/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable static optimization where possible
  staticPageGenerationTimeout: 120,
  // Configure images for local storage and Cloudinary
  images: {
    domains: ['res.cloudinary.com', '103.14.120.163'],
    unoptimized: true,
  },
  // Customize the build output
  output: 'standalone',
  // Configure rewrites for API routes
  async rewrites() {
    return [
      // Static routes
      {
        source: '/static/:path*',
        destination: '/:path*',
      },
      // Assets routes for local storage
      {
        source: '/assets/:path*',
        destination: '/assets/:path*',
      },
      // Dynamic API routes
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },
  // Configure headers for API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ]
      }
    ]
  }
}
