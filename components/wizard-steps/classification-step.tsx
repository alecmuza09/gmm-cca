"use client"

import React from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DollarSignIcon, PercentIcon, ShieldIcon } from "lucide-react"
import type { EmissionFormData } from "@/components/emission-wizard"

type TipoEmision = "NUEVO_NEGOCIO" | "ELIMINACION_PERIODOS" | "CONVERSION_INDIVIDUAL" | "CONEXION_GNP" | "VINCULO_MUNDIAL"
type Persona = "FISICA" | "MORAL"

interface ClassificationStepProps {
  formData: EmissionFormData
  updateFormData: (updates: Partial<EmissionFormData>) => void
}

export function ClassificationStep({ formData, updateFormData }: ClassificationStepProps) {
  const extractedData = formData.ocrData?.extractedData

  // Detectar automáticamente el tipo de emisión basado en los datos extraídos
  const detectTipoEmision = (): TipoEmision => {
    if (extractedData?.numeroPoliza && extractedData?.vigenciaDesde) {
      return "NUEVO_NEGOCIO"
    }
    // Aquí se pueden agregar más reglas de detección
    return "NUEVO_NEGOCIO"
  }

  // Detectar automáticamente el tipo de persona basado en el RFC
  const detectTipoPersona = (): Persona => {
    if (extractedData?.rfc) {
      // RFC de persona física tiene 13 caracteres, persona moral 12
      return extractedData.rfc.length === 13 ? "FISICA" : "MORAL"
    }
    return "FISICA"
  }

  // Auto-detectar al cargar el componente si no hay valores previos
  React.useEffect(() => {
    if (extractedData && !formData.tipoEmision) {
      updateFormData({
        tipoEmision: detectTipoEmision(),
        persona: detectTipoPersona()
      })
    }
  }, [extractedData])

  const handleTipoEmisionChange = (value: TipoEmision) => {
    updateFormData({ tipoEmision: value })
  }

  const handlePersonaChange = (value: Persona) => {
    updateFormData({ persona: value })
  }

  const handleRequiereFacturaChange = (checked: boolean) => {
    updateFormData({ requiereFactura: checked })
  }

  const handleFinancialInfoChange = (field: string, value: string | number) => {
    const currentInfo = formData.informacionFinanciera || {}
    updateFormData({
      informacionFinanciera: {
        ...currentInfo,
        [field]: value
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Información detectada automáticamente */}
      {extractedData && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-green-600">✓</span>
              Información Detectada Automáticamente
            </CardTitle>
            <CardDescription>
              Basado en el documento procesado en el paso anterior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              {extractedData.compania && (
                <div>
                  <Label className="text-sm text-green-700">Compañía</Label>
                  <p className="font-medium">{extractedData.compania}</p>
                </div>
              )}
              {extractedData.asegurado && (
                <div>
                  <Label className="text-sm text-green-700">Asegurado</Label>
                  <p className="font-medium">{extractedData.asegurado}</p>
                </div>
              )}
              {extractedData.rfc && (
                <div>
                  <Label className="text-sm text-green-700">RFC</Label>
                  <p className="font-medium">{extractedData.rfc}</p>
                </div>
              )}
              {extractedData.numeroPoliza && (
                <div>
                  <Label className="text-sm text-green-700">Número de Póliza</Label>
                  <p className="font-medium">{extractedData.numeroPoliza}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="tipoEmision">Tipo de Emisión *</Label>
          <Select value={formData.tipoEmision || ""} onValueChange={handleTipoEmisionChange}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccione el tipo de emisión" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NUEVO_NEGOCIO">Nuevo Negocio</SelectItem>
              <SelectItem value="ELIMINACION_PERIODOS">Eliminación de Períodos</SelectItem>
              <SelectItem value="CONVERSION_INDIVIDUAL">Conversión Individual</SelectItem>
              <SelectItem value="CONEXION_GNP">Conexión GNP</SelectItem>
              <SelectItem value="VINCULO_MUNDIAL">Vínculo Mundial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="persona">Contratante *</Label>
          <Select value={formData.persona || ""} onValueChange={handlePersonaChange}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccione el tipo de contratante" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FISICA">Persona Física</SelectItem>
              <SelectItem value="MORAL">Persona Moral</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Información Financiera */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSignIcon className="h-5 w-5" />
            Información Financiera
          </CardTitle>
          <CardDescription>
            Capture los datos financieros de la póliza manualmente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selector de Moneda */}
          <div className="space-y-2">
            <Label htmlFor="moneda">Moneda *</Label>
            <Select 
              value={formData.informacionFinanciera?.moneda || "MXN"} 
              onValueChange={(value: "MXN" | "USD") => handleFinancialInfoChange("moneda", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione la moneda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MXN">🇲🇽 Pesos Mexicanos (MXN)</SelectItem>
                <SelectItem value="USD">🇺🇸 Dólares Americanos (USD)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Suma Asegurada */}
            <div className="space-y-2">
              <Label htmlFor="sumaAsegurada" className="flex items-center gap-2">
                <ShieldIcon className="h-4 w-4" />
                Suma Asegurada *
              </Label>
              <Input
                id="sumaAsegurada"
                type="number"
                placeholder="0"
                value={formData.informacionFinanciera?.sumaAsegurada || ""}
                onChange={(e) => handleFinancialInfoChange("sumaAsegurada", parseFloat(e.target.value) || 0)}
                min="0"
                step="1000"
              />
              <p className="text-xs text-muted-foreground">
                En {formData.informacionFinanciera?.moneda || "MXN"}
              </p>
            </div>

            {/* Coaseguro */}
            <div className="space-y-2">
              <Label htmlFor="coaseguro" className="flex items-center gap-2">
                <PercentIcon className="h-4 w-4" />
                Coaseguro *
              </Label>
              <Input
                id="coaseguro"
                type="number"
                placeholder="10"
                value={formData.informacionFinanciera?.coaseguro || ""}
                onChange={(e) => handleFinancialInfoChange("coaseguro", parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
                step="1"
              />
              <p className="text-xs text-muted-foreground">
                Porcentaje (%)
              </p>
            </div>

            {/* Deducible */}
            <div className="space-y-2">
              <Label htmlFor="deducible" className="flex items-center gap-2">
                <DollarSignIcon className="h-4 w-4" />
                Deducible *
              </Label>
              <Input
                id="deducible"
                type="number"
                placeholder="15000"
                value={formData.informacionFinanciera?.deducible || ""}
                onChange={(e) => handleFinancialInfoChange("deducible", parseFloat(e.target.value) || 0)}
                min="0"
                step="1000"
              />
              <p className="text-xs text-muted-foreground">
                En {formData.informacionFinanciera?.moneda || "MXN"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center space-x-2">
        <Switch
          id="requiereFactura"
          checked={formData.requiereFactura}
          onCheckedChange={handleRequiereFacturaChange}
        />
        <Label htmlFor="requiereFactura">Requiere Factura</Label>
      </div>

      {/* Additional fields for specific emission types */}
      {formData.tipoEmision === "ELIMINACION_PERIODOS" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Eliminación de Períodos</CardTitle>
            <CardDescription>Información adicional requerida</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>¿De dónde viene la póliza?</Label>
              <Select
                value={formData.supuestosMeta?.vieneDe || ""}
                onValueChange={(value: "INDIVIDUAL" | "GRUPAL") =>
                  updateFormData({
                    supuestosMeta: { ...formData.supuestosMeta, vieneDe: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el origen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INDIVIDUAL">Póliza Individual</SelectItem>
                  <SelectItem value="GRUPAL">Póliza Grupal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaFinVigencia">Fecha Fin de Vigencia Anterior</Label>
              <Input
                id="fechaFinVigencia"
                type="date"
                value={formData.supuestosMeta?.fechaFinVigencia || ""}
                onChange={(e) =>
                  updateFormData({
                    supuestosMeta: { ...formData.supuestosMeta, fechaFinVigencia: e.target.value },
                  })
                }
              />
              <p className="text-xs text-muted-foreground">Debe ser menor a 30 días para conservar antigüedad</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vínculo Mundial specific fields */}
      {formData.tipoEmision === "VINCULO_MUNDIAL" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vínculo Mundial</CardTitle>
            <CardDescription>Se contrata para viajes de placer o estudiantes en el extranjero</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Propósito del Viaje *</Label>
              <Select
                value={formData.supuestosMeta?.propositoViaje || ""}
                onValueChange={(value: "PLACER" | "ESTUDIANTE" | "TRABAJO") =>
                  updateFormData({
                    supuestosMeta: { ...formData.supuestosMeta, propositoViaje: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el propósito del viaje" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLACER">Viaje de Placer</SelectItem>
                  <SelectItem value="ESTUDIANTE">Estudiante</SelectItem>
                  <SelectItem value="TRABAJO">Trabajo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Requisitos específicos según el propósito */}
            {formData.supuestosMeta?.propositoViaje === "PLACER" && (
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">📋 Requisitos - Viaje de Placer:</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Llenado Circular</li>
                </ul>
              </div>
            )}

            {(formData.supuestosMeta?.propositoViaje === "ESTUDIANTE" || formData.supuestosMeta?.propositoViaje === "TRABAJO") && (
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">📋 Requisitos - Estudiante/Trabajo:</h4>
                <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                  <li>• Carta de Universidad (si es estudiante)</li>
                  <li>• Carta de Empresa (si es trabajo)</li>
                </ul>
              </div>
            )}

            {/* Campos adicionales para Vínculo Mundial */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="paisDestino">País de Destino *</Label>
                <Input
                  id="paisDestino"
                  placeholder="Ej: Estados Unidos, España..."
                  value={formData.supuestosMeta?.paisDestino || ""}
                  onChange={(e) =>
                    updateFormData({
                      supuestosMeta: { ...formData.supuestosMeta, paisDestino: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duracionViaje">Duración del Viaje (días) *</Label>
                <Input
                  id="duracionViaje"
                  type="number"
                  placeholder="Ej: 30"
                  min="1"
                  value={formData.supuestosMeta?.duracionViaje || ""}
                  onChange={(e) =>
                    updateFormData({
                      supuestosMeta: { ...formData.supuestosMeta, duracionViaje: e.target.value },
                    })
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fechaInicioViaje">Fecha de Inicio del Viaje *</Label>
                <Input
                  id="fechaInicioViaje"
                  type="date"
                  value={formData.supuestosMeta?.fechaInicioViaje || ""}
                  onChange={(e) =>
                    updateFormData({
                      supuestosMeta: { ...formData.supuestosMeta, fechaInicioViaje: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaFinViaje">Fecha de Fin del Viaje *</Label>
                <Input
                  id="fechaFinViaje"
                  type="date"
                  value={formData.supuestosMeta?.fechaFinViaje || ""}
                  onChange={(e) =>
                    updateFormData({
                      supuestosMeta: { ...formData.supuestosMeta, fechaFinViaje: e.target.value },
                    })
                  }
                />
              </div>
            </div>

            {(formData.supuestosMeta?.propositoViaje === "ESTUDIANTE" || formData.supuestosMeta?.propositoViaje === "TRABAJO") && (
              <div className="space-y-2">
                <Label htmlFor="institucionEmpresa">
                  {formData.supuestosMeta?.propositoViaje === "ESTUDIANTE" ? "Universidad/Institución *" : "Empresa *"}
                </Label>
                <Input
                  id="institucionEmpresa"
                  placeholder={formData.supuestosMeta?.propositoViaje === "ESTUDIANTE" ? "Nombre de la universidad" : "Nombre de la empresa"}
                  value={formData.supuestosMeta?.institucionEmpresa || ""}
                  onChange={(e) =>
                    updateFormData({
                      supuestosMeta: { ...formData.supuestosMeta, institucionEmpresa: e.target.value },
                    })
                  }
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
