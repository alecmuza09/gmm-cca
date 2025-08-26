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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  DollarSign,
  Users,
  Building
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { EmissionDetail } from "@/components/emission-detail"
import { useRouter, useSearchParams } from "next/navigation"

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
  createdBy: string
}

export default function EmisionesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [emisiones, setEmisiones] = useState<Emision[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEmissionId, setSelectedEmissionId] = useState<string | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [estadoFilter, setEstadoFilter] = useState("TODOS")
  const [companiaFilter, setCompaniaFilter] = useState("TODAS")
  const [asesorFilter, setAsesorFilter] = useState("TODOS")
  const [activeTab, setActiveTab] = useState("all")

  const userRole = user?.role as UserRole
  const filterParam = searchParams?.get('filter')

  // Verificar permisos
  if (!canAccess(userRole, 'viewAllEmissions') && userRole !== 'ASESOR') {
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
              No tienes permisos para ver todas las emisiones.
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
    // Si el filtro es "own" y es asesor, redirigir a mis-emisiones
    if (filterParam === 'own' && userRole === 'ASESOR') {
      router.replace('/mis-emisiones')
      return
    }
    
    fetchEmisiones()
  }, [user, filterParam, userRole, router])

  const fetchEmisiones = async () => {
    try {
      setLoading(true)
      let url = '/api/emisiones'
      
      // Si es asesor, solo puede ver sus emisiones
      if (userRole === 'ASESOR') {
        url += `?createdBy=${user?.id}`
      }
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setEmisiones(data)
      }
    } catch (error) {
      console.error('Error fetching emisiones:', error)
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
    const matchesAsesor = asesorFilter === "TODOS" || emision.createdBy === asesorFilter

    let matchesTab = true
    if (activeTab === "pending") {
      matchesTab = emision.estado === 'PENDIENTE' || emision.estado === 'EN_REVISION'
    } else if (activeTab === "escalated") {
      matchesTab = emision.estado.includes('ESCALADO')
    } else if (activeTab === "approved") {
      matchesTab = emision.estado === 'ALTA_VIABLE' || emision.estado === 'LISTO_PARA_PORTAL'
    } else if (activeTab === "closed") {
      matchesTab = emision.estado === 'CERRADO'
    }

    return matchesSearch && matchesEstado && matchesCompania && matchesAsesor && matchesTab
  })

  // Estadísticas
  const totalEmisiones = emisiones.length
  const emisionesPendientes = emisiones.filter(e => e.estado === 'PENDIENTE' || e.estado === 'EN_REVISION').length
  const emisionesEscaladas = emisiones.filter(e => e.estado.includes('ESCALADO')).length
  const emisionesAprobadas = emisiones.filter(e => e.estado === 'ALTA_VIABLE' || e.estado === 'LISTO_PARA_PORTAL').length
  const emisionesCerradas = emisiones.filter(e => e.estado === 'CERRADO').length
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

  // Obtener listas únicas para filtros
  const companias = [...new Set(emisiones.map(e => e.compania))].filter(Boolean)
  const asesores = [...new Set(emisiones.map(e => e.asesor))].filter(Boolean)

  const pageTitle = userRole === 'ASESOR' ? 'Mis Emisiones' : 'Todas las Emisiones'
  const pageDescription = userRole === 'ASESOR' 
    ? 'Gestiona todas tus emisiones de seguros' 
    : 'Administra todas las emisiones del sistema'

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <FileText className="h-6 w-6" />
                {pageTitle}
              </h1>
              <p className="text-sm text-muted-foreground">
                {pageDescription}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              {canAccess(userRole, 'createEmissions') && (
                <Button onClick={handleNewEmission}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Emisión
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-5 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalEmisiones}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{emisionesPendientes}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Escaladas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{emisionesEscaladas}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{emisionesAprobadas}</div>
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
            </CardContent>
          </Card>
        </div>

        {/* Filtros y Búsqueda */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por folio, contratante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                <SelectTrigger>
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
                <SelectTrigger>
                  <Building className="h-4 w-4 mr-2" />
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

              {userRole !== 'ASESOR' && (
                <Select value={asesorFilter} onValueChange={setAsesorFilter}>
                  <SelectTrigger>
                    <Users className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Asesor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODOS">Todos los asesores</SelectItem>
                    {asesores.map((asesor) => (
                      <SelectItem key={asesor} value={asesor}>
                        {asesor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs de Emisiones */}
        <Card>
          <CardHeader>
            <CardTitle>Emisiones ({filteredEmisiones.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">
                  Todas ({totalEmisiones})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pendientes ({emisionesPendientes})
                </TabsTrigger>
                <TabsTrigger value="escalated">
                  Escaladas ({emisionesEscaladas})
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Aprobadas ({emisionesAprobadas})
                </TabsTrigger>
                <TabsTrigger value="closed">
                  Cerradas ({emisionesCerradas})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-6">
                {loading ? (
                  <div className="text-center py-8">Cargando emisiones...</div>
                ) : filteredEmisiones.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No se encontraron emisiones con los filtros aplicados
                    </p>
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
                          {userRole !== 'ASESOR' && <TableHead>Asesor</TableHead>}
                          <TableHead>Vigencia</TableHead>
                          <TableHead>Fecha</TableHead>
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
                            {userRole !== 'ASESOR' && (
                              <TableCell>{emision.asesor || '-'}</TableCell>
                            )}
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
              </TabsContent>
            </Tabs>
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
