import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: process.env.DEPLOY_BASE || '/',
  plugins: [vue()],
  esbuild: {
    jsx: 'automatic'
  },
  server: {
    host: 'localhost',
    port: 5280,
    open: false
  }
})
