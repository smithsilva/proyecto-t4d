import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'

const keyPath = './certs/localhost.key'
const certPath = './certs/localhost.crt'

// Solo usa HTTPS local si los certificados existen (en Netlify no existen)
const https =
  fs.existsSync(keyPath) && fs.existsSync(certPath)
    ? {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      }
    : undefined

export default defineConfig({
  plugins: [react()],
  server: {
    https,
  },
})