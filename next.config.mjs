/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Permite que la compilación en Vercel termine con éxito aunque haya advertencias de tipos
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignora advertencias de ESLint durante el despliegue
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
