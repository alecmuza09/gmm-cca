"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, CheckCircle, AlertTriangle } from "lucide-react"
import type { EmissionFormData } from "@/components/emission-wizard"
import type { DocTipo } from "@prisma/client"
import { getRequiredDocuments } from "@/lib/validations"

interface DocumentosStepProps {
  formData: EmissionFormData
  updateFormData: (updates: Partial<EmissionFormData>) => void
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

export function DocumentosStep({ formData, updateFormData }: DocumentosStepProps) {
  const [requiredDocs, setRequiredDocs] = useState<DocTipo[]>([])
  const [uploadedDocs, setUploadedDocs] = useState<Record<DocTipo, File | null>>({} as any)

  useEffect(() => {
    if (formData.tipoEmision && formData.persona) {
      const required = getRequiredDocuments(
        formData.tipoEmision,
        formData.persona,
        formData.requiereFactura,
        formData.montoUSD,
        formData.declaraciones,
        formData.supuestosMeta,
      )
      setRequiredDocs(required)
    }
  }, [formData])

  const handleFileUpload = (docType: DocTipo, file: File | null) => {
    setUploadedDocs((prev) => ({
      ...prev,
      [docType]: file,
    }))

    // Update form data with files
    const files = Object.values({ ...uploadedDocs, [docType]: file }).filter(Boolean) as File[]
    updateFormData({ documentos: files })
  }

  const getDocumentStatus = (docType: DocTipo) => {
    if (uploadedDocs[docType]) {
      return "uploaded"
    }
    if (requiredDocs.includes(docType)) {
      return "required"
    }
    return "optional"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "uploaded":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "required":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "uploaded":
        return <Badge variant="default">Subido</Badge>
      case "required":
        return <Badge variant="destructive">Requerido</Badge>
      default:
        return <Badge variant="secondary">Opcional</Badge>
    }
  }

  const allRequiredUploaded = requiredDocs.every((doc) => uploadedDocs[doc])

  return (
    <div className="space-y-6">
      <Alert>
        <Upload className="h-4 w-4" />
        <AlertDescription>
          Suba los documentos requeridos según el tipo de emisión seleccionado. Los documentos marcados como "Requerido"
          son obligatorios para continuar.
        </AlertDescription>
      </Alert>

      {!allRequiredUploaded && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Faltan documentos requeridos. Por favor, suba todos los documentos marcados como "Requerido".
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {Object.entries(DOC_TIPO_LABELS).map(([docType, label]) => {
          const status = getDocumentStatus(docType as DocTipo)

          if (status === "optional" && !uploadedDocs[docType as DocTipo]) {
            return null // Don't show optional docs that aren't uploaded
          }

          return (
            <Card key={docType}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(status)}
                    <CardTitle className="text-base">{label}</CardTitle>
                  </div>
                  {getStatusBadge(status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      handleFileUpload(docType as DocTipo, file)
                    }}
                    className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                  {uploadedDocs[docType as DocTipo] && (
                    <p className="text-sm text-muted-foreground">Archivo: {uploadedDocs[docType as DocTipo]?.name}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Show all required documents for reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Documentos Requeridos</CardTitle>
          <CardDescription>Lista completa de documentos necesarios para este tipo de emisión</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {requiredDocs.map((docType) => (
              <div key={docType} className="flex items-center justify-between">
                <span className="text-sm">{DOC_TIPO_LABELS[docType]}</span>
                {uploadedDocs[docType] ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
