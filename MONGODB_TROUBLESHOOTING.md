# 🔧 Solución de Problemas - MongoDB Atlas

## ❌ **Error Detectado**

El error indica que no se puede conectar a MongoDB Atlas:

```
Server selection timeout: No available servers
Kind: I/O error: received fatal alert: InternalError
```

## 🔍 **Posibles Causas y Soluciones**

### 1. **Configuración de Red (IP Whitelist)**

**Problema:** MongoDB Atlas puede tener restricciones de IP.

**Solución:**
1. Ve a [MongoDB Atlas Dashboard](https://cloud.mongodb.com)
2. Selecciona tu cluster
3. Ve a **Network Access**
4. Haz clic en **+ ADD IP ADDRESS**
5. Agrega `0.0.0.0/0` para permitir todas las IPs (solo para desarrollo)
6. O agrega la IP específica de Netlify

### 2. **Credenciales Expiradas**

**Problema:** La contraseña puede haber expirado.

**Solución:**
1. Ve a **Database Access**
2. Encuentra el usuario `alecmuza09`
3. Haz clic en **Edit**
4. Genera una nueva contraseña
5. Actualiza la variable `DATABASE_URL` en Netlify

### 3. **Cluster Pausado**

**Problema:** El cluster puede estar pausado para ahorrar recursos.

**Solución:**
1. Ve a tu cluster en MongoDB Atlas
2. Si está pausado, haz clic en **Resume**
3. Espera a que se active completamente

### 4. **Configuración de Prisma**

**Problema:** Prisma puede necesitar configuración adicional para MongoDB.

**Solución:**
1. Verifica que el esquema use `provider = "mongodb"`
2. Asegúrate de que los IDs sean `@db.ObjectId`
3. Ejecuta `npx prisma generate` después de cambios

## 🚀 **Pasos para Verificar**

### 1. **Verificar Estado del Cluster**
```bash
# Ejecutar script de prueba
node scripts/test-mongodb.js
```

### 2. **Verificar Variables de Entorno**
En Netlify, asegúrate de que `DATABASE_URL` sea:
```
mongodb+srv://alecmuza09:s5sHo7g9fHvbDIZR@gmm-cca.0voskrv.mongodb.net/gmm-cca?retryWrites=true&w=majority&appName=GMM-CCA
```

### 3. **Probar Conexión Directa**
Puedes probar la conexión usando MongoDB Compass o el shell de MongoDB.

## 🔧 **Configuración Alternativa**

Si el problema persiste, considera:

### **Opción 1: Crear Nuevo Usuario**
1. Ve a **Database Access**
2. Crea un nuevo usuario con permisos de lectura/escritura
3. Actualiza la URL de conexión

### **Opción 2: Usar Otra Base de Datos**
- **PlanetScale** (MySQL)
- **Supabase** (PostgreSQL)
- **Railway** (MySQL/PostgreSQL)

## 📞 **Soporte**

Si necesitas ayuda:
1. Revisa los logs de Netlify
2. Verifica el estado de MongoDB Atlas
3. Prueba la conexión localmente
4. Contacta soporte de MongoDB Atlas

## ✅ **Verificación Final**

Una vez solucionado:
1. Los usuarios se crearán automáticamente
2. Podrás hacer login sin problemas
3. La aplicación será completamente funcional
