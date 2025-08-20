# 🏥 GMM Web App - Sistema de Gestión de Seguros

Una aplicación web moderna para la gestión de seguros médicos, desarrollada con Next.js, TypeScript y Prisma.

## 🚀 Características Principales

### 👥 Sistema de Usuarios y Roles
- **Autenticación personalizada** con cookies
- **4 roles de usuario** con permisos específicos:
  - **ASESOR**: Gestión de solicitudes y emisiones
  - **OPERACIONES**: Revisión de documentos y validaciones
  - **MEDICO**: Evaluaciones médicas
  - **ADMIN**: Gestión completa del sistema

### 📄 Procesamiento OCR Inteligente
- **OCR con Mistral AI** (Pixtral-12b-2409) para extracción de datos
- **Soporte para PDF e imágenes** (JPG, PNG)
- **Reportes estructurados** con información detallada de documentos
- **Conversión automática** de PDF a imágenes para OCR

### 🎨 Interfaz Moderna
- **Diseño responsive** con soporte móvil
- **Tema oscuro/claro** con next-themes
- **Navegación basada en roles** dinámica
- **Componentes UI** modernos y accesibles

### 🔧 Funcionalidades Técnicas
- **Base de datos SQLite** con Prisma ORM
- **API RESTful** para todas las operaciones
- **Validación de archivos** y manejo de errores
- **Procesamiento asíncrono** con indicadores de progreso

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Base de Datos**: SQLite
- **OCR**: Mistral AI (Pixtral-12b-2409)
- **Conversión PDF**: ConvertAPI
- **Autenticación**: Cookies personalizadas
- **Temas**: next-themes

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta de Mistral AI (para OCR)
- Cuenta de ConvertAPI (para conversión PDF)

## ⚙️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/alecmuza09/gmm-cca.git
   cd gmm-cca
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   
   Editar `.env.local` con tus credenciales:
   ```env
   MISTRAL_API_KEY=tu_api_key_de_mistral
   CONVERTAPI_SECRET=tu_secret_de_convertapi
   DATABASE_URL="file:./dev.db"
   ```

4. **Configurar la base de datos**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

## 🔐 Configuración de Usuarios

### Usuario Administrador Inicial
El sistema incluye un usuario administrador por defecto:
- **Email**: admin@gmm.com
- **Contraseña**: admin123
- **Rol**: ADMIN

### Crear Nuevos Usuarios
1. Inicia sesión como ADMIN
2. Ve a la sección "Usuarios" en el menú
3. Usa el formulario para crear nuevos usuarios
4. Asigna roles según las necesidades

## 📁 Estructura del Proyecto

```
gmm-cca/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # Autenticación
│   │   ├── admin/         # Gestión de usuarios
│   │   └── ocr/           # Procesamiento OCR
│   ├── admin/             # Páginas de administración
│   ├── emisiones/         # Gestión de emisiones
│   ├── faltantes/         # Documentos faltantes
│   └── mis-emisiones/     # Emisiones del usuario
├── components/            # Componentes React
│   ├── ui/               # Componentes base
│   └── wizard-steps/     # Pasos del wizard
├── lib/                  # Utilidades y configuraciones
├── prisma/              # Esquema de base de datos
└── hooks/               # Custom hooks
```

## 🔧 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión

### Administración
- `GET /api/admin/users` - Listar usuarios
- `POST /api/admin/users` - Crear usuario

### OCR
- `POST /api/ocr/process` - Procesar documento OCR

## 🎯 Roles y Permisos

### ASESOR
- Crear y gestionar solicitudes
- Ver emisiones propias
- Subir documentos para OCR

### OPERACIONES
- Revisar documentos faltantes
- Validar información extraída
- Gestionar emisiones

### MEDICO
- Evaluaciones médicas
- Revisar historiales
- Aprobar/rechazar casos

### ADMIN
- Gestión completa de usuarios
- Acceso a todas las funcionalidades
- Configuración del sistema

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Despliega automáticamente

### Otros Proveedores
- **Netlify**: Compatible con Next.js
- **Railway**: Soporte para SQLite
- **Heroku**: Requiere configuración adicional

## 🐛 Solución de Problemas

### Error de Hidratación
Si encuentras errores de hidratación, verifica:
- Variables de entorno configuradas correctamente
- Base de datos inicializada
- Dependencias instaladas

### Error OCR 400
- Verifica que el archivo sea PDF, JPG o PNG
- Confirma que el tamaño sea menor a 10MB
- Revisa las credenciales de Mistral AI

### Problemas de Base de Datos
```bash
npx prisma db push --force-reset
npx prisma generate
```

## 📝 Licencia

Este proyecto es privado y de uso interno para GMM.

## 👥 Contribución

Para contribuir al proyecto:
1. Crea una rama para tu feature
2. Realiza tus cambios
3. Envía un pull request
4. Espera la revisión

## 📞 Soporte

Para soporte técnico, contacta al equipo de desarrollo.

---

**Desarrollado con ❤️ para GMM**
