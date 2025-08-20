# ConvertAPI Setup

## Configuración de ConvertAPI para Conversión PDF → Imagen

### 1. Obtener API Token

1. Visita [ConvertAPI](https://www.convertapi.com/)
2. Regístrate o inicia sesión
3. Ve a tu dashboard y obtén tu **API Token**
4. ConvertAPI ofrece **1500 conversiones gratuitas** por mes

### 2. Configurar Variable de Entorno

Agrega tu token al archivo `.env.local`:

```env
CONVERTAPI_TOKEN=tu_api_token_aquí
```

### 3. Cómo Funciona

- **PDF → JPG**: ConvertAPI convierte PDFs a imágenes JPG de alta calidad
- **API REST**: Integración simple con fetch()
- **Base64 Response**: Respuesta directa en base64 o URL de descarga
- **Fallback**: Si no está configurado, usa el PDF original

### 4. Ejemplo de Uso

```bash
curl -X POST https://v2.convertapi.com/convert/pdf/to/jpg \
 -H "Authorization: Bearer tu_api_token" \
 -F "File=@/path/to/documento.pdf"
```

### 5. Beneficios

- ✅ **Sin dependencias del sistema**: No requiere poppler local
- ✅ **Alta calidad**: Conversión profesional de PDFs
- ✅ **Confiable**: Servicio cloud estable
- ✅ **Rápido**: Conversión en segundos
- ✅ **Gratis**: 1500 conversiones mensuales

### 6. Documentación

- [ConvertAPI Docs](https://www.convertapi.com/doc)
- [PDF to JPG API](https://v2.convertapi.com/info/openapi/pdf/to/jpg)
