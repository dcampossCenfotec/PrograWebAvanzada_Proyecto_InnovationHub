import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

const clientRoot = fileURLToPath(new URL('.', import.meta.url))
const repositoryRoot = fileURLToPath(new URL('..', import.meta.url))
const fixturesRoot = fileURLToPath(new URL('../pruebas/fixtures', import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const environment = loadEnv(mode, clientRoot, '')

  if (command === 'build' && environment.VITE_API_MODE === 'mock') {
    throw new Error('VITE_API_MODE=mock no está permitido en builds de producción.')
  }

  return {
    resolve: {
      alias: {
        '@fixtures': fixturesRoot,
      },
    },
    server: {
      fs: {
        allow: [repositoryRoot],
      },
    },
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
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.js',
      clearMocks: true,
    },
  }
})
