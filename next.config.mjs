/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add React strict mode to help catch issues during development
  reactStrictMode: true,
  
  // Suppress hydration warnings
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  
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
