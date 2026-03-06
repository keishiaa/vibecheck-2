import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "Allow Auth users to upload vibecheck" ON storage.objects;`);
    await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "Allow Auth users to update vibecheck" ON storage.objects;`);
    await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "Allow Auth users to delete vibecheck" ON storage.objects;`);
    await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "Allow public read vibecheck" ON storage.objects;`);

    await prisma.$executeRawUnsafe(`CREATE POLICY "Allow Auth users to upload vibecheck" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'vibecheck');`);
    await prisma.$executeRawUnsafe(`CREATE POLICY "Allow Auth users to update vibecheck" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'vibecheck');`);
    await prisma.$executeRawUnsafe(`CREATE POLICY "Allow Auth users to delete vibecheck" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'vibecheck');`);
    await prisma.$executeRawUnsafe(`CREATE POLICY "Allow public read vibecheck" ON storage.objects FOR SELECT USING (bucket_id = 'vibecheck');`);
    console.log("RLS setup completed successfully");
}

main().catch(console.error).finally(() => prisma.$disconnect());
