import { prisma } from "@/lib/prisma"
import { validateEmision, getRequiredDocuments } from "@/lib/validations"
import type { Estado, Role } from "@prisma/client"

export interface WorkflowContext {
  emisionId: string
  currentState: Estado
  userId?: string
  reason?: string
}

export interface EscalationRule {
  condition: (emission: any) => boolean
  targetRole: Role
  reason: string
  priority: number
}

// Define escalation rules
const ESCALATION_RULES: EscalationRule[] = [
  // Medical escalation rules
  {
    condition: (emission) => {
      const declaraciones = emission.declaraciones as any
      return (
        declaraciones?.riesgoSelecto ||
        (declaraciones?.padecimientosDeclarados && declaraciones.padecimientosDeclarados.toLowerCase() !== "ninguno") ||
        declaraciones?.actividadesDeRiesgo?.length > 2
      )
    },
    targetRole: "MEDICO",
    reason: "Requiere evaluación médica por riesgo selecto o padecimientos declarados",
    priority: 1,
  },

  // High amount escalation
  {
    condition: (emission) => emission.montoUSD && emission.montoUSD > 50000,
    targetRole: "OPERACIONES",
    reason: "Monto elevado requiere revisión de operaciones",
    priority: 2,
  },

  // Complex document issues
  {
    condition: (emission) => {
      const illegibleDocs = emission.documentos.filter((doc: any) => doc.ocrStatus === "ILLEGIBLE").length
      const incompleteDocs = emission.documentos.filter((doc: any) => doc.ocrStatus === "INCOMPLETE").length
      return illegibleDocs > 1 || incompleteDocs > 2
    },
    targetRole: "OPERACIONES",
    reason: "Múltiples documentos con problemas de OCR",
    priority: 3,
  },

  // SLA breach escalation
  {
    condition: (emission) => {
      const createdAt = new Date(emission.createdAt)
      const now = new Date()
      const hoursElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
      return hoursElapsed > 48 && emission.estado === "FALTANTES"
    },
    targetRole: "OPERACIONES",
    reason: "SLA excedido - más de 48 horas en estado de faltantes",
    priority: 4,
  },

  // Persona Moral complexity
  {
    condition: (emission) => {
      return emission.persona === "MORAL" && emission.tipoEmision === "NUEVO_NEGOCIO"
    },
    targetRole: "OPERACIONES",
    reason: "Nuevo negocio de persona moral requiere revisión especializada",
    priority: 5,
  },
]

export class WorkflowEngine {
  async processEmission(emisionId: string): Promise<void> {
    const emission = await this.getEmissionWithDetails(emisionId)
    if (!emission) throw new Error("Emission not found")

    // Run validation rules
    await this.validateAndCreateFaltantes(emission)

    // Check for automatic escalation
    await this.checkEscalationRules(emission)

    // Update state based on current conditions
    await this.updateStateBasedOnConditions(emission)
  }

  private async getEmissionWithDetails(emisionId: string) {
    return await prisma.emision.findUnique({
      where: { id: emisionId },
      include: {
        documentos: true,
        faltantes: { where: { resolved: false } },
        responsable: true,
        createdBy: true,
      },
    })
  }

  private async validateAndCreateFaltantes(emission: any): Promise<void> {
    // Clear existing unresolved faltantes to re-evaluate
    await prisma.faltante.deleteMany({
      where: {
        emisionId: emission.id,
        resolved: false,
      },
    })

    // Run business validation rules
    const validationErrors = validateEmision({
      tipoEmision: emission.tipoEmision,
      persona: emission.persona,
      requiereFactura: emission.requiereFactura,
      montoUSD: emission.montoUSD,
      solicitante: emission.solicitante,
      moralInfo: emission.moralInfo,
      declaraciones: emission.declaraciones,
      supuestosMeta: emission.supuestosMeta,
    })

    // Create faltantes for validation errors
    for (const error of validationErrors) {
      await prisma.faltante.create({
        data: {
          emisionId: emission.id,
          code: error.code,
          message: error.message,
          resolved: false,
        },
      })
    }

    // Check document requirements
    await this.validateDocumentRequirements(emission)

    // Check OCR results
    await this.validateOCRResults(emission)
  }

  private async validateDocumentRequirements(emission: any): Promise<void> {
    const requiredDocs = getRequiredDocuments(
      emission.tipoEmision,
      emission.persona,
      emission.requiereFactura,
      emission.montoUSD,
      emission.declaraciones,
      emission.supuestosMeta,
    )

    const uploadedDocTypes = emission.documentos.map((doc: any) => doc.tipo)

    for (const requiredType of requiredDocs) {
      if (!uploadedDocTypes.includes(requiredType)) {
        await prisma.faltante.create({
          data: {
            emisionId: emission.id,
            code: `F_SIN_${requiredType}`,
            message: `Falta documento requerido: ${requiredType}`,
            resolved: false,
          },
        })
      }
    }
  }

  private async validateOCRResults(emission: any): Promise<void> {
    for (const doc of emission.documentos) {
      if (doc.ocrStatus === "ILLEGIBLE") {
        await prisma.faltante.create({
          data: {
            emisionId: emission.id,
            code: "F_DOC_ILEGIBLE",
            message: `Documento ilegible: ${doc.filename}. Re-suba en alta resolución.`,
            resolved: false,
          },
        })
      } else if (doc.ocrStatus === "INCOMPLETE") {
        await prisma.faltante.create({
          data: {
            emisionId: emission.id,
            code: "F_DOC_INCOMPLETO",
            message: `Documento incompleto: ${doc.filename}. Verifique que contenga toda la información requerida.`,
            resolved: false,
          },
        })
      }
    }

    // Cross-validate OCR data for consistency
    await this.validateOCRConsistency(emission)
  }

  private async validateOCRConsistency(emission: any): Promise<void> {
    const ocrDocs = emission.documentos.filter((doc: any) => doc.ocrData && doc.ocrStatus === "OK")

    if (ocrDocs.length < 2) return // Need at least 2 docs to cross-validate

    // Check for address consistency
    const addresses = ocrDocs.map((doc: any) => doc.ocrData?.fields?.address).filter(Boolean)

    if (addresses.length > 1) {
      const uniqueAddresses = [...new Set(addresses)]
      if (uniqueAddresses.length > 1) {
        await prisma.faltante.create({
          data: {
            emisionId: emission.id,
            code: "F_DOMICILIO_NO_COINCIDE",
            message: "El domicilio no coincide entre documentos. Verifique la consistencia.",
            resolved: false,
          },
        })
      }
    }

    // Check for name consistency
    const names = ocrDocs.map((doc: any) => doc.ocrData?.fields?.name).filter(Boolean)

    if (names.length > 1) {
      const uniqueNames = [...new Set(names.map((name) => name.toLowerCase().trim()))]
      if (uniqueNames.length > 1) {
        await prisma.faltante.create({
          data: {
            emisionId: emission.id,
            code: "F_NOMBRE_NO_COINCIDE",
            message: "El nombre no coincide entre documentos. Verifique la consistencia.",
            resolved: false,
          },
        })
      }
    }
  }

  private async checkEscalationRules(emission: any): Promise<void> {
    // Skip if already escalated
    if (emission.escaladoA) return

    // Find applicable escalation rules
    const applicableRules = ESCALATION_RULES.filter((rule) => rule.condition(emission)).sort(
      (a, b) => a.priority - b.priority,
    )

    if (applicableRules.length > 0) {
      const rule = applicableRules[0] // Use highest priority rule
      await this.escalateEmission(emission.id, rule.targetRole, rule.reason)
    }
  }

  private async escalateEmission(emisionId: string, targetRole: Role, reason: string): Promise<void> {
    // Find a user with the target role
    const targetUser = await prisma.user.findFirst({
      where: { role: targetRole },
    })

    const newState = targetRole === "MEDICO" ? "ESCALADO_MEDICO" : "ESCALADO_OPERACIONES"

    await prisma.emision.update({
      where: { id: emisionId },
      data: {
        estado: newState as Estado,
        escaladoA: targetRole,
        responsableId: targetUser?.id,
      },
    })

    // Create escalation record for audit
    await this.createEscalationRecord(emisionId, targetRole, reason)
  }

  private async createEscalationRecord(emisionId: string, targetRole: Role, reason: string): Promise<void> {
    // In a real app, you'd have an escalation/audit table
    console.log(`Escalation: Emission ${emisionId} escalated to ${targetRole} - ${reason}`)
  }

  private async updateStateBasedOnConditions(emission: any): Promise<void> {
    const activeFaltantes = emission.faltantes.filter((f: any) => !f.resolved)

    // If no faltantes and all docs processed, mark as viable
    if (
      activeFaltantes.length === 0 &&
      emission.documentos.length > 0 &&
      emission.documentos.every((doc: any) => doc.ocrStatus !== "PENDING") &&
      !emission.escaladoA
    ) {
      await prisma.emision.update({
        where: { id: emission.id },
        data: { estado: "ALTA_VIABLE" },
      })
    }
    // If has faltantes, set to faltantes state
    else if (
      activeFaltantes.length > 0 &&
      emission.estado !== "ESCALADO_OPERACIONES" &&
      emission.estado !== "ESCALADO_MEDICO"
    ) {
      await prisma.emision.update({
        where: { id: emission.id },
        data: { estado: "FALTANTES" },
      })
    }
  }

  async transitionState(context: WorkflowContext): Promise<boolean> {
    const { emisionId, currentState, userId, reason } = context

    // Validate state transition permissions
    if (!(await this.canTransitionState(emisionId, currentState, userId))) {
      return false
    }

    // Update emission state
    await prisma.emision.update({
      where: { id: emisionId },
      data: {
        estado: currentState,
        updatedAt: new Date(),
      },
    })

    // Re-process emission after state change
    await this.processEmission(emisionId)

    return true
  }

  private async canTransitionState(emisionId: string, newState: Estado, userId?: string): Promise<boolean> {
    if (!userId) return false

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return false

    // Define state transition permissions
    const permissions: Record<Estado, Role[]> = {
      BORRADOR: ["ASESOR", "ADMIN"],
      EN_REVISION_OCR: ["ASESOR", "OPERACIONES", "ADMIN"],
      FALTANTES: ["OPERACIONES", "ADMIN"],
      ALTA_VIABLE: ["OPERACIONES", "MEDICO", "ADMIN"],
      ESCALADO_OPERACIONES: ["ASESOR", "ADMIN"],
      ESCALADO_MEDICO: ["ASESOR", "OPERACIONES", "ADMIN"],
      LISTO_PARA_PORTAL: ["OPERACIONES", "ADMIN"],
      CERRADO: ["OPERACIONES", "ADMIN"],
    }

    return permissions[newState]?.includes(user.role) || false
  }

  async getSLAStatus(emisionId: string): Promise<{
    hoursElapsed: number
    slaTarget: number
    isBreached: boolean
    severity: "low" | "medium" | "high"
  }> {
    const emission = await prisma.emision.findUnique({
      where: { id: emisionId },
    })

    if (!emission) throw new Error("Emission not found")

    const createdAt = new Date(emission.createdAt)
    const now = new Date()
    const hoursElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)

    // Define SLA targets based on state and complexity
    let slaTarget = 24 // Default 24 hours

    if (emission.escaladoA) {
      slaTarget = 48 // Escalated cases get more time
    } else if (emission.persona === "MORAL") {
      slaTarget = 36 // Moral entities are more complex
    }

    const isBreached = hoursElapsed > slaTarget

    let severity: "low" | "medium" | "high" = "low"
    if (hoursElapsed > slaTarget * 1.5) {
      severity = "high"
    } else if (hoursElapsed > slaTarget * 1.2) {
      severity = "medium"
    }

    return {
      hoursElapsed: Math.round(hoursElapsed * 10) / 10,
      slaTarget,
      isBreached,
      severity,
    }
  }
}

export const workflowEngine = new WorkflowEngine()
