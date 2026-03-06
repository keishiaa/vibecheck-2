import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const { Client } = pg;
const client = new Client({
    connectionString: process.env.DATABASE_URL
});

async function main() {
    await client.connect();

    await client.query(`DROP POLICY IF EXISTS "Allow Auth users to upload vibecheck" ON storage.objects;`);
    await client.query(`DROP POLICY IF EXISTS "Allow Auth users to update vibecheck" ON storage.objects;`);
    await client.query(`DROP POLICY IF EXISTS "Allow Auth users to delete vibecheck" ON storage.objects;`);
    await client.query(`DROP POLICY IF EXISTS "Allow public read vibecheck" ON storage.objects;`);

    await client.query(`CREATE POLICY "Allow Auth users to upload vibecheck" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'vibecheck');`);
    await client.query(`CREATE POLICY "Allow Auth users to update vibecheck" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'vibecheck');`);
    await client.query(`CREATE POLICY "Allow Auth users to delete vibecheck" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'vibecheck');`);
    await client.query(`CREATE POLICY "Allow public read vibecheck" ON storage.objects FOR SELECT USING (bucket_id = 'vibecheck');`);

    console.log("RLS setup completed successfully with pg.");
    await client.end();
}

main().catch(console.error);
