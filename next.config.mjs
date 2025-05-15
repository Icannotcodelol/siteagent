/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint during `next build` to prevent builds from failing on lint errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  // You can add other Next.js configuration options below as needed
};

export default nextConfig;
