/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint during `next build` to prevent builds from failing on lint errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/js/script.js',
        destination: 'https://datafa.st/js/script.js',
      },
      {
        source: '/api/events',
        destination: 'https://datafa.st/api/events',
      },
    ];
  },
  // You can add other Next.js configuration options below as needed
};

export default nextConfig;
