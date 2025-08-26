"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { Role } from "@prisma/client"

interface AuthUser {
  id: string
  email: string
  name?: string
  role: Role
}

interface AuthContextType {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Mock auth for development - replace with real auth logic
      const mockUser = {
        id: "user_admin",
        email: "admin@consolida.mx",
        name: "Admin Sistema",
        role: "ADMIN" as Role,
      }
      setUser(mockUser)
    } catch (error) {
      console.error("Auth check failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Mock login for development - replace with real auth logic
      const mockUser = {
        id: "user_admin",
        email: "admin@consolida.mx",
        name: "Admin Sistema",
        role: "ADMIN" as Role,
      }
      setUser(mockUser)
      return true
    } catch (error) {
      console.error("Login failed:", error)
      return false
    }
  }

  const logout = async () => {
    try {
      // Mock logout for development - replace with real auth logic
      setUser(null)
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
