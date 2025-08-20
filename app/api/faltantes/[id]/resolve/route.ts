import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const faltante = await prisma.faltante.update({
      where: { id },
      data: {
        resolved: true,
        resolvedAt: new Date(),
      },
    })

    return NextResponse.json(faltante)
  } catch (error) {
    console.error("Error resolving faltante:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
