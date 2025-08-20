import { type NextRequest, NextResponse } from "next/server"
import { notificationService } from "@/lib/integrations/notifications"

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()

    const success = await notificationService.sendNotification(payload)

    return NextResponse.json({
      success,
      message: success ? "Notification sent" : "Notification failed",
    })
  } catch (error) {
    console.error("[v0] Notification API error:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const config = notificationService.getConfig()
    return NextResponse.json({ config })
  } catch (error) {
    console.error("[v0] Notification config error:", error)
    return NextResponse.json({ error: "Failed to get notification config" }, { status: 500 })
  }
}
