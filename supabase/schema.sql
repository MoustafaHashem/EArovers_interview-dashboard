-- ============================================================
-- Schema لوحة تحكم إدارة المقابلات (Interview Dashboard)
-- شغّل هذا الملف كاملاً في: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1) جدول الملفات الشخصية (profiles) لربط المستخدمين بدور وحالة موافقة
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role text not null default 'reviewer' check (role in ('super_admin', 'reviewer')),
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- كل مستخدم يقدر يقرأ صف نفسه، والـ super admin يقدر يقرأ الكل
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (
    auth.uid() = id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super_admin' and p.is_approved = true
    )
  );

-- تحديث بيانات البروفايل (الموافقة/الدور) للـ super admin فقط، أو تحديث المستخدم لاسمه هو فقط
drop policy if exists "profiles_update_admin_or_self" on public.profiles;
create policy "profiles_update_admin_or_self"
  on public.profiles for update
  using (
    auth.uid() = id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super_admin' and p.is_approved = true
    )
  );

-- 2) دالة + Trigger لإنشاء صف profile تلقائياً عند تسجيل مستخدم جديد
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, is_approved)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    'reviewer',
    false
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3) جدول طلبات الانضمام (join_requests)
create table if not exists public.join_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  whatsapp text,
  gender text,
  email text,
  academic_year text not null,
  program_type text not null default 'mainstream',
  department text,
  interests text,
  interview_slots text[] default '{}',
  selected_interview_time text,
  interview_notes text,
  status text not null default 'جديد' check (
    status in ('جديد', 'تم تحديد موعد', 'مقبول', 'مرفوض', 'مؤجل', 'لم يحضر')
  ),
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

alter table public.join_requests enable row level security;

-- أي مستخدم مفعّل (approved) يقدر يقرأ كل طلبات الانضمام
drop policy if exists "join_requests_select_approved" on public.join_requests;
create policy "join_requests_select_approved"
  on public.join_requests for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_approved = true
    )
  );

-- أي مستخدم مفعّل يقدر يعدّل بيانات طلبات الانضمام
drop policy if exists "join_requests_update_approved" on public.join_requests;
create policy "join_requests_update_approved"
  on public.join_requests for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_approved = true
    )
  );

-- السماح بإضافة طلبات انضمام جديدة من نموذج تسجيل عام (بدون تسجيل دخول)
drop policy if exists "join_requests_insert_public" on public.join_requests;
create policy "join_requests_insert_public"
  on public.join_requests for insert
  with check (true);

-- فهرس لتسريع الفلترة بحسب الحالة
create index if not exists idx_join_requests_status on public.join_requests (status);

-- ============================================================
-- ملاحظة مهمة: تفعيل أول حساب Super Admin
-- بعد التسجيل من صفحة Register، نفّذ الاستعلام التالي يدوياً
-- (استبدل البريد الإلكتروني ببريدك):
--
-- update public.profiles
-- set role = 'super_admin', is_approved = true
-- where id = (select id from auth.users where email = 'admin@example.com');
-- ============================================================
