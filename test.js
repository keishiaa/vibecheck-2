const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.product.findMany().then((res) => console.log(JSON.stringify(res, null, 2)));
