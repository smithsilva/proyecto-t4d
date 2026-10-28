import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

const keyPath = './certs/localhost.key'
const certPath = './certs/localhost.crt'

// Solo usa HTTPS si los certificados existen (en tu PC sí, en Vercel no)
const tieneCertificados = fs.existsSync(keyPath) && fs.existsSync(certPath)

export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 5173,
    ...(tieneCertificados && {
      https: {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      },
    }),
  },
})