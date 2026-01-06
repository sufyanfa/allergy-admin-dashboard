/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Enable linting during build to maintain code quality
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Enable type checking during build to prevent runtime errors
    ignoreBuildErrors: false,
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
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig