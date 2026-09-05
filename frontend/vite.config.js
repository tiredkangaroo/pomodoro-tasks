import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The Go API runs on :8080. Proxying keeps the browser on a single origin
// during development so the session cookie is sent without CORS friction.
const proxy = {
  '/api': {
    target: process.env.API_URL ?? 'http://localhost:8080',
    changeOrigin: true,
  },
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173, proxy },
  preview: { port: 4173, proxy },
})
