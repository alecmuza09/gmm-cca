# 🗄️ Configuración de Base de Datos MongoDB

## ✅ **Base de Datos Configurada**

Tu aplicación está configurada para usar **MongoDB Atlas** con la siguiente conexión:

```
mongodb+srv://alecmuza09:s5sHo7g9fHvbDIZR@gmm-cca.0voskrv.mongodb.net/?retryWrites=true&w=majority&appName=GMM-CCA
```

## 🚀 **Configuración en Netlify**

### Variables de Entorno Requeridas:

En el dashboard de Netlify, configura estas variables:

```env
DATABASE_URL=mongodb+srv://alecmuza09:s5sHo7g9fHvbDIZR@gmm-cca.0voskrv.mongodb.net/?retryWrites=true&w=majority&appName=GMM-CCA
MISTRAL_API_KEY=tu_api_key_de_mistral
CONVERTAPI_SECRET=tu_secret_de_convertapi
```

## 🔧 **Configuración Local**

Para desarrollo local, crea un archivo `.env.local` en la raíz del proyecto:

```env
DATABASE_URL="mongodb+srv://alecmuza09:s5sHo7g9fHvbDIZR@gmm-cca.0voskrv.mongodb.net/?retryWrites=true&w=majority&appName=GMM-CCA"
MISTRAL_API_KEY=tu_api_key_de_mistral
CONVERTAPI_SECRET=tu_secret_de_convertapi
```

## 📋 **Pasos para Activar**

### 1. Configurar Variables en Netlify
1. Ve al dashboard de tu proyecto en Netlify
2. Ve a **Site settings** > **Environment variables**
3. Agrega las variables de entorno listadas arriba

### 2. Ejecutar Migraciones (Opcional)
```bash
# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones (MongoDB no requiere migraciones tradicionales)
npx prisma db push

# Verificar conexión
npx prisma studio
```

### 3. Inicializar Usuarios
Una vez desplegado, los usuarios se crearán automáticamente al acceder a la aplicación.

## 🎯 **Ventajas de MongoDB**

✅ **Flexible** - Esquema dinámico  
✅ **Escalable** - Crece con tu aplicación  
✅ **Confiable** - MongoDB Atlas es muy estable  
✅ **Compatible** - Funciona perfectamente con Netlify  
✅ **Gratuito** - Plan gratuito generoso  

## 📝 **Credenciales por Defecto**

Una vez configurada, podrás usar estas credenciales:

| Usuario | Email | Contraseña | Rol |
|---------|-------|------------|-----|
| **Admin** | admin@gmm.com | admin123 | ADMIN |
| **Asesor** | asesor@consolida.mx | asesor123 | ASESOR |
| **Operaciones** | operaciones@consolida.mx | operaciones123 | OPERACIONES |
| **Médico** | medico@consolida.mx | medico123 | MEDICO |

## ✅ **Verificación**

Una vez configurada:
- Los usuarios se crearán automáticamente
- Podrás hacer login sin problemas
- Los datos persistirán entre deploys
- La aplicación será completamente funcional

## 🆘 **Soporte**

Si tienes problemas:
1. Verifica que las variables estén configuradas en Netlify
2. Asegúrate de que la URL de MongoDB sea correcta
3. Revisa los logs de Netlify
4. Verifica la conexión a MongoDB Atlas

## 🔐 **Seguridad**

- La contraseña de MongoDB está incluida en la URL
- Para mayor seguridad, considera usar variables de entorno separadas
- MongoDB Atlas tiene seguridad integrada
