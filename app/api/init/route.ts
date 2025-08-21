import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Inicializando base de datos...')
    
    // Probar conexión primero
    try {
      await prisma.$connect()
      console.log('✅ Conexión exitosa a MongoDB')
    } catch (connectionError) {
      console.error('❌ Error de conexión:', connectionError)
      return NextResponse.json({
        success: false,
        error: 'Error de conexión a la base de datos',
        details: 'No se puede conectar a MongoDB Atlas. Verifica la configuración de red y credenciales.',
        connectionError: connectionError instanceof Error ? connectionError.message : 'Unknown error'
      }, { status: 500 })
    }
    
    // Verificar si ya hay usuarios
    let userCount = 0
    try {
      userCount = await prisma.user.count()
      console.log(`📋 Encontrados ${userCount} usuarios`)
    } catch (countError) {
      console.error('❌ Error contando usuarios:', countError)
      return NextResponse.json({
        success: false,
        error: 'Error verificando usuarios existentes',
        details: 'No se puede acceder a la colección de usuarios.',
        countError: countError instanceof Error ? countError.message : 'Unknown error'
      }, { status: 500 })
    }
    
    if (userCount === 0) {
      console.log('👥 Creando usuarios por defecto...')
      
      try {
        // Crear usuario administrador por defecto
        const adminUser = await prisma.user.create({
          data: {
            email: 'admin@gmm.com',
            password: 'admin123',
            role: 'ADMIN',
            name: 'Administrador'
          }
        })
        console.log('✅ Usuario admin creado:', adminUser.email)

        // Crear algunos usuarios de ejemplo
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

        // Verificar que se crearon correctamente
        const finalUserCount = await prisma.user.count()
        console.log(`✅ Total de usuarios creados: ${finalUserCount}`)
        
        return NextResponse.json({
          success: true,
          message: 'Base de datos inicializada correctamente',
          usersCreated: finalUserCount,
          details: {
            adminCreated: true,
            otherUsersCreated: otherUsers.count
          }
        })
      } catch (createError) {
        console.error('❌ Error creando usuarios:', createError)
        return NextResponse.json({
          success: false,
          error: 'Error creando usuarios',
          details: 'No se pudieron crear los usuarios en la base de datos.',
          createError: createError instanceof Error ? createError.message : 'Unknown error'
        }, { status: 500 })
      }
    } else {
      console.log('ℹ️ Usuarios ya existen')
      
      return NextResponse.json({
        success: true,
        message: 'Usuarios ya existen',
        userCount
      })
    }
    
  } catch (error) {
    console.error('❌ Error general:', error)
    return NextResponse.json({
      success: false,
      error: 'Error general inicializando base de datos',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    try {
      await prisma.$disconnect()
    } catch (disconnectError) {
      console.error('❌ Error desconectando:', disconnectError)
    }
  }
}

export async function GET() {
  try {
    console.log('📋 Verificando estado de la base de datos...')
    
    // Probar conexión
    try {
      await prisma.$connect()
      console.log('✅ Conexión exitosa a MongoDB')
    } catch (connectionError) {
      console.error('❌ Error de conexión:', connectionError)
      return NextResponse.json({
        success: false,
        error: 'Error de conexión a la base de datos',
        userCount: 0,
        connectionError: connectionError instanceof Error ? connectionError.message : 'Unknown error'
      }, { status: 500 })
    }
    
    try {
      const userCount = await prisma.user.count()
      console.log(`✅ Encontrados ${userCount} usuarios`)
      
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true
        }
      })
      
      console.log('📋 Usuarios en la base de datos:', users.map(u => u.email))
      
      return NextResponse.json({
        userCount,
        users,
        success: true
      })
    } catch (queryError) {
      console.error('❌ Error consultando usuarios:', queryError)
      return NextResponse.json({
        success: false,
        error: 'Error consultando usuarios',
        userCount: 0,
        queryError: queryError instanceof Error ? queryError.message : 'Unknown error'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('❌ Error obteniendo usuarios:', error)
    return NextResponse.json({
      error: 'Error obteniendo usuarios',
      userCount: 0,
      details: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }, { status: 500 })
  } finally {
    try {
      await prisma.$disconnect()
    } catch (disconnectError) {
      console.error('❌ Error desconectando:', disconnectError)
    }
  }
}
