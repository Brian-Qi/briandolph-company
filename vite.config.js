import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: process.env.DEPLOY_BASE || '/',
  plugins: [vue()],
  server: {
    host: 'localhost',
    port: 5280,
    open: false
  }
})
