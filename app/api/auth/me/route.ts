import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import Database from 'better-sqlite3'
import path from 'path'

const db = new Database(path.join(process.cwd(), 'dev.db'))

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return NextResponse.json({ error: "No session" }, { status: 401 })
    }

    const session = JSON.parse(sessionCookie.value)

    const getUser = db.prepare('SELECT id, email, name, role FROM gmm_users WHERE id = ?')
    const user = getUser.get(session.userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
