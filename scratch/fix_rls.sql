CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT exists(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin' AND is_approved = true);
$$;

DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles FOR SELECT
USING (auth.uid() = id OR public.is_super_admin());

DROP POLICY IF EXISTS "profiles_update_admin_or_self" ON public.profiles;
CREATE POLICY "profiles_update_admin_or_self" ON public.profiles FOR UPDATE
USING (auth.uid() = id OR public.is_super_admin());
