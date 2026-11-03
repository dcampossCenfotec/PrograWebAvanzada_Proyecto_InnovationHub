import test from 'node:test'
import assert from 'node:assert/strict'
import { createUsersService } from '../src/services/users.service.js'

function buildService(overrides = {}) {
  const usersRepository = {
    listActive: async () => [],
    countActive: async () => 0,
    findActiveById: async () => null,
    updateActiveById: async () => null,
    ...overrides.usersRepository,
  }
  const catalogRepository = {
    findExistingActiveSkillIds: async (ids) => ids,
    listActiveCategories: async () => [],
    listActiveSkills: async () => [],
    countActiveSkills: async () => 0,
    ...overrides.catalogRepository,
  }
  return createUsersService({ usersRepository, catalogRepository, clock: () => new Date('2026-11-02T12:00:00.000Z') })
}

test('calcula la paginación después de aplicar filtros autorizados', async () => {
  let received
  const service = buildService({
    usersRepository: {
      listActive: async (input) => { received = input; return [{ id: '1' }] },
      countActive: async () => 13,
    },
  })
  const result = await service.listUsers({ availability: 'high', page: '2', size: '5', sort: 'createdAt', order: 'desc' })
  assert.deepEqual(result.pagination, { page: 2, size: 5, total: 13, totalPages: 3 })
  assert.equal(received.skip, 5)
  assert.equal(received.limit, 5)
  assert.deepEqual(received.sort, { createdAt: -1, id: -1 })
  assert.equal(received.filter.availability, 'high')
})

test('no escribe el perfil si alguna competencia no existe', async () => {
  let updated = false
  const service = buildService({
    usersRepository: { updateActiveById: async () => { updated = true } },
    catalogRepository: { findExistingActiveSkillIds: async () => [] },
  })
  const input = {
    firstName: 'Daniel', lastName: 'Campos', memberType: 'student', career: null, bio: null,
    interests: [], availability: 'medium', portfolioUrl: null,
    skills: [{ skillId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', level: 'basic' }],
  }
  await assert.rejects(service.updateOwnProfile('actor', input), (error) => Boolean(error.fields.skills))
  assert.equal(updated, false)
})

test('una página vacía conserva el total real', async () => {
  const service = buildService({ usersRepository: { countActive: async () => 4 } })
  const result = await service.listUsers({ page: '9', size: '2' })
  assert.deepEqual(result.users, [])
  assert.deepEqual(result.pagination, { page: 9, size: 2, total: 4, totalPages: 2 })
})
