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
  // For now, we'll return an admin user to test the user management functionality
  return {
    id: "user_admin",
    email: "admin@consolida.mx",
    name: "Admin Sistema",
    role: "ADMIN",
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
