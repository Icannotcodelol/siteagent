/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint during `next build` to prevent builds from failing on lint errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
    turbo: {
      resolveAlias: {
        canvas: './empty-module.js',
      },
    },
  },
  
  // Compression and optimization
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Bundle optimization
  webpack: (config, { dev, isServer }) => {
    // Reduce bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          analytics: {
            test: /[\\/]node_modules[\\/](posthog-js|@posthog)[\\/]/,
            name: 'analytics',
            chunks: 'async',
            priority: 10,
          },
        },
      };
      
      // Tree shaking optimization
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }
    
    return config;
  },
  
  // Headers for performance
  async headers() {
    return [
      // Allow the chatbot embed pages to be framed by external sites
      {
        source: '/embed/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          // Use Content-Security-Policy instead of X-Frame-Options for finer control
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *",
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
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
