import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ['@libreoffice-wasm/converter'],
  // Turbopack needs root set to parent directory to follow symlinks to linked packages
  turbopack: {
    root: path.join(__dirname, '..'),
    resolveAlias: {
      '@libreoffice-wasm/converter/browser': './node_modules/@libreoffice-wasm/converter/dist/browser.js',
      '@libreoffice-wasm/converter/server': './node_modules/@libreoffice-wasm/converter/dist/server.js',
    },
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
    ];
  },
};

export default nextConfig;
