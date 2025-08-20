import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { workflowEngine } from "@/lib/workflow-engine"
import { cookies } from "next/headers"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: emisionId } = await params
    const { estado, escaladoA, responsableId } = await request.json()

    // Get current user from session
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = JSON.parse(sessionCookie.value)
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update emission state
    const updatedEmission = await prisma.emision.update({
      where: { id: emisionId },
      data: {
        estado,
        escaladoA: escaladoA || null,
        responsableId: responsableId || null,
        updatedAt: new Date(),
      },
    })

    // Process workflow after state change
    await workflowEngine.processEmission(emisionId)

    return NextResponse.json(updatedEmission)
  } catch (error) {
    console.error("Error updating emission state:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
