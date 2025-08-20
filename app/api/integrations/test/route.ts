import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { integration, config } = await request.json()

    // Simulate integration testing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const testResults: Record<string, any> = {
      monday: {
        success: config.apiKey && config.boardId,
        message: config.apiKey && config.boardId ? "Conexión exitosa con Monday.com" : "API Key o Board ID faltante",
      },
      ocr: {
        success: config.apiKey,
        message: config.apiKey ? `Conexión exitosa con ${config.provider}` : "API Key requerida",
      },
      storage: {
        success: config.accessKey && config.secretKey,
        message:
          config.accessKey && config.secretKey ? `Conexión exitosa con ${config.provider}` : "Credenciales faltantes",
      },
      notifications: {
        success: true,
        message: "Configuración de notificaciones válida",
      },
    }

    return NextResponse.json(testResults[integration] || { success: false, message: "Integration not found" })
  } catch (error) {
    return NextResponse.json({ error: "Test failed" }, { status: 500 })
  }
}
