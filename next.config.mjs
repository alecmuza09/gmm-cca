/** @type {import('next').NextConfig} */
const nextConfig = {
  // Deshabilitar verificación de tipos durante build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Deshabilitar ESLint durante build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Configuración de imágenes
  images: {
    unoptimized: true
  },
  
  // Configuración para páginas dinámicas
  experimental: {
    missingSuspenseWithCSRBailout: false,
  }
}

export default nextConfig
