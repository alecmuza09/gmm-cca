export type UserRole = 'ASESOR' | 'OPERACIONES' | 'MEDICO' | 'ADMIN'

export interface Permission {
  resource: string
  actions: string[]
}

export interface RoleConfig {
  name: string
  displayName: string
  description: string
  permissions: Permission[]
  dashboardSections: string[]
  navigationItems: string[]
  canAccess: {
    createEmissions: boolean
    editEmissions: boolean
    viewAllEmissions: boolean
    viewOwnEmissions: boolean
    deleteEmissions: boolean
    manageUsers: boolean
    viewReports: boolean
    processOCR: boolean
    escalateEmissions: boolean
    resolveEmissions: boolean
    sendEmissions: boolean
    manageDocuments: boolean
    viewTimeline: boolean
    accessSettings: boolean
  }
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  ASESOR: {
    name: 'ASESOR',
    displayName: 'Asesor',
    description: 'Captura y gestiona emisiones de clientes',
    permissions: [
      { resource: 'emissions', actions: ['create', 'read_own', 'update_own'] },
      { resource: 'documents', actions: ['upload', 'view'] },
      { resource: 'ocr', actions: ['process'] }
    ],
    dashboardSections: ['own_emissions', 'create_emission', 'pending_tasks'],
    navigationItems: ['dashboard', 'new_emission', 'my_emissions'],
    canAccess: {
      createEmissions: true,
      editEmissions: true, // Solo sus propias emisiones
      viewAllEmissions: false,
      viewOwnEmissions: true,
      deleteEmissions: false,
      manageUsers: false,
      viewReports: false,
      processOCR: true,
      escalateEmissions: true,
      resolveEmissions: false,
      sendEmissions: false,
      manageDocuments: true,
      viewTimeline: true,
      accessSettings: false
    }
  },
  OPERACIONES: {
    name: 'OPERACIONES',
    displayName: 'Operaciones',
    description: 'Revisa, valida y procesa emisiones escaladas',
    permissions: [
      { resource: 'emissions', actions: ['read_all', 'update_all', 'escalate'] },
      { resource: 'documents', actions: ['upload', 'view', 'reprocess'] },
      { resource: 'faltantes', actions: ['create', 'resolve'] },
      { resource: 'reports', actions: ['view_operational'] }
    ],
    dashboardSections: ['escalated_emissions', 'pending_review', 'faltantes', 'kpis'],
    navigationItems: ['dashboard', 'all_emissions', 'faltantes', 'reports'],
    canAccess: {
      createEmissions: false,
      editEmissions: true,
      viewAllEmissions: true,
      viewOwnEmissions: true,
      deleteEmissions: false,
      manageUsers: false,
      viewReports: true,
      processOCR: true,
      escalateEmissions: true,
      resolveEmissions: true,
      sendEmissions: true,
      manageDocuments: true,
      viewTimeline: true,
      accessSettings: false
    }
  },
  MEDICO: {
    name: 'MEDICO',
    displayName: 'Médico',
    description: 'Revisa aspectos médicos de las emisiones',
    permissions: [
      { resource: 'emissions', actions: ['read_medical', 'update_medical'] },
      { resource: 'medical_review', actions: ['approve', 'reject'] },
      { resource: 'documents', actions: ['view'] }
    ],
    dashboardSections: ['medical_review', 'pending_medical', 'approved_cases'],
    navigationItems: ['dashboard', 'medical_review', 'medical_history'],
    canAccess: {
      createEmissions: false,
      editEmissions: true, // Solo aspectos médicos
      viewAllEmissions: false, // Solo emisiones escaladas a médico
      viewOwnEmissions: true,
      deleteEmissions: false,
      manageUsers: false,
      viewReports: true, // Solo reportes médicos
      processOCR: false,
      escalateEmissions: false,
      resolveEmissions: true, // Solo resolución médica
      sendEmissions: false,
      manageDocuments: false,
      viewTimeline: true,
      accessSettings: false
    }
  },
  ADMIN: {
    name: 'ADMIN',
    displayName: 'Administrador',
    description: 'Acceso completo al sistema y gestión de usuarios',
    permissions: [
      { resource: '*', actions: ['*'] }
    ],
    dashboardSections: ['all_kpis', 'user_management', 'system_health', 'all_emissions'],
    navigationItems: ['dashboard', 'all_emissions', 'users', 'reports', 'settings'],
    canAccess: {
      createEmissions: true,
      editEmissions: true,
      viewAllEmissions: true,
      viewOwnEmissions: true,
      deleteEmissions: true,
      manageUsers: true,
      viewReports: true,
      processOCR: true,
      escalateEmissions: true,
      resolveEmissions: true,
      sendEmissions: true,
      manageDocuments: true,
      viewTimeline: true,
      accessSettings: true
    }
  }
}

// Hook para obtener la configuración del rol actual
export function useRoleConfig(role: UserRole): RoleConfig {
  return ROLE_CONFIGS[role]
}

// Función para verificar permisos
export function hasPermission(
  userRole: UserRole,
  resource: string,
  action: string
): boolean {
  const config = ROLE_CONFIGS[userRole]
  
  // Admin tiene todos los permisos
  if (userRole === 'ADMIN') return true
  
  return config.permissions.some(permission => 
    (permission.resource === resource || permission.resource === '*') &&
    (permission.actions.includes(action) || permission.actions.includes('*'))
  )
}

// Función para verificar acceso a funcionalidades
export function canAccess(
  userRole: UserRole,
  feature: keyof RoleConfig['canAccess']
): boolean {
  const config = ROLE_CONFIGS[userRole]
  return config.canAccess[feature]
}

// Función para filtrar elementos de navegación
export function getNavigationItems(userRole: UserRole): string[] {
  const config = ROLE_CONFIGS[userRole]
  return config.navigationItems
}

// Función para obtener secciones del dashboard
export function getDashboardSections(userRole: UserRole): string[] {
  const config = ROLE_CONFIGS[userRole]
  return config.dashboardSections
}
