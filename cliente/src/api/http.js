import { ApiError } from './errors.js'

function appendQueryValue(searchParams, key, value) {
  if (value === undefined || value === null || value === '') return
  if (Array.isArray(value)) {
    value.forEach((item) => appendQueryValue(searchParams, key, item))
    return
  }
  searchParams.append(key, String(value))
}

export function buildQueryString(query = {}) {
  const searchParams = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    appendQueryValue(searchParams, key, value)
  })
  const value = searchParams.toString()
  return value ? `?${value}` : ''
}

function combineAbortSignals(externalSignal, timeoutMs) {
  const controller = new AbortController()
  const cleanupCallbacks = []

  function forwardAbort(signal) {
    if (!controller.signal.aborted) controller.abort(signal.reason)
  }

  if (externalSignal) {
    if (externalSignal.aborted) forwardAbort(externalSignal)
    else {
      const onAbort = () => forwardAbort(externalSignal)
      externalSignal.addEventListener('abort', onAbort, { once: true })
      cleanupCallbacks.push(() => externalSignal.removeEventListener('abort', onAbort))
    }
  }

  const timeoutId = setTimeout(() => {
    controller.abort(new DOMException('La solicitud excedió el tiempo permitido.', 'TimeoutError'))
  }, timeoutMs)
  cleanupCallbacks.push(() => clearTimeout(timeoutId))

  return {
    signal: controller.signal,
    cleanup() {
      cleanupCallbacks.forEach((callback) => callback())
    },
  }
}

async function readPayload(response) {
  if (response.status === 204) return null
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch (cause) {
    throw new ApiError('La API devolvió una respuesta JSON inválida.', {
      status: response.status,
      code: 'INVALID_RESPONSE',
      cause,
    })
  }
}

function createResponseError(response, payload) {
  const error = payload?.error
  return new ApiError(error?.message || 'No fue posible completar la solicitud.', {
    status: response.status,
    code: error?.code || `HTTP_${response.status}`,
    fields: error?.fields && typeof error.fields === 'object' ? error.fields : {},
  })
}

export function createHttpClient({
  baseUrl,
  fetchImpl = globalThis.fetch,
  getAccessToken = () => null,
  onUnauthorized = () => {},
  timeoutMs = 15000,
}) {
  if (!baseUrl) throw new Error('El cliente HTTP requiere baseUrl.')
  if (typeof fetchImpl !== 'function') throw new Error('El cliente HTTP requiere fetch.')

  async function request(path, options = {}) {
    const {
      method = 'GET',
      query,
      body,
      headers: customHeaders,
      signal: externalSignal,
    } = options
    const headers = new Headers(customHeaders)
    headers.set('Accept', 'application/json')

    const accessToken = getAccessToken()
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)

    let serializedBody
    if (body !== undefined) {
      headers.set('Content-Type', 'application/json')
      serializedBody = JSON.stringify(body)
    }

    const combined = combineAbortSignals(externalSignal, timeoutMs)
    try {
      const response = await fetchImpl(
        `${baseUrl}${path}${buildQueryString(query)}`,
        {
          method,
          headers,
          body: serializedBody,
          signal: combined.signal,
        },
      )
      const payload = await readPayload(response)
      if (!response.ok) {
        if (response.status === 401) onUnauthorized()
        throw createResponseError(response, payload)
      }
      return payload
    } catch (error) {
      if (error instanceof ApiError) throw error
      if (combined.signal.aborted) {
        const reason = combined.signal.reason
        if (reason?.name === 'TimeoutError') {
          throw new ApiError('La API tardó demasiado en responder.', {
            code: 'REQUEST_TIMEOUT',
            cause: reason,
          })
        }
        throw reason || new DOMException('Solicitud cancelada.', 'AbortError')
      }
      throw new ApiError('No fue posible conectar con la API.', {
        code: 'NETWORK_ERROR',
        cause: error,
      })
    } finally {
      combined.cleanup()
    }
  }

  return {
    request,
    get: (path, options) => request(path, { ...options, method: 'GET' }),
    post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
    put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
    delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
  }
}
