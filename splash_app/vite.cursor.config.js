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
    emptyOutDir: false,
    lib: {
      entry: resolve(root, 'src/boot-cursor.jsx'),
      name: 'BiyuCursor',
      formats: ['iife'],
      fileName: () => 'cursor.js'
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'BiyuReact',
          'react-dom': 'BiyuReactDOM',
          'react-dom/client': 'BiyuReactDOMClient',
          'react/jsx-runtime': 'BiyuJSXRuntime'
        }
      }
    }
  }
})
