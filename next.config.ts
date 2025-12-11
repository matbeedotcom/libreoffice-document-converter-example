import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Note: @matbee/libreoffice-converter is NOT in transpilePackages
  // because it needs to be external for server-side API routes (uses dynamic requires)
  // Turbopack needs root set to parent directory to follow symlinks to linked packages
  turbopack: {
    root: path.join(__dirname, '..'),
    resolveAlias: {
      // Force ESM versions to avoid .d.cts conflicts
      '@matbee/libreoffice-converter': './node_modules/@matbee/libreoffice-converter/dist/index.js',
      '@matbee/libreoffice-converter/browser': './node_modules/@matbee/libreoffice-converter/dist/browser.js',
      '@matbee/libreoffice-converter/server': './node_modules/@matbee/libreoffice-converter/dist/server.js',
      '@matbee/libreoffice-converter/types': './node_modules/@matbee/libreoffice-converter/dist/types-entry.js',
    },
    resolveExtensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "onnxruntime-node": false,
      };
    } else {
      // Externalize the converter for server-side to avoid bundling dynamic requires
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('@matbee/libreoffice-converter');
      }
    }
    return config;
  },
  // Experimental: use server external packages for API routes
  serverExternalPackages: ['@matbee/libreoffice-converter', 'sharp'],
  // Required headers for SharedArrayBuffer (WASM threading)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        ],
      },
      {
        source: '/wasm/soffice.wasm',
        headers: [
          { key: 'Content-Encoding', value: 'gzip' },
          { key: 'Content-Type', value: 'application/wasm' },
          { key: 'Cache-Control', value: 'no-transform' },
        ],
      },
      {
        source: '/wasm/soffice.data',
        headers: [
          { key: 'Content-Encoding', value: 'gzip' },
          { key: 'Content-Type', value: 'application/octet-stream' },
          { key: 'Cache-Control', value: 'no-transform' },
        ],
      },
    ];
  },
};

export default nextConfig;
