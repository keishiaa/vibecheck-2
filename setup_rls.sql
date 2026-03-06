DROP POLICY IF EXISTS "Allow Auth users to upload vibecheck" ON storage.objects;
DROP POLICY IF EXISTS "Allow Auth users to update vibecheck" ON storage.objects;
DROP POLICY IF EXISTS "Allow Auth users to delete vibecheck" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read vibecheck" ON storage.objects;

CREATE POLICY "Allow Auth users to upload vibecheck" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'vibecheck');
CREATE POLICY "Allow Auth users to update vibecheck" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'vibecheck');
CREATE POLICY "Allow Auth users to delete vibecheck" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'vibecheck');
CREATE POLICY "Allow public read vibecheck" ON storage.objects FOR SELECT USING (bucket_id = 'vibecheck');
