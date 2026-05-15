import { prisma } from "@/lib/prisma"
import CourseCatalog from "@/components/CourseCatalog"

export const dynamic = "force-dynamic"

export default async function CoursesPage() {
    const courses = await prisma.course.findMany({
        orderBy: { id: "asc" },
    })

    const normalized = courses.map((c) => {
        let moduleCount = 0
        try { moduleCount = JSON.parse(c.modules).length } catch {}
        return {
            id: c.id,
            title: c.title,
            description: c.description,
            price: c.price,
            imageUrl: c.imageUrl ?? "",
            moduleCount,
        }
    })

    return <CourseCatalog courses={normalized} />
}
