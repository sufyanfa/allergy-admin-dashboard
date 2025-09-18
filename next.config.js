/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable linting during build for production deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable type checking during build (for quick deployment)
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
      {
        protocol: 'https',
        hostname: '*.vercel.app',
      },
    ],
  },
}

module.exports = nextConfig