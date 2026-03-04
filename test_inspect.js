const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    console.log("TRIPS:");
    console.log(await prisma.trip.findMany({ select: { id: true, name: true, locationUrl: true, locationImageUrl: true } }));
    console.log("PRODUCTS:");
    console.log(await prisma.product.findMany({ select: { id: true, name: true, imageUrl: true } }));
}
main().catch(console.error).finally(() => prisma.$disconnect());
