import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
    try {
        const { name, email, password, companyName, taxId } = await req.json()

        if (!email || !password || !companyName || !taxId) {
            return new NextResponse("Missing fields. Tax ID is required.", { status: 400 })
        }

        const existingUser = await db.user.findUnique({ where: { email } })
        if (existingUser) {
            return new NextResponse("User already exists", { status: 400 })
        }

        const existingOrg = await db.organization.findUnique({ where: { taxId } })
        if (existingOrg) {
            return new NextResponse("Company with this Tax ID already registered. Please contact your administrator.", { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        // Create Org and User in transaction
        const result = await db.$transaction(async (tx) => {
            const org = await tx.organization.create({
                data: {
                    name: companyName,
                    slug: companyName.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Math.random().toString(36).substr(2, 4),
                    taxId: taxId
                }
            })

            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: "OWNER",
                    organizationId: org.id
                }
            })

            return user
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error("REGISTRATION_ERROR", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
