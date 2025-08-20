"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Home, 
  Plus, 
  FileText, 
  Users, 
  BarChart3, 
  Settings, 
  Stethoscope,
  AlertTriangle,
  CheckCircle
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "./auth-provider"
import { getNavigationItems, canAccess, ROLE_CONFIGS } from "@/lib/roles"
import type { UserRole } from "@/lib/roles"

interface NavigationItem {
  key: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
}

const NAVIGATION_CONFIG: Record<string, NavigationItem> = {
  dashboard: {
    key: 'dashboard',
    label: 'Dashboard',
    href: '/',
    icon: Home
  },
  new_emission: {
    key: 'new_emission',
    label: 'Nueva Emisión',
    href: '/emisiones/nueva',
    icon: Plus
  },
  my_emissions: {
    key: 'my_emissions',
    label: 'Mis Emisiones',
    href: '/mis-emisiones',
    icon: FileText
  },
  all_emissions: {
    key: 'all_emissions',
    label: 'Todas las Emisiones',
    href: '/emisiones',
    icon: FileText
  },
  faltantes: {
    key: 'faltantes',
    label: 'Faltantes',
    href: '/faltantes',
    icon: AlertTriangle,
    badge: '5',
    badgeVariant: 'destructive'
  },
  medical_review: {
    key: 'medical_review',
    label: 'Revisión Médica',
    href: '/medico/revision',
    icon: Stethoscope,
    badge: '3',
    badgeVariant: 'default'
  },
  medical_history: {
    key: 'medical_history',
    label: 'Historial Médico',
    href: '/medico/historial',
    icon: CheckCircle
  },
  users: {
    key: 'users',
    label: 'Usuarios',
    href: '/admin/usuarios',
    icon: Users,
    badge: 'Admin',
    badgeVariant: 'outline'
  },
  reports: {
    key: 'reports',
    label: 'Reportes',
    href: '/reportes',
    icon: BarChart3
  },
  settings: {
    key: 'settings',
    label: 'Configuración',
    href: '/configuracion',
    icon: Settings
  }
}

export function RoleBasedNavigation() {
  const { user, loading } = useAuth()
  
  // Evitar problemas de hidratación devolviendo null durante carga inicial
  if (loading || !user?.role) return null

  const userRole = user.role as UserRole
  const allowedItems = getNavigationItems(userRole)
  const roleConfig = ROLE_CONFIGS[userRole]

  return (
    <nav className="space-y-2">
      {/* Información del rol */}
      <div className="px-3 py-2 bg-card/50 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{roleConfig.displayName}</p>
            <p className="text-xs text-muted-foreground">{roleConfig.description}</p>
          </div>
          <Badge variant="outline" className="text-xs">
            {userRole}
          </Badge>
        </div>
      </div>

      {/* Elementos de navegación */}
      <div className="space-y-1">
        {allowedItems.map(itemKey => {
          const item = NAVIGATION_CONFIG[itemKey]
          if (!item) return null

          const Icon = item.icon

          return (
            <Link key={item.key} href={item.href}>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                size="sm"
              >
                <Icon className="h-4 w-4 mr-3" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <Badge 
                    variant={item.badgeVariant || "default"} 
                    className="ml-2 text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Button>
            </Link>
          )
        })}
      </div>

      {/* Acciones rápidas según el rol */}
      <div className="pt-4 border-t">
        <p className="text-xs font-medium text-muted-foreground mb-2 px-3">
          Acciones Rápidas
        </p>
        <div className="space-y-1">
          {canAccess(userRole, 'createEmissions') && (
            <Link href="/emisiones/nueva">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Crear Emisión
              </Button>
            </Link>
          )}
          
          {userRole === 'OPERACIONES' && (
            <Link href="/faltantes">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Revisar Faltantes
              </Button>
            </Link>
          )}
          
          {userRole === 'MEDICO' && (
            <Link href="/medico/revision">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Stethoscope className="h-4 w-4 mr-2" />
                Revisar Casos
              </Button>
            </Link>
          )}
          
          {canAccess(userRole, 'viewReports') && (
            <Link href="/reportes">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Ver Reportes
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
