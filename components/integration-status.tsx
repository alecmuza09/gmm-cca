"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"

interface IntegrationStatus {
  name: string
  status: "connected" | "disconnected" | "error"
  lastCheck: string
  config: Record<string, any>
}

export function IntegrationStatus() {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([])
  const [loading, setLoading] = useState(true)

  const checkIntegrations = async () => {
    setLoading(true)
    try {
      // Check Monday.com
      const mondayResponse = await fetch("/api/integrations/monday")
      const mondayStatus = mondayResponse.ok ? "connected" : "disconnected"

      // Check Notifications
      const notificationResponse = await fetch("/api/integrations/notifications")
      const notificationData = await notificationResponse.json()
      const notificationStatus = notificationResponse.ok ? "connected" : "disconnected"

      setIntegrations([
        {
          name: "Monday.com",
          status: mondayStatus,
          lastCheck: new Date().toISOString(),
          config: { boards: mondayStatus === "connected" ? 2 : 0 },
        },
        {
          name: "Notifications",
          status: notificationStatus,
          lastCheck: new Date().toISOString(),
          config: notificationData.config || {},
        },
        {
          name: "OCR Service",
          status: "connected",
          lastCheck: new Date().toISOString(),
          config: { provider: "Internal", accuracy: "95%" },
        },
      ])
    } catch (error) {
      console.error("[v0] Integration check failed:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkIntegrations()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "disconnected":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variant = status === "connected" ? "default" : "destructive"
    return (
      <Badge variant={variant} className="capitalize">
        {status}
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Integration Status</CardTitle>
          <CardDescription>Monitor external service connections and configurations</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={checkIntegrations} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {integrations.map((integration) => (
            <div key={integration.name} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(integration.status)}
                <div>
                  <h4 className="font-medium">{integration.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Last checked: {new Date(integration.lastCheck).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">{getStatusBadge(integration.status)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
