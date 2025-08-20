"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, Loader2, Send } from "lucide-react"
import type { EmissionFormData } from "@/components/emission-wizard"
import { useToast } from "@/hooks/use-toast"

interface RevisionStepProps {
  formData: EmissionFormData
  updateFormData: (updates: Partial<EmissionFormData>) => void
}

export function RevisionStep({ formData, updateFormData }: RevisionStepProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Create FormData for file upload
      const submitData = new FormData()

      // Add form data
      submitData.append("tipoEmision", formData.tipoEmision || "")
      submitData.append("persona", formData.persona || "")
      submitData.append("requiereFactura", formData.requiereFactura.toString())
      if (formData.montoUSD) {
        submitData.append("montoUSD", formData.montoUSD.toString())
      }
      submitData.append("solicitante", JSON.stringify(formData.solicitante))
      if (formData.moralInfo) {
        submitData.append("moralInfo", JSON.stringify(formData.moralInfo))
      }
      submitData.append("declaraciones", JSON.stringify(formData.declaraciones))
      if (formData.supuestosMeta) {
        submitData.append("supuestosMeta", JSON.stringify(formData.supuestosMeta))
      }

      // Add files
      formData.documentos.forEach((file, index) => {
        submitData.append(`documento_${index}`, file)
      })

      const response = await fetch("/api/emisiones", {
        method: "POST",
        body: submitData,
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Emisión creada exitosamente",
          description: `Folio: ${result.folio}`,
        })
        router.push("/")
      } else {
        throw new Error("Error al crear la emisión")
      }
    } catch (error) {
      console.error("Error submitting emission:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la emisión. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getClientName = () => {
    if (formData.persona === "FISICA") {
      return `${formData.solicitante.nombre || ""} ${formData.solicitante.apellidos || ""}`.trim()
    } else {
      return formData.moralInfo?.razonSocial || "No especificado"
    }
  }

  const formatTipoEmision = (tipo: string) => {
    const tipos: Record<string, string> = {
      NUEVO_NEGOCIO: "Nuevo Negocio",
      ELIMINACION_PERIODOS: "Eliminación de Períodos",
      CONVERSION_INDIVIDUAL: "Conversión Individual",
      CONEXION_GNP: "Conexión GNP",
    }
    return tipos[tipo] || tipo
  }

  const isComplete = formData.tipoEmision && formData.persona && formData.documentos.length > 0

  return (
    <div className="space-y-6">
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>Revise toda la información antes de enviar la emisión a validación OCR.</AlertDescription>
      </Alert>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tipo de Emisión:</span>
              <span>{formatTipoEmision(formData.tipoEmision || "")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tipo de Persona:</span>
              <span>{formData.persona === "FISICA" ? "Persona Física" : "Persona Moral"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cliente:</span>
              <span>{getClientName()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monto USD:</span>
              <span>{formData.montoUSD ? `$${formData.montoUSD.toLocaleString()}` : "No especificado"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Requiere Factura:</span>
              <Badge variant={formData.requiereFactura ? "default" : "secondary"}>
                {formData.requiereFactura ? "Sí" : "No"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Declaraciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Actividades de Riesgo:</span>
              <span>{formData.declaraciones.actividadesDeRiesgo?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Riesgo Selecto:</span>
              <Badge variant={formData.declaraciones.riesgoSelecto ? "destructive" : "secondary"}>
                {formData.declaraciones.riesgoSelecto ? "Sí" : "No"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Padecimientos:</span>
              <span>{formData.declaraciones.padecimientosDeclarados ? "Declarados" : "Ninguno"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Documentos Subidos</CardTitle>
          <CardDescription>{formData.documentos.length} archivos listos para procesamiento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {formData.documentos.map((file, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{file.name}</span>
                <Badge variant="default">{(file.size / 1024 / 1024).toFixed(2)} MB</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Validation Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Checklist de Validación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              {formData.tipoEmision ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">Tipo de emisión seleccionado</span>
            </div>
            <div className="flex items-center space-x-2">
              {formData.persona ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">Tipo de persona especificado</span>
            </div>
            <div className="flex items-center space-x-2">
              {getClientName() ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">Información del cliente completa</span>
            </div>
            <div className="flex items-center space-x-2">
              {formData.documentos.length > 0 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">Documentos subidos</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button onClick={handleSubmit} disabled={!isComplete || isSubmitting} size="lg" className="w-full md:w-auto">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando a Validación OCR...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Enviar a Validación OCR
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
