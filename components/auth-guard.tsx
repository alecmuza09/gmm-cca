"use client"

import type React from "react"

import { useAuth } from "@/components/auth-provider"
import { LoginForm } from "@/components/login-form"
import { Loader2 } from "lucide-react"
import type { Role } from "@prisma/client"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: Role
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  if (requiredRole && !hasPermission(user.role, requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Acceso Denegado</h1>
          <p className="text-muted-foreground">No tiene permisos para acceder a esta sección.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

function hasPermission(userRole: Role, requiredRole: Role): boolean {
  const roleHierarchy = {
    ASESOR: 1,
    OPERACIONES: 2,
    MEDICO: 2,
    ADMIN: 3,
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}
