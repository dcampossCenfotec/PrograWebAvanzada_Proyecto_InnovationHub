const allowedModes = new Set(['real', 'mock'])
const requestedMode = import.meta.env.VITE_API_MODE || 'real'

if (!allowedModes.has(requestedMode)) {
  throw new Error('VITE_API_MODE debe ser "real" o "mock".')
}

if (import.meta.env.PROD && requestedMode === 'mock') {
  throw new Error('El modo mock no está permitido en el build de producción.')
}

function normalizeBaseUrl(value) {
  const baseUrl = value.trim()
  if (!baseUrl) throw new Error('VITE_API_BASE_URL no puede estar vacía.')
  return baseUrl.replace(/\/+$/, '')
}

function parseTimeout(value) {
  if (!value) return 15000
  const timeout = Number(value)
  if (!Number.isInteger(timeout) || timeout < 100 || timeout > 60000) {
    throw new Error('VITE_API_TIMEOUT_MS debe ser un entero entre 100 y 60000.')
  }
  return timeout
}

const defaultBaseUrl = import.meta.env.DEV ? 'http://localhost:3000/api' : '/api'

export const apiConfig = Object.freeze({
  baseUrl: normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL || defaultBaseUrl),
  mode: requestedMode,
  timeoutMs: parseTimeout(import.meta.env.VITE_API_TIMEOUT_MS),
})
