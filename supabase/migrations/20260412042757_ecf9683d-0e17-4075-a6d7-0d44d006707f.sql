-- Explicitly deny anon/authenticated SELECT on subscribers by not adding a permissive SELECT policy for them.
-- RLS is already enabled and no SELECT policy exists for anon/authenticated, which is correct.
-- But let's add an explicit SELECT policy restricted to service_role for clarity.

CREATE POLICY "Only service role can read subscribers"
ON public.subscribers
FOR SELECT
TO service_role
USING (true);

-- Storage write policies for public-assets bucket
CREATE POLICY "Only service role can insert storage objects"
ON storage.objects
FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'public-assets');

CREATE POLICY "Only service role can update storage objects"
ON storage.objects
FOR UPDATE
TO service_role
USING (bucket_id = 'public-assets');

CREATE POLICY "Only service role can delete storage objects"
ON storage.objects
FOR DELETE
TO service_role
USING (bucket_id = 'public-assets');