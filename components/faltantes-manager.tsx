"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, Clock, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FaltantesManagerProps {
  emission: any
  onUpdate: () => void
}

const FALTANTE_MESSAGES: Record<string, string> = {
  F_SIN_SOLICITUD: "Falta la Solicitud GMM",
  F_SIN_CONSTANCIA: "Requiere constancia fiscal para facturar",
  F_ID_REPRESENTANTE: "Falta Identificación del Representante Legal (Persona Moral)",
  F_VIGENCIA_FUERA_DE_PLAZO: "La vigencia anterior excede los 30 días; no conserva antigüedad",
  F_DOC_ILEGIBLE: "Documento ilegible; re-suba en alta resolución",
  F_DOMICILIO_NO_COINCIDE: "El domicilio no coincide entre documentos",
  F_FORMATO_ALTA_INCOMPLETO: "El formato de alta de cliente está incompleto",
  F_ACTA_CONSTITUTIVA: "Falta acta constitutiva o boleta de inscripción",
  F_CERT_POLIZA_ANTERIOR: "Falta certificado de póliza anterior",
  F_CARTA_ANTIGUEDAD: "Falta carta de antigüedad laboral",
  F_CUESTIONARIO_ACTIVIDAD: "Falta cuestionario de actividades de riesgo",
  F_AMPLIACION_MEDICA: "Falta ampliación de información médica",
}

export function FaltantesManager({ emission, onUpdate }: FaltantesManagerProps) {
  const { toast } = useToast()
  const [resolvingFaltante, setResolvingFaltante] = useState<string | null>(null)

  const handleResolveFaltante = async (faltanteId: string) => {
    setResolvingFaltante(faltanteId)
    try {
      const response = await fetch(`/api/faltantes/${faltanteId}/resolve`, {
        method: "PATCH",
      })

      if (response.ok) {
        toast({
          title: "Faltante resuelto",
          description: "El faltante se ha marcado como resuelto.",
        })
        onUpdate()
      } else {
        throw new Error("Error al resolver faltante")
      }
    } catch (error) {
      console.error("Error resolving faltante:", error)
      toast({
        title: "Error",
        description: "No se pudo resolver el faltante. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setResolvingFaltante(null)
    }
  }

  const handleRevalidate = async () => {
    try {
      const response = await fetch(`/api/emisiones/${emission.id}/validate`, {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "Validación ejecutada",
          description: "Se han re-evaluado las reglas de validación.",
        })
        onUpdate()
      } else {
        throw new Error("Error al re-validar")
      }
    } catch (error) {
      console.error("Error revalidating:", error)
      toast({
        title: "Error",
        description: "No se pudo re-validar la emisión. Intente nuevamente.",
        variant: "destructive",
      })
    }
  }

  const activeFaltantes = emission.faltantes.filter((f: any) => !f.resolved)
  const resolvedFaltantes = emission.faltantes.filter((f: any) => f.resolved)

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-2xl font-bold text-destructive">{activeFaltantes.length}</p>
                <p className="text-sm text-muted-foreground">Faltantes Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-500">{resolvedFaltantes.length}</p>
                <p className="text-sm text-muted-foreground">Resueltos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{emission.faltantes.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones</CardTitle>
          <CardDescription>Re-evalúe las reglas de validación después de subir nuevos documentos</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleRevalidate} variant="outline">
            <CheckCircle className="h-4 w-4 mr-2" />
            Re-validar Emisión
          </Button>
        </CardContent>
      </Card>

      {/* Active Faltantes */}
      {activeFaltantes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span>Faltantes Activos</span>
            </CardTitle>
            <CardDescription>Documentos o información requerida que falta por completar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeFaltantes.map((faltante: any) => (
                <Alert key={faltante.id} variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <div className="flex-1">
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{FALTANTE_MESSAGES[faltante.code] || faltante.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Código: {faltante.code} • Creado: {new Date(faltante.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolveFaltante(faltante.id)}
                          disabled={resolvingFaltante === faltante.id}
                        >
                          {resolvingFaltante === faltante.id ? (
                            <Clock className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <Check className="h-4 w-4 mr-1" />
                          )}
                          Marcar Resuelto
                        </Button>
                      </div>
                    </AlertDescription>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resolved Faltantes */}
      {resolvedFaltantes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Faltantes Resueltos</span>
            </CardTitle>
            <CardDescription>Documentos o información que ya se han completado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {resolvedFaltantes.map((faltante: any) => (
                <div
                  key={faltante.id}
                  className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">{FALTANTE_MESSAGES[faltante.code] || faltante.message}</p>
                      <p className="text-xs text-muted-foreground">
                        Resuelto: {new Date(faltante.resolvedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Resuelto
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Faltantes */}
      {emission.faltantes.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">¡Emisión Completa!</h3>
              <p className="text-muted-foreground">
                No hay faltantes pendientes. La emisión está lista para continuar con el proceso.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
