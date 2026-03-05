const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findFirst({
        where: {
            name: { contains: 'Keishia' }
        }
    });

    if (!user) {
        console.error('User not found!');
        process.exit(1);
    }

    console.log('Assigning products to user: ' + user.name + ' (' + user.id + ')');

    const updatedProducts = await prisma.product.updateMany({
        where: {
            userId: null
        },
        data: {
            userId: user.id
        }
    });

    console.log('Updated ' + updatedProducts.count + ' unassigned products to belong to you.');
}

main()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error(e);
        prisma.$disconnect();
        process.exit(1);
    });
