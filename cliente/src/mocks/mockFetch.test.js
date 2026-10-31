import { describe, expect, it } from 'vitest'
import { createMockFetch } from './mockFetch.js'

const ownerToken = 'mock-owner-token'
const applicantToken = 'mock-applicant-token'
const restrictedId = '10000000-0000-4000-8000-000000000003'
const privateId = '10000000-0000-4000-8000-000000000006'

function authorization(token) {
  return { Authorization: `Bearer ${token}` }
}

describe('createMockFetch', () => {
  it('lee los catálogos compartidos sin duplicar fixtures', async () => {
    const response = await createMockFetch({ delayMs: 0 })(
      'http://localhost:3000/api/categories',
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.data).toHaveLength(8)
    expect(payload.data[0]).toEqual({ id: 'technology', name: 'Tecnología' })
  })

  it('pagina competencias y devuelve vacío cuando no hay coincidencias', async () => {
    const mockFetch = createMockFetch({ delayMs: 0 })
    const response = await mockFetch(
      'http://localhost:3000/api/skills?q=sin-coincidencias&page=1&size=5',
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.data).toEqual([])
    expect(payload.pagination).toMatchObject({ page: 1, size: 5, total: 0, totalPages: 0 })
  })

  it('rechaza búsquedas de una letra con el formato de error común', async () => {
    const response = await createMockFetch({ delayMs: 0 })(
      'http://localhost:3000/api/skills?q=x',
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'INVALID_QUERY', fields: { q: expect.any(String) } },
    })
  })

  it('proyecta solo iniciativas públicas para una visita anónima', async () => {
    const response = await createMockFetch({ delayMs: 0 })(
      'http://localhost:3000/api/initiatives',
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.data).toHaveLength(3)
    expect(payload.data.every((item) => item.visibility === 'public')).toBe(true)
    expect(payload.data[0].availableSpaces).toBeGreaterThanOrEqual(0)
  })

  it('aplica 403 a restringidas y 404 a privadas para otro usuario', async () => {
    const mockFetch = createMockFetch({ delayMs: 0 })
    const restricted = await mockFetch(
      `http://localhost:3000/api/initiatives/${restrictedId}`,
      { headers: authorization(applicantToken) },
    )
    const privateResponse = await mockFetch(
      `http://localhost:3000/api/initiatives/${privateId}`,
      { headers: authorization(applicantToken) },
    )

    expect(restricted.status).toBe(403)
    expect(privateResponse.status).toBe(404)
  })

  it('omite datos internos y detalles de una restringida en los listados', async () => {
    const response = await createMockFetch({ delayMs: 0 })(
      'http://localhost:3000/api/initiatives',
      { headers: authorization(applicantToken) },
    )
    const payload = await response.json()
    const restricted = payload.data.find((item) => item.id === restrictedId)

    expect(restricted).toBeDefined()
    expect(restricted).not.toHaveProperty('ownerId')
    expect(restricted).not.toHaveProperty('categoryId')
    expect(restricted).not.toHaveProperty('description')
    expect(restricted).not.toHaveProperty('owner')
  })

  it('permite al propietario consultar sus iniciativas no públicas', async () => {
    const response = await createMockFetch({ delayMs: 0 })(
      `http://localhost:3000/api/initiatives/${privateId}`,
      { headers: authorization(ownerToken) },
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      data: { id: privateId, access: { canEdit: true } },
    })
  })

  it('protege el directorio y rechaza credenciales sintéticas desconocidas', async () => {
    const mockFetch = createMockFetch({ delayMs: 0 })
    const anonymous = await mockFetch('http://localhost:3000/api/users')
    const invalid = await mockFetch('http://localhost:3000/api/users', {
      headers: authorization('unknown-token'),
    })

    expect(anonymous.status).toBe(401)
    expect(invalid.status).toBe(401)
    await expect(invalid.json()).resolves.toMatchObject({
      error: { code: 'INVALID_CREDENTIALS' },
    })
  })

  it('distingue una sesión sintética expirada', async () => {
    const response = await createMockFetch({ delayMs: 0 })(
      'http://localhost:3000/api/auth/me',
      { headers: authorization('mock-expired-token') },
    )

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'SESSION_EXPIRED' },
    })
  })

  it('proyecta solicitudes y proyectos con los DTO públicos del contrato', async () => {
    const mockFetch = createMockFetch({ delayMs: 0 })
    const requestsResponse = await mockFetch(
      'http://localhost:3000/api/requests?scope=mine',
      { headers: authorization(applicantToken) },
    )
    const projectsResponse = await mockFetch('http://localhost:3000/api/projects')
    const requestsPayload = await requestsResponse.json()
    const projectsPayload = await projectsResponse.json()

    expect(requestsPayload.data[0]).toMatchObject({
      initiative: { id: expect.any(String), title: expect.any(String) },
      applicant: { id: expect.any(String) },
      offeredSkill: { id: expect.any(String), name: expect.any(String) },
    })
    expect(requestsPayload.data[0]).not.toHaveProperty('initiativeId')
    expect(projectsPayload.data[0]).toMatchObject({
      sourceInitiative: { id: expect.any(String), title: expect.any(String) },
      owner: { id: expect.any(String) },
      memberCount: expect.any(Number),
    })
    expect(projectsPayload.data[0]).not.toHaveProperty('ownerId')
  })

  it('falla explícitamente las mutaciones que pertenecen a tareas posteriores', async () => {
    const response = await createMockFetch({ delayMs: 0 })(
      'http://localhost:3000/api/initiatives',
      { method: 'POST', headers: authorization(ownerToken) },
    )

    expect(response.status).toBe(501)
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'MOCK_NOT_IMPLEMENTED' },
    })
  })

  it('inicia, consulta y revoca una sesión de desarrollo', async () => {
    const mockFetch = createMockFetch({ delayMs: 0 })
    const login = await mockFetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'ana.owner@example.test',
        password: 'DemoSegura2026',
      }),
    })
    const loginPayload = await login.json()
    const token = loginPayload.data.accessToken
    const me = await mockFetch('http://localhost:3000/api/auth/me', {
      headers: authorization(token),
    })
    const logout = await mockFetch('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      headers: authorization(token),
    })
    const reused = await mockFetch('http://localhost:3000/api/auth/me', {
      headers: authorization(token),
    })

    expect(login.status).toBe(200)
    expect(me.status).toBe(200)
    expect(logout.status).toBe(204)
    expect(reused.status).toBe(401)
  })

  it('registra una cuenta y protege el correo normalizado contra duplicados', async () => {
    const mockFetch = createMockFetch({ delayMs: 0 })
    const body = {
      firstName: 'Daniel',
      lastName: 'Campos',
      memberType: 'student',
      email: 'Daniel@Example.test',
      password: 'ClaveSegura2026',
      passwordConfirmation: 'ClaveSegura2026',
      termsAccepted: true,
    }
    const created = await mockFetch('http://localhost:3000/api/auth/register', {
      method: 'POST', body: JSON.stringify(body),
    })
    const duplicate = await mockFetch('http://localhost:3000/api/auth/register', {
      method: 'POST', body: JSON.stringify({ ...body, email: ' DANIEL@example.TEST ' }),
    })

    expect(created.status).toBe(201)
    expect(created.headers.get('Location')).toMatch(/^\/api\/users\/[0-9a-f-]{36}$/)
    expect(duplicate.status).toBe(409)
    await expect(duplicate.json()).resolves.toMatchObject({
      error: { code: 'EMAIL_ALREADY_EXISTS', fields: { email: expect.any(String) } },
    })
  })

  it('respeta AbortSignal durante la latencia simulada', async () => {
    const controller = new AbortController()
    const promise = createMockFetch({ delayMs: 50 })(
      'http://localhost:3000/api/categories',
      { signal: controller.signal },
    )

    controller.abort(new DOMException('Vista desmontada.', 'AbortError'))

    await expect(promise).rejects.toMatchObject({ name: 'AbortError' })
  })
})
