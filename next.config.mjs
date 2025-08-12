/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
<<<<<<< HEAD
      {
        source: '/api/videos/fetch-religious-reels',
        destination: '/api/videos/religious-reels',
      },
=======
>>>>>>> ba5531e9b34f056c52f9ae9afb3f554ffeef1182
    ];
  },
};

export default nextConfig;
