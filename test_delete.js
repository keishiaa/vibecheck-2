const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL
});

async function main() {
    console.log("tripMember?", !!prisma.tripMember, Object.keys(prisma).filter(k => k.toLowerCase().includes('trip')));
    console.log("dayDetail?", !!prisma.dayDetail, !!prisma.dayDetails, Object.keys(prisma).filter(k => k.toLowerCase().includes('day')));
}
main().catch(console.error).finally(() => prisma.$disconnect());
