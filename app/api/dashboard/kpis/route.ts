import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get emissions counts
    const [emisionesHoy, emisionesSemana, emisionesMes, totalEmisiones] = await Promise.all([
      prisma.emision.count({
        where: { createdAt: { gte: startOfDay } },
      }),
      prisma.emision.count({
        where: { createdAt: { gte: startOfWeek } },
      }),
      prisma.emision.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      prisma.emision.count(),
    ])

    // Get completion stats
    const emisionesCompletas = await prisma.emision.count({
      where: {
        OR: [{ estado: "ALTA_VIABLE" }, { estado: "LISTO_PARA_PORTAL" }, { estado: "CERRADO" }],
      },
    })

    const emisionesEscaladas = await prisma.emision.count({
      where: {
        OR: [{ estado: "ESCALADO_OPERACIONES" }, { estado: "ESCALADO_MEDICO" }],
      },
    })

    // Calculate percentages
    const porcentajeCompletas = totalEmisiones > 0 ? Math.round((emisionesCompletas / totalEmisiones) * 100) : 0
    const porcentajeEscaladas = totalEmisiones > 0 ? Math.round((emisionesEscaladas / totalEmisiones) * 100) : 0

    // Mock SLA calculation (in a real app, this would be based on actual processing times)
    const slaPromedio = 24 // hours

    return NextResponse.json({
      emisionesHoy,
      emisionesSemana,
      emisionesMes,
      porcentajeCompletas,
      porcentajeEscaladas,
      slaPromedio,
    })
  } catch (error) {
    console.error("Error fetching KPIs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
