import { NextRequest, NextResponse } from "next/server"
import Database from 'better-sqlite3'
import path from 'path'

const db = new Database(path.join(process.cwd(), 'dev.db'))

export async function POST(request: NextRequest) {
  try {
    const { emissionId } = await request.json()

    if (!emissionId) {
      return NextResponse.json(
        { error: "ID de emisión requerido" },
        { status: 400 }
      )
    }

    // Verificar que la emisión existe
    const getEmission = db.prepare('SELECT * FROM Emision WHERE id = ?')
    const emission = getEmission.get(emissionId)

    if (!emission) {
      return NextResponse.json(
        { error: "Emisión no encontrada" },
        { status: 404 }
      )
    }

    // Simular re-procesamiento OCR
    // En un sistema real, aquí se re-procesarían los documentos existentes
    
    // Actualizar el timestamp de la emisión
    const updateEmission = db.prepare(`
      UPDATE Emision 
      SET updatedAt = ? 
      WHERE id = ?
    `)
    
    const now = new Date().toISOString()
    updateEmission.run(now, emissionId)

    // Crear un registro de actividad
    const insertActivity = db.prepare(`
      INSERT INTO EmissionActivity (id, emissionId, action, description, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `)
    
    const activityId = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    insertActivity.run(
      activityId,
      emissionId,
      'OCR_REPROCESSED',
      'OCR re-ejecutado para todos los documentos de la emisión',
      now
    )

    return NextResponse.json({
      success: true,
      message: "OCR re-ejecutado correctamente",
      processedDocuments: 1 // Simulado
    })

  } catch (error) {
    console.error('Error reprocessing OCR:', error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}