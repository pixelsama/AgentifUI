import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

/**
 * Next.js Configuration
 * @description Configure Next.js with traditional webpack to avoid Turbopack font loading issues
 * Integrate next-intl plugin
 */

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  /* config options here */

  // Automatically remove console.log in production
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'], // Keep console.error and console.warn
          }
        : false,
  },

  // Ignore ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Ignore TypeScript errors during build (optional)
  typescript: {
    ignoreBuildErrors: false, // Set to true to ignore TS errors as well
  },

  // Webpack configuration: Fix Supabase Realtime WebSocket issues
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Server-side: Ensure WebSocket dependencies load correctly
      config.externals = config.externals || [];
      config.externals.push({
        bufferutil: 'bufferutil',
        'utf-8-validate': 'utf-8-validate',
      });
    }

    // Ignore Supabase Realtime dynamic import warnings
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /node_modules\/@supabase\/realtime-js/,
        message:
          /Critical dependency: the request of a dependency is an expression/,
      },
    ];

    return config;
  },

  // Use traditional webpack for proper font loading
};

export default withNextIntl(nextConfig);
