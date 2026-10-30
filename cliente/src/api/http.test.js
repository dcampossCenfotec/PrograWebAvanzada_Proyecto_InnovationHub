import { describe, expect, it, vi } from 'vitest'
import { ApiError } from './errors.js'
import { buildQueryString, createHttpClient } from './http.js'

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('buildQueryString', () => {
  it('omite valores vacíos y repite arreglos sin modificar la entrada', () => {
    const query = { q: 'diseño web', skill: ['uno', 'dos'], page: 2, empty: '' }

    expect(buildQueryString(query)).toBe('?q=dise%C3%B1o+web&skill=uno&skill=dos&page=2')
    expect(query.skill).toEqual(['uno', 'dos'])
  })
})

describe('createHttpClient', () => {
  it.each([
    [200, { data: { id: 'one' } }],
    [201, { data: { id: 'created' } }],
  ])('devuelve el JSON de una respuesta %i', async (status, payload) => {
    const client = createHttpClient({
      baseUrl: 'http://localhost:3000/api',
      fetchImpl: vi.fn().mockResolvedValue(jsonResponse(payload, status)),
    })

    await expect(client.get('/resource')).resolves.toEqual(payload)
  })

  it('devuelve null para 204 sin intentar leer JSON', async () => {
    const client = createHttpClient({
      baseUrl: '/api',
      fetchImpl: vi.fn().mockResolvedValue(new Response(null, { status: 204 })),
    })

    await expect(client.delete('/resource')).resolves.toBeNull()
  })

  it('envía query, JSON y token Bearer con los encabezados esperados', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ data: {} }))
    const client = createHttpClient({
      baseUrl: 'http://localhost:3000/api',
      fetchImpl,
      getAccessToken: () => 'opaque-token',
    })

    await client.post('/resource', { title: 'Nueva' }, { query: { page: 1 } })

    const [url, options] = fetchImpl.mock.calls[0]
    expect(url).toBe('http://localhost:3000/api/resource?page=1')
    expect(options.method).toBe('POST')
    expect(options.body).toBe('{"title":"Nueva"}')
    expect(options.headers.get('Accept')).toBe('application/json')
    expect(options.headers.get('Content-Type')).toBe('application/json')
    expect(options.headers.get('Authorization')).toBe('Bearer opaque-token')
  })

  it.each([400, 401, 403, 404, 409, 500])(
    'normaliza los errores HTTP %i según el contrato',
    async (status) => {
      const client = createHttpClient({
        baseUrl: '/api',
        fetchImpl: vi.fn().mockResolvedValue(
          jsonResponse(
            {
              error: {
                code: `ERROR_${status}`,
                message: `Fallo ${status}`,
                fields: { field: 'inválido' },
              },
            },
            status,
          ),
        ),
      })

      await expect(client.get('/resource')).rejects.toMatchObject({
        name: 'ApiError',
        status,
        code: `ERROR_${status}`,
        message: `Fallo ${status}`,
        fields: { field: 'inválido' },
      })
    },
  )

  it('notifica una respuesta 401 una sola vez', async () => {
    const onUnauthorized = vi.fn()
    const client = createHttpClient({
      baseUrl: '/api',
      fetchImpl: vi.fn().mockResolvedValue(
        jsonResponse({ error: { code: 'SESSION_EXPIRED', message: 'Expiró.', fields: {} } }, 401),
      ),
      onUnauthorized,
    })

    await expect(client.get('/protected')).rejects.toBeInstanceOf(ApiError)
    expect(onUnauthorized).toHaveBeenCalledTimes(1)
  })

  it('distingue JSON inválido de un error de red', async () => {
    const invalidClient = createHttpClient({
      baseUrl: '/api',
      fetchImpl: vi.fn().mockResolvedValue(new Response('<html>', { status: 200 })),
    })
    const networkClient = createHttpClient({
      baseUrl: '/api',
      fetchImpl: vi.fn().mockRejectedValue(new TypeError('connection refused')),
    })

    await expect(invalidClient.get('/resource')).rejects.toMatchObject({
      code: 'INVALID_RESPONSE',
      status: 200,
    })
    await expect(networkClient.get('/resource')).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
      status: 0,
    })
  })

  it('cancela por timeout y lo informa con un código estable', async () => {
    const fetchImpl = vi.fn((_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason), { once: true })
    }))
    const client = createHttpClient({ baseUrl: '/api', fetchImpl, timeoutMs: 5 })

    await expect(client.get('/slow')).rejects.toMatchObject({ code: 'REQUEST_TIMEOUT' })
  })

  it('conserva AbortError cuando quien llama cancela la solicitud', async () => {
    const fetchImpl = vi.fn((_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason), { once: true })
    }))
    const client = createHttpClient({ baseUrl: '/api', fetchImpl })
    const controller = new AbortController()
    const promise = client.get('/resource', { signal: controller.signal })

    controller.abort(new DOMException('Cancelada por la vista.', 'AbortError'))

    await expect(promise).rejects.toMatchObject({ name: 'AbortError' })
  })
})
