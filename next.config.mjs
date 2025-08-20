/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Configure image optimization
  images: {
    domains: ['res.cloudinary.com', 'storage.googleapis.com'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Enable static exports for pages that don't require server-side rendering
  output: 'standalone',

  // Configure webpack for optimizations
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs' module on the client to prevent this error on build --> Error: Can't resolve 'fs'
      config.resolve.fallback = {
        fs: false,
        stream: false,
        crypto: false,
        os: false,
        path: false,
      };
    }
    return config;
  },

  // Configure page extensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js', 'mjs'],

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
      {
        source: '/api/videos/fetch-religious-reels',
        destination: '/api/videos/religious-reels',
      },
    ];
  },
};

export default nextConfig;
