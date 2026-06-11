import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const courses = await prisma.course.findMany({
            select: { id: true, title: true, modules: true }
        });
        return NextResponse.json(courses);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
