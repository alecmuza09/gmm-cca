"use client"

import { useAuth } from "@/components/auth-provider"
import { canAccess } from "@/lib/roles"
import type { UserRole } from "@/lib/roles"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Stethoscope, CheckCircle, XCircle, AlertTriangle, ArrowLeft, FileText } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

interface RevisionMedica {
  id: string
  emissionId: string
  folio: string
  paciente: string
  edad: number
  condicionMedica: string
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA'
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'
  fechaEscalado: string
  observaciones?: string
}

export default function RevisionMedicaPage() {
  const { user } = useAuth()
  const [revisiones, setRevisiones] = useState<RevisionMedica[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRevision, setSelectedRevision] = useState<RevisionMedica | null>(null)
  const [observaciones, setObservaciones] = useState("")

  const userRole = user?.role as UserRole

  // Verificar permisos
  if (userRole !== 'MEDICO' && userRole !== 'ADMIN') {
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
              Esta página está reservada para personal médico autorizado.
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
    fetchRevisiones()
  }, [])

  const fetchRevisiones = async () => {
    try {
      // Simular datos de revisiones médicas
      const mockRevisiones: RevisionMedica[] = [
        {
          id: '1',
          emissionId: 'emision_1',
          folio: 'GMM-2025-001',
          paciente: 'Juan Pérez García',
          edad: 45,
          condicionMedica: 'Diabetes Tipo 2, Hipertensión',
          prioridad: 'ALTA',
          estado: 'PENDIENTE',
          fechaEscalado: '2025-01-18T10:00:00Z'
        },
        {
          id: '2',
          emissionId: 'emision_2',
          folio: 'GMM-2025-002',
          paciente: 'María González López',
          edad: 32,
          condicionMedica: 'Embarazo de alto riesgo',
          prioridad: 'ALTA',
          estado: 'PENDIENTE',
          fechaEscalado: '2025-01-18T11:30:00Z'
        },
        {
          id: '3',
          emissionId: 'emision_4',
          folio: 'GMM-2025-004',
          paciente: 'Carlos Mendoza Rivera',
          edad: 28,
          condicionMedica: 'Lesión deportiva - Rodilla',
          prioridad: 'MEDIA',
          estado: 'APROBADO',
          fechaEscalado: '2025-01-17T09:00:00Z',
          observaciones: 'Aprobado para cobertura de fisioterapia y tratamiento ortopédico.'
        }
      ]
      setRevisiones(mockRevisiones)
    } catch (error) {
      console.error('Error fetching revisiones:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRevision = async (revisionId: string, decision: 'APROBADO' | 'RECHAZADO') => {
    setRevisiones(prev => prev.map(r => 
      r.id === revisionId 
        ? { ...r, estado: decision, observaciones }
        : r
    ))
    setSelectedRevision(null)
    setObservaciones("")
  }

  const revisionesPendientes = revisiones.filter(r => r.estado === 'PENDIENTE')
  const revisionesAprobadas = revisiones.filter(r => r.estado === 'APROBADO')
  const revisionesRechazadas = revisiones.filter(r => r.estado === 'RECHAZADO')

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'ALTA': return 'destructive'
      case 'MEDIA': return 'default'
      case 'BAJA': return 'secondary'
      default: return 'outline'
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'APROBADO': return 'default'
      case 'RECHAZADO': return 'destructive'
      case 'PENDIENTE': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Stethoscope className="h-6 w-6" />
                Revisión Médica
              </h1>
              <p className="text-sm text-muted-foreground">
                Evalúa y aprueba casos médicos escalados
              </p>
            </div>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* KPIs Médicos */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Casos Pendientes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{revisionesPendientes.length}</div>
              <p className="text-xs text-muted-foreground">
                {revisionesPendientes.filter(r => r.prioridad === 'ALTA').length} de alta prioridad
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aprobados Hoy</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{revisionesAprobadas.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rechazados</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{revisionesRechazadas.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
              <Stethoscope className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">1.2h</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de Revisiones */}
        <Card>
          <CardHeader>
            <CardTitle>Casos para Revisión Médica</CardTitle>
            <CardDescription>
              Emisiones escaladas que requieren evaluación médica especializada
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Cargando casos médicos...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Folio</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Edad</TableHead>
                    <TableHead>Condición Médica</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Escalado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revisiones.map((revision) => (
                    <TableRow key={revision.id}>
                      <TableCell className="font-medium">{revision.folio}</TableCell>
                      <TableCell>{revision.paciente}</TableCell>
                      <TableCell>{revision.edad} años</TableCell>
                      <TableCell className="max-w-xs truncate">{revision.condicionMedica}</TableCell>
                      <TableCell>
                        <Badge variant={getPrioridadColor(revision.prioridad) as any}>
                          {revision.prioridad}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getEstadoColor(revision.estado) as any}>
                          {revision.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(revision.fechaEscalado).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {revision.estado === 'PENDIENTE' && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  onClick={() => setSelectedRevision(revision)}
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  Revisar
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Revisión Médica - {revision.folio}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                      <h4 className="font-medium">Paciente</h4>
                                      <p className="text-sm text-muted-foreground">{revision.paciente}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-medium">Edad</h4>
                                      <p className="text-sm text-muted-foreground">{revision.edad} años</p>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium">Condición Médica</h4>
                                    <p className="text-sm text-muted-foreground">{revision.condicionMedica}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium">Observaciones Médicas</h4>
                                    <Textarea
                                      placeholder="Ingresa tus observaciones médicas aquí..."
                                      value={observaciones}
                                      onChange={(e) => setObservaciones(e.target.value)}
                                      className="min-h-[100px]"
                                    />
                                  </div>
                                  <div className="flex gap-4">
                                    <Button
                                      onClick={() => handleRevision(revision.id, 'APROBADO')}
                                      className="flex-1"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Aprobar
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleRevision(revision.id, 'RECHAZADO')}
                                      className="flex-1"
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Rechazar
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                          {revision.observaciones && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  Ver Observaciones
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Observaciones Médicas</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <p className="text-sm">{revision.observaciones}</p>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
