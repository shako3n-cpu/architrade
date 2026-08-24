import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Lets us import with "@/components/..." instead of "../../components/..."
      '@': path.resolve(__dirname, './src'),
    },
  },
})
