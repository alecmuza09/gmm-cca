import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from './prisma'

export type Role = 'ASESOR' | 'OPERACIONES' | 'MEDICO' | 'ADMIN'

export interface User {
  id: number
  email: string
  role: Role
  name?: string
}

export async function getUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('session')?.value

  if (!sessionId) {
    return null
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        // Buscar por sessionId (implementar lógica de sesión)
        email: sessionId // Temporal: usar email como sessionId
      }
    })

    if (!user) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role as Role,
      name: user.name || undefined
    }
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  return user
}

export async function requireRole(requiredRole: Role): Promise<User> {
  const user = await requireAuth()
  
  if (user.role !== requiredRole && user.role !== 'ADMIN') {
    redirect('/unauthorized')
  }
  
  return user
}
