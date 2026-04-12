
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.algonode.cloud',
      },
      {
        protocol: 'https',
        hostname: 'algonode.xyz',
      },
      {
        protocol: 'https',
        hostname: '**.algonode.xyz',
      },
      {
        protocol: 'https',
        hostname: '**.tinyman.org',
      },
      {
        protocol: 'https',
        hostname: 'tinyman.org',
      },
      {
        protocol: 'https',
        hostname: '**.pera.app',
      },
      {
        protocol: 'https',
        hostname: '**.perawallet.app',
      },
      {
        protocol: 'https',
        hostname: '**.ipfs.io',
      },
      {
        protocol: 'https',
        hostname: '**.cloudflare-ipfs.com',
      },
      {
        protocol: 'https',
        hostname: '**.dweb.link',
      },
      {
        protocol: 'https',
        hostname: 'arweave.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.arweave.net',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        url: require.resolve('url/'),
        zlib: require.resolve('browserify-zlib'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        process: require.resolve('process/browser'),
        buffer: require.resolve('buffer/'),
        path: require.resolve('path-browserify'),
        util: require.resolve('util/'),
      };
    }
    return config;
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
