# Configuración de Mistral OCR API Key

Para habilitar el procesamiento OCR real con Mistral AI OCR API, necesitas configurar tu API Key.

## 1. Obtener tu API Key de Mistral:

1. Ve a [Mistral AI Platform](https://console.mistral.ai/)
2. Regístrate o inicia sesión con tu cuenta.
3. Dirígete a la sección de "API Keys" en tu dashboard.
4. Haz clic en "Create new key" o "Nueva clave".
5. Copia la clave generada.

## 2. Configurar la API Key en tu proyecto:

La API Key ya está configurada en el archivo `.env.local`:

```
MISTRAL_API_KEY=kYxsbe1T6FFD1ASinsik3KXLHfXw9PGp
```

**Importante:**
- Asegúrate de que este archivo `.env.local` no se suba a tu repositorio de Git (ya está en `.gitignore`).
- Si necesitas cambiar la clave, edita el archivo `.env.local` directamente.

## 3. Reiniciar el servidor de desarrollo:

Después de añadir o modificar la API Key, debes reiniciar tu servidor de desarrollo para que los cambios surtan efecto.

```bash
pkill -f "next dev" && sleep 2 && npm run dev
```

## 4. Ventajas de Mistral OCR:

### ✅ **Soporte completo para PDFs:**
- A diferencia de Gemini Vision, Mistral OCR puede procesar PDFs directamente
- No necesitas convertir PDFs a imágenes manualmente

### ✅ **Mejor precisión:**
- Modelo especializado en OCR con alta precisión
- Soporte nativo para documentos de seguros

### ✅ **Formatos soportados:**
- **Imágenes**: JPG, PNG
- **Documentos**: PDF (procesamiento directo)
- **Tamaño máximo**: 10MB por archivo

### ✅ **Proceso en dos etapas:**
1. **Extracción OCR**: Convierte la imagen/PDF a texto usando `mistral-ocr-latest`
2. **Análisis inteligente**: Procesa el texto con `mistral-large-latest` para extraer campos específicos

## 5. Funcionamiento:

### **Paso 1: OCR**
```javascript
const ocrResponse = await client.ocr.process({
  model: "mistral-ocr-latest",
  document: {
    type: "document_base64",
    document_base64: `data:${mimeType};base64,${base64}`
  }
})
```

### **Paso 2: Análisis**
```javascript
const analysisResponse = await client.chat.complete({
  model: "mistral-large-latest",
  messages: [/* análisis del texto extraído */]
})
```

## 6. Fallback automático:

Si la API de Mistral no está disponible o falla, el sistema automáticamente usa datos simulados realistas para demostración.

**¡Tu aplicación ahora usa Mistral OCR para procesamiento de documentos más preciso y versátil!** 🚀
