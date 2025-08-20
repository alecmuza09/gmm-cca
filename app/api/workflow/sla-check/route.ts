import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { workflowEngine } from "@/lib/workflow-engine"

export async function POST() {
  try {
    // Get all active emissions
    const activeEmissions = await prisma.emision.findMany({
      where: {
        estado: {
          notIn: ["CERRADO", "LISTO_PARA_PORTAL"],
        },
      },
      select: { id: true },
    })

    const slaResults = []

    for (const emission of activeEmissions) {
      try {
        const slaStatus = await workflowEngine.getSLAStatus(emission.id)

        // If SLA is breached with high severity, trigger escalation
        if (slaStatus.isBreached && slaStatus.severity === "high") {
          await workflowEngine.processEmission(emission.id)
        }

        slaResults.push({
          emissionId: emission.id,
          ...slaStatus,
        })
      } catch (error) {
        console.error(`Error checking SLA for emission ${emission.id}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      checked: activeEmissions.length,
      breached: slaResults.filter((r) => r.isBreached).length,
      results: slaResults,
    })
  } catch (error) {
    console.error("Error in SLA check:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
