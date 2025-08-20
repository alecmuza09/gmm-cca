"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Database, Users, CheckCircle, AlertCircle } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [userCount, setUserCount] = useState(0)
  const [dbStatus, setDbStatus] = useState<'checking' | 'ready' | 'error'>('checking')
  const { login, initializeDatabase } = useAuth()

  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  const checkDatabaseStatus = async () => {
    try {
      setDbStatus('checking')
      const response = await fetch('/api/init')
      if (response.ok) {
        const data = await response.json()
        setUserCount(data.userCount || 0)
        setDbStatus('ready')
        console.log('✅ Estado de BD:', data)
      } else {
        setDbStatus('error')
        console.error('❌ Error checking DB status:', response.status)
      }
    } catch (error) {
      setDbStatus('error')
      console.error('❌ Error checking database status:', error)
    }
  }

  const handleInitializeDatabase = async () => {
    setIsInitializing(true)
    setError("")
    setSuccess("")
    
    try {
      console.log('🔧 Iniciando inicialización de BD...')
      const response = await fetch('/api/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const result = await response.json()
      console.log('📋 Resultado de inicialización:', result)
      
      if (response.ok && result.success) {
        setSuccess(`✅ Base de datos inicializada. ${result.usersCreated} usuarios creados.`)
        await checkDatabaseStatus()
      } else {
        setError(`❌ Error: ${result.error || 'Error desconocido'}`)
      }
    } catch (error) {
      console.error('❌ Error inicializando base de datos:', error)
      setError('Error de conexión al inicializar la base de datos')
    } finally {
      setIsInitializing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      const success = await login(email, password)
      if (!success) {
        setError("Credenciales inválidas. Por favor, intente nuevamente.")
      }
    } catch (error) {
      console.error('❌ Error en login:', error)
      setError("Error de conexión. Por favor, intente nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">GMM - Consolidacapital</CardTitle>
          <CardDescription className="text-center">Ingrese sus credenciales para acceder al sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Database Status */}
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4" />
              <span className="text-sm font-medium">Estado de la Base de Datos</span>
            </div>
            <div className="flex items-center gap-2 text-sm mb-2">
              <Users className="h-4 w-4" />
              <span>Usuarios: {dbStatus === 'checking' ? 'Verificando...' : userCount}</span>
            </div>
            
            {dbStatus === 'checking' && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Verificando estado...
              </div>
            )}
            
            {dbStatus === 'error' && (
              <div className="flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="h-4 w-4" />
                Error verificando base de datos
              </div>
            )}
            
            {userCount === 0 && dbStatus === 'ready' && (
              <Button 
                onClick={handleInitializeDatabase} 
                disabled={isInitializing}
                size="sm" 
                className="mt-2"
                variant="outline"
              >
                {isInitializing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Inicializando...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Crear Usuarios por Defecto
                  </>
                )}
              </Button>
            )}
            
            {userCount > 0 && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                Base de datos lista
              </div>
            )}
          </div>

          {/* Success Message */}
          {success && (
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@consolida.mx"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || userCount === 0}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-3">Credenciales disponibles:</p>
            <div className="text-xs space-y-3">
              <div>
                <p><strong>Admin:</strong> admin@gmm.com / admin123</p>
                <p className="text-muted-foreground ml-2">• Acceso completo al sistema</p>
              </div>
              <div>
                <p><strong>Asesor:</strong> asesor@consolida.mx / asesor123</p>
                <p className="text-muted-foreground ml-2">• Captura y gestiona emisiones propias</p>
              </div>
              <div>
                <p><strong>Operaciones:</strong> operaciones@consolida.mx / operaciones123</p>
                <p className="text-muted-foreground ml-2">• Revisa, valida y procesa todas las emisiones</p>
              </div>
              <div>
                <p><strong>Médico:</strong> medico@consolida.mx / medico123</p>
                <p className="text-muted-foreground ml-2">• Evalúa casos médicos escalados</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
