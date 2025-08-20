import { prisma } from './prisma'

// Definir tipos como strings
export type Estado = 'BORRADOR' | 'EN_REVISION_OCR' | 'FALTANTES' | 'ALTA_VIABLE' | 'ESCALADO_OPERACIONES' | 'ESCALADO_MEDICO' | 'LISTO_PARA_PORTAL' | 'CERRADO'
export type Role = 'ASESOR' | 'OPERACIONES' | 'MEDICO' | 'ADMIN'

export interface WorkflowStep {
  id: string
  name: string
  description: string
  requiredRole: Role
  nextSteps: string[]
  conditions?: (emision: any) => boolean
}

export class WorkflowEngine {
  private steps: Map<string, WorkflowStep> = new Map()

  constructor() {
    this.initializeSteps()
  }

  private initializeSteps() {
    // Definir pasos del workflow
    this.steps.set('BORRADOR', {
      id: 'BORRADOR',
      name: 'Borrador',
      description: 'Emisión en estado borrador',
      requiredRole: 'ASESOR',
      nextSteps: ['EN_REVISION_OCR']
    })

    this.steps.set('EN_REVISION_OCR', {
      id: 'EN_REVISION_OCR',
      name: 'En Revisión OCR',
      description: 'Documentos siendo procesados por OCR',
      requiredRole: 'ASESOR',
      nextSteps: ['FALTANTES', 'ALTA_VIABLE']
    })

    this.steps.set('FALTANTES', {
      id: 'FALTANTES',
      name: 'Faltantes',
      description: 'Documentos faltantes o incompletos',
      requiredRole: 'ASESOR',
      nextSteps: ['EN_REVISION_OCR']
    })

    this.steps.set('ALTA_VIABLE', {
      id: 'ALTA_VIABLE',
      name: 'Alta Viable',
      description: 'Emisión lista para revisión',
      requiredRole: 'OPERACIONES',
      nextSteps: ['ESCALADO_OPERACIONES', 'ESCALADO_MEDICO', 'LISTO_PARA_PORTAL']
    })

    this.steps.set('ESCALADO_OPERACIONES', {
      id: 'ESCALADO_OPERACIONES',
      name: 'Escalado a Operaciones',
      description: 'Requiere revisión de operaciones',
      requiredRole: 'OPERACIONES',
      nextSteps: ['ESCALADO_MEDICO', 'LISTO_PARA_PORTAL']
    })

    this.steps.set('ESCALADO_MEDICO', {
      id: 'ESCALADO_MEDICO',
      name: 'Escalado Médico',
      description: 'Requiere revisión médica',
      requiredRole: 'MEDICO',
      nextSteps: ['LISTO_PARA_PORTAL']
    })

    this.steps.set('LISTO_PARA_PORTAL', {
      id: 'LISTO_PARA_PORTAL',
      name: 'Listo para Portal',
      description: 'Emisión lista para envío al portal',
      requiredRole: 'OPERACIONES',
      nextSteps: ['CERRADO']
    })

    this.steps.set('CERRADO', {
      id: 'CERRADO',
      name: 'Cerrado',
      description: 'Emisión completada',
      requiredRole: 'ASESOR',
      nextSteps: []
    })
  }

  async canTransition(emisionId: number, fromState: Estado, toState: Estado, userRole: Role): Promise<boolean> {
    const currentStep = this.steps.get(fromState)
    if (!currentStep) return false

    // Verificar que el usuario tenga el rol requerido
    if (currentStep.requiredRole !== userRole && userRole !== 'ADMIN') {
      return false
    }

    // Verificar que la transición sea válida
    if (!currentStep.nextSteps.includes(toState)) {
      return false
    }

    // Verificar condiciones específicas si existen
    if (currentStep.conditions) {
      const emision = await prisma.emision.findUnique({
        where: { id: emisionId }
      })
      if (!emision || !currentStep.conditions(emision)) {
        return false
      }
    }

    return true
  }

  async transition(emisionId: number, toState: Estado, userRole: Role): Promise<boolean> {
    const emision = await prisma.emision.findUnique({
      where: { id: emisionId }
    })

    if (!emision) return false

    const canTransition = await this.canTransition(emisionId, emision.estado as Estado, toState, userRole)
    
    if (!canTransition) return false

    await prisma.emision.update({
      where: { id: emisionId },
      data: { estado: toState }
    })

    return true
  }

  getAvailableTransitions(currentState: Estado, userRole: Role): Estado[] {
    const currentStep = this.steps.get(currentState)
    if (!currentStep) return []

    if (currentStep.requiredRole !== userRole && userRole !== 'ADMIN') {
      return []
    }

    return currentStep.nextSteps as Estado[]
  }

  getStepInfo(state: Estado): WorkflowStep | undefined {
    return this.steps.get(state)
  }
}

// Exportar instancia del workflow engine
export const workflowEngine = new WorkflowEngine()
