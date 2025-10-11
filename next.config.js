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
    ],
    // Use default loader for Cloudflare Pages compatibility
    unoptimized: true,
  },
  // Disable server actions for Cloudflare Pages compatibility
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig