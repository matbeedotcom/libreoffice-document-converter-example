import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ['@matbee/libreoffice-converter'],
  // Turbopack needs root set to parent directory to follow symlinks to linked packages
  turbopack: {
    root: path.join(__dirname, '..'),
    resolveAlias: {
      '@matbee/libreoffice-converter/browser': './node_modules/@matbee/libreoffice-converter/dist/browser.js',
      '@matbee/libreoffice-converter/server': './node_modules/@matbee/libreoffice-converter/dist/server.js',
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "onnxruntime-node": false,
      };
    }
    return config;
  },
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
