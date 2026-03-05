import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3000, // Forces Vite to run on port 3000
    strictPort: true, // If 3000 is busy, it won't automatically switch to 3001
  }
})