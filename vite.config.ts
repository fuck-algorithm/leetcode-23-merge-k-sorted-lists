import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/leetcode-23-merge-k-sorted-lists/',
  server: {
    port: 62066,
    host: true
  },
  build: {
    outDir: 'dist'
  }
})
