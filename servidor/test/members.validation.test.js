
import test from 'node:test'
import assert from 'node:assert/strict'
import { validateMembersQuery } from '../src/validation/members.validation.js'
import { validateRequestDecision, validateRequestQuery } from '../src/validation/requests.validation.js'

test('API09 valida filtros de miembros y alcances recibidos', () => {
  assert.deepEqual(validateMembersQuery({ page: '2', size: '5', sort: 'lastName', order: 'asc' }).page, 2)
  assert.equal(validateRequestQuery({ scope: 'received' }, { allowReceived: true }).scope, 'received')
  assert.throws(() => validateMembersQuery({ sort: 'email' }), (e) => e.status === 400 && e.code === 'INVALID_QUERY')
  assert.throws(() => validateMembersQuery({ skill: 'no-uuid' }), (e) => e.status === 400)
  assert.throws(() => validateMembersQuery({ size: '51' }), (e) => e.status === 400)
})

test('API09 rechaza decisiones no contempladas o comentario demasiado largo', () => {
  assert.deepEqual(validateRequestDecision({ decision: 'rejected' }), { decision: 'rejected', comment: null })
  assert.deepEqual(validateRequestDecision({ decision: 'accepted', comment: '  Bienvenida ' }), { decision: 'accepted', comment: 'Bienvenida' })
  assert.throws(() => validateRequestDecision({ decision: 'maybe' }), (e) => e.status === 400)
  assert.throws(() => validateRequestDecision({ decision: 'accepted', comment: '' }), (e) => e.status === 400)
  assert.throws(() => validateRequestDecision({ decision: 'accepted', memberId: 'fake' }), (e) => e.status === 400)
})
