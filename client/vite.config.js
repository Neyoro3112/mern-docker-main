import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { // Añadir esta sección
    proxy: {
      '/api': {
        // Reemplaza con la URL de tu servicio backend en Minikube
        target: 'http://backend-service:4000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})