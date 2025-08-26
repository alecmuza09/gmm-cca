import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import Database from 'better-sqlite3'
import path from 'path'

const db = new Database(path.join(process.cwd(), 'dev.db'))

// Demo users for authentication
const DEMO_USERS = [
  { email: "asesor@consolida.mx", password: "password", name: "Asesor Demo", role: "ASESOR" },
  { email: "marlene@consolida.mx", password: "password", name: "Marlene Operaciones", role: "OPERACIONES" },
  { email: "doctora@consolida.mx", password: "password", name: "Doctora Médico", role: "MEDICO" },
  { email: "admin@consolida.mx", password: "password", name: "Admin Sistema", role: "ADMIN" },
]

function ensureUsersTableExists() {
  try {
    // Create table if it doesn't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS gmm_users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Check if demo users exist, if not create them
    const checkUser = db.prepare('SELECT id FROM gmm_users WHERE email = ?')
    const insertUser = db.prepare('INSERT OR IGNORE INTO gmm_users (id, email, name, role, password_hash) VALUES (?, ?, ?, ?, ?)')
    
    for (const demoUser of DEMO_USERS) {
      const existingUser = checkUser.get(demoUser.email)
      if (!existingUser) {
        insertUser.run(`user_${demoUser.role.toLowerCase()}`, demoUser.email, demoUser.name, demoUser.role, demoUser.password)
      }
    }
  } catch (error) {
    console.error("Error ensuring users table exists:", error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    ensureUsersTableExists()

    const demoUser = DEMO_USERS.find((u) => u.email === email && u.password === password)
    if (!demoUser) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check if user exists in our custom table
    const getUser = db.prepare('SELECT id, email, name, role FROM gmm_users WHERE email = ? AND password_hash = ?')
    const user = getUser.get(email, password)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set("session", JSON.stringify({ userId: user.id }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
