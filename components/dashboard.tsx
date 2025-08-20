"use client"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { RoleBasedNavigation } from "./role-based-navigation"
import { canAccess, getDashboardSections, ROLE_CONFIGS } from "@/lib/roles"
import type { UserRole } from "@/lib/roles"
import {
  LogOut,
  User,
  Plus,
  Search,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  ArrowUpRight,
  Settings,
  FileText,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { EmissionDetail } from "./emission-detail"
import type { Estado, TipoEmision } from "@prisma/client"

interface KPIData {
  emisionesHoy: number
  emisionesSemana: number
  emisionesMes: number
  porcentajeCompletas: number
  porcentajeEscaladas: number
  slaPromedio: number
}

interface EmisionSummary {
  id: string
  folio: string
  tipoEmision: TipoEmision
  cliente: string
  montoUSD: number | null
  estado: Estado
  faltantesCount: number
  responsable: string | null
  ultimaActualizacion: string
}

export function Dashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [kpis, setKpis] = useState<KPIData | null>(null)
  const [emisiones, setEmisiones] = useState<EmisionSummary[]>([])
  const [filteredEmisiones, setFilteredEmisiones] = useState<EmisionSummary[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [estadoFilter, setEstadoFilter] = useState<string>("all")
  const [selectedEmissionId, setSelectedEmissionId] = useState<string | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [tipoFilter, setTipoFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  // Funciones para manejar las acciones
  const handleViewEmission = (emissionId: string) => {
    setSelectedEmissionId(emissionId)
    setShowDetailDialog(true)
  }

  const handleEditEmission = (emissionId: string) => {
    router.push(`/emisiones/${emissionId}`)
  }

  const handleSendEmission = async (emissionId: string) => {
    try {
      const response = await fetch(`/api/emisiones/${emissionId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        toast({
          title: "Emisión enviada",
          description: "La emisión ha sido enviada correctamente.",
        })
        fetchDashboardData() // Refresh data
      } else {
        throw new Error('Error al enviar la emisión')
      }
    } catch (error) {
      console.error('Error sending emission:', error)
      toast({
        title: "Error",
        description: "No se pudo enviar la emisión. Intente nuevamente.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    // Filter emissions based on search and filters
    let filtered = emisiones

    if (searchTerm) {
      filtered = filtered.filter(
        (e) =>
          e.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.cliente.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (estadoFilter !== "all") {
      filtered = filtered.filter((e) => e.estado === estadoFilter)
    }

    if (tipoFilter !== "all") {
      filtered = filtered.filter((e) => e.tipoEmision === tipoFilter)
    }

    setFilteredEmisiones(filtered)
  }, [emisiones, searchTerm, estadoFilter, tipoFilter])

  const fetchDashboardData = async () => {
    try {
      // Filtrar URL de emisiones según rol
      const userRole = user?.role as UserRole
      let emissionsUrl = '/api/emisiones'
      
      // Si es asesor, solo ver sus propias emisiones
      if (userRole === 'ASESOR') {
        emissionsUrl += `?createdBy=${user.id}`
      }
      // Si es médico, solo ver emisiones escaladas a médico
      else if (userRole === 'MEDICO') {
        emissionsUrl += '?estado=ESCALADO_MEDICO'
      }

      const [kpiResponse, emisionesResponse] = await Promise.all([
        fetch("/api/dashboard/kpis"),
        fetch(emissionsUrl),
      ])

      if (kpiResponse.ok) {
        const kpiData = await kpiResponse.json()
        setKpis(kpiData)
      }

      if (emisionesResponse.ok) {
        const emisionesData = await emisionesResponse.json()
        setEmisiones(emisionesData)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getEstadoBadgeVariant = (estado: Estado) => {
    switch (estado) {
      case "BORRADOR":
        return "secondary"
      case "EN_REVISION_OCR":
        return "default"
      case "FALTANTES":
        return "destructive"
      case "ALTA_VIABLE":
        return "default"
      case "ESCALADO_OPERACIONES":
      case "ESCALADO_MEDICO":
        return "destructive"
      case "LISTO_PARA_PORTAL":
        return "default"
      case "CERRADO":
        return "default"
      default:
        return "secondary"
    }
  }

  const formatTipoEmision = (tipo: TipoEmision) => {
    const tipos = {
      NUEVO_NEGOCIO: "Nuevo Negocio",
      ELIMINACION_PERIODOS: "Eliminación Periodos",
      CONVERSION_INDIVIDUAL: "Conversión Individual",
      CONEXION_GNP: "Conexión GNP",
    }
    return tipos[tipo] || tipo
  }

  const formatEstado = (estado: Estado) => {
    const estados = {
      BORRADOR: "Borrador",
      EN_REVISION_OCR: "En Revisión OCR",
      FALTANTES: "Faltantes",
      ALTA_VIABLE: "Alta Viable",
      ESCALADO_OPERACIONES: "Escalado Operaciones",
      ESCALADO_MEDICO: "Escalado Médico",
      LISTO_PARA_PORTAL: "Listo para Portal",
      CERRADO: "Cerrado",
    }
    return estados[estado] || estado
  }

  const handleNewEmission = () => {
    router.push("/emisiones/nueva")
  }

  const userRole = user?.role as UserRole
  const roleConfig = ROLE_CONFIGS[userRole]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">GMM - Consolidacapital</h1>
            <p className="text-sm text-muted-foreground">Sistema de Gestión de Gastos Médicos Mayores</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="text-sm">{user?.name}</span>
              <Badge variant="outline" className="text-xs">
                {roleConfig?.displayName || user?.role}
              </Badge>
            </div>
            {canAccess(userRole, 'accessSettings') && (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/configuracion">
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración
                </Link>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <RoleBasedNavigation />
          </div>
          
          {/* Main Dashboard Content */}
          <main className="lg:col-span-3 space-y-6">
        {/* KPI Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emisiones Hoy</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis?.emisionesHoy || 0}</div>
              <p className="text-xs text-muted-foreground">
                {kpis?.emisionesSemana || 0} esta semana, {kpis?.emisionesMes || 0} este mes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">% Completas</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis?.porcentajeCompletas || 0}%</div>
              <p className="text-xs text-muted-foreground">Emisiones sin faltantes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">% Escaladas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis?.porcentajeEscaladas || 0}%</div>
              <p className="text-xs text-muted-foreground">Requieren atención especial</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SLA Promedio</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis?.slaPromedio || 0}h</div>
              <p className="text-xs text-muted-foreground">Tiempo de procesamiento</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por folio o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={estadoFilter} onValueChange={setEstadoFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="BORRADOR">Borrador</SelectItem>
              <SelectItem value="EN_REVISION_OCR">En Revisión OCR</SelectItem>
              <SelectItem value="FALTANTES">Faltantes</SelectItem>
              <SelectItem value="ALTA_VIABLE">Alta Viable</SelectItem>
              <SelectItem value="ESCALADO_OPERACIONES">Escalado Operaciones</SelectItem>
              <SelectItem value="ESCALADO_MEDICO">Escalado Médico</SelectItem>
              <SelectItem value="LISTO_PARA_PORTAL">Listo para Portal</SelectItem>
              <SelectItem value="CERRADO">Cerrado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={tipoFilter} onValueChange={setTipoFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="NUEVO_NEGOCIO">Nuevo Negocio</SelectItem>
              <SelectItem value="ELIMINACION_PERIODOS">Eliminación Periodos</SelectItem>
              <SelectItem value="CONVERSION_INDIVIDUAL">Conversión Individual</SelectItem>
              <SelectItem value="CONEXION_GNP">Conexión GNP</SelectItem>
            </SelectContent>
          </Select>

          <div className="space-y-2">
            <Button onClick={handleNewEmission} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Emisión
            </Button>
            {userRole === 'ASESOR' && (
              <Link href="/mis-emisiones">
                <Button variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Ver Mis Emisiones
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Emissions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Casos de Emisión</CardTitle>
            <CardDescription>
              {filteredEmisiones.length} de {emisiones.length} emisiones
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Cargando emisiones...</div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Folio</TableHead>
                    <TableHead>Tipo de Emisión</TableHead>
                    <TableHead>Cliente/Contratante</TableHead>
                    <TableHead>Monto (USD)</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Faltantes</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead>Última Actualización</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmisiones.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No se encontraron emisiones
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEmisiones.map((emision) => (
                      <TableRow key={emision.id}>
                        <TableCell className="font-medium">{emision.folio}</TableCell>
                        <TableCell>{formatTipoEmision(emision.tipoEmision)}</TableCell>
                        <TableCell>{emision.cliente}</TableCell>
                        <TableCell>{emision.montoUSD ? `$${emision.montoUSD.toLocaleString()}` : "-"}</TableCell>
                        <TableCell>
                          <Badge variant={getEstadoBadgeVariant(emision.estado)}>{formatEstado(emision.estado)}</Badge>
                        </TableCell>
                        <TableCell>
                          {emision.faltantesCount > 0 ? (
                            <Badge variant="destructive">{emision.faltantesCount}</Badge>
                          ) : (
                            <Badge variant="default">0</Badge>
                          )}
                        </TableCell>
                        <TableCell>{emision.responsable || "-"}</TableCell>
                        <TableCell>{new Date(emision.ultimaActualizacion).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewEmission(emision.id)}
                              title="Ver detalles"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {canAccess(userRole, 'editEmissions') && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditEmission(emision.id)}
                                title="Editar emisión"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {canAccess(userRole, 'sendEmissions') && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleSendEmission(emision.id)}
                                title="Enviar emisión"
                              >
                                <ArrowUpRight className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
          </main>
        </div>
      </div>

      {/* Diálogo para ver detalles de emisión */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-[98vw] w-[98vw] max-h-[98vh] h-[98vh] p-0 gap-0 overflow-hidden">
          <div className="flex flex-col h-full">
            <DialogHeader className="px-6 py-4 border-b shrink-0">
              <DialogTitle className="text-2xl font-bold">Detalles de la Emisión</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto">
              {selectedEmissionId && (
                <EmissionDetail emissionId={selectedEmissionId} />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
