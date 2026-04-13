import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const apiUrl = process.env.VITE_API_URL || 'http://localhost:8001';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: apiUrl,
        changeOrigin: true,
      },
      '/ws': {
        target: apiUrl.replace('http', 'ws'),
        ws: true,
      },
    },
    historyApiFallback: true,
  },
})
