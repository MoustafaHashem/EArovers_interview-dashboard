-- دالة تقوم بتأكيد إيميل المستخدم تلقائياً عند الموافقة عليه
CREATE OR REPLACE FUNCTION public.auto_confirm_email_on_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- لما is_approved تتغير من false إلى true
  IF NEW.is_approved = true AND OLD.is_approved = false THEN
    UPDATE auth.users
    SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

-- ربط الدالة بجدول profiles
DROP TRIGGER IF EXISTS on_profile_approved ON public.profiles;
CREATE TRIGGER on_profile_approved
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.auto_confirm_email_on_approval();
