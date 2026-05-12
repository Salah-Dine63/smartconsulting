import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import CourseVideoPlayer from "@/components/CourseVideoPlayer"

export default async function CourseVideoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        redirect("/login")
    }

    const userId = (session.user as any).id

    const course = await prisma.course.findUnique({
        where: { id }
    })

    if (!course) {
        return notFound()
    }

    const enrollment = await prisma.enrollment.findFirst({
        where: { courseId: course.id, userId }
    })

    if (!enrollment) {
        redirect(`/courses/${course.id}`)
    }

    const modules = JSON.parse(course.modules)

    return (
        <CourseVideoPlayer
            courseTitle={course.title}
            modules={modules}
        />
    )
}
