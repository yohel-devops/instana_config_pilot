import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.yaml', '**/*.yml'],
  server: {
    port: 3000,
  },
})

// Made with Bob
