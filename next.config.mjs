/** @type {import('next').NextConfig} */
const nextConfig = {
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
