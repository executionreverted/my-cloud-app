import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import circleDependency from 'vite-plugin-circular-dependency'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), nodePolyfills({
    include: ['path', 'fs', 'os', 'crypto', 'buffer'],
    overrides: {
      'crypto': 'bare-crypto',
      'fs': 'memfs'
    },
    globals: {
      global: true,
      process: true,
      Buffer: true,
    },
  }),
  circleDependency({
    outputFilePath: "./circleDep",
  })
  ],
  base: "/dist/",
  optimizeDeps: {
    esbuildOptions: {
      target: 'node20',
      define: {
        global: 'globalThis'
      },
      // Enable esbuild polyfill plugins
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
        })
      ]
    },
    include: ["random-access-file", "protocol-buffers-encodings", "fs"],
    exclude: ['sodium-universal', 'sodium-native', 'sodium']
  },
  build: {
    target: 'node20',
    commonjsOptions: {
      transformMixedEsModules: true
    },
    rollupOptions: {
      logLevel: "debug",
      external: ['sodium-universal', 'sodium-native', 'sodium', 'udx-native', "random-access-file", "hyperdht"]
    },
  },
  resolve: {
    alias: {
      'sodium-universal': 'sodium-plus',
      'sodium-native': 'sodium-plus',
      'sodium': 'sodium-plus',
    }
  },
  publicDir: "./src/assets",
})