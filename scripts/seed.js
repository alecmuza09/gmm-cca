const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed de la base de datos...')

  // Crear usuarios de prueba
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'marlene@consolida.mx' },
      update: {},
      create: {
        id: 'user_marlene',
        email: 'marlene@consolida.mx',
        name: 'Marlene García',
        role: 'OPERACIONES'
      }
    }),
    prisma.user.upsert({
      where: { email: 'doctora@consolida.mx' },
      update: {},
      create: {
        id: 'user_doctora',
        email: 'doctora@consolida.mx',
        name: 'Dra. Patricia López',
        role: 'MEDICO'
      }
    }),
    prisma.user.upsert({
      where: { email: 'asesor@consolida.mx' },
      update: {},
      create: {
        id: 'user_asesor',
        email: 'asesor@consolida.mx',
        name: 'Carlos Mendoza',
        role: 'ASESOR'
      }
    }),
    prisma.user.upsert({
      where: { email: 'admin@consolida.mx' },
      update: {},
      create: {
        id: 'user_admin',
        email: 'admin@consolida.mx',
        name: 'Admin Sistema',
        role: 'ADMIN'
      }
    })
  ])

  console.log('✓ Usuarios creados:', users.length)

  // Crear emisiones de prueba
  const emisiones = await Promise.all([
    prisma.emision.upsert({
      where: { folio: 'GMM-2025-001' },
      update: {},
      create: {
        id: 'emision_1',
        folio: 'GMM-2025-001',
        tipoEmision: 'NUEVO_NEGOCIO',
        estado: 'FALTANTES',
        persona: 'FISICA',
        requiereFactura: true,
        montoUSD: 8500.00,
        solicitante: JSON.stringify({
          nombre: 'Juan',
          apellidos: 'Pérez García',
          fechaNac: '1985-03-15',
          rfc: 'PEGJ850315ABC',
          email: 'juan.perez@email.com',
          telefono: '5551234567'
        }),
        declaraciones: JSON.stringify({
          actividadesDeRiesgo: ['submarinismo'],
          riesgoSelecto: false,
          padecimientosDeclarados: 'Ninguno'
        }),
        supuestosMeta: JSON.stringify({
          requiereFactura: true
        }),
        createdById: 'user_asesor'
      }
    }),
    prisma.emision.upsert({
      where: { folio: 'GMM-2025-002' },
      update: {},
      create: {
        id: 'emision_2',
        folio: 'GMM-2025-002',
        tipoEmision: 'ELIMINACION_PERIODOS',
        estado: 'ESCALADO_OPERACIONES',
        persona: 'MORAL',
        requiereFactura: false,
        montoUSD: 12000.00,
        solicitante: JSON.stringify({
          razonSocial: 'Tecnología Avanzada SA',
          rfc: 'TAV850315XYZ',
          representante: 'María González'
        }),
        moralInfo: JSON.stringify({
          razonSocial: 'Tecnología Avanzada SA',
          rfc: 'TAV850315XYZ',
          codigoCliente: 'CLI001'
        }),
        declaraciones: JSON.stringify({
          actividadesDeRiesgo: [],
          riesgoSelecto: true
        }),
        supuestosMeta: JSON.stringify({
          vieneDe: 'GRUPAL',
          fechaFinVigencia: '2024-12-15'
        }),
        escaladoA: 'OPERACIONES',
        responsableId: 'user_marlene',
        createdById: 'user_asesor'
      }
    })
  ])

  console.log('✓ Emisiones creadas:', emisiones.length)

  // Crear faltantes de prueba
  const faltantes = await Promise.all([
    prisma.faltante.create({
      data: {
        id: 'faltante_1',
        emisionId: 'emision_1',
        code: 'F_SIN_CONSTANCIA',
        message: 'Falta constancia fiscal para facturar',
        resolved: false
      }
    }),
    prisma.faltante.create({
      data: {
        id: 'faltante_2',
        emisionId: 'emision_1',
        code: 'F_ID_REPRESENTANTE',
        message: 'Falta ID del representante legal',
        resolved: false
      }
    }),
    prisma.faltante.create({
      data: {
        id: 'faltante_3',
        emisionId: 'emision_2',
        code: 'F_VIGENCIA_FUERA_DE_PLAZO',
        message: 'La vigencia anterior excede los 30 días',
        resolved: false
      }
    })
  ])

  console.log('✓ Faltantes creados:', faltantes.length)
  console.log('🎉 Seed completado exitosamente!')
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
