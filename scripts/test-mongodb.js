const { PrismaClient } = require('@prisma/client')

// Configurar la URL de MongoDB con nombre de base de datos
process.env.DATABASE_URL = "mongodb+srv://alecmuza09:s5sHo7g9fHvbDIZR@gmm-cca.0voskrv.mongodb.net/gmm-cca?retryWrites=true&w=majority&appName=GMM-CCA"

async function testMongoDB() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔧 Probando conexión a MongoDB...')
    
    // Probar conexión
    await prisma.$connect()
    console.log('✅ Conexión exitosa a MongoDB')
    
    // Verificar si hay usuarios
    const userCount = await prisma.user.count()
    console.log(`📋 Usuarios existentes: ${userCount}`)
    
    if (userCount === 0) {
      console.log('👥 Creando usuarios por defecto...')
      
      // Crear usuario administrador
      const adminUser = await prisma.user.create({
        data: {
          email: 'admin@gmm.com',
          password: 'admin123',
          role: 'ADMIN',
          name: 'Administrador'
        }
      })
      console.log('✅ Usuario admin creado:', adminUser.email)

      // Crear otros usuarios
      const otherUsers = await prisma.user.createMany({
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
      console.log('✅ Otros usuarios creados:', otherUsers.count)

      // Verificar usuarios creados
      const finalUserCount = await prisma.user.count()
      console.log(`✅ Total de usuarios: ${finalUserCount}`)
      
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true
        }
      })
      
      console.log('📋 Lista de usuarios:')
      allUsers.forEach(user => {
        console.log(`  - ${user.email} (${user.role})`)
      })
      
    } else {
      console.log('ℹ️ Usuarios ya existen')
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true
        }
      })
      
      console.log('📋 Usuarios existentes:')
      users.forEach(user => {
        console.log(`  - ${user.email} (${user.role})`)
      })
    }
    
    console.log('🎉 Prueba completada exitosamente')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testMongoDB()
