import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import circleDependency from 'vite-plugin-circular-dependency'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), circleDependency({
    outputFilePath: "./circleDep",
  }),],
  base: "/dist/",
})