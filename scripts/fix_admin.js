const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Admin123!', 10);

  // 1. Fix the existing admin
  let existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@executiveedu.com' }
  });

  if (existingAdmin) {
    existingAdmin = await prisma.user.update({
      where: { email: 'admin@executiveedu.com' },
      data: { 
        password: hashedPassword,
        role: 'ADMIN' // Ensure role is ADMIN
      }
    });
    console.log('Fixed existing admin (admin@executiveedu.com). Password reset to: Admin123!');
  } else {
    console.log('Admin admin@executiveedu.com not found, creating it...');
    existingAdmin = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@executiveedu.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    console.log('Created admin@executiveedu.com with password: Admin123!');
  }

  // 2. Create another admin account
  const newAdminEmail = 'admin2@executiveedu.com';
  let anotherAdmin = await prisma.user.findUnique({
    where: { email: newAdminEmail }
  });

  if (anotherAdmin) {
    anotherAdmin = await prisma.user.update({
      where: { email: newAdminEmail },
      data: {
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    console.log(`Updated existing account ${newAdminEmail} to ADMIN with password: Admin123!`);
  } else {
    anotherAdmin = await prisma.user.create({
      data: {
        name: 'Admin 2',
        email: newAdminEmail,
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    console.log(`Created new admin account ${newAdminEmail} with password: Admin123!`);
  }

  console.log('--- Current Admins ---');
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true, name: true, email: true, role: true }
  });
  console.table(admins);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
