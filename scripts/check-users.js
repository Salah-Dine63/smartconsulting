const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true }
  });
  console.log("USERS_IN_DB:", JSON.stringify(users));
}

main().finally(() => prisma.$disconnect());
