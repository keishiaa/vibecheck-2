import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const trip = await prisma.trip.findFirst();
        if (trip) {
            console.log("try delete", trip.id);
            await prisma.outfit.deleteMany({ where: { tripId: trip.id } });
            await prisma.tripMember.deleteMany({ where: { tripId: trip.id } });
            await prisma.product.deleteMany({ where: { tripId: trip.id } });
            await prisma.dayDetails.deleteMany({ where: { tripId: trip.id } });
        }
    } catch (e) {
        console.error(e);
    }
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
