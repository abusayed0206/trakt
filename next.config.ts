import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wsrv.nl',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cfcdn.sayed.app',
        port: '',
        pathname: '/watch/**',
      },
    ],
  },
};

export default nextConfig;
