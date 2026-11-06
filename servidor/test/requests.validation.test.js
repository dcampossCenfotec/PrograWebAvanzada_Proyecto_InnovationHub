
import test from 'node:test'
import assert from 'node:assert/strict'
import { validateRequestBody, validateRequestQuery, validateRequestId } from '../src/validation/requests.validation.js'

const valid = {
  message: 'Puedo apoyar en el equipo de diseño esta semana.',
  offeredSkillId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4',
  role: 'Diseño de materiales',
  availability: 'medium',
}
const bad = (fn, code = 'VALIDATION_ERROR') => assert.throws(fn, (error) => error.status === 400 && error.code === code)

test('API08 valida cuatro campos y recorta texto', () => {
  assert.deepEqual(validateRequestBody({ ...valid, role: '  Diseño de materiales  ' }), valid)
  bad(() => validateRequestBody({ ...valid, applicantId: '11111111-1111-4111-8111-111111111111' }))
  bad(() => validateRequestBody({ ...valid, message: 'Corto' }))
  bad(() => validateRequestBody({ ...valid, offeredSkillId: 'inventada' }))
  bad(() => validateRequestBody({ ...valid, availability: 'always' }))
  bad(() => validateRequestBody({ message: valid.message }))
})

test('API08 valida UUID público y todos los filtros de GET /requests', () => {
  assert.equal(validateRequestId('AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAA4'), valid.offeredSkillId)
  bad(() => validateRequestId('123'))
  const query = validateRequestQuery({ scope: 'mine', page: '2', size: '5', sort: 'state', order: 'asc' })
  assert.deepEqual({ page: query.page, size: query.size, sort: query.sort }, { page: 2, size: 5, sort: 'state' })
  bad(() => validateRequestQuery({ scope: 'received' }), 'INVALID_QUERY')
  bad(() => validateRequestQuery({ scope: 'mine', page: '0' }), 'INVALID_QUERY')
  bad(() => validateRequestQuery({ scope: 'mine', size: '51' }), 'INVALID_QUERY')
  bad(() => validateRequestQuery({ scope: 'mine', sort: 'passwordHash' }), 'INVALID_QUERY')
  bad(() => validateRequestQuery({ scope: 'mine', scope2: 'all' }), 'INVALID_QUERY')
  bad(() => validateRequestQuery({ scope: ['mine', 'mine'] }), 'INVALID_QUERY')
  bad(() => validateRequestQuery({ scope: 'mine', from: '2026-11-05T10:00:00Z', to: '2026-11-04T10:00:00Z' }), 'INVALID_QUERY')
})
