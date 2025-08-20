"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { EmissionFormData } from "@/components/emission-wizard"

interface SolicitanteStepProps {
  formData: EmissionFormData
  updateFormData: (updates: Partial<EmissionFormData>) => void
}

export function SolicitanteStep({ formData, updateFormData }: SolicitanteStepProps) {
  const updateSolicitante = (field: string, value: string) => {
    updateFormData({
      solicitante: {
        ...formData.solicitante,
        [field]: value,
      },
    })
  }

  const updateDomicilio = (field: string, value: string) => {
    updateFormData({
      solicitante: {
        ...formData.solicitante,
        domicilio: {
          ...formData.solicitante.domicilio,
          [field]: value,
        },
      },
    })
  }

  const updateMoralInfo = (field: string, value: string) => {
    updateFormData({
      moralInfo: {
        ...formData.moralInfo,
        [field]: value,
      },
    })
  }

  if (formData.persona === "FISICA") {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Datos Personales</CardTitle>
            <CardDescription>Información de la persona física</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre(s) *</Label>
                <Input
                  id="nombre"
                  value={formData.solicitante.nombre || ""}
                  onChange={(e) => updateSolicitante("nombre", e.target.value)}
                  placeholder="Nombre completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellidos">Apellidos *</Label>
                <Input
                  id="apellidos"
                  value={formData.solicitante.apellidos || ""}
                  onChange={(e) => updateSolicitante("apellidos", e.target.value)}
                  placeholder="Apellidos completos"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="fechaNac">Fecha de Nacimiento</Label>
                <Input
                  id="fechaNac"
                  type="date"
                  value={formData.solicitante.fechaNac || ""}
                  onChange={(e) => updateSolicitante("fechaNac", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rfc">RFC *</Label>
                <Input
                  id="rfc"
                  value={formData.solicitante.rfc || ""}
                  onChange={(e) => updateSolicitante("rfc", e.target.value.toUpperCase())}
                  placeholder="ABCD123456EFG"
                  maxLength={13}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="curp">CURP</Label>
                <Input
                  id="curp"
                  value={formData.solicitante.curp || ""}
                  onChange={(e) => updateSolicitante("curp", e.target.value.toUpperCase())}
                  placeholder="ABCD123456HEFGHI01"
                  maxLength={18}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.solicitante.email || ""}
                  onChange={(e) => updateSolicitante("email", e.target.value)}
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={formData.solicitante.telefono || ""}
                  onChange={(e) => updateSolicitante("telefono", e.target.value)}
                  placeholder="5551234567"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Domicilio</CardTitle>
            <CardDescription>Dirección del solicitante</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="calle">Calle</Label>
                <Input
                  id="calle"
                  value={formData.solicitante.domicilio?.calle || ""}
                  onChange={(e) => updateDomicilio("calle", e.target.value)}
                  placeholder="Nombre de la calle"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  value={formData.solicitante.domicilio?.numero || ""}
                  onChange={(e) => updateDomicilio("numero", e.target.value)}
                  placeholder="123"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="colonia">Colonia</Label>
                <Input
                  id="colonia"
                  value={formData.solicitante.domicilio?.colonia || ""}
                  onChange={(e) => updateDomicilio("colonia", e.target.value)}
                  placeholder="Nombre de la colonia"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cp">Código Postal</Label>
                <Input
                  id="cp"
                  value={formData.solicitante.domicilio?.cp || ""}
                  onChange={(e) => updateDomicilio("cp", e.target.value)}
                  placeholder="12345"
                  maxLength={5}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="ciudad">Ciudad</Label>
                <Input
                  id="ciudad"
                  value={formData.solicitante.domicilio?.ciudad || ""}
                  onChange={(e) => updateDomicilio("ciudad", e.target.value)}
                  placeholder="Ciudad"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  value={formData.solicitante.domicilio?.estado || ""}
                  onChange={(e) => updateDomicilio("estado", e.target.value)}
                  placeholder="Estado"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pais">País</Label>
                <Input
                  id="pais"
                  value={formData.solicitante.domicilio?.pais || "México"}
                  onChange={(e) => updateDomicilio("pais", e.target.value)}
                  placeholder="México"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Persona Moral
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Datos de la Empresa</CardTitle>
          <CardDescription>Información de la persona moral</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="razonSocial">Razón Social *</Label>
              <Input
                id="razonSocial"
                value={formData.moralInfo?.razonSocial || ""}
                onChange={(e) => updateMoralInfo("razonSocial", e.target.value)}
                placeholder="Nombre de la empresa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rfcMoral">RFC *</Label>
              <Input
                id="rfcMoral"
                value={formData.moralInfo?.rfc || ""}
                onChange={(e) => updateMoralInfo("rfc", e.target.value.toUpperCase())}
                placeholder="ABC123456789"
                maxLength={12}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="representante">Representante Legal</Label>
              <Input
                id="representante"
                value={formData.moralInfo?.representante || ""}
                onChange={(e) => updateMoralInfo("representante", e.target.value)}
                placeholder="Nombre del representante"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="codigoCliente">Código de Cliente</Label>
              <Input
                id="codigoCliente"
                value={formData.moralInfo?.codigoCliente || ""}
                onChange={(e) => updateMoralInfo("codigoCliente", e.target.value)}
                placeholder="CLI001"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
