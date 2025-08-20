"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, FileText, Upload, CheckCircle, AlertTriangle, ArrowUp } from "lucide-react"

interface EmissionTimelineProps {
  emission: any
}

export function EmissionTimeline({ emission }: EmissionTimelineProps) {
  // Mock timeline events - in a real app, these would come from an audit log
  const timelineEvents = [
    {
      id: 1,
      type: "created",
      title: "Emisión creada",
      description: `Creada por ${emission.createdBy.name}`,
      timestamp: emission.createdAt,
      icon: FileText,
      color: "blue",
    },
    {
      id: 2,
      type: "documents",
      title: "Documentos subidos",
      description: `${emission.documentos.length} documentos procesados`,
      timestamp: emission.createdAt,
      icon: Upload,
      color: "green",
    },
    {
      id: 3,
      type: "ocr",
      title: "Procesamiento OCR",
      description: "Documentos procesados automáticamente",
      timestamp: emission.createdAt,
      icon: CheckCircle,
      color: "blue",
    },
  ]

  // Add faltantes events
  emission.faltantes.forEach((faltante: any, index: number) => {
    timelineEvents.push({
      id: 100 + index,
      type: "faltante",
      title: "Faltante detectado",
      description: faltante.message,
      timestamp: faltante.createdAt,
      icon: AlertTriangle,
      color: "red",
    })

    if (faltante.resolved) {
      timelineEvents.push({
        id: 200 + index,
        type: "resolved",
        title: "Faltante resuelto",
        description: faltante.message,
        timestamp: faltante.resolvedAt,
        icon: CheckCircle,
        color: "green",
      })
    }
  })

  // Add escalation events
  if (emission.escaladoA) {
    timelineEvents.push({
      id: 300,
      type: "escalation",
      title: `Escalado a ${emission.escaladoA}`,
      description: `Asignado a ${emission.responsable?.name || "Responsable"}`,
      timestamp: emission.updatedAt,
      icon: ArrowUp,
      color: "orange",
    })
  }

  // Sort by timestamp
  timelineEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  const getIconColor = (color: string) => {
    switch (color) {
      case "blue":
        return "text-blue-500"
      case "green":
        return "text-green-500"
      case "red":
        return "text-red-500"
      case "orange":
        return "text-orange-500"
      default:
        return "text-muted-foreground"
    }
  }

  const getBadgeVariant = (color: string) => {
    switch (color) {
      case "green":
        return "default"
      case "red":
        return "destructive"
      case "orange":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Timeline de Eventos</span>
        </CardTitle>
        <CardDescription>Historial completo de actividades y cambios en la emisión</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {timelineEvents.map((event, index) => {
            const Icon = event.icon
            return (
              <div key={event.id} className="flex items-start space-x-4">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full bg-background border-2 border-current flex items-center justify-center ${getIconColor(event.color)}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">{event.title}</h4>
                    <Badge variant={getBadgeVariant(event.color)} className="text-xs">
                      {new Date(event.timestamp).toLocaleDateString()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(event.timestamp).toLocaleTimeString()}</p>
                </div>
                {index < timelineEvents.length - 1 && (
                  <div className="absolute left-4 mt-8 w-0.5 h-6 bg-border" style={{ marginLeft: "15px" }} />
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
