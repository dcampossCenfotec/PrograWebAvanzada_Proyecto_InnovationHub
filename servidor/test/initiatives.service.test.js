import test from 'node:test'
import assert from 'node:assert/strict'
import { createInitiativesService } from '../src/services/initiatives.service.js'

const owner = {
  id: '11111111-1111-4111-8111-111111111111',
  firstName: 'Ana',
  lastName: 'Rojas',
}
const other = { ...owner, id: '22222222-2222-4222-8222-222222222222' }
const skillId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'
const input = {
  title: 'Tutorías colaborativas',
  type: 'idea',
  summary: 'Red universitaria para intercambiar tutorías entre carreras.',
  description: 'La iniciativa coordina sesiones y seguimiento entre estudiantes.',
  problem: 'El apoyo académico informal es difícil de localizar.',
  beneficiaries: 'Estudiantes de todas las carreras',
  categoryId: 'education',
  skillIds: [skillId],
  estimatedMembers: 4,
  visibility: 'public',
  tags: ['tutorías', 'comunidad'],
}
const ids = [
  '10000000-0000-4000-8000-000000000099',
  '30000000-0000-4000-8000-000000000099',
  '40000000-0000-4000-8000-000000000099',
]

function buildService(overrides = {}) {
  const initiativesRepository = {
    createAggregate: async ({ initiative }) => initiative,
    findById: async () => null,
    countActiveMemberships: async () => 1,
    updateOwnedAtRevision: async ({ changes, updatedAt }) => ({
      ...overrides.current,
      ...changes,
      updatedAt,
    }),
    ...overrides.initiativesRepository,
  }
  const catalogRepository = {
    findActiveCategoryById: async (id) => ({ id, name: 'Educación' }),
    findActiveSkillsByIds: async (skillIds) => skillIds.map((id) => ({ id, name: 'Desarrollo web' })),
    ...overrides.catalogRepository,
  }
  let index = 0
  return createInitiativesService({
    connection: {},
    initiativesRepository,
    catalogRepository,
    clock: () => new Date('2026-11-03T12:00:00.000Z'),
    createId: () => ids[index++],
    transactionRunner: async (_connection, operation) => operation({ id: 'session' }),
  })
}

test('crea iniciativa publicada con membresía y evento del propietario', async () => {
  let aggregate
  const service = buildService({
    initiativesRepository: {
      createAggregate: async (value) => {
        aggregate = value
        return value.initiative
      },
    },
  })
  const result = await service.createInitiative(owner, input)
  assert.equal(result.initiative.ownerId, owner.id)
  assert.equal(result.initiative.state, 'published')
  assert.equal(result.initiative.revision, 0)
  assert.equal(aggregate.membership.userId, owner.id)
  assert.equal(aggregate.membership.state, 'active')
  assert.equal(aggregate.event.membershipId, aggregate.membership.id)
  assert.equal(aggregate.event.type, 'joined')
  assert.equal(result.memberCount, 1)
})

test('rechaza referencias inactivas antes de escribir', async () => {
  let writes = 0
  const service = buildService({
    initiativesRepository: { createAggregate: async () => { writes += 1 } },
    catalogRepository: { findActiveCategoryById: async () => null },
  })
  await assert.rejects(
    service.createInitiative(owner, input),
    (error) => error.status === 400 && Boolean(error.fields.categoryId),
  )
  assert.equal(writes, 0)
})

test('distingue iniciativa inexistente de actor ajeno', async () => {
  const missing = buildService()
  await assert.rejects(
    missing.updateInitiative(ids[0], owner, input),
    (error) => error.status === 404,
  )
  const current = {
    id: ids[0], ownerId: owner.id, state: 'published', revision: 0, estimatedMembers: 4,
  }
  const foreign = buildService({
    current,
    initiativesRepository: { findById: async () => current },
  })
  await assert.rejects(
    foreign.updateInitiative(ids[0], other, input),
    (error) => error.status === 403,
  )
})

test('una iniciativa archivada no se modifica', async () => {
  const current = {
    id: ids[0], ownerId: owner.id, state: 'archived', revision: 0, estimatedMembers: 4,
  }
  const service = buildService({
    current,
    initiativesRepository: { findById: async () => current },
  })
  await assert.rejects(
    service.updateInitiative(ids[0], owner, input),
    (error) => error.status === 409 && error.code === 'STATE_CONFLICT',
  )
})

test('permite conservar una estimación superada y rechaza reducirla', async () => {
  const current = {
    id: ids[0], ownerId: owner.id, state: 'published', revision: 2, estimatedMembers: 2,
    createdAt: new Date('2026-11-01T12:00:00.000Z'),
  }
  const service = buildService({
    current,
    initiativesRepository: {
      findById: async () => current,
      countActiveMemberships: async () => 3,
      updateOwnedAtRevision: async ({ changes, updatedAt }) => ({ ...current, ...changes, updatedAt }),
    },
  })
  const preserved = await service.updateInitiative(ids[0], owner, { ...input, estimatedMembers: 2 })
  assert.equal(preserved.initiative.estimatedMembers, 2)
  await assert.rejects(
    service.updateInitiative(ids[0], owner, { ...input, estimatedMembers: 1 }),
    (error) => error.status === 400 && Boolean(error.fields.estimatedMembers),
  )
})

test('detecta una revisión concurrente sin sobrescribir', async () => {
  const current = {
    id: ids[0], ownerId: owner.id, state: 'published', revision: 3, estimatedMembers: 4,
  }
  const service = buildService({
    current,
    initiativesRepository: {
      findById: async () => current,
      updateOwnedAtRevision: async () => null,
    },
  })
  await assert.rejects(
    service.updateInitiative(ids[0], owner, input),
    (error) => error.status === 409 && error.code === 'INITIATIVE_CHANGED',
  )
})
