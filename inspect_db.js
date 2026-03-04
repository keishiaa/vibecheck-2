import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const trips = await prisma.trip.findMany({ select: { id: true, name: true, locationUrl: true, locationImageUrl: true }});
  console.log("Trips:");
  console.dir(trips, { depth: null });
  const products = await prisma.product.findMany({ select: { id: true, name: true, imageUrl: true } });
  console.log("Products:");
  console.dir(products, { depth: null });
  const outfits = await prisma.outfit.findMany();
  console.log("Outfits:");
  console.dir(outfits, { depth: null });
}
main().catch(console.error).finally(() => prisma.$disconnect());
