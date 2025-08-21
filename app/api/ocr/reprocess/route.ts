import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { documentId } = await request.json()

    if (!documentId) {
      return NextResponse.json({ error: 'ID de documento requerido' }, { status: 400 })
    }

    // Verificar que el documento existe
    const documento = await prisma.documento.findUnique({
      where: { id: documentId }
    })

    if (!documento) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 })
    }

    // Simular reprocesamiento OCR
    // En un sistema real, aquí se volvería a procesar el documento
    
    const updatedDocumento = await prisma.documento.update({
      where: { id: documentId },
      data: {
        ocrStatus: 'PENDING',
        ocrData: null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Documento enviado para reprocesamiento OCR',
      documento: updatedDocumento
    })

  } catch (error) {
    console.error('Error reprocesando OCR:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}