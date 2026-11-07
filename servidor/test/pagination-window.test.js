
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  isPaginatedRoute,
  validatePaginationWindow,
  paginationWindowMiddleware,
} from '../src/middleware/pagination-window.js'

const urls = [
  '/api/users',
  '/api/skills',
  '/api/initiatives',
  '/api/initiatives/mine',
  '/api/requests',
  '/api/projects',
  '/api/initiatives/10000000-0000-4000-8000-000000000001/members',
]

test('API11 aplica la protección a todos los listados extensos', () => {
  for (const url of urls) {
    assert.equal(
      isPaginatedRoute('GET', url),
      true,
      url,
    )

    assert.equal(
      isPaginatedRoute('POST', url),
      false,
      url,
    )
  }

  assert.equal(
    isPaginatedRoute('GET', '/api/categories'),
    false,
  )

  assert.equal(
    isPaginatedRoute('GET', '/api/projects/123'),
    false,
  )
})

test('API11 conserva valores por defecto y límites del contrato', () => {
  assert.deepEqual(
    validatePaginationWindow({}),
    { page: 1, size: 12 },
  )

  assert.deepEqual(
    validatePaginationWindow({
      page: '9',
      size: '50',
    }),
    { page: 9, size: 50 },
  )

  for (const query of [
    { page: '0' },
    { size: '51' },
    { size: '1.5' },
    { page: '1e2' },
    { page: ['1', '2'] },
    { page: '9007199254740991', size: '50' },
  ]) {
    assert.throws(
      () => validatePaginationWindow(query),
      (error) =>
        error.status === 400 &&
        error.code === 'INVALID_QUERY',
    )
  }
})

test('API11 corta la consulta inválida antes de llegar a los repositorios', () => {
  let calls = 0
  let error

  paginationWindowMiddleware(
    {
      method: 'GET',
      path: '/api/requests',
      query: { size: '51' },
    },
    {},
    (received) => {
      calls += 1
      error = received
    },
  )

  assert.equal(calls, 1)
  assert.equal(error?.status, 400)
})
