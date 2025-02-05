import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import circleDependency from 'vite-plugin-circular-dependency'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), nodePolyfills(), circleDependency({
    outputFilePath: "./circleDep",
  }),],
  base: "/dist/",
  optimizeDeps: {
    include: ['corestore', 'hyperbee'], // Kullandığınız node modüllerini buraya ekleyin
    esbuildOptions: {
      target: 'esnext'
    }
  },
  resolve: {
    alias: {
      // Node.js core modüllerinin polyfill'lerini ekleyin
      stream: 'stream-browserify',
      path: 'path-browserify',
      crypto: 'crypto-browserify',
      fs: 'browserify-fs',
      // Diğer gerekli node modülleri için polyfill'ler...
    }
  }
})