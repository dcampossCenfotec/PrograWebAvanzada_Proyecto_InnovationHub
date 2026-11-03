import { describe, expect, it } from 'vitest'
import catalogs from '@fixtures/catalogs.json'
import initiatives from '@fixtures/initiatives.json'
import memberships from '@fixtures/memberships.json'
import projects from '@fixtures/projects.json'
import requests from '@fixtures/requests.json'
import users from '@fixtures/users.json'
import { createMockFetch } from './mockFetch.js'

const fixtures = { catalogs, initiatives, memberships, projects, requests, users }
const ownerId = '11111111-1111-4111-8111-111111111111'
const restrictedId = '10000000-0000-4000-8000-000000000003'
const privateId = '10000000-0000-4000-8000-000000000006'
const options = (token) => ({ headers: { Authorization: `Bearer ${token}` } })

describe('contrato del catálogo mock', () => {
  it('combina texto sin tildes, categoría, competencia, tipo, estado, espacios y propietario', async () => {
    const fetch = createMockFetch({ delayMs: 0 })
    const response = await fetch(`http://localhost/api/initiatives?q=HUERTOS&type=idea&category=sustainability&skill=aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2&state=published&hasSpaces=true&ownerId=${ownerId}`)
    const body = await response.json()
    expect(response.status).toBe(200)
    expect(body.data.map(({ id }) => id)).toEqual(['10000000-0000-4000-8000-000000000001'])
    expect(body.pagination.total).toBe(1)
  })

  it('no revela etiquetas ni propietario ocultos a través de coincidencias', async () => {
    const custom = structuredClone(fixtures)
    custom.initiatives.find(({ id }) => id === restrictedId).tags = ['PalabraOcultaSoloEtiqueta']
    const fetch = createMockFetch({ fixtures: custom, delayMs: 0 })
    const hidden = await fetch('http://localhost/api/initiatives?q=PalabraOcultaSoloEtiqueta', options('mock-applicant-token'))
    expect((await hidden.json()).pagination.total).toBe(0)
    const ownerFilter = await fetch(`http://localhost/api/initiatives?ownerId=${ownerId}`, options('mock-applicant-token'))
    expect((await ownerFilter.json()).data.some(({ id }) => id === restrictedId)).toBe(false)
    const general = await fetch('http://localhost/api/initiatives', options('mock-applicant-token'))
    const row = (await general.json()).data.find(({ id }) => id === restrictedId)
    for (const key of ['owner', 'tags', 'description', 'createdAt', 'updatedAt']) expect(row).not.toHaveProperty(key)
  })

  it('mantiene total y orden estable al paginar y permite páginas vacías', async () => {
    const fetch = createMockFetch({ delayMs: 0 })
    const first = await (await fetch('http://localhost/api/initiatives?sort=title&order=asc&size=2&page=1')).json()
    const next = await (await fetch('http://localhost/api/initiatives?sort=title&order=asc&size=2&page=2')).json()
    const empty = await (await fetch('http://localhost/api/initiatives?sort=title&order=asc&size=2&page=9')).json()
    expect(first.pagination.total).toBe(3)
    expect(next.pagination.total).toBe(3)
    expect(new Set([...first.data, ...next.data].map(({ id }) => id)).size).toBe(3)
    expect(empty.data).toEqual([])
    expect(empty.pagination.total).toBe(3)
  })

  it('un miembro activo puede consultar una privada y las propias conservan estados ocultos', async () => {
    const custom = structuredClone(fixtures)
    custom.memberships.push({ id: 'member', initiativeId: privateId, userId: users[1].id, state: 'active' })
    const fetch = createMockFetch({ fixtures: custom, delayMs: 0 })
    const detail = await fetch(`http://localhost/api/initiatives/${privateId}`, options('mock-applicant-token'))
    expect(detail.status).toBe(200)
    const list = await (await fetch('http://localhost/api/initiatives', options('mock-applicant-token'))).json()
    expect(list.data.some(({ id }) => id === privateId)).toBe(true)
    const mine = await (await fetch('http://localhost/api/initiatives/mine?sort=state&order=asc', options('mock-owner-token'))).json()
    expect(mine.pagination.total).toBe(8)
    expect(mine.data.some(({ state }) => state === 'draft')).toBe(true)
    expect(mine.data.some(({ state }) => state === 'archived')).toBe(true)
  })

  it('rechaza queries repetidas, desconocidas o con enums inválidos', async () => {
    const fetch = createMockFetch({ delayMs: 0 })
    for (const query of ['q=uno&q=dos', 'state=archived', 'type=otro', 'hasSpaces=yes', 'sort=email', 'visibility=private']) {
      const response = await fetch(`http://localhost/api/initiatives?${query}`)
      expect(response.status).toBe(400)
    }
  })
})
