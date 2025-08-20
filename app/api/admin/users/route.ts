import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import Database from 'better-sqlite3'
import path from 'path'
import { z } from 'zod'

const db = new Database(path.join(process.cwd(), 'dev.db'))

// Schema de validación para crear usuarios
const createUserSchema = z.object({
  email: z.string().email("Email inválido"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  role: z.enum(["ASESOR", "OPERACIONES", "MEDICO", "ADMIN"], {
    errorMap: () => ({ message: "Rol inválido" })
  }),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres")
})

// Función para verificar si el usuario es admin
async function verifyAdminAccess(): Promise<{ isValid: boolean, userId?: string }> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return { isValid: false }
    }

    const session = JSON.parse(sessionCookie.value)
    const getUser = db.prepare('SELECT id, role FROM gmm_users WHERE id = ?')
    const user = getUser.get(session.userId)

    if (!user || user.role !== 'ADMIN') {
      return { isValid: false }
    }

    return { isValid: true, userId: user.id }
  } catch (error) {
    return { isValid: false }
  }
}

// GET - Obtener todos los usuarios (solo para admins)
export async function GET() {
  try {
    const { isValid } = await verifyAdminAccess()
    
    if (!isValid) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const getUsers = db.prepare(`
      SELECT id, email, name, role, created_at, updated_at 
      FROM gmm_users 
      ORDER BY created_at DESC
    `)
    const users = getUsers.all()

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error obteniendo usuarios:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST - Crear nuevo usuario (solo para admins)
export async function POST(request: NextRequest) {
  try {
    const { isValid } = await verifyAdminAccess()
    
    if (!isValid) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createUserSchema.parse(body)

    // Verificar si el email ya existe
    const checkEmail = db.prepare('SELECT id FROM gmm_users WHERE email = ?')
    const existingUser = checkEmail.get(validatedData.email)
    
    if (existingUser) {
      return NextResponse.json({ error: "El email ya está en uso" }, { status: 400 })
    }

    // Generar ID único
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Insertar nuevo usuario
    const insertUser = db.prepare(`
      INSERT INTO gmm_users (id, email, name, role, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `)
    
    insertUser.run(
      userId,
      validatedData.email,
      validatedData.name,
      validatedData.role,
      validatedData.password // En producción, esto debería ser hasheado
    )

    // Obtener el usuario creado (sin la contraseña)
    const getUser = db.prepare(`
      SELECT id, email, name, role, created_at, updated_at 
      FROM gmm_users 
      WHERE id = ?
    `)
    const newUser = getUser.get(userId)

    return NextResponse.json({ 
      message: "Usuario creado exitosamente",
      user: newUser 
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Datos inválidos",
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 })
    }

    console.error("Error creando usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
