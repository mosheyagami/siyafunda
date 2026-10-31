import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

const phoneMode = globalThis.process?.env?.VITE_PHONE === 'true'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), ...(phoneMode ? [basicSsl()] : [])],
  server: {
    host: true,
  },
})
