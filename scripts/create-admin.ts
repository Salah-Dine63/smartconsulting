import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    const email = "admin@executiveedu.com"
    const password = "Admin@12345"
    const name = "Admin"

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
        // If already exists, just promote to ADMIN
        await prisma.user.update({ where: { email }, data: { role: "ADMIN" } })
        console.log(`✓ User ${email} promoted to ADMIN`)
        return
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
        data: { name, email, password: hashed, role: "ADMIN" },
    })

    console.log(`✓ Admin user created:`)
    console.log(`  Email:    ${user.email}`)
    console.log(`  Password: ${password}`)
    console.log(`  Role:     ${user.role}`)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
