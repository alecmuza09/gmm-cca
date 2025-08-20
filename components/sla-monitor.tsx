"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react"

interface SLAStatus {
  emissionId: string
  hoursElapsed: number
  slaTarget: number
  isBreached: boolean
  severity: "low" | "medium" | "high"
}

interface SLAMonitorProps {
  emissionId?: string
  showAll?: boolean
}

export function SLAMonitor({ emissionId, showAll = false }: SLAMonitorProps) {
  const [slaData, setSlaData] = useState<SLAStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  useEffect(() => {
    fetchSLAData()

    // Set up periodic refresh every 5 minutes
    const interval = setInterval(fetchSLAData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [emissionId, showAll])

  const fetchSLAData = async () => {
    try {
      let url = "/api/workflow/sla-check"
      if (emissionId && !showAll) {
        url = `/api/emisiones/${emissionId}/sla`
      }

      const response = await fetch(url, { method: "POST" })
      if (response.ok) {
        const data = await response.json()
        setSlaData(showAll ? data.results : [data])
        setLastCheck(new Date())
      }
    } catch (error) {
      console.error("Error fetching SLA data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityBadge = (severity: string, isBreached: boolean) => {
    if (!isBreached) {
      return (
        <Badge variant="default" className="bg-green-500">
          En Tiempo
        </Badge>
      )
    }

    switch (severity) {
      case "high":
        return <Badge variant="destructive">Crítico</Badge>
      case "medium":
        return (
          <Badge variant="destructive" className="bg-orange-500">
            Atención
          </Badge>
        )
      default:
        return <Badge variant="secondary">Retrasado</Badge>
    }
  }

  const getProgressPercentage = (hoursElapsed: number, slaTarget: number) => {
    return Math.min((hoursElapsed / slaTarget) * 100, 100)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            <span>Verificando SLA...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const breachedCount = slaData.filter((item) => item.isBreached).length
  const criticalCount = slaData.filter((item) => item.isBreached && item.severity === "high").length

  return (
    <div className="space-y-4">
      {showAll && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Monitor de SLA</span>
            </CardTitle>
            <CardDescription>Estado de cumplimiento de SLA para todas las emisiones activas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{slaData.length}</p>
                <p className="text-sm text-muted-foreground">Total Activas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-500">{breachedCount}</p>
                <p className="text-sm text-muted-foreground">SLA Excedido</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-500">{criticalCount}</p>
                <p className="text-sm text-muted-foreground">Críticas</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Última verificación: {lastCheck?.toLocaleTimeString()}</p>
              <Button variant="outline" size="sm" onClick={fetchSLAData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {criticalCount > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {criticalCount} emisión{criticalCount > 1 ? "es" : ""} en estado crítico requiere
            {criticalCount === 1 ? "" : "n"} atención inmediata.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        {slaData.map((item) => (
          <Card key={item.emissionId}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {item.isBreached ? (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  <span className="font-medium">{showAll ? `Emisión ${item.emissionId.slice(-8)}` : "SLA Status"}</span>
                </div>
                {getSeverityBadge(item.severity, item.isBreached)}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tiempo transcurrido:</span>
                  <span>
                    {item.hoursElapsed}h de {item.slaTarget}h
                  </span>
                </div>

                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      item.isBreached ? (item.severity === "high" ? "bg-red-500" : "bg-orange-500") : "bg-green-500"
                    }`}
                    style={{ width: `${getProgressPercentage(item.hoursElapsed, item.slaTarget)}%` }}
                  />
                </div>

                {item.isBreached && (
                  <p className="text-xs text-destructive">
                    SLA excedido por {(item.hoursElapsed - item.slaTarget).toFixed(1)} horas
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
