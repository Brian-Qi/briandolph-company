import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  base: '/splash/',
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  },
  build: {
    outDir: resolve(root, '../public/splash'),
    emptyOutDir: true,
    lib: {
      entry: resolve(root, 'src/vendor.jsx'),
      name: 'BiyuVendor',
      formats: ['iife'],
      fileName: () => 'vendor.js'
    }
  }
})
