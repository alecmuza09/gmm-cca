'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// Definir tipos localmente
export type Role = 'ASESOR' | 'OPERACIONES' | 'MEDICO' | 'ADMIN'

export interface User {
  id: number
  email: string
  role: Role
  name?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  initializeDatabase: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const initializeDatabase = async () => {
    try {
      console.log('🔧 Inicializando base de datos...')
      const response = await fetch('/api/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Base de datos inicializada:', result)
      } else {
        console.error('❌ Error inicializando base de datos')
      }
    } catch (error) {
      console.error('Error inicializando base de datos:', error)
    }
  }

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        // Si no hay autenticación, verificar si hay usuarios en la base de datos
        const initResponse = await fetch('/api/init')
        if (initResponse.ok) {
          const { userCount } = await initResponse.json()
          if (userCount === 0) {
            // No hay usuarios, inicializar la base de datos
            await initializeDatabase()
          }
        }
      }
    } catch (error) {
      console.error('Auth check error:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        router.push('/')
        return true
      } else {
        // Si el login falla, verificar si hay usuarios
        const initResponse = await fetch('/api/init')
        if (initResponse.ok) {
          const { userCount } = await initResponse.json()
          if (userCount === 0) {
            // No hay usuarios, inicializar y reintentar login
            await initializeDatabase()
            return await login(email, password)
          }
        }
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, initializeDatabase }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
