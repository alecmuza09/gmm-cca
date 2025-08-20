"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, AlertTriangle, ArrowRight } from "lucide-react"

interface WorkflowStatusProps {
  emission: any
}

const WORKFLOW_STEPS = [
  { state: "BORRADOR", label: "Borrador", description: "Emisión en preparación" },
  { state: "EN_REVISION_OCR", label: "Revisión OCR", description: "Procesando documentos" },
  { state: "FALTANTES", label: "Faltantes", description: "Documentos pendientes" },
  { state: "ALTA_VIABLE", label: "Alta Viable", description: "Lista para procesar" },
  { state: "LISTO_PARA_PORTAL", label: "Listo Portal", description: "Preparado para envío" },
  { state: "CERRADO", label: "Cerrado", description: "Proceso completado" },
]

const ESCALATION_STEPS = [
  { state: "ESCALADO_OPERACIONES", label: "Escalado Operaciones", description: "Revisión especializada" },
  { state: "ESCALADO_MEDICO", label: "Escalado Médico", description: "Evaluación médica" },
]

export function WorkflowStatus({ emission }: WorkflowStatusProps) {
  const getCurrentStepIndex = () => {
    if (emission.escaladoA) {
      return -1 // Escalated workflow
    }
    return WORKFLOW_STEPS.findIndex((step) => step.state === emission.estado)
  }

  const getStepStatus = (stepIndex: number, currentIndex: number) => {
    if (stepIndex < currentIndex) return "completed"
    if (stepIndex === currentIndex) return "current"
    return "pending"
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "current":
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
    }
  }

  const currentStepIndex = getCurrentStepIndex()
  const progress = emission.escaladoA ? 0 : ((currentStepIndex + 1) / WORKFLOW_STEPS.length) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ArrowRight className="h-5 w-5" />
          <span>Estado del Workflow</span>
        </CardTitle>
        <CardDescription>Progreso de la emisión a través del proceso</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        {!emission.escaladoA && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Escalation Status */}
        {emission.escaladoA && (
          <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span className="font-medium">Emisión Escalada</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Esta emisión ha sido escalada para revisión especializada.
            </p>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              {emission.escaladoA === "MEDICO" ? "Evaluación Médica" : "Revisión Operaciones"}
            </Badge>
            {emission.responsable && (
              <p className="text-sm text-muted-foreground mt-2">Asignado a: {emission.responsable.name}</p>
            )}
          </div>
        )}

        {/* Workflow Steps */}
        <div className="space-y-4">
          <h4 className="font-medium">{emission.escaladoA ? "Proceso de Escalación" : "Flujo Principal"}</h4>

          {emission.escaladoA ? (
            // Show escalation steps
            <div className="space-y-3">
              {ESCALATION_STEPS.map((step) => (
                <div
                  key={step.state}
                  className={`flex items-center space-x-3 p-3 rounded-lg ${
                    step.state === emission.estado
                      ? "bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800"
                      : "bg-muted/50"
                  }`}
                >
                  {step.state === emission.estado ? (
                    <Clock className="h-4 w-4 text-blue-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{step.label}</p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                  {step.state === emission.estado && (
                    <Badge variant="default" className="text-xs">
                      Actual
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // Show normal workflow steps
            <div className="space-y-3">
              {WORKFLOW_STEPS.map((step, index) => {
                const status = getStepStatus(index, currentStepIndex)
                return (
                  <div
                    key={step.state}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      status === "current"
                        ? "bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800"
                        : status === "completed"
                          ? "bg-green-50 dark:bg-green-950"
                          : "bg-muted/50"
                    }`}
                  >
                    {getStepIcon(status)}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{step.label}</p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                    {status === "current" && (
                      <Badge variant="default" className="text-xs">
                        Actual
                      </Badge>
                    )}
                    {status === "completed" && (
                      <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                        Completado
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h5 className="font-medium text-sm mb-2">Próximos Pasos</h5>
          <p className="text-xs text-muted-foreground">
            {emission.escaladoA
              ? `Esperando revisión del área ${emission.escaladoA.toLowerCase()}.`
              : currentStepIndex < WORKFLOW_STEPS.length - 1
                ? `Una vez completado el paso actual, la emisión avanzará a: ${WORKFLOW_STEPS[currentStepIndex + 1]?.label}`
                : "Proceso completado."}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
