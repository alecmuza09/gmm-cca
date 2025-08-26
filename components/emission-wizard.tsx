"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { SolicitudStep } from "@/components/wizard-steps/solicitud-step"
import { ClassificationStep } from "@/components/wizard-steps/classification-step"
import { SolicitanteStep } from "@/components/wizard-steps/solicitante-step"
import { DeclaracionesStep } from "@/components/wizard-steps/declaraciones-step"
import { DocumentosStep } from "@/components/wizard-steps/documentos-step"
import { RevisionStep } from "@/components/wizard-steps/revision-step"

export type TipoEmision = "NUEVO_NEGOCIO" | "ELIMINACION_PERIODOS" | "CONVERSION_INDIVIDUAL" | "CONEXION_GNP" | "VINCULO_MUNDIAL"
export type Persona = "FISICA" | "MORAL"

export interface EmissionFormData {
  // Step 1: Classification
  tipoEmision?: TipoEmision
  persona?: Persona
  requiereFactura: boolean
  
  // Información financiera manual
  informacionFinanciera?: {
    primaTotal?: number
    moneda?: "MXN" | "USD"
  }

  // Step 2: Solicitante
  solicitante: {
    nombre?: string
    apellidos?: string
    fechaNac?: string
    rfc?: string
    curp?: string
    email?: string
    telefono?: string
    domicilio?: {
      calle?: string
      numero?: string
      colonia?: string
      cp?: string
      ciudad?: string
      estado?: string
      pais?: string
    }
  }

  // Moral info
  moralInfo?: {
    razonSocial?: string
    rfc?: string
    representante?: string
    representanteId?: string
    codigoCliente?: string
  }

  // Step 3: Declaraciones
  declaraciones: {
    actividadesDeRiesgo: string[]
    riesgoSelecto: boolean
    padecimientosDeclarados?: string
  }

  // Step 3: OCR Data
  ocrData?: {
    caratulaFile?: File
    extractedData?: {
      numeroPoliza?: string
      vigenciaDesde?: string
      vigenciaHasta?: string
      asegurado?: string
      beneficiario?: string
      prima?: number
      sumaAsegurada?: number
      compania?: string
      agente?: string
      rfc?: string
      telefono?: string
      email?: string
      codigoPostal?: string
      ciudad?: string
      estado?: string
      planCobertura?: string
      deducible?: string
      coaseguro?: string
      [key: string]: any
    }
    isProcessing?: boolean
    processingComplete?: boolean
    error?: string
  }

  // Step 4: Supuestos meta
  supuestosMeta?: {
    // Eliminación de períodos
    vieneDe?: "INDIVIDUAL" | "GRUPAL"
    fechaFinVigencia?: string
    
    // Vínculo Mundial
    propositoViaje?: "PLACER" | "ESTUDIANTE" | "TRABAJO"
    paisDestino?: string
    duracionViaje?: string
    fechaInicioViaje?: string
    fechaFinViaje?: string
    institucionEmpresa?: string
  }

  // Documents will be handled separately
  documentos: File[]
}

const STEPS = [
  { id: 1, title: "Clasificación", description: "Tipo de emisión y información financiera" },
  { id: 2, title: "Solicitud", description: "Cargar y procesar documento" },
  { id: 3, title: "Contratante", description: "Completar información del cliente" },
  { id: 4, title: "Declaraciones", description: "Riesgos y padecimientos" },
  { id: 5, title: "Documentos", description: "Carga de archivos adicionales" },
  { id: 6, title: "Revisión", description: "Verificación y envío" },
]

export function EmissionWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<EmissionFormData>({
    requiereFactura: false,
    informacionFinanciera: {
      moneda: "MXN"
    },
    solicitante: {},
    declaraciones: {
      actividadesDeRiesgo: [],
      riesgoSelecto: false,
    },
    documentos: [],
  })

  const updateFormData = (updates: Partial<EmissionFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        // Paso 1: Clasificación - validación básica + información financiera
        if (!formData.tipoEmision || !formData.persona) return false
        
        // Validar información financiera
        const finInfo = formData.informacionFinanciera
        if (!finInfo?.primaTotal || !finInfo?.moneda) return false
        
        // Validación específica para Vínculo Mundial
        if (formData.tipoEmision === "VINCULO_MUNDIAL") {
          const meta = formData.supuestosMeta
          if (!meta?.propositoViaje || !meta?.paisDestino || !meta?.duracionViaje || 
              !meta?.fechaInicioViaje || !meta?.fechaFinViaje) return false
          
          // Validación adicional para estudiante/trabajo
          if ((meta.propositoViaje === "ESTUDIANTE" || meta.propositoViaje === "TRABAJO") && 
              !meta.institucionEmpresa) return false
        }
        
        // Validación específica para Eliminación de Períodos
        if (formData.tipoEmision === "ELIMINACION_PERIODOS") {
          const meta = formData.supuestosMeta
          if (!meta?.vieneDe || !meta?.fechaFinVigencia) return false
        }
        
        return true
      case 2:
        // Paso 2: Solicitud - debe tener documento procesado
        return formData.ocrData?.processingComplete && formData.ocrData?.extractedData
      case 3:
        // Paso 3: Contratante - información básica requerida
        if (formData.persona === "FISICA") {
          return formData.solicitante.nombre && formData.solicitante.apellidos && formData.solicitante.rfc
        } else {
          return formData.moralInfo?.razonSocial && formData.moralInfo?.rfc
        }
      case 4:
        return true // Declaraciones are optional
      case 5:
        return true // Documents validation will be handled in the step
      default:
        return true
    }
  }

  const handleBack = () => {
    router.push("/")
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <ClassificationStep formData={formData} updateFormData={updateFormData} />
      case 2:
        return <SolicitudStep formData={formData} updateFormData={updateFormData} onValidateAndContinue={nextStep} />
      case 3:
        return <SolicitanteStep formData={formData} updateFormData={updateFormData} />
      case 4:
        return <DeclaracionesStep formData={formData} updateFormData={updateFormData} />
      case 5:
        return <DocumentosStep formData={formData} updateFormData={updateFormData} />
      case 6:
        return <RevisionStep formData={formData} updateFormData={updateFormData} />
      default:
        return null
    }
  }

  const progress = (currentStep / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-bold">Nueva Emisión GMM</h1>
                <p className="text-sm text-muted-foreground">
                  Paso {currentStep} de {STEPS.length}: {STEPS[currentStep - 1]?.title}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={progress} className="w-full" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Step Navigation */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                      step.id === currentStep
                        ? "bg-primary text-primary-foreground"
                        : step.id < currentStep
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.id}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`w-12 h-0.5 mx-2 ${step.id < currentStep ? "bg-primary" : "bg-muted"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle>{STEPS[currentStep - 1]?.title}</CardTitle>
              <CardDescription>{STEPS[currentStep - 1]?.description}</CardDescription>
            </CardHeader>
            <CardContent>{renderStep()}</CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
            <Button onClick={nextStep} disabled={!canProceed() || currentStep === STEPS.length}>
              Siguiente
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
