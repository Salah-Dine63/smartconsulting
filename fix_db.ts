import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://johndoe:randompassword@127.0.0.1:5432/mydb?schema=public"
    },
  },
})

async function main() {
    const courses = await prisma.course.findMany()
    let found = false;
    for (const course of courses) {
        if (course.modules && course.modules.includes('w3schools.com')) {
            found = true;
            console.log(`Fixing course: ${course.title} (${course.id})`)
            await prisma.course.delete({
                where: { id: course.id }
            })
            console.log(`Deleted mocked course: ${course.title}`)
        }
    }
    if (!found) {
        console.log("No courses with w3schools found in the database!")
    }
}
main()
