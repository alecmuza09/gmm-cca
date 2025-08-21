# 🗄️ Configuración de Base de Datos MySQL

## 📋 Opciones de Base de Datos

### 1. **PlanetScale (Recomendado - Gratuito)**
- Base de datos MySQL en la nube
- Plan gratuito con 1GB de almacenamiento
- Compatible con Netlify
- Configuración automática

### 2. **Railway (Alternativa - Gratuito)**
- Base de datos MySQL/PostgreSQL
- Plan gratuito disponible
- Fácil configuración

### 3. **Supabase (Alternativa - Gratuito)**
- Base de datos PostgreSQL
- Plan gratuito generoso
- Interfaz web completa

## 🚀 Configuración con PlanetScale

### Paso 1: Crear cuenta en PlanetScale
1. Ve a [planetscale.com](https://planetscale.com)
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto

### Paso 2: Crear base de datos
1. En tu proyecto, crea una nueva base de datos
2. Selecciona la región más cercana
3. Copia la URL de conexión

### Paso 3: Configurar variables de entorno

**En Netlify:**
```env
DATABASE_URL=mysql://username:password@host:port/database
MISTRAL_API_KEY=tu_api_key_de_mistral
CONVERTAPI_SECRET=tu_secret_de_convertapi
```

**Para desarrollo local (.env.local):**
```env
DATABASE_URL=mysql://username:password@host:port/database
MISTRAL_API_KEY=tu_api_key_de_mistral
CONVERTAPI_SECRET=tu_secret_de_convertapi
```

### Paso 4: Ejecutar migraciones
```bash
# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma db push

# Verificar conexión
npx prisma studio
```

## 🔧 Configuración Manual

### Si prefieres otra base de datos:

1. **Crear base de datos MySQL**
2. **Configurar variables de entorno**
3. **Ejecutar migraciones**
4. **Inicializar usuarios por defecto**

## 📝 Variables de Entorno Requeridas

```env
# Base de datos MySQL
DATABASE_URL=mysql://username:password@host:port/database

# APIs externas
MISTRAL_API_KEY=tu_api_key_de_mistral
CONVERTAPI_SECRET=tu_secret_de_convertapi
```

## 🎯 Pasos para Configurar

1. **Elige una base de datos** (PlanetScale recomendado)
2. **Crea la base de datos** y obtén la URL de conexión
3. **Configura las variables de entorno** en Netlify
4. **Ejecuta las migraciones** para crear las tablas
5. **Inicializa los usuarios** por defecto

## ✅ Verificación

Una vez configurada:
- Los usuarios se crearán automáticamente
- Podrás hacer login con las credenciales por defecto
- Los datos persistirán entre deploys

## 🆘 Soporte

Si tienes problemas:
1. Verifica la URL de conexión
2. Asegúrate de que las variables estén configuradas
3. Revisa los logs de Netlify
4. Ejecuta las migraciones manualmente si es necesario
