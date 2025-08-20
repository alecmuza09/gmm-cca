# 🔧 Configuración de Variables de Entorno

## Crear archivo `.env.local` en la raíz del proyecto

Crea un archivo llamado `.env.local` en la carpeta raíz del proyecto con el siguiente contenido:

```env
# ConvertAPI Token para conversión PDF → JPG
CONVERTAPI_TOKEN=sD0PkFkhwXCxH6shcMqTNWA8BT7UrBVb

# Mistral API Token para OCR
MISTRAL_API_KEY=kYxsbe1T6FFD1ASinsik3KXLHfXw9PGp

# Database
DATABASE_URL="file:./dev.db"
```

## 📋 Pasos para Configurar:

1. **Crear el archivo**:
   ```bash
   touch .env.local
   ```

2. **Agregar el contenido** copiando las variables de arriba

3. **Reiniciar el servidor**:
   ```bash
   npm run dev
   ```

## ✅ Verificación

Una vez configurado, verás en los logs:
- `Converting PDF to image using ConvertAPI...`
- `Convirtiendo PDF a JPG usando ConvertAPI...`
- `PDF convertido a JPG exitosamente`

En lugar de:
- `CONVERTAPI_TOKEN no configurado, usando conversión local...`

## 🎯 Beneficios con ConvertAPI Configurado:

- ✅ **Conversión real PDF → JPG** de alta calidad
- ✅ **OCR preciso** con Mistral Vision
- ✅ **Datos reales** extraídos de tus documentos
- ✅ **1500 conversiones gratuitas** por mes

¡Tu sistema estará completamente funcional para leer datos reales de PDFs! 🚀
