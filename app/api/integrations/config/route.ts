import { type NextRequest, NextResponse } from "next/server"

// Mock configuration storage
let integrationConfig = {
  monday: {
    enabled: false,
    apiKey: "",
    boardId: "",
    status: "disconnected",
  },
  notifications: {
    emailEnabled: true,
    smsEnabled: false,
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    smtpUser: "",
    smtpPass: "",
    smsProvider: "twilio",
    smsApiKey: "",
  },
  ocr: {
    enabled: true,
    provider: "aws-textract",
    apiKey: "",
    region: "us-east-1",
    status: "connected",
  },
  storage: {
    enabled: true,
    provider: "aws-s3",
    bucket: "gmm-documents",
    region: "us-east-1",
    accessKey: "",
    secretKey: "",
    status: "connected",
  },
}

export async function GET() {
  try {
    // In production, this would fetch from database
    return NextResponse.json(integrationConfig)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch configuration" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const config = await request.json()

    // In production, this would save to database
    integrationConfig = { ...integrationConfig, ...config }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to save configuration" }, { status: 500 })
  }
}
