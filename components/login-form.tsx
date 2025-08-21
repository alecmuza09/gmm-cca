"use client"

import { useState, useEffect } from 'react'
import { useAuth } from './auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle, Database, Users } from 'lucide-react'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [dbStatus, setDbStatus] = useState<{
    userCount: number
    isLoading: boolean
    error: string | null
  }>({
    userCount: 0,
    isLoading: true,
    error: null
  })

  const { login, initializeDatabase } = useAuth()

  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  const checkDatabaseStatus = async () => {
    try {
      setDbStatus(prev => ({ ...prev, isLoading: true, error: null }))
      const response = await fetch('/api/init')
      const data = await response.json()
      
      if (data.success) {
        setDbStatus({
          userCount: data.userCount,
          isLoading: false,
          error: null
        })
      } else {
        setDbStatus({
          userCount: 0,
          isLoading: false,
          error: data.error || 'Error verificando base de datos'
        })
      }
    } catch (error) {
      setDbStatus({
        userCount: 0,
        isLoading: false,
        error: 'No se puede conectar a la base de datos'
      })
    }
  }

  const handleCreateUsers = async () => {
    try {
      setIsLoading(true)
      setError('')
      setSuccess('')
      
      const result = await initializeDatabase()
      
      if (result.success) {
        setSuccess('Usuarios creados exitosamente')
        await checkDatabaseStatus()
      } else {
        setError(result.error || 'Error creando usuarios')
      }
    } catch (error) {
      setError('Error inesperado creando usuarios')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await login(email, password)
      
      if (result.success) {
        setSuccess('Inicio de sesión exitoso')
        // El AuthProvider manejará la redirección
      } else {
        setError(result.error || 'Credenciales inválidas')
      }
    } catch (error) {
      setError('Error de conexión. Verifica tu conexión a internet.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            GMM Web App
          </CardTitle>
          <CardDescription className="text-center">
            Inicia sesión en tu cuenta
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Estado de la Base de Datos */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Database className="h-4 w-4" />
              <span>Estado de la Base de Datos:</span>
            </div>
            
            {dbStatus.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Verificando conexión...
              </div>
            ) : dbStatus.error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {dbStatus.error}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Conectado ({dbStatus.userCount} usuarios)</span>
              </div>
            )}
          </div>

          {/* Crear Usuarios si no existen */}
          {!dbStatus.isLoading && dbStatus.userCount === 0 && !dbStatus.error && (
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                No hay usuarios en la base de datos. 
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-normal"
                  onClick={handleCreateUsers}
                  disabled={isLoading}
                >
                  Crear usuarios por defecto
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Formulario de Login */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@gmm.com"
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
                placeholder="admin123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || dbStatus.error !== null}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>

          {/* Credenciales de Ejemplo */}
          {!dbStatus.isLoading && dbStatus.userCount > 0 && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Credenciales de ejemplo:</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div>Admin: admin@gmm.com / admin123</div>
                <div>Asesor: asesor@consolida.mx / asesor123</div>
                <div>Operaciones: operaciones@consolida.mx / operaciones123</div>
                <div>Médico: medico@consolida.mx / medico123</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
