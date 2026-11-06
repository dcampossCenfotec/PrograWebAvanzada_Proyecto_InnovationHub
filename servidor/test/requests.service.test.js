
import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequestsService } from '../src/services/requests.service.js'

const initiativeId = '10000000-0000-4000-8000-000000000004'
const ownerId = '11111111-1111-4111-8111-111111111111'
const applicantId = '22222222-2222-4222-8222-222222222222'
const skillId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4'
const body = { message: 'Puedo participar en la coordinación del proyecto.', role: 'Coordinación', offeredSkillId: skillId, availability: 'medium' }
const now = new Date('2026-11-05T12:00:00.000Z')

function fixture(overrides = {}) {
  const records = []
  const calls = []
  const initiative = { id: initiativeId, ownerId, visibility: 'public', state: 'published', revision: 0 }
  const repo = {
    findInitiative: async () => initiative,
    findUser: async () => ({ skills: [{ skillId }] }),
    findSkill: async () => ({ id: skillId, name: 'Comunicación' }),
    findMembership: async () => null,
    findPending: async () => records.find((r) => r.state === 'pending') ?? null,
    touchRevision: async () => { calls.push('revision'); return true },
    createRequest: async (record) => { calls.push('create'); records.push(record); return record },
    findRequest: async (id) => records.find((r) => r.id === id),
    updatePending: async ({ id, changes }) => {
      const record = records.find((r) => r.id === id && r.state === 'pending')
      if (record) Object.assign(record, changes)
      return record
    },
    updateState: async ({ id, state, changes }) => {
      const record = records.find((r) => r.id === id && r.state === 'pending')
      if (record) Object.assign(record, { state, ...changes })
      return record
    },
    decorate: async (raw) => ({ raw, initiative, applicant: { id: applicantId }, skill: { id: skillId } }),
    ...overrides,
  }
  const service = createRequestsService({
    connection: {}, repository: repo, clock: () => now,
    createId: () => '20000000-0000-4000-8000-000000000099',
    transactionRunner: async (_connection, fn) => fn({}),
  })
  return { repo, records, calls, initiative, service }
}

test('API08 crea solicitud pendiente y no incorpora membresía', async () => {
  const { service, records, calls } = fixture()
  const result = await service.create(initiativeId, applicantId, body)
  assert.equal(result.raw.state, 'pending')
  assert.equal(records.length, 1)
  assert.deepEqual(calls, ['revision', 'create'])
  await assert.rejects(service.create(initiativeId, applicantId, body), (e) => e.status === 409 && e.code === 'PENDING_REQUEST_EXISTS')
})

test('API08 impide solicitud de dueño, miembro y competencia ajena', async () => {
  const f = fixture()
  await assert.rejects(f.service.create(initiativeId, ownerId, body), (e) => e.status === 409)
  f.repo.findMembership = async () => ({ id: 'member' })
  await assert.rejects(f.service.create(initiativeId, applicantId, body), (e) => e.code === 'ACTIVE_MEMBER_EXISTS')
  f.repo.findMembership = async () => null
  f.repo.findUser = async () => ({ skills: [] })
  await assert.rejects(f.service.create(initiativeId, applicantId, body), (e) => e.status === 400 && Boolean(e.fields.offeredSkillId))
})

test('API08 permite cancelar en archivada y preserva historia; terminal no se edita', async () => {
  const f = fixture()
  const request = (await f.service.create(initiativeId, applicantId, body)).raw
  f.initiative.state = 'archived'
  const cancelled = await f.service.cancel(request.id, applicantId)
  assert.equal(cancelled.raw.state, 'cancelled')
  assert.equal(f.records.length, 1)
  await assert.rejects(f.service.cancel(request.id, applicantId), (e) => e.status === 409)
  await assert.rejects(f.service.update(request.id, applicantId, body), (e) => e.status === 409)
})

test('API08 niega operaciones ajenas y no filtra recursos privados a terceros', async () => {
  const f = fixture()
  const request = (await f.service.create(initiativeId, applicantId, body)).raw
  await assert.rejects(f.service.get(request.id, '33333333-3333-4333-8333-333333333333'), (e) => e.status === 403)
  f.initiative.visibility = 'private'
  await assert.rejects(f.service.create(initiativeId, '33333333-3333-4333-8333-333333333333', body), (e) => e.status === 404)
})
