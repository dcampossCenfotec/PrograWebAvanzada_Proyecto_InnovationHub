
import test from 'node:test'
import assert from 'node:assert/strict'
import { createMembersService } from '../src/services/members.service.js'

const id = '10000000-0000-4000-8000-000000000004'
const owner = '11111111-1111-4111-8111-111111111111'
const member = '22222222-2222-4222-8222-222222222222'

function setup() {
  const calls = []
  const initiative = { id, ownerId: owner, visibility: 'private', state: 'published', revision: 0 }
  const membership = { id: '30000000-0000-4000-8000-000000000100', initiativeId: id, userId: member, state: 'active', joinedAt: new Date(), role: 'Apoyo' }
  const repo = {
    findInitiative: async () => initiative,
    findMembership: async (_id, userId) => userId === member ? membership : null,
    touchRevision: async () => { calls.push('revision'); return true },
    retireMembership: async () => { calls.push('retired'); membership.state = 'retired'; return membership },
    createMembershipEvent: async () => { calls.push('event') },
    listMembers: async () => ({ rows: [{ membership, user: { id: member, firstName: 'Luis', lastName: 'Mora' } }], total: 1 }),
  }
  const service = createMembersService({ connection: {}, repository: repo,
    clock: () => new Date('2026-11-05T12:00:00.000Z'),
    createId: () => '40000000-0000-4000-8000-000000000101',
    transactionRunner: async (_connection, fn) => fn({}),
  })
  return { calls, initiative, membership, repo, service }
}

test('API09 retira a participante y conserva evento', async () => {
  const { service, calls } = setup()
  await service.remove(id, member, owner)
  assert.deepEqual(calls, ['revision', 'retired', 'event'])
})

test('API09 no permite retirar propietario ni a un usuario ajeno', async () => {
  const { service } = setup()
  await assert.rejects(service.remove(id, owner, owner), (e) => e.status === 409)
  await assert.rejects(service.remove(id, member, member), (e) => e.status === 403)
})

test('API09 lista solo con acceso completo y paginación', async () => {
  const { service } = setup()
  const listed = await service.list(id, owner, { page: '1', size: '10' })
  assert.equal(listed.rows.length, 1)
  assert.equal(listed.pagination.totalPages, 1)
  await assert.rejects(service.list(id, '33333333-3333-4333-8333-333333333333', {}), (e) => e.status === 404)
})
