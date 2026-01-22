/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Handle Node.js polyfills for Aleo SDK
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      path: false,
      os: false,
      stream: false,
      buffer: false,
    };

    // Enable WebAssembly support for Aleo SDK
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Exclude problematic modules from client bundle
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'node:crypto': false,
        'node:fs': false,
        'node:path': false,
      };
    }

    // Handle .wasm files
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });

    // Exclude aleo-wasm-web from server-side bundling (browser-only)
    if (isServer) {
      config.externals = [
        ...config.externals,
        '@puzzlehq/aleo-wasm-web',
        '@puzzlehq/aleo-wasm-web/testnet.js',
      ];
    }

    return config;
  },
  // Don't transpile WASM packages
  transpilePackages: [],
};

module.exports = nextConfig;
