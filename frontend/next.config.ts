import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/details/:productId',
        destination: '/details/[productId]',
      },
    ];
  },
};

export default nextConfig;