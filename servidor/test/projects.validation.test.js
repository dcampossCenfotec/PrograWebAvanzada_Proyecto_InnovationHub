
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  validateProjectBody,
  validateProjectsQuery,
} from '../src/validation/projects.validation.js'

const valid = {
  name: 'Proyecto tutorías',
  description: 'Una red de tutorías colaborativas para estudiantes.',
  objective: 'Coordinar tutorías y medir resultados.',
  technologies: ['React', 'Node.js'],
  startDate: '2026-11-06',
  estimatedEndDate: '2027-02-28',
  repositoryUrl: 'https://github.com/demo/demo',
}

test('API10 acepta proyecto completo y consulta paginada', () => {
  assert.deepEqual(
    validateProjectBody(valid).technologies,
    ['React', 'Node.js'],
  )

  assert.deepEqual(
    validateProjectsQuery({
      page: '2',
      size: '10',
      sort: 'name',
      order: 'asc',
    }),
    { page: 2, size: 10, sort: 'name', order: 'asc' },
  )
})

test('API10 rechaza fechas imposibles, duplicados y URL no HTTP(S)', () => {
  for (const body of [
    { ...valid, startDate: '2026-02-30' },
    { ...valid, estimatedEndDate: '2026-01-01' },
    { ...valid, repositoryUrl: 'file:///etc/passwd' },
    { ...valid, technologies: ['React', 'react'] },
    { ...valid, ownerId: 'external' },
  ]) {
    assert.throws(
      () => validateProjectBody(body),
      (error) => error.status === 400,
    )
  }

  assert.throws(
    () => validateProjectsQuery({ q: 'secret' }),
    (error) => error.status === 400,
  )
})
