import { type NextRequest, NextResponse } from "next/server"
import { workflowEngine } from "@/lib/workflow-engine"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: emisionId } = await params

    // Re-run validation and workflow processing
    await workflowEngine.processEmission(emisionId)

    return NextResponse.json({ success: true, message: "Validation completed" })
  } catch (error) {
    console.error("Error validating emission:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
