"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Plus, Edit, Trash2, UserPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  email: string
  name: string
  role: 'ASESOR' | 'OPERACIONES' | 'MEDICO' | 'ADMIN'
  createdAt: string
  updatedAt: string
}

interface UserFormData {
  email: string
  name: string
  role: 'ASESOR' | 'OPERACIONES' | 'MEDICO' | 'ADMIN'
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    name: '',
    role: 'ASESOR'
  })
  const { toast } = useToast()

  // Cargar usuarios
  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cargar usuarios",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  // Crear usuario
  const handleCreateUser = async () => {
    try {
      setCreating(true)
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const newUser = await response.json()
        setUsers(prev => [newUser, ...prev])
        setIsCreateDialogOpen(false)
        setFormData({ email: '', name: '', role: 'ASESOR' })
        toast({
          title: "Éxito",
          description: "Usuario creado correctamente"
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Error al crear usuario",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al crear usuario",
        variant: "destructive"
      })
    } finally {
      setCreating(false)
    }
  }

  // Actualizar usuario
  const handleUpdateUser = async () => {
    if (!editingUser) return

    try {
      setUpdating(true)
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUsers(prev => prev.map(user => user.id === editingUser.id ? updatedUser : user))
        setIsEditDialogOpen(false)
        setEditingUser(null)
        setFormData({ email: '', name: '', role: 'ASESOR' })
        toast({
          title: "Éxito",
          description: "Usuario actualizado correctamente"
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Error al actualizar usuario",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al actualizar usuario",
        variant: "destructive"
      })
    } finally {
      setUpdating(false)
    }
  }

  // Eliminar usuario
  const handleDeleteUser = async (userId: string) => {
    try {
      setDeleting(true)
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setUsers(prev => prev.filter(user => user.id !== userId))
        toast({
          title: "Éxito",
          description: "Usuario eliminado correctamente"
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Error al eliminar usuario",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al eliminar usuario",
        variant: "destructive"
      })
    } finally {
      setDeleting(false)
    }
  }

  // Abrir diálogo de edición
  const openEditDialog = (user: User) => {
    setEditingUser(user)
    setFormData({
      email: user.email,
      name: user.name,
      role: user.role
    })
    setIsEditDialogOpen(true)
  }

  // Obtener color del badge según el rol
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'destructive'
      case 'OPERACIONES': return 'default'
      case 'MEDICO': return 'secondary'
      case 'ASESOR': return 'outline'
      default: return 'outline'
    }
  }

  // Obtener nombre del rol
  const getRoleName = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrador'
      case 'OPERACIONES': return 'Operaciones'
      case 'MEDICO': return 'Médico'
      case 'ASESOR': return 'Asesor'
      default: return role
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Gestión de Usuarios
        </CardTitle>
        <CardDescription>
          Administra los usuarios del sistema. Solo los administradores pueden crear, editar y eliminar usuarios.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {users.length} usuario{users.length !== 1 ? 's' : ''} en el sistema
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                <DialogDescription>
                  Completa la información del nuevo usuario del sistema.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="usuario@consolida.mx"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nombre Apellido"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                  <Select value={formData.role} onValueChange={(value: any) => setFormData(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ASESOR">Asesor</SelectItem>
                      <SelectItem value="OPERACIONES">Operaciones</SelectItem>
                      <SelectItem value="MEDICO">Médico</SelectItem>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateUser} disabled={creating || !formData.email || !formData.name}>
                  {creating ? "Creando..." : "Crear Usuario"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">Cargando usuarios...</div>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Fecha de Creación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {getRoleName(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString('es-MX')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog open={isEditDialogOpen && editingUser?.id === user.id} onOpenChange={(open) => {
                          if (!open) {
                            setIsEditDialogOpen(false)
                            setEditingUser(null)
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Editar Usuario</DialogTitle>
                              <DialogDescription>
                                Modifica la información del usuario.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                  id="edit-email"
                                  type="email"
                                  value={formData.email}
                                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-name">Nombre Completo</Label>
                                <Input
                                  id="edit-name"
                                  value={formData.name}
                                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-role">Rol</Label>
                                <Select value={formData.role} onValueChange={(value: any) => setFormData(prev => ({ ...prev, role: value }))}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="ASESOR">Asesor</SelectItem>
                                    <SelectItem value="OPERACIONES">Operaciones</SelectItem>
                                    <SelectItem value="MEDICO">Médico</SelectItem>
                                    <SelectItem value="ADMIN">Administrador</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => {
                                setIsEditDialogOpen(false)
                                setEditingUser(null)
                              }}>
                                Cancelar
                              </Button>
                              <Button onClick={handleUpdateUser} disabled={updating || !formData.email || !formData.name}>
                                {updating ? "Actualizando..." : "Actualizar"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={deleting}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente el usuario "{user.name}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
