"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Settings, Database, Mail, MessageSquare, Cloud, Eye, Save, TestTube } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export default function ConfiguracionPage() {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState<string | null>(null)

  // Mock configuration state
  const [config, setConfig] = useState({
    monday: {
      enabled: false,
      apiKey: "",
      boardId: "",
      status: "disconnected" as "connected" | "disconnected" | "error",
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      smtpHost: "smtp.gmail.com",
      smtpPort: 587,
      smtpUser: "",
      smtpPass: "",
      smsProvider: "twilio",
      smsApiKey: "",
    },
    ocr: {
      enabled: true,
      provider: "aws-textract" as "aws-textract" | "google-vision" | "azure-cognitive",
      apiKey: "",
      region: "us-east-1",
      status: "connected" as "connected" | "disconnected" | "error",
    },
    storage: {
      enabled: true,
      provider: "aws-s3" as "aws-s3" | "azure-blob" | "google-cloud",
      bucket: "gmm-documents",
      region: "us-east-1",
      accessKey: "",
      secretKey: "",
      status: "connected" as "connected" | "disconnected" | "error",
    },
  })

  if (user?.rol !== "ADMIN") {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No tienes permisos para acceder a esta página.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSave = async () => {
    setSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setSaving(false)
  }

  const handleTest = async (integration: string) => {
    setTesting(integration)
    // Simulate test
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setTesting(null)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      connected: "default",
      disconnected: "secondary",
      error: "destructive",
    } as const

    const labels = {
      connected: "Conectado",
      disconnected: "Desconectado",
      error: "Error",
    }

    return <Badge variant={variants[status as keyof typeof variants]}>{labels[status as keyof typeof labels]}</Badge>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Configuración del Sistema</h1>
      </div>

      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="integrations">Integraciones</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="ocr">OCR</TabsTrigger>
          <TabsTrigger value="storage">Almacenamiento</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Monday.com Integration
                {getStatusBadge(config.monday.status)}
              </CardTitle>
              <CardDescription>Sincroniza casos con Monday.com para gestión de proyectos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.monday.enabled}
                  onCheckedChange={(checked) =>
                    setConfig((prev) => ({
                      ...prev,
                      monday: { ...prev.monday, enabled: checked },
                    }))
                  }
                />
                <Label>Habilitar integración con Monday.com</Label>
              </div>

              {config.monday.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monday-api-key">API Key</Label>
                    <Input
                      id="monday-api-key"
                      type="password"
                      value={config.monday.apiKey}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          monday: { ...prev.monday, apiKey: e.target.value },
                        }))
                      }
                      placeholder="Ingresa tu API Key de Monday.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monday-board-id">Board ID</Label>
                    <Input
                      id="monday-board-id"
                      value={config.monday.boardId}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          monday: { ...prev.monday, boardId: e.target.value },
                        }))
                      }
                      placeholder="ID del board de Monday.com"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleTest("monday")}
                  disabled={testing === "monday" || !config.monday.enabled}
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  {testing === "monday" ? "Probando..." : "Probar Conexión"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Notificaciones por Email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.notifications.emailEnabled}
                    onCheckedChange={(checked) =>
                      setConfig((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, emailEnabled: checked },
                      }))
                    }
                  />
                  <Label>Habilitar notificaciones por email</Label>
                </div>

                {config.notifications.emailEnabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Servidor SMTP</Label>
                      <Input
                        value={config.notifications.smtpHost}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            notifications: { ...prev.notifications, smtpHost: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Puerto</Label>
                      <Input
                        type="number"
                        value={config.notifications.smtpPort}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            notifications: { ...prev.notifications, smtpPort: Number.parseInt(e.target.value) },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Usuario</Label>
                      <Input
                        value={config.notifications.smtpUser}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            notifications: { ...prev.notifications, smtpUser: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Contraseña</Label>
                      <Input
                        type="password"
                        value={config.notifications.smtpPass}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            notifications: { ...prev.notifications, smtpPass: e.target.value },
                          }))
                        }
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Notificaciones por SMS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.notifications.smsEnabled}
                    onCheckedChange={(checked) =>
                      setConfig((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, smsEnabled: checked },
                      }))
                    }
                  />
                  <Label>Habilitar notificaciones por SMS</Label>
                </div>

                {config.notifications.smsEnabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Proveedor SMS</Label>
                      <Select
                        value={config.notifications.smsProvider}
                        onValueChange={(value) =>
                          setConfig((prev) => ({
                            ...prev,
                            notifications: { ...prev.notifications, smsProvider: value },
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="twilio">Twilio</SelectItem>
                          <SelectItem value="aws-sns">AWS SNS</SelectItem>
                          <SelectItem value="nexmo">Nexmo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>API Key</Label>
                      <Input
                        type="password"
                        value={config.notifications.smsApiKey}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            notifications: { ...prev.notifications, smsApiKey: e.target.value },
                          }))
                        }
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ocr" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Servicio OCR
                {getStatusBadge(config.ocr.status)}
              </CardTitle>
              <CardDescription>Configuración del servicio de reconocimiento óptico de caracteres</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.ocr.enabled}
                  onCheckedChange={(checked) =>
                    setConfig((prev) => ({
                      ...prev,
                      ocr: { ...prev.ocr, enabled: checked },
                    }))
                  }
                />
                <Label>Habilitar procesamiento OCR</Label>
              </div>

              {config.ocr.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Proveedor OCR</Label>
                    <Select
                      value={config.ocr.provider}
                      onValueChange={(value: any) =>
                        setConfig((prev) => ({
                          ...prev,
                          ocr: { ...prev.ocr, provider: value },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aws-textract">AWS Textract</SelectItem>
                        <SelectItem value="google-vision">Google Vision API</SelectItem>
                        <SelectItem value="azure-cognitive">Azure Cognitive Services</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Región</Label>
                    <Input
                      value={config.ocr.region}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          ocr: { ...prev.ocr, region: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>API Key</Label>
                    <Input
                      type="password"
                      value={config.ocr.apiKey}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          ocr: { ...prev.ocr, apiKey: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => handleTest("ocr")}
                disabled={testing === "ocr" || !config.ocr.enabled}
              >
                <TestTube className="h-4 w-4 mr-2" />
                {testing === "ocr" ? "Probando..." : "Probar OCR"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                Almacenamiento en la Nube
                {getStatusBadge(config.storage.status)}
              </CardTitle>
              <CardDescription>Configuración del servicio de almacenamiento de documentos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.storage.enabled}
                  onCheckedChange={(checked) =>
                    setConfig((prev) => ({
                      ...prev,
                      storage: { ...prev.storage, enabled: checked },
                    }))
                  }
                />
                <Label>Habilitar almacenamiento en la nube</Label>
              </div>

              {config.storage.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Proveedor</Label>
                    <Select
                      value={config.storage.provider}
                      onValueChange={(value: any) =>
                        setConfig((prev) => ({
                          ...prev,
                          storage: { ...prev.storage, provider: value },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aws-s3">Amazon S3</SelectItem>
                        <SelectItem value="azure-blob">Azure Blob Storage</SelectItem>
                        <SelectItem value="google-cloud">Google Cloud Storage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Bucket/Container</Label>
                    <Input
                      value={config.storage.bucket}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          storage: { ...prev.storage, bucket: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Access Key</Label>
                    <Input
                      type="password"
                      value={config.storage.accessKey}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          storage: { ...prev.storage, accessKey: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Secret Key</Label>
                    <Input
                      type="password"
                      value={config.storage.secretKey}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          storage: { ...prev.storage, secretKey: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => handleTest("storage")}
                disabled={testing === "storage" || !config.storage.enabled}
              >
                <TestTube className="h-4 w-4 mr-2" />
                {testing === "storage" ? "Probando..." : "Probar Conexión"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Guardando..." : "Guardar Configuración"}
        </Button>
      </div>
    </div>
  )
}
