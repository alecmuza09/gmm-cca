"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  FileText,
  Upload,
  Eye,
  RefreshCw,
  AlertTriangle,
  User,
  DollarSign,
  Building,
  Phone,
  Mail,
} from "lucide-react"
import { DocumentManager } from "@/components/document-manager"
import { FaltantesManager } from "@/components/faltantes-manager"
import { EmissionActions } from "@/components/emission-actions"
import { EmissionTimeline } from "@/components/emission-timeline"
import type { Estado, TipoEmision, Persona } from "@prisma/client"

interface EmissionData {
  id: string
  folio: string
  tipoEmision: TipoEmision
  estado: Estado
  persona: Persona
  requiereFactura: boolean
  montoUSD: number | null
  solicitante: any
  moralInfo: any
  declaraciones: any
  supuestosMeta: any
  responsable: { name: string } | null
  createdBy: { name: string }
  createdAt: string
  updatedAt: string
  documentos: any[]
  faltantes: any[]
}

interface EmissionDetailProps {
  emissionId: string
}

export function EmissionDetail({ emissionId }: EmissionDetailProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [emission, setEmission] = useState<EmissionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)
  const [isProcessingOCR, setIsProcessingOCR] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)

  // Funciones para las acciones rápidas
  const handleReprocessOCR = async () => {
    setIsProcessingOCR(true)
    try {
      const response = await fetch(`/api/ocr/reprocess`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emissionId: emissionId
        })
      })

      if (response.ok) {
        toast({
          title: "OCR Re-ejecutado",
          description: "El procesamiento OCR ha sido re-ejecutado correctamente.",
        })
        fetchEmissionData() // Refresh data
      } else {
        throw new Error('Error al re-ejecutar OCR')
      }
    } catch (error) {
      console.error('Error reprocessing OCR:', error)
      toast({
        title: "Error",
        description: "No se pudo re-ejecutar el OCR. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsProcessingOCR(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingFile(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('emissionId', emissionId)

      const response = await fetch(`/api/emisiones/${emissionId}/documentos`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        toast({
          title: "Documento subido",
          description: `El archivo "${file.name}" ha sido subido correctamente.`,
        })
        setShowUploadDialog(false)
        fetchEmissionData() // Refresh data
      } else {
        throw new Error('Error al subir documento')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      toast({
        title: "Error",
        description: "No se pudo subir el documento. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setUploadingFile(false)
    }
  }

  useEffect(() => {
    fetchEmissionData()
  }, [emissionId])

  const fetchEmissionData = async () => {
    try {
      const response = await fetch(`/api/emisiones/${emissionId}`)
      if (response.ok) {
        const data = await response.json()
        setEmission(data)
      } else {
        setError("No se pudo cargar la emisión")
      }
    } catch (error) {
      console.error("Error fetching emission:", error)
      setError("Error al cargar los datos")
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push("/")
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

  const getClientName = () => {
    if (!emission) return ""
    if (emission.persona === "FISICA") {
      return `${emission.solicitante?.nombre || ""} ${emission.solicitante?.apellidos || ""}`.trim()
    } else {
      return emission.moralInfo?.razonSocial || "Cliente no especificado"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Cargando emisión...</p>
        </div>
      </div>
    )
  }

  if (error || !emission) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive">{error || "Emisión no encontrada"}</p>
          <Button variant="outline" onClick={handleBack} className="mt-4 bg-transparent">
            Volver al Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background h-full">
      {/* Header compacto integrado */}
      <div className="bg-card/30 px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-xl font-bold">{emission.folio}</h2>
              <p className="text-sm text-muted-foreground">
                {formatTipoEmision(emission.tipoEmision)} - {getClientName()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant={getEstadoBadgeVariant(emission.estado)}>{formatEstado(emission.estado)}</Badge>
            <EmissionActions emission={emission} onUpdate={fetchEmissionData} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6 h-full">
        <div className="grid gap-4 xl:grid-cols-4 lg:grid-cols-3 h-full">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-3 lg:col-span-2 space-y-4">
            <Tabs defaultValue="resumen" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="resumen">Resumen</TabsTrigger>
                <TabsTrigger value="documentos">Documentos</TabsTrigger>
                <TabsTrigger value="faltantes">Faltantes</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>

              <TabsContent value="resumen" className="space-y-3">
                {/* Client Information */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-base">
                      <User className="h-4 w-4" />
                      <span>Información del Cliente</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {emission.persona === "FISICA" ? (
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Nombre Completo</p>
                          <p className="font-medium">{getClientName()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">RFC</p>
                          <p className="font-medium">{emission.solicitante?.rfc || "No especificado"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {emission.solicitante?.email || "No especificado"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Teléfono</p>
                          <p className="font-medium flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {emission.solicitante?.telefono || "No especificado"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Razón Social</p>
                          <p className="font-medium flex items-center">
                            <Building className="h-4 w-4 mr-1" />
                            {emission.moralInfo?.razonSocial || "No especificado"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">RFC</p>
                          <p className="font-medium">{emission.moralInfo?.rfc || "No especificado"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Representante Legal</p>
                          <p className="font-medium">{emission.moralInfo?.representante || "No especificado"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Código Cliente</p>
                          <p className="font-medium">{emission.moralInfo?.codigoCliente || "No asignado"}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Emission Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>Detalles de la Emisión</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Monto USD</p>
                        <p className="font-medium flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {emission.montoUSD ? `$${emission.montoUSD.toLocaleString()}` : "No especificado"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Requiere Factura</p>
                        <Badge variant={emission.requiereFactura ? "default" : "secondary"}>
                          {emission.requiereFactura ? "Sí" : "No"}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Creado por</p>
                        <p className="font-medium">{emission.createdBy.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Responsable</p>
                        <p className="font-medium">{emission.responsable?.name || "No asignado"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Declarations */}
                {emission.declaraciones && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Declaraciones</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Actividades de Riesgo</p>
                        <p className="font-medium">
                          {emission.declaraciones.actividadesDeRiesgo?.length > 0
                            ? emission.declaraciones.actividadesDeRiesgo.join(", ")
                            : "Ninguna"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Riesgo Selecto</p>
                        <Badge variant={emission.declaraciones.riesgoSelecto ? "destructive" : "secondary"}>
                          {emission.declaraciones.riesgoSelecto ? "Sí" : "No"}
                        </Badge>
                      </div>
                      {emission.declaraciones.padecimientosDeclarados && (
                        <div>
                          <p className="text-sm text-muted-foreground">Padecimientos Declarados</p>
                          <p className="font-medium">{emission.declaraciones.padecimientosDeclarados}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="documentos">
                <DocumentManager emission={emission} onUpdate={fetchEmissionData} />
              </TabsContent>

              <TabsContent value="faltantes">
                <FaltantesManager emission={emission} onUpdate={fetchEmissionData} />
              </TabsContent>

              <TabsContent value="timeline">
                <EmissionTimeline emission={emission} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Estado Actual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Badge variant={getEstadoBadgeVariant(emission.estado)} className="text-sm px-3 py-1">
                    {formatEstado(emission.estado)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Documentos:</span>
                    <span>{emission.documentos.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Faltantes:</span>
                    <span className="text-destructive">{emission.faltantes.filter((f) => !f.resolved).length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Creado:</span>
                    <span>{new Date(emission.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Actualizado:</span>
                    <span>{new Date(emission.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start bg-transparent"
                  onClick={handleReprocessOCR}
                  disabled={isProcessingOCR}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isProcessingOCR ? 'animate-spin' : ''}`} />
                  {isProcessingOCR ? 'Procesando...' : 'Re-ejecutar OCR'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start bg-transparent"
                  onClick={() => setShowUploadDialog(true)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Subir Documento
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start bg-transparent"
                  onClick={() => setShowHistoryDialog(true)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Historial
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Diálogo para subir documento */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subir Documento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file-upload">Seleccionar archivo</Label>
              <Input
                id="file-upload"
                type="file"
                onChange={handleFileUpload}
                disabled={uploadingFile}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Formatos soportados: PDF, JPG, PNG, DOC, DOCX (máx. 10MB)
              </p>
            </div>
            {uploadingFile && (
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-sm">Subiendo archivo...</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo para ver historial */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Historial de la Emisión</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {emission && (
              <EmissionTimeline emissionId={emission.id} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
