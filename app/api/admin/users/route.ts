import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

async function validateAdminSession() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('session')?.value

  if (!sessionId) {
    return { isValid: false }
  }

  const user = await prisma.user.findUnique({
    where: { email: sessionId }
  })

  if (!user || user.role !== 'ADMIN') {
    return { isValid: false }
  }

  return { isValid: true, user }
}

export async function GET(request: NextRequest) {
  try {
    const { isValid } = await validateAdminSession()
    
    if (!isValid) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json(users)

  } catch (error) {
    console.error('Error obteniendo usuarios:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { isValid } = await validateAdminSession()
    
    if (!isValid) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { email, password, name, role } = await request.json()

    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Email, contraseña y rol son requeridos' }, { status: 400 })
    }

    // Verificar que el email no exista
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 400 })
    }

    // Crear nuevo usuario
    const newUser = await prisma.user.create({
      data: {
        email,
        password, // En producción, hashear la contraseña
        name: name || '',
        role
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json(newUser, { status: 201 })

  } catch (error) {
    console.error('Error creando usuario:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
