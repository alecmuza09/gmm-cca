"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Eye, 
  ArrowRight,
  FileCheck,
  Zap
} from "lucide-react"
import { EmissionFormData } from "../emission-wizard"

interface SolicitudStepProps {
  formData: EmissionFormData
  updateFormData: (updates: Partial<EmissionFormData>) => void
  onValidateAndContinue?: () => void
}

export function SolicitudStep({ formData, updateFormData, onValidateAndContinue }: SolicitudStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedText, setExtractedText] = useState<string>("")
  const [validationComplete, setValidationComplete] = useState(false)

  const hasFile = formData.ocrData?.caratulaFile
  const extractedData = formData.ocrData?.extractedData
  const processingComplete = formData.ocrData?.processingComplete

  const handleFileSelect = (file: File) => {
    const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (file && acceptedTypes.includes(file.type)) {
      let url = null
      if (file.type.startsWith('image/')) {
        url = URL.createObjectURL(file)
        setPreviewUrl(url)
      } else {
        setPreviewUrl(null) // No preview for PDF
      }
      
      updateFormData({
        ocrData: {
          ...formData.ocrData,
          caratulaFile: file,
          isProcessing: false,
          processingComplete: false,
          error: undefined
        }
      })
    } else {
      alert('Por favor selecciona un archivo JPG, PNG o PDF válido.')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const processDocument = async () => {
    if (!hasFile) return

    setIsProcessing(true)
    setUploadProgress(0)
    setExtractedText("")
    setValidationComplete(false)

    updateFormData({
      ocrData: {
        ...formData.ocrData,
        isProcessing: true,
        processingComplete: false,
        error: undefined
      }
    })

    try {
      console.log('Enviando archivo para procesamiento OCR:')
      console.log('- Nombre:', hasFile.name)
      console.log('- Tipo MIME:', hasFile.type)
      console.log('- Tamaño:', hasFile.size, 'bytes')
      console.log('- Tamaño en MB:', (hasFile.size / 1024 / 1024).toFixed(2), 'MB')

      const formDataToSend = new FormData()
      formDataToSend.append('file', hasFile)
      // Agregar timestamp para evitar caché
      formDataToSend.append('timestamp', Date.now().toString())

      // Simular progreso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 10
        })
      }, 200)

      const response = await fetch('/api/ocr/process', {
        method: 'POST',
        body: formDataToSend,
        // Agregar headers para evitar caché
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
        console.error('Error del servidor OCR:', errorData)
        throw new Error(`Error ${response.status}: ${errorData.error || 'Error desconocido'}`)
      }

      const result = await response.json()
      console.log('Resultado del OCR recibido:', result)

      if (result.success) {
        console.log('OCR procesado exitosamente, datos extraídos:', result.extractedData)
        
        // Extraer texto completo del documento
        const fullText = generateExtractedText(result.extractedData)
        setExtractedText(fullText)

        // Distribuir datos automáticamente
        distributeDataToSteps(result.extractedData)

        updateFormData({
          ocrData: {
            ...formData.ocrData,
            extractedData: result.extractedData,
            isProcessing: false,
            processingComplete: true
          }
        })
      } else {
        console.error('Error en el resultado del OCR:', result.error)
        throw new Error(result.error || 'Error en el procesamiento OCR')
      }
    } catch (error) {
      console.error('Error processing document:', error)
      updateFormData({
        ocrData: {
          ...formData.ocrData,
          isProcessing: false,
          processingComplete: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        }
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const generateExtractedText = (data: any): string => {
    // Si hay texto completo pre-formateado, usarlo
    if (data.textoCompleto) {
      return data.textoCompleto
    }

    // Si no, generar texto estructurado basado en los datos disponibles
    let text = "=== DOCUMENTO PROCESADO COMPLETAMENTE ===\n\n"
    
    // Información General
    if (data.informacionGeneral) {
      text += "=== INFORMACIÓN GENERAL ===\n"
      const info = data.informacionGeneral
      if (info.compania) text += `Compañía: ${info.compania}\n`
      if (info.numeroPoliza) text += `Número de Póliza: ${info.numeroPoliza}\n`
      if (info.planCobertura) text += `Plan: ${info.planCobertura}\n`
      if (info.deducible) text += `Deducible: ${info.deducible}\n`
      if (info.coaseguro) text += `Coaseguro: ${info.coaseguro}\n`
      if (info.prima) text += `Prima Anual: $${info.prima.toLocaleString()} MXN\n`
      if (info.sumaAsegurada) text += `Suma Asegurada: $${info.sumaAsegurada.toLocaleString()} MXN\n`
      text += "\n"
    }

    // Datos del Solicitante
    if (data.solicitante) {
      text += "=== DATOS DEL SOLICITANTE ===\n"
      const sol = data.solicitante
      if (sol.codigoCliente) text += `Código de Cliente: ${sol.codigoCliente}\n`
      if (sol.nombreCompleto) text += `Nombre Completo: ${sol.nombreCompleto}\n`
      if (sol.primerApellido) text += `Primer Apellido: ${sol.primerApellido}\n`
      if (sol.segundoApellido) text += `Segundo Apellido: ${sol.segundoApellido}\n`
      if (sol.nombres) text += `Nombres: ${sol.nombres}\n`
      if (sol.fechaNacimiento) text += `Fecha de Nacimiento: ${sol.fechaNacimiento}\n`
      if (sol.rfc) text += `RFC: ${sol.rfc}\n`
      if (sol.curp) text += `CURP: ${sol.curp}\n`
      if (sol.sexo) text += `Sexo: ${sol.sexo === 'F' ? 'Femenino' : 'Masculino'}\n`
      if (sol.regimenFiscal) text += `Régimen Fiscal: ${sol.regimenFiscal}\n`
      if (sol.ocupacion) text += `Ocupación: ${sol.ocupacion}\n`
      if (sol.peso) text += `Peso: ${sol.peso} kg\n`
      if (sol.estatura) text += `Estatura: ${sol.estatura} m\n`
      if (sol.paisNacimiento) text += `País de Nacimiento: ${sol.paisNacimiento}\n`
      if (sol.entidadFederativa) text += `Entidad Federativa: ${sol.entidadFederativa}\n`
      if (sol.nacionalidad) text += `Nacionalidad: ${sol.nacionalidad}\n`
      if (sol.correoElectronico) text += `Correo Electrónico: ${sol.correoElectronico}\n`
      if (sol.cargoGobierno) text += `¿Ha desempeñado cargo en gobierno?: ${sol.cargoGobierno}\n`
      text += "\n"
    }

    // Domicilio
    if (data.domicilio) {
      text += "=== DOMICILIO ===\n"
      const dom = data.domicilio
      if (dom.calle) text += `Calle: ${dom.calle}\n`
      if (dom.numeroExterior) text += `Número Exterior: ${dom.numeroExterior}\n`
      if (dom.numeroInterior) text += `Número Interior: ${dom.numeroInterior}\n`
      if (dom.colonia) text += `Colonia: ${dom.colonia}\n`
      if (dom.codigoPostal) text += `Código Postal: ${dom.codigoPostal}\n`
      if (dom.municipioAlcaldia) text += `Municipio/Alcaldía: ${dom.municipioAlcaldia}\n`
      if (dom.entidadFederativa) text += `Entidad Federativa: ${dom.entidadFederativa}\n`
      if (dom.pais) text += `País: ${dom.pais}\n`
      text += "\n"
    }

    // Coberturas Adicionales
    if (data.coberturasAdicionales) {
      text += "=== COBERTURAS ADICIONALES SELECCIONADAS ===\n"
      const cob = data.coberturasAdicionales
      if (cob.ampliacionHospitalariaNacional) text += "✓ Ampliación hospitalaria Nacional\n"
      if (cob.altaTecnologiaMedicinaVanguardia) text += "✓ Alta tecnología y medicina de vanguardia\n"
      if (cob.ceroDeducibleAccidente) text += "✓ Cero deducible por Accidente\n"
      if (cob.clausulaFamiliar) text += "✓ Cláusula Familiar\n"
      if (cob.dobleEsencialPlus) text += "✓ Doble Esencial Plus\n"
      if (cob.enfermedadesCatastroficasExtranjero) text += "✓ Enfermedades catastróficas en el extranjero\n"
      if (cob.eliminacionDeducibleAccidente) text += "✓ Eliminación de deducible por Accidente\n"
      if (cob.emergenciaMedicaExtranjero) text += "✓ Emergencia Médica en el Extranjero\n"
      if (cob.esencialPlus) text += "✓ Esencial Plus\n"
      if (cob.reduccionDeducible) text += "✓ Reducción de deducible\n"
      if (cob.reduccionDeducibleAccidente) text += "✓ Reducción de deducible por Accidente\n"
      if (cob.solicitanteCoberturasExtranjero) text += `Solicitante para Cobertura en el extranjero: ${cob.solicitanteCoberturasExtranjero}\n`
      text += "\n"
    }

    // Beneficiarios
    if (data.beneficiarios && data.beneficiarios.length > 0) {
      text += "=== BENEFICIARIOS ===\n"
      data.beneficiarios.forEach((ben: any, index: number) => {
        text += `${index + 1}. ${ben.nombre} (${ben.parentesco}) - ${ben.porcentaje}%`
        if (ben.fechaNacimiento) text += ` - Nac: ${ben.fechaNacimiento}`
        text += "\n"
      })
      text += "\n"
    }

    // Declaraciones Médicas
    if (data.declaracionesMedicas) {
      text += "=== DECLARACIONES MÉDICAS ===\n"
      const med = data.declaracionesMedicas
      
      if (med.padecimientos && med.padecimientos.length > 0) {
        text += "Padecimientos actuales:\n"
        med.padecimientos.forEach((pad: string) => text += `- ${pad}\n`)
        text += "\n"
      }

      if (med.medicamentos && med.medicamentos.length > 0) {
        text += "Medicamentos actuales:\n"
        med.medicamentos.forEach((med: string) => text += `- ${med}\n`)
        text += "\n"
      }

      if (med.cirugias && med.cirugias.length > 0) {
        text += "Cirugías previas:\n"
        med.cirugias.forEach((cir: any) => {
          text += `- ${cir.tipo}`
          if (cir.fecha) text += ` (${cir.fecha})`
          if (cir.hospital) text += ` - ${cir.hospital}`
          text += "\n"
        })
        text += "\n"
      }

      if (med.hospitalizaciones && med.hospitalizaciones.length > 0) {
        text += "Hospitalizaciones:\n"
        med.hospitalizaciones.forEach((hosp: any) => {
          text += `- ${hosp.motivo}`
          if (hosp.fecha) text += ` (${hosp.fecha})`
          if (hosp.dias) text += ` - ${hosp.dias} días`
          if (hosp.hospital) text += ` - ${hosp.hospital}`
          text += "\n"
        })
        text += "\n"
      }

      if (med.consultasMedicas && med.consultasMedicas.length > 0) {
        text += "Consultas médicas regulares:\n"
        med.consultasMedicas.forEach((cons: string) => text += `- ${cons}\n`)
        text += "\n"
      }
    }

    // Información Adicional
    if (data.informacionAdicional) {
      text += "=== INFORMACIÓN ADICIONAL ===\n"
      const info = data.informacionAdicional
      if (info.observaciones) text += `Observaciones: ${info.observaciones}\n`
      if (info.comentarios) text += `Comentarios: ${info.comentarios}\n`
      if (info.notasEspeciales) text += `Notas Especiales: ${info.notasEspeciales}\n`
      text += "\n"
    }

    // Documentos Requeridos
    if (data.documentosRequeridos && data.documentosRequeridos.length > 0) {
      text += "=== DOCUMENTOS REQUERIDOS ===\n"
      data.documentosRequeridos.forEach((doc: string) => text += `- ${doc}\n`)
      text += "\n"
    }

    // Firmas
    if (data.firmas) {
      text += "=== FIRMAS Y AUTORIZACIONES ===\n"
      const firma = data.firmas
      if (firma.solicitante) text += `Solicitante: ${firma.solicitante}\n`
      if (firma.fecha) text += `Fecha: ${firma.fecha}\n`
      if (firma.lugar) text += `Lugar: ${firma.lugar}\n`
      text += "\n"
    }

    text += "DOCUMENTO PROCESADO COMPLETAMENTE - TODAS LAS PÁGINAS ANALIZADAS"

    return text
  }

  const distributeDataToSteps = (data: any) => {
    // Determinar tipo de emisión basado en el documento
    let tipoEmision: any = "NUEVO_NEGOCIO" // Por defecto
    let persona: any = "FISICA" // Por defecto

    // Determinar tipo de persona basado en RFC
    if (data.solicitante?.rfc || data.rfc) {
      const rfc = data.solicitante?.rfc || data.rfc
      persona = rfc.length === 13 ? "FISICA" : "MORAL"
    }

    // Actualizar información del solicitante - maneja ambas estructuras
    const solicitanteData = {
      nombre: data.solicitante?.nombres || data.nombres || data.asegurado?.split(' ').slice(2).join(' ') || "",
      apellidos: (data.solicitante?.primerApellido && data.solicitante?.segundoApellido) 
        ? `${data.solicitante.primerApellido} ${data.solicitante.segundoApellido}`
        : data.asegurado?.split(' ').slice(0, 2).join(' ') || "",
      fechaNac: data.solicitante?.fechaNacimiento || data.fechaNacimiento || "",
      rfc: data.solicitante?.rfc || data.rfc || "",
      curp: data.solicitante?.curp || data.curp || "",
      email: data.solicitante?.correoElectronico || data.email || "",
      telefono: data.solicitante?.telefono || data.telefono || "",
      domicilio: {
        calle: data.domicilio?.calle || "",
        numero: data.domicilio?.numeroExterior || "",
        colonia: data.domicilio?.colonia || "",
        cp: data.domicilio?.codigoPostal || "",
        ciudad: data.domicilio?.municipioAlcaldia || data.domicilio?.municipio || "",
        estado: data.domicilio?.entidadFederativa || data.entidadFederativa || "",
        pais: data.domicilio?.pais || data.paisNacimiento || "México"
      }
    }

    // Información adicional para moral si es necesario
    const moralInfo = persona === "MORAL" ? {
      razonSocial: data.solicitante?.nombreCompleto || data.asegurado || "",
      rfc: data.solicitante?.rfc || data.rfc || "",
      representante: data.solicitante?.nombres || "",
      representanteId: "",
      codigoCliente: data.solicitante?.codigoCliente || ""
    } : undefined

    // Actualizar datos del formulario
    updateFormData({
      tipoEmision,
      persona,
      solicitante: solicitanteData,
      moralInfo: moralInfo,
      montoUSD: data.informacionGeneral?.prima || data.prima || undefined,
      // Guardar toda la información extraída para referencia
      ocrData: {
        ...formData.ocrData,
        extractedData: {
          ...data,
          // Mantener compatibilidad con estructura anterior
          asegurado: data.solicitante?.nombreCompleto || data.asegurado,
          compania: data.informacionGeneral?.compania || data.compania,
          numeroPoliza: data.informacionGeneral?.numeroPoliza || data.numeroPoliza,
          vigenciaDesde: data.informacionGeneral?.vigenciaDesde || data.vigenciaDesde,
          vigenciaHasta: data.informacionGeneral?.vigenciaHasta || data.vigenciaHasta,
          prima: data.informacionGeneral?.prima || data.prima,
          sumaAsegurada: data.informacionGeneral?.sumaAsegurada || data.sumaAsegurada,
          planCobertura: data.informacionGeneral?.planCobertura || data.planCobertura,
          deducible: data.informacionGeneral?.deducible || data.deducible,
          coaseguro: data.informacionGeneral?.coaseguro || data.coaseguro
        }
      }
    })
  }

  const handleValidateAndContinue = () => {
    setValidationComplete(true)
    setTimeout(() => {
      onValidateAndContinue?.()
    }, 500)
  }

  return (
    <div className="space-y-6">
      {/* Título principal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Cargar Solicitud de Seguro
          </CardTitle>
          <CardDescription>
            Sube el documento de solicitud para extraer automáticamente toda la información usando Mistral OCR
            <br />
            <span className="text-green-600 text-sm mt-1 block">
              ✅ <strong>Soporte completo:</strong> JPG, PNG y PDFs (ConvertAPI + Mistral Vision)
            </span>
            <span className="text-blue-600 text-sm mt-1 block font-medium">
              🚀 <strong>OCR Profesional:</strong> ConvertAPI convierte PDFs → Mistral extrae datos reales
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasFile && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? 'border-primary bg-primary/10'
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium">Arrastra tu solicitud aquí</p>
                <p className="text-sm text-muted-foreground">
                  o haz clic para seleccionar el archivo
                </p>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Seleccionar Archivo
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Formatos soportados: JPG, PNG, PDF (máx. 10MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileSelect(file)
                }}
                className="hidden"
              />
            </div>
          )}

          {/* Vista previa del archivo */}
          {hasFile && (
            <Card className="border-2 border-blue-200 bg-blue-50/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">{hasFile.name}</p>
                      <p className="text-sm text-blue-700">
                        {hasFile.type === 'application/pdf' ? 'PDF • ' : 'Imagen • '}
                        {(hasFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      updateFormData({
                        ocrData: {
                          ...formData.ocrData,
                          caratulaFile: undefined,
                          extractedData: undefined,
                          isProcessing: false,
                          processingComplete: false
                        }
                      })
                      setPreviewUrl(null)
                      setExtractedText("")
                      setValidationComplete(false)
                    }}
                  >
                    Cambiar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vista previa de imagen */}
          {previewUrl && (
            <div className="mt-4">
              <img
                src={previewUrl}
                alt="Vista previa"
                className="max-w-full h-auto max-h-64 object-contain border rounded-lg"
              />
            </div>
          )}

          {/* Botón de procesamiento */}
          {hasFile && !processingComplete && !isProcessing && (
            <Button
              onClick={processDocument}
              className="w-full"
              size="lg"
            >
              <Zap className="h-4 w-4 mr-2" />
              Procesar Documento
            </Button>
          )}

          {/* Progreso de procesamiento */}
          {isProcessing && (
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span className="text-sm font-medium text-blue-600">
                  Procesando documento con Mistral OCR...
                </span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                Extrayendo información del documento
              </p>
            </div>
          )}

          {/* Error de procesamiento */}
          {formData.ocrData?.error && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Error:</strong> {formData.ocrData.error}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={processDocument}
                  className="mt-2"
                >
                  Intentar de nuevo
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Texto extraído */}
      {extractedText && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-600" />
              Información Extraída
            </CardTitle>
            <CardDescription>
              Texto completo extraído del documento procesado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64 w-full rounded-md border p-4">
              <Textarea
                value={extractedText}
                readOnly
                className="min-h-[200px] resize-none border-none bg-transparent"
              />
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Botón de validar y continuar */}
      {processingComplete && extractedText && (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-900">
                    Documento procesado exitosamente
                  </p>
                  <p className="text-sm text-green-700">
                    Los datos se han distribuido automáticamente en los siguientes pasos
                  </p>
                </div>
              </div>
              <Button
                onClick={handleValidateAndContinue}
                size="lg"
                className="bg-green-600 hover:bg-green-700"
                disabled={validationComplete}
              >
                {validationComplete ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Validado
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Validar y Continuar
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
