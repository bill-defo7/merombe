import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      // tout ce qui commence par /api part vers le back-end
      '/api': {
        //target: 'http://localhost:8080',
        target: 'http://192.168.1.221:8080',

        changeOrigin: true,
      },
    },
  },
})