/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  api: {
    bodyParser: false,
  },

  images: {
    domains: ['localhost', 'backend'],
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend:8081/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;