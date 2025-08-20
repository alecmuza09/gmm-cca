import { prisma } from './prisma'

export async function initializeDatabase() {
  try {
    // Verificar si ya hay usuarios
    const userCount = await prisma.user.count()
    
    if (userCount === 0) {
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
    }
  } catch (error) {
    console.error('Error inicializando la base de datos:', error)
  }
}
