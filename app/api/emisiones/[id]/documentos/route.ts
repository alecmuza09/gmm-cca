import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const emisionId = parseInt(params.id)
    
    if (isNaN(emisionId)) {
      return NextResponse.json({ error: 'ID de emisión inválido' }, { status: 400 })
    }

    const documentos = await prisma.documento.findMany({
      where: { emisionId }
    })

    return NextResponse.json(documentos)

  } catch (error) {
    console.error('Error obteniendo documentos:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const emisionId = parseInt(params.id)
    
    if (isNaN(emisionId)) {
      return NextResponse.json({ error: 'ID de emisión inválido' }, { status: 400 })
    }

    const { nombre, tipo, url } = await request.json()

    if (!nombre || !tipo) {
      return NextResponse.json({ error: 'Nombre y tipo son requeridos' }, { status: 400 })
    }

    const documento = await prisma.documento.create({
      data: {
        nombre,
        tipo,
        url,
        emisionId
      }
    })

    return NextResponse.json(documento, { status: 201 })

  } catch (error) {
    console.error('Error creando documento:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}