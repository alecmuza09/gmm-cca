"use client"

import { useAuth } from "@/components/auth-provider"
import { canAccess } from "@/lib/roles"
import type { UserRole } from "@/lib/roles"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ArrowLeft, 
  Eye, 
  Edit, 
  Plus, 
  Search, 
  Filter,
  FileText,
  Calendar,
  DollarSign
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { EmissionDetail } from "@/components/emission-detail"
import { useRouter } from "next/navigation"

interface Emision {
  id: string
  folio: string
  contratante: string
  asegurado: string
  compania: string
  ramo: string
  estado: string
  fechaCreacion: string
  fechaActualizacion: string
  prima: number
  vigenciaDesde: string
  vigenciaHasta: string
  asesor: string
}

export default function MisEmisionesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [emisiones, setEmisiones] = useState<Emision[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEmissionId, setSelectedEmissionId] = useState<string | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [estadoFilter, setEstadoFilter] = useState("TODOS")
  const [companiaFilter, setCompaniaFilter] = useState("TODAS")

  const userRole = user?.role as UserRole

  // Mostrar loading durante autenticación inicial para evitar hidratación
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>Cargando...</span>
        </div>
      </div>
    )
  }

  // Verificar permisos - solo asesores pueden ver esta página
  if (userRole !== 'ASESOR' && userRole !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Acceso Denegado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Esta página está reservada para asesores.
            </p>
            <Link href="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  useEffect(() => {
    fetchMisEmisiones()
  }, [user])

  const fetchMisEmisiones = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/emisiones?createdBy=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setEmisiones(data)
      }
    } catch (error) {
      console.error('Error fetching mis emisiones:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewEmission = (emissionId: string) => {
    setSelectedEmissionId(emissionId)
    setShowDetailDialog(true)
  }

  const handleEditEmission = (emissionId: string) => {
    router.push(`/emisiones/${emissionId}`)
  }

  const handleNewEmission = () => {
    router.push("/emisiones/nueva")
  }

  // Filtrar emisiones
  const filteredEmisiones = emisiones.filter(emision => {
    const matchesSearch = 
      emision.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emision.contratante.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emision.asegurado.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesEstado = estadoFilter === "TODOS" || emision.estado === estadoFilter
    const matchesCompania = companiaFilter === "TODAS" || emision.compania === companiaFilter

    return matchesSearch && matchesEstado && matchesCompania
  })

  // Estadísticas
  const emisionesPendientes = emisiones.filter(e => e.estado === 'PENDIENTE' || e.estado === 'EN_REVISION').length
  const emisionesAprobadas = emisiones.filter(e => e.estado === 'ALTA_VIABLE' || e.estado === 'LISTO_PARA_PORTAL').length
  const emisionesEscaladas = emisiones.filter(e => e.estado.includes('ESCALADO')).length
  const primaTotal = emisiones.reduce((sum, e) => sum + (e.prima || 0), 0)

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return 'secondary'
      case 'EN_REVISION': return 'default'
      case 'ESCALADO_OPERACIONES':
      case 'ESCALADO_MEDICO': return 'destructive'
      case 'ALTA_VIABLE': return 'default'
      case 'LISTO_PARA_PORTAL': return 'default'
      case 'CERRADO': return 'outline'
      default: return 'secondary'
    }
  }

  const getEstadoLabel = (estado: string) => {
    const estados: Record<string, string> = {
      PENDIENTE: "Pendiente",
      EN_REVISION: "En Revisión",
      ESCALADO_OPERACIONES: "Escalado - Operaciones",
      ESCALADO_MEDICO: "Escalado - Médico",
      ALTA_VIABLE: "Alta Viable",
      LISTO_PARA_PORTAL: "Listo para Portal",
      CERRADO: "Cerrado",
    }
    return estados[estado] || estado
  }

  // Obtener compañías únicas para el filtro
  const companias = [...new Set(emisiones.map(e => e.compania))].filter(Boolean)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <FileText className="h-6 w-6" />
                Mis Emisiones
              </h1>
              <p className="text-sm text-muted-foreground">
                Gestiona todas tus emisiones de seguros
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Button onClick={handleNewEmission}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Emisión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* KPIs del Asesor */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Emisiones</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{emisiones.length}</div>
              <p className="text-xs text-muted-foreground">
                {emisiones.filter(e => new Date(e.fechaCreacion) > new Date(Date.now() - 30*24*60*60*1000)).length} este mes
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{emisionesPendientes}</div>
              <p className="text-xs text-muted-foreground">
                Requieren atención
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{emisionesAprobadas}</div>
              <p className="text-xs text-muted-foreground">
                {emisionesEscaladas} escaladas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prima Total</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${primaTotal.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Valor de cartera
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y Búsqueda */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar por folio, contratante o asegurado..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos los estados</SelectItem>
                  <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                  <SelectItem value="EN_REVISION">En Revisión</SelectItem>
                  <SelectItem value="ESCALADO_OPERACIONES">Escalado - Operaciones</SelectItem>
                  <SelectItem value="ESCALADO_MEDICO">Escalado - Médico</SelectItem>
                  <SelectItem value="ALTA_VIABLE">Alta Viable</SelectItem>
                  <SelectItem value="LISTO_PARA_PORTAL">Listo para Portal</SelectItem>
                  <SelectItem value="CERRADO">Cerrado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={companiaFilter} onValueChange={setCompaniaFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Compañía" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODAS">Todas las compañías</SelectItem>
                  {companias.map((compania) => (
                    <SelectItem key={compania} value={compania}>
                      {compania}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Emisiones */}
        <Card>
          <CardHeader>
            <CardTitle>Mis Emisiones ({filteredEmisiones.length})</CardTitle>
            <CardDescription>
              Todas las emisiones que has creado y gestionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Cargando emisiones...</div>
            ) : filteredEmisiones.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  {searchTerm || estadoFilter !== "TODOS" || companiaFilter !== "TODAS" 
                    ? "No se encontraron emisiones con los filtros aplicados"
                    : "Aún no tienes emisiones creadas"
                  }
                </p>
                {!searchTerm && estadoFilter === "TODOS" && companiaFilter === "TODAS" && (
                  <Button onClick={handleNewEmission}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primera Emisión
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Folio</TableHead>
                      <TableHead>Contratante</TableHead>
                      <TableHead>Asegurado</TableHead>
                      <TableHead>Compañía</TableHead>
                      <TableHead>Ramo</TableHead>
                      <TableHead>Prima</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Vigencia</TableHead>
                      <TableHead>Fecha Creación</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmisiones.map((emision) => (
                      <TableRow key={emision.id}>
                        <TableCell className="font-medium">{emision.folio}</TableCell>
                        <TableCell>{emision.contratante}</TableCell>
                        <TableCell>{emision.asegurado}</TableCell>
                        <TableCell>{emision.compania}</TableCell>
                        <TableCell>{emision.ramo}</TableCell>
                        <TableCell>
                          {emision.prima ? `$${emision.prima.toLocaleString()}` : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getEstadoColor(emision.estado) as any}>
                            {getEstadoLabel(emision.estado)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {emision.vigenciaDesde && emision.vigenciaHasta ? (
                            <div className="text-xs">
                              <div>{new Date(emision.vigenciaDesde).toLocaleDateString()}</div>
                              <div className="text-muted-foreground">
                                a {new Date(emision.vigenciaHasta).toLocaleDateString()}
                              </div>
                            </div>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-xs">
                            <Calendar className="h-3 w-3" />
                            {new Date(emision.fechaCreacion).toLocaleDateString()}
                          </div>
                        </TableCell>
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
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Modal de Detalles */}
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
