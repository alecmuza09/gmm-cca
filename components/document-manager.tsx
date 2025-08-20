"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, Eye, RefreshCw, CheckCircle, AlertTriangle, Clock, Download, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { OCRStatus, DocTipo } from "@prisma/client"

interface DocumentManagerProps {
  emission: any
  onUpdate: () => void
}

const DOC_TIPO_LABELS: Record<DocTipo, string> = {
  SOLICITUD_GMM: "Solicitud GMM",
  CONSTANCIA_FISCAL: "Constancia de Situación Fiscal",
  ID_OFICIAL: "Identificación Oficial",
  FORMATO_ALTA_CLIENTE: "Formato Alta de Cliente",
  ACTA_CONSTITUTIVA: "Acta Constitutiva + Boleta de Inscripción",
  CERT_POLIZA: "Certificado de Póliza",
  CARTA_ANTIGUEDAD: "Carta de Antigüedad",
  CARTA_BAJA_LABORAL: "Carta de Baja Laboral",
  CARATULA_POLIZA: "Carátula de Póliza",
  COMPROBANTE_PAGO: "Comprobante de Pago",
  CUESTIONARIO_ACTIVIDAD: "Cuestionario de Actividades de Riesgo",
  AMPLIACION_INFO_MEDICA: "Ampliación de Información Médica",
  RIESGO_SELECTO: "Cuestionario de Riesgo Selecto",
  OTRO: "Otro Documento",
}

export function DocumentManager({ emission, onUpdate }: DocumentManagerProps) {
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [processingOCR, setProcessingOCR] = useState<string | null>(null)

  const getOCRStatusBadge = (status: OCRStatus) => {
    switch (status) {
      case "OK":
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            OK
          </Badge>
        )
      case "INCOMPLETE":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Incompleto
          </Badge>
        )
      case "ILLEGIBLE":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Ilegible
          </Badge>
        )
      case "PENDING":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        )
      default:
        return <Badge variant="secondary">Desconocido</Badge>
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("emisionId", emission.id)

      const response = await fetch(`/api/emisiones/${emission.id}/documentos`, {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        toast({
          title: "Documento subido",
          description: "El documento se ha subido exitosamente y está siendo procesado por OCR.",
        })
        onUpdate()
      } else {
        throw new Error("Error al subir el documento")
      }
    } catch (error) {
      console.error("Error uploading document:", error)
      toast({
        title: "Error",
        description: "No se pudo subir el documento. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      // Reset file input
      event.target.value = ""
    }
  }

  const handleReprocessOCR = async (documentId: string) => {
    setProcessingOCR(documentId)
    try {
      const response = await fetch(`/api/ocr/reprocess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId }),
      })

      if (response.ok) {
        toast({
          title: "OCR Re-procesado",
          description: "El documento está siendo re-procesado por OCR.",
        })
        onUpdate()
      } else {
        throw new Error("Error al re-procesar OCR")
      }
    } catch (error) {
      console.error("Error reprocessing OCR:", error)
      toast({
        title: "Error",
        description: "No se pudo re-procesar el OCR. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setProcessingOCR(null)
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm("¿Está seguro de que desea eliminar este documento?")) return

    try {
      const response = await fetch(`/api/emisiones/${emission.id}/documentos/${documentId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Documento eliminado",
          description: "El documento se ha eliminado exitosamente.",
        })
        onUpdate()
      } else {
        throw new Error("Error al eliminar el documento")
      }
    } catch (error) {
      console.error("Error deleting document:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el documento. Intente nuevamente.",
        variant: "destructive",
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Subir Nuevo Documento</span>
          </CardTitle>
          <CardDescription>Seleccione un archivo PDF, JPG o PNG para subir y procesar con OCR</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              disabled={uploading}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 disabled:opacity-50"
            />
            {uploading && (
              <Alert>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <AlertDescription>Subiendo documento y procesando con OCR...</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Documentos ({emission.documentos.length})</span>
          </CardTitle>
          <CardDescription>Estado de procesamiento OCR y acciones disponibles para cada documento</CardDescription>
        </CardHeader>
        <CardContent>
          {emission.documentos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay documentos subidos</p>
              <p className="text-sm">Suba el primer documento usando el formulario de arriba</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre del Archivo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado OCR</TableHead>
                  <TableHead>Subido</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emission.documentos.map((doc: any) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <div>
                          <p className="font-medium">{doc.filename}</p>
                          <p className="text-xs text-muted-foreground">{doc.mime}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{DOC_TIPO_LABELS[doc.tipo as DocTipo] || doc.tipo}</Badge>
                    </TableCell>
                    <TableCell>{getOCRStatusBadge(doc.ocrStatus)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                        <p className="text-muted-foreground">{new Date(doc.uploadedAt).toLocaleTimeString()}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" title="Ver documento">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReprocessOCR(doc.id)}
                          disabled={processingOCR === doc.id}
                          title="Re-procesar OCR"
                        >
                          {processingOCR === doc.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </Button>
                        <Button variant="ghost" size="sm" title="Descargar">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDocument(doc.id)}
                          title="Eliminar documento"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* OCR Results */}
      {emission.documentos.some((doc: any) => doc.ocrData) && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados de OCR</CardTitle>
            <CardDescription>Datos extraídos automáticamente de los documentos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {emission.documentos
                .filter((doc: any) => doc.ocrData)
                .map((doc: any) => (
                  <div key={doc.id} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">{doc.filename}</h4>
                    
                    {/* Mostrar reporte estructurado si está disponible */}
                    {doc.ocrData.structuredReport && (
                      <div className="mb-4">
                        <h5 className="font-semibold text-sm mb-2 text-gray-900">📋 Reporte de Información Extraída</h5>
                        <div className="bg-gray-50 rounded-lg p-3 max-h-64 overflow-y-auto">
                          <pre className="whitespace-pre-wrap text-xs text-gray-700 font-mono leading-relaxed">
                            {doc.ocrData.structuredReport}
                          </pre>
                        </div>
                      </div>
                    )}
                    
                    {/* Datos JSON completos (colapsados por defecto) */}
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                        Ver datos JSON completos
                      </summary>
                      <pre className="text-xs bg-muted p-2 rounded overflow-auto mt-2">
                        {JSON.stringify(doc.ocrData, null, 2)}
                      </pre>
                    </details>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
