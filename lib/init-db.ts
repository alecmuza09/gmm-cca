import { prisma } from './prisma'

export async function initializeDatabase() {
  try {
    console.log('Inicializando base de datos...')
    
    // Verificar si ya hay usuarios
    const userCount = await prisma.user.count()
    
    if (userCount === 0) {
      console.log('Creando usuarios por defecto...')
      
      // Crear usuario administrador por defecto
      await prisma.user.create({
        data: {
          email: 'admin@gmm.com',
          password: 'admin123', // En producción, esto debería estar hasheado
          role: 'ADMIN',
          name: 'Administrador'
        }
      })

      // Crear algunos usuarios de ejemplo
      await prisma.user.createMany({
        data: [
          {
            email: 'asesor@consolida.mx',
            password: 'asesor123',
            role: 'ASESOR',
            name: 'Carlos Mendoza'
          },
          {
            email: 'operaciones@consolida.mx',
            password: 'operaciones123',
            role: 'OPERACIONES',
            name: 'Ana García'
          },
          {
            email: 'medico@consolida.mx',
            password: 'medico123',
            role: 'MEDICO',
            name: 'Dr. Juan Pérez'
          }
        ]
      })

      console.log('Base de datos inicializada con usuarios de ejemplo')
    } else {
      console.log('Usuarios ya existen, saltando inicialización')
    }
  } catch (error) {
    console.error('Error inicializando la base de datos:', error)
    // No lanzar error para evitar fallar el build
  }
}

// Función para verificar que las tablas existen
export async function ensureTablesExist() {
  try {
    console.log('Verificando que las tablas existen...')
    
    // Intentar hacer una consulta simple para verificar que las tablas existen
    await prisma.user.findFirst()
    await prisma.emision.findFirst()
    await prisma.documento.findFirst()
    
    console.log('Todas las tablas existen correctamente')
    return true
  } catch (error) {
    console.error('Error verificando tablas:', error)
    return false
  }
}
