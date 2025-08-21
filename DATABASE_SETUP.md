# 🗄️ Configuración de Base de Datos - MongoDB Atlas

## 📋 **Configuración Local**

### 1. **Crear archivo `.env.local`**

Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

```env
# MongoDB Atlas
DATABASE_URL="mongodb+srv://alecmuza09:s5sHo7g9fHvbDIZR@gmm-cca.0voskrv.mongodb.net/gmm-cca?retryWrites=true&w=majority&appName=GMM-CCA"

# Mistral AI para OCR
MISTRAL_API_KEY="tu_mistral_api_key_aqui"

# ConvertAPI para conversión de PDF
CONVERTAPI_SECRET="tu_convertapi_secret_aqui"
```

### 2. **Instalar dependencias**

```bash
npm install
```

### 3. **Generar cliente Prisma**

```bash
npx prisma generate
```

### 4. **Probar conexión**

```bash
node scripts/test-mongodb.js
```

## 🌐 **Configuración en Netlify**

### 1. **Variables de Entorno**

Ve al dashboard de Netlify y configura las siguientes variables de entorno:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | `mongodb+srv://alecmuza09:s5sHo7g9fHvbDIZR@gmm-cca.0voskrv.mongodb.net/gmm-cca?retryWrites=true&w=majority&appName=GMM-CCA` |
| `MISTRAL_API_KEY` | Tu clave de API de Mistral |
| `CONVERTAPI_SECRET` | Tu clave secreta de ConvertAPI |

### 2. **Configuración de Red en MongoDB Atlas**

1. Ve a [MongoDB Atlas Dashboard](https://cloud.mongodb.com)
2. Selecciona tu cluster
3. Ve a **Network Access**
4. Haz clic en **+ ADD IP ADDRESS**
5. Agrega `0.0.0.0/0` para permitir todas las IPs

### 3. **Verificar Usuario de Base de Datos**

1. Ve a **Database Access**
2. Verifica que el usuario `alecmuza09` tenga permisos de lectura/escritura
3. Si es necesario, genera una nueva contraseña

## 🚀 **Despliegue**

Una vez configuradas las variables de entorno en Netlify:

1. **Netlify detectará automáticamente** los cambios en GitHub
2. **Iniciará un nuevo despliegue**
3. **Los usuarios se crearán automáticamente** en la primera ejecución

## 👥 **Usuarios por Defecto**

La aplicación creará automáticamente los siguientes usuarios:

| Email | Contraseña | Rol |
|-------|------------|-----|
| `admin@gmm.com` | `admin123` | ADMIN |
| `asesor@consolida.mx` | `asesor123` | ASESOR |
| `operaciones@consolida.mx` | `operaciones123` | OPERACIONES |
| `medico@consolida.mx` | `medico123` | MEDICO |

## ✅ **Verificación**

Para verificar que todo funciona:

1. **Accede a tu aplicación** en Netlify
2. **Inicia sesión** con cualquiera de los usuarios por defecto
3. **Verifica que puedes navegar** por todas las secciones
4. **Prueba la funcionalidad OCR** subiendo un documento

## 🔧 **Solución de Problemas**

Si encuentras problemas:

1. **Revisa los logs** de Netlify
2. **Verifica las variables de entorno**
3. **Consulta el archivo** `MONGODB_TROUBLESHOOTING.md`
4. **Ejecuta el script de prueba** localmente: `node scripts/test-mongodb.js`
