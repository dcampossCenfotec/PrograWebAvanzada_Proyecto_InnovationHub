import test from 'node:test'
import assert from 'node:assert/strict'
import { validateInitiativeQuery } from '../../src/validation/initiative-query.validation.js'

test('consultas de iniciativas normalizan y limitan paginación y filtros', () => {
  const input = validateInitiativeQuery({ q: '  Mentorías ', hasSpaces: 'false', page: '2', size: '5' })
  assert.equal(input.q, 'Mentorías')
  assert.equal(input.hasSpaces, false)
  assert.equal(input.page, 2)
  assert.equal(input.size, 5)
  assert.equal(input.sort, 'createdAt')
})

test('parámetros desconocidos, repetidos y operadores no llegan al repositorio', () => {
  for (const query of [
    { visibility: 'private' }, { state: 'archived' }, { q: ['Uno', 'Otro'] },
    { q: { $ne: '' } }, { 'q[$ne]': '' }, { ownerId: 'invalido' },
    { skill: 'texto' }, { category: '$where' }, { hasSpaces: 'yes' },
    { page: '0' }, { size: '51' }, { page: '-1' }, { size: '0' },
    { sort: 'passwordHash' }, { order: 'ASC' }, { from: '2026-11-03' },
    { page: '9007199254740991', size: '50' },
  ]) {
    assert.throws(() => validateInitiativeQuery(query), (error) => error.code === 'INVALID_QUERY')
  }
})

test('mis iniciativas acepta solo su conjunto de query y ordenamientos', () => {
  assert.equal(validateInitiativeQuery({ sort: 'state' }, { mine: true }).sort, 'state')
  assert.throws(() => validateInitiativeQuery({ ownerId: 'otro' }, { mine: true }))
  assert.throws(() => validateInitiativeQuery({ sort: 'memberCount' }, { mine: true }))
})
