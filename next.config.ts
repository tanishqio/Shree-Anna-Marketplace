import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // API rewrites for development - proxy API calls to Python backend
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8005';
    // Ensure the URL has a protocol for production
    const destination = apiUrl.startsWith('http') ? apiUrl : `https://${apiUrl}`;
    return [
      {
        source: '/api/v1/:path*',
        destination: `${destination}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
