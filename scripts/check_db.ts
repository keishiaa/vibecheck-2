import prisma from '../src/lib/prisma';

async function main() {
    console.log("Updating items...");

    // Sally: f4ceaeaf-8f70-4897-b356-d826d3ab9fd1
    // Kevyn: eec629a0-5a4e-44f7-9f54-0e63995151f7

    await prisma.product.updateMany({
        where: { id: { in: ['39d84e45-d2de-4baf-af25-a0f934c94ef8', '8d51dba6-3df2-476b-8ecc-f492194c357d'] } },
        data: { userId: 'f4ceaeaf-8f70-4897-b356-d826d3ab9fd1' }
    });

    await prisma.product.updateMany({
        where: { id: '49710095-110e-41ce-9f4c-50abd752322d' },
        data: { userId: 'eec629a0-5a4e-44f7-9f54-0e63995151f7' }
    });

    console.log("Done updating!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
