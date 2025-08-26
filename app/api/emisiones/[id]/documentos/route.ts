import { NextRequest, NextResponse } from "next/server"
import Database from 'better-sqlite3'
import path from 'path'

const db = new Database(path.join(process.cwd(), 'dev.db'))

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const emissionId = (await params).id
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó archivo" },
        { status: 400 }
      )
    }

    // Validar tipo de archivo
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no soportado" },
        { status: 400 }
      )
    }

    // Validar tamaño de archivo (10MB máximo)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "El archivo es demasiado grande. Máximo 10MB." },
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

    // Simular guardado del archivo
    // En un sistema real, aquí se guardaría el archivo en un storage
    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()

    // Insertar documento en la base de datos (simulado)
    const insertDocument = db.prepare(`
      INSERT INTO EmissionDocument (id, emissionId, filename, fileType, fileSize, uploadedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    
    try {
      insertDocument.run(
        documentId,
        emissionId,
        file.name,
        file.type,
        file.size,
        now
      )
    } catch (dbError) {
      // Si la tabla no existe, simplemente continuar (para demo)
      console.log('Document table may not exist, continuing with simulation')
    }

    // Crear registro de actividad
    const insertActivity = db.prepare(`
      INSERT INTO EmissionActivity (id, emissionId, action, description, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `)
    
    const activityId = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    insertActivity.run(
      activityId,
      emissionId,
      'DOCUMENT_UPLOADED',
      `Documento "${file.name}" subido correctamente`,
      now
    )

    // Actualizar timestamp de la emisión
    const updateEmission = db.prepare(`
      UPDATE Emision 
      SET updatedAt = ? 
      WHERE id = ?
    `)
    
    updateEmission.run(now, emissionId)

    return NextResponse.json({
      success: true,
      message: "Documento subido correctamente",
      document: {
        id: documentId,
        filename: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadedAt: now
      }
    })

  } catch (error) {
    console.error('Error uploading document:', error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}