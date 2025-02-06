import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import circleDependency from 'vite-plugin-circular-dependency'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), nodePolyfills({
    include: ['path', 'fs', 'os', 'crypto', 'buffer'],
    overrides: {
      'crypto': 'bare-crypto'
    },
    globals: {
      Buffer: true,
      global: true,
      process: true,
    },
  }),
  circleDependency({
    outputFilePath: "./circleDep",
  })
  ],
  base: "/dist/",
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext'
    },
    include: ["random-access-file", "protocol-buffers-encodings"],
    exclude: ['sodium-universal', 'sodium-native', 'sodium']
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    },
    rollupOptions: {
      logLevel: "debug",
      external: ['sodium-universal', 'sodium-native', 'sodium', 'udx-native', "random-access-file", "protocol-buffers-encodings", "varint", "signed-varint", "b4a"]
    },

  },
  resolve: {
    alias: {
      'sodium-universal': 'sodium-plus',
      'sodium-native': 'sodium-plus',
      'sodium': 'sodium-plus',
    }
  }
})