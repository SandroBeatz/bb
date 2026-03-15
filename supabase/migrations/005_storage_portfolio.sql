-- Create portfolio storage bucket with public read access
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow anyone to read portfolio photos (public bucket)
CREATE POLICY "portfolio_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'portfolio');

-- Allow authenticated users to upload portfolio photos
CREATE POLICY "portfolio_auth_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'portfolio');

-- Allow authenticated users to update/replace portfolio photos
CREATE POLICY "portfolio_auth_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'portfolio');

-- Allow service role full access (server-side uploads and deletes)
CREATE POLICY "portfolio_service_role_all"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'portfolio')
WITH CHECK (bucket_id = 'portfolio');
