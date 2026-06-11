import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
    const user = await prisma.user.findFirst();
    if (user) {
        await prisma.user.update({
            where: { id: user.id },
            data: { role: 'ADMIN' }
        });
        console.log(`Successfully made ${user.email} an ADMIN!`);
        console.log(`Email: ${user.email}`);
        console.log(`Password: (It is hashed, you should login with this email or reset it if you forgot)`);
    } else {
        console.log("No users found in the database. Please register an account first.");
    }
}
main().catch(console.error).finally(() => prisma.$disconnect());
