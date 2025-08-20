"use client"

import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { EmissionFormData } from "@/components/emission-wizard"

interface DeclaracionesStepProps {
  formData: EmissionFormData
  updateFormData: (updates: Partial<EmissionFormData>) => void
}

const ACTIVIDADES_RIESGO = [
  "paracaidismo",
  "submarinismo",
  "alpinismo",
  "motociclismo",
  "boxeo",
  "artes_marciales",
  "aviacion_deportiva",
  "carreras_automoviles",
]

export function DeclaracionesStep({ formData, updateFormData }: DeclaracionesStepProps) {
  const updateDeclaraciones = (field: string, value: any) => {
    updateFormData({
      declaraciones: {
        ...formData.declaraciones,
        [field]: value,
      },
    })
  }

  const handleActividadRiesgo = (actividad: string, checked: boolean) => {
    const currentActividades = formData.declaraciones.actividadesDeRiesgo || []
    let newActividades: string[]

    if (checked) {
      newActividades = [...currentActividades, actividad]
    } else {
      newActividades = currentActividades.filter((a) => a !== actividad)
    }

    updateDeclaraciones("actividadesDeRiesgo", newActividades)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actividades de Riesgo</CardTitle>
          <CardDescription>Seleccione las actividades de riesgo que practica el asegurado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {ACTIVIDADES_RIESGO.map((actividad) => (
              <div key={actividad} className="flex items-center space-x-2">
                <Checkbox
                  id={actividad}
                  checked={formData.declaraciones.actividadesDeRiesgo?.includes(actividad) || false}
                  onCheckedChange={(checked) => handleActividadRiesgo(actividad, checked as boolean)}
                />
                <Label htmlFor={actividad} className="capitalize">
                  {actividad.replace("_", " ")}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Riesgo Selecto</CardTitle>
          <CardDescription>Indica si el caso requiere evaluación de riesgo selecto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="riesgoSelecto"
              checked={formData.declaraciones.riesgoSelecto}
              onCheckedChange={(checked) => updateDeclaraciones("riesgoSelecto", checked)}
            />
            <Label htmlFor="riesgoSelecto">Requiere evaluación de riesgo selecto</Label>
          </div>
          {formData.declaraciones.riesgoSelecto && (
            <p className="text-sm text-muted-foreground mt-2">
              Se requerirá cuestionario de riesgo selecto y estudios con GNP
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Padecimientos Declarados</CardTitle>
          <CardDescription>Describa cualquier padecimiento médico relevante</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="padecimientos">Padecimientos</Label>
            <Textarea
              id="padecimientos"
              value={formData.declaraciones.padecimientosDeclarados || ""}
              onChange={(e) => updateDeclaraciones("padecimientosDeclarados", e.target.value)}
              placeholder="Describa los padecimientos médicos relevantes o escriba 'Ninguno' si no aplica"
              rows={4}
            />
            {formData.declaraciones.padecimientosDeclarados &&
              formData.declaraciones.padecimientosDeclarados.toLowerCase() !== "ninguno" && (
                <p className="text-sm text-muted-foreground">
                  Se requerirá formato de ampliación de información médica llenado por médico tratante
                </p>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
