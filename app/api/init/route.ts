import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Inicializando base de datos...')
    
    // Verificar si ya hay usuarios
    const userCount = await prisma.user.count()
    console.log(`📋 Encontrados ${userCount} usuarios`)
    
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
      
      return NextResponse.json({
        success: true,
        message: 'Base de datos inicializada correctamente',
        usersCreated: 4
      })
    } else {
      console.log('ℹ️ Usuarios ya existen')
      
      return NextResponse.json({
        success: true,
        message: 'Usuarios ya existen',
        userCount
      })
    }
    
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error)
    return NextResponse.json({
      success: false,
      error: 'Error inicializando base de datos'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const userCount = await prisma.user.count()
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })
    
    return NextResponse.json({
      userCount,
      users
    })
  } catch (error) {
    console.error('Error obteniendo usuarios:', error)
    return NextResponse.json({
      error: 'Error obteniendo usuarios'
    }, { status: 500 })
  }
}
