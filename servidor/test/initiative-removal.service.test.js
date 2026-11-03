import test from 'node:test'
import assert from 'node:assert/strict'
import { createInitiativeRemovalService } from '../src/services/initiative-removal.service.js'

const id = '10000000-0000-4000-8000-000000000099'
const ownerId = '11111111-1111-4111-8111-111111111111'
const current = { id, ownerId, state: 'published', revision: 0 }

function buildService({ initiative = current, initiatives = {}, removal = {}, transactionRunner } = {}) {
  return createInitiativeRemovalService({
    connection: {},
    initiativesRepository: {
      findById: async () => initiative,
      touchRevision: async () => ({ ...initiative, revision: initiative.revision + 1 }),
      ...initiatives,
    },
    removalRepository: {
      inspectHistory: async () => ({ canDelete: true, membershipId: 'membership', eventId: 'event' }),
      deleteAggregate: async () => true,
      archiveAtRevision: async () => ({ ...initiative, state: 'archived' }),
      ...removal,
    },
    clock: () => new Date('2026-11-03T18:00:00.000Z'),
    transactionRunner: transactionRunner ?? (async (_connection, operation) => operation({ id: 'session' })),
  })
}

test('eliminar sin historial devuelve null para HTTP 204', async () => {
  assert.equal(await buildService().deleteInitiative(id, ownerId), null)
})

test('historial obliga a archivar sin eliminar relaciones', async () => {
  let deletes = 0
  const service = buildService({ removal: {
    inspectHistory: async () => ({ canDelete: false }),
    deleteAggregate: async () => { deletes += 1; return true },
  } })
  assert.deepEqual(await service.deleteInitiative(id, ownerId), { id, state: 'archived', operation: 'archived' })
  assert.equal(deletes, 0)
})

test('inexistente y actor ajeno no escriben ni inspeccionan historia', async () => {
  let writes = 0
  const initiatives = { touchRevision: async () => { writes += 1; return current } }
  await assert.rejects(buildService({ initiative: null, initiatives }).deleteInitiative(id, ownerId), (e) => e.status === 404)
  await assert.rejects(buildService({ initiatives }).deleteInitiative(id, 'otro'), (e) => e.status === 403)
  assert.equal(writes, 0)
})

test('repetir archivo devuelve el mismo resultado sin otra escritura', async () => {
  let writes = 0
  const service = buildService({
    initiative: { ...current, state: 'archived' },
    initiatives: { touchRevision: async () => { writes += 1 } },
  })
  assert.deepEqual(await service.deleteInitiative(id, ownerId), { id, state: 'archived', operation: 'archived' })
  assert.equal(writes, 0)
})

test('UUID, body y query inválidos se rechazan antes de abrir transacción', async () => {
  let transactions = 0
  const service = buildService({ transactionRunner: async () => { transactions += 1 } })
  await assert.rejects(service.deleteInitiative('invalid', ownerId), (e) => e.status === 400)
  await assert.rejects(service.deleteInitiative(id, ownerId, { body: {} }), (e) => e.status === 400)
  await assert.rejects(service.deleteInitiative(id, ownerId, { query: { force: 'true' } }), (e) => e.code === 'INVALID_QUERY')
  assert.equal(transactions, 0)
})

test('revisión cambiada aborta antes de borrar', async () => {
  const service = buildService({ initiatives: { touchRevision: async () => null } })
  await assert.rejects(service.deleteInitiative(id, ownerId), (e) => e.status === 409 && e.code === 'CONCURRENT_MODIFICATION')
})

test('resultado de eliminación parcial no se confirma', async () => {
  const service = buildService({ removal: { deleteAggregate: async () => false } })
  await assert.rejects(service.deleteInitiative(id, ownerId), (e) => e.status === 409)
})

test('archivo que pierde su revisión se rechaza con conflicto', async () => {
  const service = buildService({ removal: {
    inspectHistory: async () => ({ canDelete: false }),
    archiveAtRevision: async () => null,
  } })
  await assert.rejects(service.deleteInitiative(id, ownerId), (e) => e.status === 409)
})
