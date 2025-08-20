import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const emission = await prisma.emision.findUnique({
      where: { id },
      include: {
        responsable: {
          select: { name: true },
        },
        createdBy: {
          select: { name: true },
        },
        documentos: {
          orderBy: { uploadedAt: "desc" },
        },
        faltantes: {
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!emission) {
      return NextResponse.json({ error: "Emission not found" }, { status: 404 })
    }

    return NextResponse.json(emission)
  } catch (error) {
    console.error("Error fetching emission:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
