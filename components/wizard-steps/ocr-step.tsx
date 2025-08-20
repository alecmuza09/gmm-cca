"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Eye, RefreshCw, ArrowRight } from "lucide-react"
import { EmissionFormData } from "../emission-wizard"

interface OcrStepProps {
  formData: EmissionFormData
  updateFormData: (updates: Partial<EmissionFormData>) => void
  onAutoAdvance?: () => void
}

export function OcrStep({ formData, updateFormData, onAutoAdvance }: OcrStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showReview, setShowReview] = useState(false)
  const [missingFields, setMissingFields] = useState<string[]>([])
  const [userConfirmed, setUserConfirmed] = useState(false)

  // Función para validar qué campos importantes faltan
  const validateExtractedData = (data: any): string[] => {
    const missing: string[] = []
    const requiredFields = [
      { key: 'asegurado', label: 'Nombre del asegurado' },
      { key: 'numeroPoliza', label: 'Número de póliza' },
      { key: 'vigenciaDesde', label: 'Fecha de inicio de vigencia' },
      { key: 'vigenciaHasta', label: 'Fecha de fin de vigencia' },
      { key: 'prima', label: 'Prima anual' },
      { key: 'compania', label: 'Compañía aseguradora' }
    ]

    requiredFields.forEach(field => {
      if (!data[field.key] || data[field.key].toString().trim() === '') {
        missing.push(field.label)
      }
    })

    return missing
  }

  // Función para confirmar los datos y continuar
  const handleConfirmData = () => {
    setUserConfirmed(true)
    // Auto-advance after confirmation
    setTimeout(() => {
      if (onAutoAdvance) {
        onAutoAdvance()
      }
    }, 500)
  }

  // Función para procesar un nuevo archivo
  const handleProcessNewFile = () => {
    setShowReview(false)
    setUserConfirmed(false)
    setMissingFields([])
    // Clear current data
    updateFormData({
      ocrData: {
        ...formData.ocrData,
        caratulaFile: undefined,
        extractedData: undefined,
        processingComplete: false
      }
    })
    setPreviewUrl(null)
  }

  const handleFileSelect = (file: File) => {
    const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    
    if (file && acceptedTypes.includes(file.type)) {
      // Create preview URL (only for images)
      let url = null
      if (file.type.startsWith('image/')) {
        url = URL.createObjectURL(file)
        setPreviewUrl(url)
      } else {
        setPreviewUrl(null) // No preview for PDF
      }

      // Update form data
      updateFormData({
        ocrData: {
          ...formData.ocrData,
          caratulaFile: file,
          isProcessing: true,
          processingComplete: false
        }
      })

      // Process OCR
      processOcrFile(file)
    } else {
      alert('Por favor selecciona un archivo JPG, PNG o PDF válido.')
    }
  }

  // Función para adaptar datos de la nueva estructura a la anterior
  const adaptOcrData = (newData: any) => {
    // Si ya está en el formato anterior, devolverlo tal como está
    if (newData.asegurado || newData.compania) {
      return newData
    }

    // Adaptar desde la nueva estructura de páginas
    const adapted: any = { ...newData }

    // Extraer información del solicitante titular
    if (newData.pagina1?.solicitante1Titular) {
      const titular = newData.pagina1.solicitante1Titular
      if (titular.nombres || titular.primerApellido) {
        adapted.asegurado = `${titular.nombres || ''} ${titular.primerApellido || ''} ${titular.segundoApellido || ''}`.trim()
      }
      if (titular.rfc) adapted.rfc = titular.rfc
      if (titular.curp) adapted.curp = titular.curp
      if (titular.correoElectronico) adapted.email = titular.correoElectronico
      if (titular.domicilioResidencia?.telefono) adapted.telefono = titular.domicilioResidencia.telefono
      if (titular.domicilioResidencia?.codigoPostal) adapted.codigoPostal = titular.domicilioResidencia.codigoPostal
      if (titular.domicilioResidencia?.municipioAlcaldia) adapted.ciudad = titular.domicilioResidencia.municipioAlcaldia
      if (titular.domicilioResidencia?.entidadFederativa) adapted.estado = titular.domicilioResidencia.entidadFederativa
    }

    // Información de la póliza
    if (newData.pagina4) {
      if (newData.pagina4.sumaAsegurada) adapted.prima = newData.pagina4.sumaAsegurada
      if (newData.pagina4.deducible) adapted.deducible = newData.pagina4.deducible
    }

    // Información general
    adapted.compania = 'GNP' // Siempre es GNP para este tipo de solicitud

    return adapted
  }

  const processOcrFile = async (file: File) => {
    try {
      // Simulate upload progress
      for (let i = 0; i <= 50; i += 10) {
        setUploadProgress(i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Call OCR API
      const formDataToSend = new FormData()
      formDataToSend.append('file', file)

      const response = await fetch('/api/ocr/process', {
        method: 'POST',
        body: formDataToSend
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
        throw new Error(errorData.error || 'Error en el procesamiento OCR')
      }

      const result = await response.json()
      
      // Validate response structure
      if (!result || typeof result !== 'object') {
        throw new Error('Respuesta inválida del servidor')
      }
      
      // Complete progress
      setUploadProgress(100)
      await new Promise(resolve => setTimeout(resolve, 500))

      if (result.success && result.extractedData) {
        // Adaptar los datos al formato anterior para compatibilidad
        const adaptedData = adaptOcrData(result.extractedData)
        
        // Update form data with extracted information (mantener datos originales + adaptados)
        updateFormData({
          ocrData: {
            ...formData.ocrData,
            caratulaFile: file,
            extractedData: {
              ...result.extractedData, // Datos originales de la nueva estructura
              ...adaptedData // Datos adaptados para compatibilidad
            },
            isProcessing: false,
            processingComplete: true
          }
        })

        // Auto-fill all available data
        if (adaptedData.asegurado) {
          const nameParts = adaptedData.asegurado.split(' ')
          const nombre = nameParts[0] || ''
          const apellidos = nameParts.slice(1).join(' ') || ''
          
          // Fill solicitante data
          updateFormData({
            solicitante: {
              ...formData.solicitante,
              nombre: nombre,
              apellidos: apellidos,
              rfc: adaptedData.rfc || formData.solicitante.rfc,
              telefono: adaptedData.telefono || formData.solicitante.telefono,
              email: adaptedData.email || formData.solicitante.email,
              domicilio: {
                ...formData.solicitante.domicilio,
                cp: adaptedData.codigoPostal || formData.solicitante.domicilio?.cp,
                ciudad: adaptedData.ciudad || formData.solicitante.domicilio?.ciudad,
                estado: adaptedData.estado || formData.solicitante.domicilio?.estado,
                pais: 'México'
              }
            }
          })
        }

        // Auto-fill monto if extracted
        if (adaptedData.prima && !formData.montoUSD) {
          updateFormData({
            montoUSD: adaptedData.prima
          })
        }

        // Validate extracted data and show review
        const missing = validateExtractedData(adaptedData)
        setMissingFields(missing)
        setShowReview(true)
        setUserConfirmed(false)
      } else {
        throw new Error('No se pudieron extraer datos de la imagen')
      }
    } catch (error) {
      console.error('Error processing OCR:', error)
      
      // Update with error state
      updateFormData({
        ocrData: {
          ...formData.ocrData,
          caratulaFile: file,
          isProcessing: false,
          processingComplete: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        }
      })
    } finally {
      setUploadProgress(0)
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    
    updateFormData({
      ocrData: {
        caratulaFile: undefined,
        extractedData: undefined,
        isProcessing: false,
        processingComplete: false
      }
    })
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const isProcessing = formData.ocrData?.isProcessing
  const isComplete = formData.ocrData?.processingComplete
  const hasFile = formData.ocrData?.caratulaFile
  const extractedData = formData.ocrData?.extractedData
  const hasError = formData.ocrData?.error

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Carátula de Póliza
          </CardTitle>
          <CardDescription>
            Suba una imagen o PDF de la carátula de la póliza para extraer automáticamente los datos usando Mistral OCR
            <br />
            <span className="text-green-600 text-sm mt-1 block">
              ✅ <strong>Soporte completo:</strong> JPG, PNG e incluso PDFs directamente
            </span>
            <span className="text-blue-600 text-sm">
              🤖 <strong>Mistral OCR:</strong> Procesamiento inteligente de documentos con alta precisión
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasFile && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  Arrastra y suelta la carátula aquí
                </p>
                <p className="text-sm text-muted-foreground">
                  o haz clic para seleccionar un archivo
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Seleccionar Archivo
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,application/pdf"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground mt-4">
                Formatos soportados: JPG, PNG, PDF (máx. 10MB)
              </p>
            </div>
          )}

          {hasFile && (
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-20 h-20 object-cover rounded border"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-muted rounded border flex items-center justify-center">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium truncate">
                        {formData.ocrData?.caratulaFile?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formData.ocrData?.caratulaFile?.type === 'application/pdf' ? 'PDF • ' : 'Imagen • '}
                        {formData.ocrData?.caratulaFile?.size ? 
                          `${(formData.ocrData.caratulaFile.size / 1024 / 1024).toFixed(2)} MB` : 
                          'Tamaño desconocido'
                        }
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRemoveFile}
                      disabled={isProcessing}
                    >
                      Remover
                    </Button>
                  </div>
                  
                  {isProcessing && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Procesando con OCR...
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}
                  
                  {isComplete && (
                    <div className="mt-3">
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        Procesamiento completado con IA
                      </div>
                    </div>
                  )}
                  
                  {hasError && (
                    <div className="mt-3">
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        Error: {hasError}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revisión de datos extraídos */}
      {extractedData && showReview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              Revisar Datos Extraídos
            </CardTitle>
            <CardDescription>
              Revisa la información extraída antes de continuar. Los campos faltantes se completarán en el siguiente paso.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Alertas sobre campos faltantes */}
            {missingFields.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-700">
                  <strong>Campos que requieren atención:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {missingFields.map((field, index) => (
                      <li key={index} className="text-sm">{field}</li>
                    ))}
                  </ul>
                  <p className="text-xs mt-2 opacity-75">
                    Estos campos se pueden completar manualmente en el siguiente paso.
                  </p>
                </AlertDescription>
              </Alert>
            )}

            {/* Datos extraídos exitosamente */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-sm">Información Extraída:</span>
                {extractedData.extractionMethod && (
                  <Badge variant="outline" className="text-xs">
                    {extractedData.extractionMethod}
                  </Badge>
                )}
              </div>

              {/* Mostrar reporte estructurado si está disponible */}
              {extractedData.structuredReport && (
                <div className="col-span-full">
                  <div className="bg-white border rounded-lg p-4">
                    <h4 className="font-semibold text-lg mb-3 text-gray-900">📋 Reporte de Información Extraída</h4>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
                        {extractedData.structuredReport}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Información básica */}
                {(extractedData.asegurado || extractedData.pagina1?.solicitante1Titular?.nombres) && (
                  <div className="space-y-2">
                    <Label className="text-green-700">✓ Asegurado</Label>
                    <Input 
                      value={extractedData.asegurado || 
                        (extractedData.pagina1?.solicitante1Titular ? 
                          `${extractedData.pagina1.solicitante1Titular.nombres || ''} ${extractedData.pagina1.solicitante1Titular.primerApellido || ''} ${extractedData.pagina1.solicitante1Titular.segundoApellido || ''}`.trim() 
                          : '')} 
                      readOnly 
                      className="bg-green-50 border-green-200" 
                    />
                  </div>
                )}
                
                {(extractedData.compania || 'GNP') && (
                  <div className="space-y-2">
                    <Label className="text-green-700">✓ Compañía</Label>
                    <Input value={extractedData.compania || 'GNP'} readOnly className="bg-green-50 border-green-200" />
                  </div>
                )}
                
                {extractedData.numeroPoliza && (
                  <div className="space-y-2">
                    <Label className="text-green-700">✓ Número de Póliza</Label>
                    <Input value={extractedData.numeroPoliza} readOnly className="bg-green-50 border-green-200" />
                  </div>
                )}
                
                {/* Documentos oficiales */}
                {(extractedData.rfc || extractedData.pagina1?.solicitante1Titular?.rfc) && (
                  <div className="space-y-2">
                    <Label className="text-green-700">✓ RFC</Label>
                    <Input 
                      value={extractedData.rfc || extractedData.pagina1?.solicitante1Titular?.rfc} 
                      readOnly 
                      className="bg-green-50 border-green-200" 
                    />
                  </div>
                )}
                
                {extractedData.curp && (
                  <div className="space-y-2">
                    <Label className="text-green-700">✓ CURP</Label>
                    <Input value={extractedData.curp} readOnly className="bg-green-50 border-green-200" />
                  </div>
                )}
                
                {/* Datos personales */}
                {extractedData.fechaNacimiento && (
                  <div className="space-y-2">
                    <Label className="text-green-700">✓ Fecha de Nacimiento</Label>
                    <Input value={extractedData.fechaNacimiento} readOnly className="bg-green-50 border-green-200" />
                  </div>
                )}
                
                {extractedData.sexo && (
                  <div className="space-y-2">
                    <Label className="text-green-700">✓ Sexo</Label>
                    <Input value={extractedData.sexo === 'F' ? 'Femenino' : 'Masculino'} readOnly className="bg-green-50 border-green-200" />
                  </div>
                )}
                
                {extractedData.ocupacion && (
                  <div className="space-y-2">
                    <Label className="text-green-700">✓ Ocupación</Label>
                    <Input value={extractedData.ocupacion} readOnly className="bg-green-50 border-green-200" />
                  </div>
                )}
                
                {/* Datos físicos */}
                {extractedData.peso && (
                  <div className="space-y-2">
                    <Label className="text-green-700">✓ Peso</Label>
                    <Input value={`${extractedData.peso} kg`} readOnly className="bg-green-50 border-green-200" />
                  </div>
                )}
                
                {extractedData.estatura && (
                  <div className="space-y-2">
                    <Label className="text-green-700">✓ Estatura</Label>
                    <Input value={`${extractedData.estatura} m`} readOnly className="bg-green-50 border-green-200" />
                  </div>
                )}
                
                {/* Contacto */}
                {extractedData.email && (
                  <div className="space-y-2">
                    <Label className="text-green-700">✓ Email</Label>
                    <Input value={extractedData.email} readOnly className="bg-green-50 border-green-200" />
                  </div>
                )}
                
                {extractedData.telefono && (
                  <div className="space-y-2">
                    <Label className="text-green-700">✓ Teléfono</Label>
                    <Input value={extractedData.telefono} readOnly className="bg-green-50 border-green-200" />
                  </div>
                )}
                
                {/* Ubicación */}
                {extractedData.paisNacimiento && (
                  <div className="space-y-2">
                    <Label className="text-green-700">✓ País de Nacimiento</Label>
                    <Input value={extractedData.paisNacimiento} readOnly className="bg-green-50 border-green-200" />
                  </div>
                )}
                
                {extractedData.entidadFederativa && (
                  <div className="space-y-2">
                    <Label className="text-green-700">✓ Entidad Federativa</Label>
                    <Input value={extractedData.entidadFederativa} readOnly className="bg-green-50 border-green-200" />
                  </div>
                )}
                
                {/* Domicilio */}
                {extractedData.domicilio?.calle && (
                  <div className="space-y-2">
                    <Label className="text-green-700">✓ Calle</Label>
                    <Input value={extractedData.domicilio.calle} readOnly className="bg-green-50 border-green-200" />
                  </div>
                )}
                
                {extractedData.domicilio?.numeroExterior && (
                  <div className="space-y-2">
                    <Label className="text-green-700">✓ Número Exterior</Label>
                    <Input value={extractedData.domicilio.numeroExterior} readOnly className="bg-green-50 border-green-200" />
                  </div>
                )}
                
                {/* Seguros - si están disponibles */}
                {extractedData.vigenciaDesde && (
                  <div className="space-y-2">
                    <Label className="text-green-700">✓ Vigencia Desde</Label>
                    <Input value={extractedData.vigenciaDesde} readOnly className="bg-green-50 border-green-200" />
                  </div>
                )}
                
                {extractedData.vigenciaHasta && (
                  <div className="space-y-2">
                    <Label className="text-green-700">✓ Vigencia Hasta</Label>
                    <Input value={extractedData.vigenciaHasta} readOnly className="bg-green-50 border-green-200" />
                  </div>
                )}
                
                {extractedData.prima && (
                  <div className="space-y-2">
                    <Label className="text-green-700">✓ Prima Anual</Label>
                    <Input value={`$${extractedData.prima.toLocaleString()}`} readOnly className="bg-green-50 border-green-200" />
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button 
                onClick={handleConfirmData} 
                className="flex items-center gap-2"
                disabled={userConfirmed}
              >
                {userConfirmed ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Confirmado - Avanzando...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4" />
                    Confirmar y Continuar
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleProcessNewFile}
                className="flex items-center gap-2"
                disabled={userConfirmed}
              >
                <RefreshCw className="h-4 w-4" />
                Procesar Otro Archivo
              </Button>
            </div>

            {missingFields.length === 0 && (
              <Alert className="mt-4">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  ✅ ¡Excelente! Se extrajeron todos los campos principales. 
                  Puedes continuar al siguiente paso para revisar y completar la información.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
      
      {!hasFile && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Este paso es opcional. Puede continuar sin subir la carátula, pero tendrá que llenar 
            manualmente todos los datos en los siguientes pasos.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
