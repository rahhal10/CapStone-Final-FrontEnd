import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward /estimate → FastAPI AI server (avoids browser CORS preflight)
      '/estimate': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})

