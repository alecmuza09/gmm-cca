const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔧 Inicializando base de datos para Netlify...')
    
    // Verificar si ya hay usuarios (esto también verifica que las tablas existen)
    console.log('📋 Verificando usuarios existentes...')
    const userCount = await prisma.user.count()
    console.log(`✅ Encontrados ${userCount} usuarios`)
    
    if (userCount === 0) {
      console.log('👥 Creando usuarios por defecto...')
      
      // Crear usuario administrador por defecto
      await prisma.user.create({
        data: {
          email: 'admin@gmm.com',
          password: 'admin123',
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

      console.log('✅ Usuarios creados exitosamente')
    } else {
      console.log('ℹ️ Usuarios ya existen, saltando creación')
    }
    
    console.log('🎉 Base de datos inicializada correctamente')
    
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error)
    // No lanzar error para evitar fallar el build
    console.log('⚠️ Continuando con el build...')
  } finally {
    await prisma.$disconnect()
  }
}

main()
