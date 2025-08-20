import { type NextRequest, NextResponse } from "next/server"
import { mondayService } from "@/lib/integrations/monday"

export async function GET() {
  try {
    const boards = await mondayService.getBoards()
    return NextResponse.json({ boards })
  } catch (error) {
    console.error("[v0] Monday API error:", error)
    return NextResponse.json({ error: "Failed to fetch Monday.com boards" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, boardId, groupId, itemData, itemId, updates } = body

    switch (action) {
      case "create_item":
        const newItem = await mondayService.createItem(boardId, groupId, itemData)
        return NextResponse.json({ item: newItem })

      case "update_item":
        const updatedItem = await mondayService.updateItem(itemId, updates)
        return NextResponse.json({ item: updatedItem })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("[v0] Monday API error:", error)
    return NextResponse.json({ error: "Monday.com integration failed" }, { status: 500 })
  }
}
