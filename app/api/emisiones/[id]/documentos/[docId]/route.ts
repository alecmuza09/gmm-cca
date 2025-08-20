import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { workflowEngine } from "@/lib/workflow-engine"

interface RouteParams {
  params: Promise<{ id: string; docId: string }>
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: emissionId, docId } = await params

    // Delete the document
    await prisma.documento.delete({
      where: { id: docId },
    })

    // Re-process emission after document deletion
    await workflowEngine.processEmission(emissionId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting document:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
