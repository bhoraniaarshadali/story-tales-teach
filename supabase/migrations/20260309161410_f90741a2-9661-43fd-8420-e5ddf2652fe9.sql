
-- Allow anyone to read public stories (for sharing)
CREATE POLICY "Allow public read of public stories"
ON public.stories
FOR SELECT
TO anon, authenticated
USING (is_public = true);

-- Allow anyone to insert stories (for sharing without auth)
DROP POLICY IF EXISTS "Allow inserts for authenticated users" ON public.stories;
CREATE POLICY "Allow inserts for anyone"
ON public.stories
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
