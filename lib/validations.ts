import { type TipoEmision, type Persona, DocTipo } from "@prisma/client"

export interface ValidationRule {
  code: string
  message: string
  required: boolean
}

export function getRequiredDocuments(
  tipoEmision: TipoEmision,
  persona: Persona,
  requiereFactura: boolean,
  montoUSD?: number,
  declaraciones?: any,
  supuestosMeta?: any,
): DocTipo[] {
  const required: DocTipo[] = [DocTipo.SOLICITUD_GMM]

  // Factura requirements
  if (requiereFactura) {
    required.push(DocTipo.CONSTANCIA_FISCAL)
  }

  // Persona Física requirements
  if (persona === "FISICA" && montoUSD && montoUSD > 7500) {
    required.push(DocTipo.ID_OFICIAL)
  }

  // Persona Moral requirements
  if (persona === "MORAL") {
    required.push(
      DocTipo.FORMATO_ALTA_CLIENTE,
      DocTipo.ACTA_CONSTITUTIVA,
      DocTipo.CONSTANCIA_FISCAL,
      DocTipo.ID_OFICIAL, // For legal representative
    )
  }

  // Tipo-specific requirements
  switch (tipoEmision) {
    case "ELIMINACION_PERIODOS":
      if (supuestosMeta?.vieneDe === "INDIVIDUAL") {
        required.push(DocTipo.CARATULA_POLIZA, DocTipo.COMPROBANTE_PAGO)
      } else if (supuestosMeta?.vieneDe === "GRUPAL") {
        required.push(DocTipo.CERT_POLIZA, DocTipo.CARTA_ANTIGUEDAD)
      }
      break

    case "CONVERSION_INDIVIDUAL":
      required.push(DocTipo.CERT_POLIZA, DocTipo.CARTA_BAJA_LABORAL)
      break

    case "CONEXION_GNP":
      required.push(DocTipo.CARTA_BAJA_LABORAL, DocTipo.CERT_POLIZA)
      break
  }

  // Declaration-based requirements
  if (declaraciones?.actividadesDeRiesgo?.length > 0) {
    required.push(DocTipo.CUESTIONARIO_ACTIVIDAD)
  }

  if (declaraciones?.padecimientosDeclarados) {
    required.push(DocTipo.AMPLIACION_INFO_MEDICA)
  }

  if (declaraciones?.riesgoSelecto) {
    required.push(DocTipo.RIESGO_SELECTO)
  }

  return required
}

export function validateEmision(emisionData: any): ValidationRule[] {
  const errors: ValidationRule[] = []

  // Basic validations
  if (!emisionData.tipoEmision) {
    errors.push({
      code: "F_TIPO_EMISION",
      message: "Debe seleccionar un tipo de emisión",
      required: true,
    })
  }

  if (!emisionData.persona) {
    errors.push({
      code: "F_PERSONA",
      message: "Debe especificar si es persona física o moral",
      required: true,
    })
  }

  // Vigencia validation for eliminación de periodos
  if (emisionData.tipoEmision === "ELIMINACION_PERIODOS" && emisionData.supuestosMeta?.fechaFinVigencia) {
    const fechaFin = new Date(emisionData.supuestosMeta.fechaFinVigencia)
    const hoy = new Date()
    const diasDiferencia = Math.floor((hoy.getTime() - fechaFin.getTime()) / (1000 * 60 * 60 * 24))

    if (diasDiferencia > 30) {
      errors.push({
        code: "F_VIGENCIA_FUERA_DE_PLAZO",
        message: "La vigencia anterior excede los 30 días; no conserva antigüedad",
        required: false,
      })
    }
  }

  return errors
}
