import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"

export async function GET(req: Request) {
    const session = await auth()
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 })

    const currentUser = await db.user.findUnique({
        where: { email: session.user.email },
        include: { organization: true }
    })

    if (!currentUser?.organizationId) return new NextResponse("No Organization", { status: 400 })

    const users = await db.user.findMany({
        where: { organizationId: currentUser.organizationId },
        select: { id: true, name: true, email: true, role: true }
    })

    return NextResponse.json({ users })
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 })

    const { email } = await req.json()

    const currentUser = await db.user.findUnique({
        where: { email: session.user.email }
    })

    if (!currentUser?.organizationId) return new NextResponse("No Organization", { status: 400 })
    if (currentUser.role === "MEMBER") return new NextResponse("Forbidden", { status: 403 })

    // Check if user exists
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) return new NextResponse("User already exists", { status: 400 })

    // Create new user (Invite)
    const newUser = await db.user.create({
        data: {
            email,
            role: "MEMBER",
            organizationId: currentUser.organizationId,
            // Password would be set by user upon accepting invite (out of scope for POC)
        }
    })

    return NextResponse.json({ user: newUser })
}
