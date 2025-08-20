import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const emisionId = parseInt(params.id)
    
    if (isNaN(emisionId)) {
      return NextResponse.json({ error: 'ID de emisión inválido' }, { status: 400 })
    }

    // Verificar que la emisión existe
    const emision = await prisma.emision.findUnique({
      where: { id: emisionId }
    })

    if (!emision) {
      return NextResponse.json({ error: 'Emisión no encontrada' }, { status: 404 })
    }

    // Actualizar estado de la emisión
    const updatedEmision = await prisma.emision.update({
      where: { id: emisionId },
      data: { 
        estado: 'LISTO_PARA_PORTAL',
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Emisión enviada correctamente',
      emision: updatedEmision
    })

  } catch (error) {
    console.error('Error enviando emisión:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
