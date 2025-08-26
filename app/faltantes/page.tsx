"use client"

import { useAuth } from "@/components/auth-provider"
import { canAccess } from "@/lib/roles"
import type { UserRole } from "@/lib/roles"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle, CheckCircle, Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

interface Faltante {
  id: string
  emissionId: string
  folio: string
  tipo: string
  descripcion: string
  estado: 'PENDIENTE' | 'RESUELTO'
  fechaCreacion: string
  fechaResolucion?: string
  responsable?: string
}

export default function FaltantesPage() {
  const { user } = useAuth()
  const [faltantes, setFaltantes] = useState<Faltante[]>([])
  const [loading, setLoading] = useState(true)

  const userRole = user?.role as UserRole

  // Verificar permisos
  if (!canAccess(userRole, 'viewAllEmissions') && userRole !== 'OPERACIONES') {
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
              No tienes permisos para acceder a esta página.
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
    fetchFaltantes()
  }, [])

  const fetchFaltantes = async () => {
    try {
      // Simular datos de faltantes
      const mockFaltantes: Faltante[] = [
        {
          id: '1',
          emissionId: 'emision_1',
          folio: 'GMM-2025-001',
          tipo: 'Documento',
          descripcion: 'Falta identificación oficial del contratante',
          estado: 'PENDIENTE',
          fechaCreacion: '2025-01-18T10:00:00Z',
          responsable: 'Juan Pérez García'
        },
        {
          id: '2',
          emissionId: 'emision_2',
          folio: 'GMM-2025-002',
          tipo: 'Información',
          descripcion: 'Completar información médica del beneficiario',
          estado: 'PENDIENTE',
          fechaCreacion: '2025-01-18T11:30:00Z',
          responsable: 'Tecnología Avanzada SA'
        },
        {
          id: '3',
          emissionId: 'emision_3',
          folio: 'GMM-2025-003',
          tipo: 'Documento',
          descripcion: 'Carátula de póliza anterior',
          estado: 'RESUELTO',
          fechaCreacion: '2025-01-17T09:00:00Z',
          fechaResolucion: '2025-01-18T14:00:00Z',
          responsable: 'ALEC MUZA'
        }
      ]
      setFaltantes(mockFaltantes)
    } catch (error) {
      console.error('Error fetching faltantes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResolverFaltante = async (faltanteId: string) => {
    // Simular resolución
    setFaltantes(prev => prev.map(f => 
      f.id === faltanteId 
        ? { ...f, estado: 'RESUELTO' as const, fechaResolucion: new Date().toISOString() }
        : f
    ))
  }

  const faltantesPendientes = faltantes.filter(f => f.estado === 'PENDIENTE')
  const faltantesResueltos = faltantes.filter(f => f.estado === 'RESUELTO')

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Gestión de Faltantes</h1>
              <p className="text-sm text-muted-foreground">
                Administra los faltantes y documentos pendientes
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
        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faltantes Pendientes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{faltantesPendientes.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resueltos Hoy</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{faltantesResueltos.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">2.5h</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de Faltantes */}
        <Card>
          <CardHeader>
            <CardTitle>Faltantes por Resolver</CardTitle>
            <CardDescription>
              Lista de documentos e información pendiente por completar
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Cargando faltantes...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Folio</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faltantes.map((faltante) => (
                    <TableRow key={faltante.id}>
                      <TableCell className="font-medium">{faltante.folio}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{faltante.tipo}</Badge>
                      </TableCell>
                      <TableCell>{faltante.descripcion}</TableCell>
                      <TableCell>{faltante.responsable}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={faltante.estado === 'PENDIENTE' ? 'destructive' : 'default'}
                        >
                          {faltante.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(faltante.fechaCreacion).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {faltante.estado === 'PENDIENTE' && (
                          <Button
                            size="sm"
                            onClick={() => handleResolverFaltante(faltante.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Resolver
                          </Button>
                        )}
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
