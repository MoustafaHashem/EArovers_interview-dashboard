# لوحة تحكم إدارة المقابلات (Interview Dashboard)

مشروع React (Vite) + TailwindCSS + Supabase لإدارة المتقدمين للمقابلات الشخصية، بواجهة عربية بالكامل (RTL).

## 1) التثبيت

```bash
npm install
```

## 2) إعداد متغيرات البيئة

انسخ `.env.example` إلى `.env` وضع فيه بيانات مشروعك على Supabase:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxxxxxx
```

تجد هذه القيم في: Supabase Dashboard > Project Settings > API.

## 3) إعداد قاعدة البيانات

1. افتح مشروعك على [supabase.com](https://supabase.com).
2. اذهب إلى **SQL Editor**.
3. الصق محتوى ملف `supabase/schema.sql` بالكامل ونفّذه (Run).

هذا سينشئ:
- جدول `profiles` (المستخدمين: Super Admin / Reviewer + حالة الموافقة).
- جدول `candidates` (بيانات المتقدمين).
- Trigger تلقائي لإنشاء صف `profile` عند تسجيل أي مستخدم جديد.
- سياسات RLS الأساسية للحماية.

## 4) تفعيل أول حساب Super Admin

بما أن أي مستخدم جديد يُسجَّل كـ `reviewer` وغير مفعّل افتراضياً، يجب تفعيل أول حساب Super Admin يدوياً:

1. سجّل حساب من صفحة **Register** داخل التطبيق (بإيميلك أنت).
2. ارجع لـ **SQL Editor** في Supabase ونفّذ:

```sql
update public.profiles
set role = 'super_admin', is_approved = true
where id = (select id from auth.users where email = 'YOUR_EMAIL@example.com');
```

3. الآن يمكنك تسجيل الدخول كـ Super Admin، والذهاب لصفحة **إدارة المستخدمين** للموافقة على أي Reviewer جديد.

## 5) تشغيل المشروع

```bash
npm run dev
```

## 6) بيانات تجريبية لجدول candidates (اختياري)

```sql
insert into public.candidates
  (full_name, phone, email, academic_year, department, gender, interests, whatsapp, interview_slots)
values
  ('أحمد محمد', '01012345678', 'ahmed@example.com', 'المستوى الثالث', 'هندسة برمجيات',
   'ذكر', 'برمجة، تصميم واجهات', '201012345678',
   array['السبت 4 أكتوبر - 2:00 م', 'الأحد 5 أكتوبر - 4:00 م']);
```

## ملاحظات تقنية

- **الأتمتة عند الحفظ:** عند تعديل أي متقدم من `CandidateModal`، يتم تلقائياً تحديث `reviewed_by` باسم المستخدم الحالي و `reviewed_at` بالوقت الحالي.
- **زر الواتساب:** يبني رابط `wa.me` تلقائياً من رقم `whatsapp` مع رسالة تحتوي على اسم المتقدم وموعد المقابلة المختار. الكود يفترض كود دولة مصر (+20) عند إدخال رقم يبدأ بصفر — عدّل الدالة `toWhatsAppNumber` في `src/components/CandidateModal.jsx` إذا كانت الأرقام بكود دولة مختلف.
- **الصلاحيات:** حسابات جديدة (Register) لا يمكنها الدخول حتى يوافق عليها Super Admin من صفحة `/users`.
- **الاتصال المباشر بقاعدة PostgreSQL** (Host/Port/User المذكورة في الطلب) مخصص لأدوات مثل psql أو أدوات الترحيل، ولا يُستخدم من الفرونت اند مباشرة لأسباب أمنية — الفرونت اند يتواصل فقط عبر Supabase Client باستخدام `anon key`.
