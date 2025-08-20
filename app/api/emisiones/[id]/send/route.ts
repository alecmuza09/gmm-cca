import { NextRequest, NextResponse } from "next/server"
import Database from 'better-sqlite3'
import path from 'path'

const db = new Database(path.join(process.cwd(), 'dev.db'))

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const emissionId = params.id

    // Verificar que la emisión existe
    const getEmission = db.prepare('SELECT * FROM Emision WHERE id = ?')
    const emission = getEmission.get(emissionId)

    if (!emission) {
      return NextResponse.json(
        { error: "Emisión no encontrada" },
        { status: 404 }
      )
    }

    // Simular el envío de la emisión
    // En un sistema real, aquí se enviaría a un sistema externo
    
    // Actualizar el estado de la emisión a "ENVIADO" o "LISTO_PARA_PORTAL"
    const updateEmission = db.prepare(`
      UPDATE Emision 
      SET estado = ?, updatedAt = ? 
      WHERE id = ?
    `)
    
    const newState = emission.estado === 'ALTA_VIABLE' ? 'LISTO_PARA_PORTAL' : 'ENVIADO'
    const now = new Date().toISOString()
    
    updateEmission.run(newState, now, emissionId)

    // Crear un registro de actividad
    const insertActivity = db.prepare(`
      INSERT INTO EmissionActivity (id, emissionId, action, description, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `)
    
    const activityId = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    insertActivity.run(
      activityId,
      emissionId,
      'ENVIADO',
      `Emisión enviada - Estado cambiado a ${newState}`,
      now
    )

    return NextResponse.json({
      success: true,
      message: "Emisión enviada correctamente",
      newState: newState
    })

  } catch (error) {
    console.error('Error sending emission:', error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
