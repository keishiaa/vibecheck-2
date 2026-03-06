import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({ where: { userId: null }, include: { trip: true }});
  let count = 0;
  for (const product of products) {
    if (product.trip && product.trip.ownerId) {
       await prisma.product.update({
         where: { id: product.id },
         data: { userId: product.trip.ownerId }
       });
       count++;
    }
  }
  console.log(`Updated ${count} products.`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
