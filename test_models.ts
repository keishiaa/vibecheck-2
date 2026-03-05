import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log(Object.keys(prisma).filter(k => k.toLowerCase().includes('trip') || k.toLowerCase().includes('day')));
}
main().catch(console.error).finally(() => prisma.$disconnect());
