"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, ArrowUp, Stethoscope, CheckCircle, Send, Archive, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { canAccess, hasPermission } from "@/lib/roles"
import type { UserRole } from "@/lib/roles"

interface EmissionActionsProps {
  emission: any
  onUpdate: () => void
}

export function EmissionActions({ emission, onUpdate }: EmissionActionsProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)
  const userRole = user?.role as UserRole

  const handleStateChange = async (newState: string, escaladoA?: string) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/emisiones/${emission.id}/state`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estado: newState,
          escaladoA,
          responsableId: escaladoA ? getResponsableId(escaladoA) : null,
        }),
      })

      if (response.ok) {
        toast({
          title: "Estado actualizado",
          description: `La emisión ha sido ${getStateDescription(newState)}.`,
        })
        onUpdate()
      } else {
        throw new Error("Error al actualizar estado")
      }
    } catch (error) {
      console.error("Error updating state:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const getResponsableId = (role: string) => {
    // In a real app, you'd fetch the actual user IDs
    const roleToUserId: Record<string, string> = {
      OPERACIONES: "user_marlene",
      MEDICO: "user_doctora",
    }
    return roleToUserId[role] || null
  }

  const getStateDescription = (state: string) => {
    const descriptions: Record<string, string> = {
      ESCALADO_OPERACIONES: "escalada a Operaciones",
      ESCALADO_MEDICO: "escalada al área Médica",
      ALTA_VIABLE: "marcada como Alta Viable",
      LISTO_PARA_PORTAL: "marcada como Lista para Portal",
      CERRADO: "cerrada",
    }
    return descriptions[state] || "actualizada"
  }

  const canEscalate = () => {
    return canAccess(userRole, 'escalateEmissions')
  }

  const canMarkViable = () => {
    return canAccess(userRole, 'resolveEmissions')
  }

  const canClose = () => {
    return hasPermission(userRole, 'emissions', 'update_all') || userRole === 'ADMIN'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isUpdating}>
          {isUpdating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {canEscalate() && emission.estado !== "ESCALADO_OPERACIONES" && (
          <DropdownMenuItem onClick={() => handleStateChange("ESCALADO_OPERACIONES", "OPERACIONES")}>
            <ArrowUp className="h-4 w-4 mr-2" />
            Escalar a Operaciones
          </DropdownMenuItem>
        )}

        {canEscalate() && emission.estado !== "ESCALADO_MEDICO" && (
          <DropdownMenuItem onClick={() => handleStateChange("ESCALADO_MEDICO", "MEDICO")}>
            <Stethoscope className="h-4 w-4 mr-2" />
            Escalar a Médico
          </DropdownMenuItem>
        )}

        {canMarkViable() && emission.estado !== "ALTA_VIABLE" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleStateChange("ALTA_VIABLE")}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Marcar Alta Viable
            </DropdownMenuItem>
          </>
        )}

        {canMarkViable() && emission.estado === "ALTA_VIABLE" && (
          <DropdownMenuItem onClick={() => handleStateChange("LISTO_PARA_PORTAL")}>
            <Send className="h-4 w-4 mr-2" />
            Marcar Listo para Portal
          </DropdownMenuItem>
        )}

        {canClose() && emission.estado !== "CERRADO" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleStateChange("CERRADO")}>
              <Archive className="h-4 w-4 mr-2" />
              Cerrar Caso
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
