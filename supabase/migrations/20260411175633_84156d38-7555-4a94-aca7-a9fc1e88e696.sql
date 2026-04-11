
-- 1. Fix subscriber email exposure: drop public SELECT, create count-only function
DROP POLICY IF EXISTS "Anyone can read subscriber count" ON public.subscribers;

CREATE OR REPLACE FUNCTION public.get_active_subscriber_count()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer FROM public.subscribers WHERE is_active = true;
$$;

-- 2. Add unique constraint on email if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscribers_email_unique'
  ) THEN
    ALTER TABLE public.subscribers ADD CONSTRAINT subscribers_email_unique UNIQUE (email);
  END IF;
END $$;

-- 3. Remove permissive storage upload policy
DROP POLICY IF EXISTS "Authenticated upload" ON storage.objects;
