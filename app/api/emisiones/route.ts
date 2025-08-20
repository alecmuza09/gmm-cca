import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const emisiones = await prisma.emision.findMany({
      include: {
        responsable: {
          select: { name: true },
        },
        faltantes: {
          where: { resolved: false },
          select: { id: true },
        },
        _count: {
          select: { faltantes: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    })

    const emisionesSummary = emisiones.map((emision) => {
      // Extract client name from solicitante JSON
      const solicitante = emision.solicitante as any
      const cliente =
        emision.persona === "FISICA"
          ? `${solicitante?.nombre || ""} ${solicitante?.apellidos || ""}`.trim()
          : (emision.moralInfo as any)?.razonSocial || solicitante?.razonSocial || "Cliente no especificado"

      return {
        id: emision.id,
        folio: emision.folio,
        tipoEmision: emision.tipoEmision,
        cliente,
        montoUSD: emision.montoUSD,
        estado: emision.estado,
        faltantesCount: emision.faltantes.length,
        responsable: emision.responsable?.name || null,
        ultimaActualizacion: emision.updatedAt.toISOString(),
      }
    })

    return NextResponse.json(emisionesSummary)
  } catch (error) {
    console.error("Error fetching emisiones:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const formData = await request.formData()

    // Extract form fields
    const tipoEmision = formData.get("tipoEmision") as string
    const persona = formData.get("persona") as string
    const requiereFactura = formData.get("requiereFactura") === "true"
    const montoUSD = formData.get("montoUSD") ? Number.parseFloat(formData.get("montoUSD") as string) : null
    const solicitante = JSON.parse(formData.get("solicitante") as string)
    const moralInfo = formData.get("moralInfo") ? JSON.parse(formData.get("moralInfo") as string) : null
    const declaraciones = JSON.parse(formData.get("declaraciones") as string)
    const supuestosMeta = formData.get("supuestosMeta") ? JSON.parse(formData.get("supuestosMeta") as string) : null

    // Generate folio
    const year = new Date().getFullYear()
    const count = await prisma.emision.count()
    const folio = `GMM-${year}-${String(count + 1).padStart(3, "0")}`

    // Create emission
    const emision = await prisma.emision.create({
      data: {
        folio,
        tipoEmision: tipoEmision as any,
        persona: persona as any,
        requiereFactura,
        montoUSD,
        solicitante,
        moralInfo,
        declaraciones,
        supuestosMeta,
        estado: "EN_REVISION_OCR",
        createdById: user.id,
      },
    })

    // Handle file uploads (in a real app, you'd upload to S3 or similar)
    const documentPromises = []
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("documento_") && value instanceof File) {
        // Mock document creation - in production, upload to storage first
        documentPromises.push(
          prisma.documento.create({
            data: {
              emisionId: emision.id,
              tipo: "OTRO", // Would determine type based on file analysis
              filename: value.name,
              url: `/uploads/${emision.id}/${value.name}`, // Mock URL
              mime: value.type,
              ocrStatus: "PENDING",
            },
          }),
        )
      }
    }

    await Promise.all(documentPromises)

    return NextResponse.json({
      id: emision.id,
      folio: emision.folio,
      message: "Emisión creada exitosamente",
    })
  } catch (error) {
    console.error("Error creating emission:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
