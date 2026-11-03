import test from 'node:test'
import assert from 'node:assert/strict'
import { initiativeCapabilities, requireInitiativeDetailsAccess } from '../src/services/initiative-access.js'

test('detalle distingue visitante, dueño, miembro y ajeno por visibilidad', () => {
  for (const visibility of ['public', 'institutional', 'restricted', 'private']) {
    const initiative = { ownerId: 'owner', state: 'published', visibility }
    requireInitiativeDetailsAccess(initiative, 'owner')
    requireInitiativeDetailsAccess(initiative, 'member', true)
    for (const [actorId, expected] of [
      [null, { public: 200, institutional: 401, restricted: 401, private: 404 }[visibility]],
      ['other', { public: 200, institutional: 200, restricted: 403, private: 404 }[visibility]],
    ]) {
      if (expected === 200) requireInitiativeDetailsAccess(initiative, actorId)
      else assert.throws(
        () => requireInitiativeDetailsAccess(initiative, actorId),
        (error) => error.status === expected,
      )
    }
  }
})

test('borrador y archivada solo se consultan como propietario', () => {
  for (const state of ['draft', 'archived']) {
    const initiative = { ownerId: 'owner', state, visibility: 'public' }
    requireInitiativeDetailsAccess(initiative, 'owner')
    assert.throws(() => requireInitiativeDetailsAccess(initiative, 'other', true), (error) => error.status === 404)
  }
})

test('capacidades no confunden falta de espacios con bloqueo de solicitudes', () => {
  const initiative = { ownerId: 'owner', state: 'converted', visibility: 'public', estimatedMembers: 1 }
  const capabilities = (options) => initiativeCapabilities(initiative, { actorId: 'other', memberCount: 3, ...options })
  assert.equal(capabilities({}).canRequest, true)
  assert.equal(capabilities({ hasPending: true }).canRequest, false)
  assert.equal(capabilities({ isMember: true }).canRequest, false)
  assert.equal(capabilities({ actorId: null }).canRequest, false)
  assert.equal(capabilities({ actorId: 'owner' }).canConvert, false)
  assert.equal(capabilities({ actorId: 'owner' }).canRequest, false)
})

test('dueño puede gestionar pendientes archivadas pero no editar ni convertir', () => {
  const access = initiativeCapabilities(
    { ownerId: 'owner', state: 'archived', visibility: 'private' },
    { actorId: 'owner', memberCount: 3 },
  )
  assert.equal(access.canManageRequests, true)
  assert.equal(access.canEdit, false)
  assert.equal(access.canConvert, false)
})


test('archivar es capacidad independiente del permiso de eliminar', () => {
  const base = { ownerId: 'owner', visibility: 'private' }
  assert.equal(initiativeCapabilities({ ...base, state: 'published' }, { actorId: 'owner', memberCount: 1 }).canArchive, true)
  assert.equal(initiativeCapabilities({ ...base, state: 'archived' }, { actorId: 'owner', memberCount: 1 }).canArchive, false)
  assert.equal(initiativeCapabilities({ ...base, state: 'archived' }, { actorId: 'owner', memberCount: 1 }).canDelete, true)
  assert.equal(initiativeCapabilities({ ...base, state: 'published' }, { actorId: 'other', memberCount: 1 }).canArchive, false)
})
