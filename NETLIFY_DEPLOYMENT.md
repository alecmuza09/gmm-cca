# 🚀 Despliegue en Netlify - GMM Web App

## 📋 Configuración Requerida

### 1. Variables de Entorno en Netlify

Configura las siguientes variables de entorno en tu proyecto de Netlify:

```env
DATABASE_URL=file::memory:?connection_limit=1
MISTRAL_API_KEY=tu_api_key_de_mistral
CONVERTAPI_SECRET=tu_secret_de_convertapi
```

**Nota importante**: La aplicación usa una base de datos en memoria para Netlify, por lo que los datos se reinician en cada deploy.

### 2. Configuración del Build

El proyecto está configurado para funcionar con Netlify. Los archivos de configuración incluyen:

- `netlify.toml` - Configuración específica de Netlify
- `next.config.mjs` - Configuración optimizada para el build
- `.nvmrc` - Versión de Node.js (18)

### 3. Pasos para el Despliegue

1. **Conecta tu repositorio** a Netlify
2. **Configura las variables de entorno** en Netlify Dashboard
3. **El build se ejecutará automáticamente**

### 4. Configuración del Build en Netlify

- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: 18

### 5. Solución de Problemas Comunes

#### Error de Dependencias Nativas
- La aplicación usa `sqlite3` en lugar de `better-sqlite3` para compatibilidad
- Las dependencias nativas están configuradas como externas en webpack

#### Base de Datos en Memoria
- Los datos se reinician en cada deploy
- Usuarios por defecto se crean automáticamente:
  - **Admin**: admin@gmm.com / admin123
  - **Asesor**: asesor@consolida.mx / asesor123
  - **Operaciones**: operaciones@consolida.mx / operaciones123
  - **Médico**: medico@consolida.mx / medico123

#### Error de API Keys
- Asegúrate de configurar `MISTRAL_API_KEY` y `CONVERTAPI_SECRET`
- Las API keys son necesarias para el funcionamiento del OCR

### 6. Funcionalidades Disponibles

✅ **Sistema de autenticación**  
✅ **Gestión de usuarios**  
✅ **OCR con Mistral AI**  
✅ **Interfaz responsive**  
✅ **Tema oscuro/claro**  
✅ **Base de datos en memoria**  

### 7. Notas Importantes

- La aplicación requiere Node.js 18+
- Las API keys son obligatorias para el OCR
- La base de datos se reinicia en cada deploy (datos temporales)
- El build puede tomar varios minutos en la primera ejecución

### 8. Usuarios por Defecto

La aplicación crea automáticamente estos usuarios:

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@gmm.com | admin123 | ADMIN |
| asesor@consolida.mx | asesor123 | ASESOR |
| operaciones@consolida.mx | operaciones123 | OPERACIONES |
| medico@consolida.mx | medico123 | MEDICO |

### 9. Soporte

Si encuentras problemas:
1. Revisa los logs de build en Netlify
2. Verifica las variables de entorno
3. Confirma que el repositorio esté actualizado
4. Los datos se reinician en cada deploy
