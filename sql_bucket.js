const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

async function setupBucket() {
  await client.connect();
  try {
    // create bucket
    await client.query(`INSERT INTO storage.buckets (id, name, public) VALUES ('vibecheck-images', 'vibecheck-images', true) ON CONFLICT (id) DO NOTHING;`);
    console.log("Bucket created or exists.");
    
    // create anon insert policy
    await client.query(`
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow public uploads'
          ) THEN
              EXECUTE 'CREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = ''vibecheck-images'')';
          END IF;
      END
      $$;
    `);
    
    // create public read policy
    await client.query(`
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow public reads'
          ) THEN
              EXECUTE 'CREATE POLICY "Allow public reads" ON storage.objects FOR SELECT TO public USING (bucket_id = ''vibecheck-images'')';
          END IF;
      END
      $$;
    `);
    
    console.log("Policies created or exist.");
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
setupBucket();
