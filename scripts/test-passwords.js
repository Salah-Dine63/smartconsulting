const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'admin@executiveedu.com' }
  });

  if (!user) {
    console.log("Admin user not found in database!");
    return;
  }

  const p1 = 'Admin123!';
  const p2 = 'Admin@12345';
  
  const ok1 = await bcrypt.compare(p1, user.password);
  const ok2 = await bcrypt.compare(p2, user.password);

  console.log(`Password "${p1}" validation:`, ok1);
  console.log(`Password "${p2}" validation:`, ok2);
}

main().finally(() => prisma.$disconnect());
