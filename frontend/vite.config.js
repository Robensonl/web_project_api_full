import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 30001,
    open: true,
  },
  base: '/web_project_around_auth/', 
})
