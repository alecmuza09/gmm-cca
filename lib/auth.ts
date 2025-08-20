import type { Role } from "@prisma/client"

export interface AuthUser {
  id: string
  email: string
  name?: string
  role: Role
}

// Mock auth for development - replace with real auth system
export async function getCurrentUser(): Promise<AuthUser | null> {
  // This would be replaced with actual auth logic (Clerk, NextAuth, etc.)
  return {
    id: "user_asesor",
    email: "asesor@consolida.mx",
    name: "Carlos Mendoza",
    role: "ASESOR",
  }
}

export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  const roleHierarchy = {
    ASESOR: 1,
    OPERACIONES: 2,
    MEDICO: 2,
    ADMIN: 3,
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}
