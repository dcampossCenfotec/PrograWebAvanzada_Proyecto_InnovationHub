import { apiConfig } from './config.js'
import { createHttpClient } from './http.js'
import { getAccessToken, notifyUnauthorized } from './session.js'

let mockFetchPromise

async function applicationFetch(input, init) {
  if (!import.meta.env.DEV || apiConfig.mode === 'real') {
    return globalThis.fetch(input, init)
  }
  mockFetchPromise ??= import('../mocks/mockFetch.js').then(({ createMockFetch }) =>
    createMockFetch(),
  )
  const mockFetch = await mockFetchPromise
  return mockFetch(input, init)
}

export const apiClient = createHttpClient({
  baseUrl: apiConfig.baseUrl,
  fetchImpl: applicationFetch,
  getAccessToken,
  onUnauthorized: notifyUnauthorized,
  timeoutMs: apiConfig.timeoutMs,
})
