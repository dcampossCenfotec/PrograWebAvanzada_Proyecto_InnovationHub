import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        // Bootstrap 5.3 todavía usa APIs Sass obsoletas. Se conserva el aviso
        // del @import propio sin repetir cientos de avisos de node_modules.
        quietDeps: true,
      },
    },
  },
  plugins: [react()],
})
