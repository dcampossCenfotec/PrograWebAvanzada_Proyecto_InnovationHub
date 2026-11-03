import test from 'node:test'
import assert from 'node:assert/strict'
import { validateInitiativeId, validateInitiativeInput } from '../../src/validation/initiatives.validation.js'

const skillId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'
const validInput = {
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

test('normaliza textos e identificadores de una iniciativa válida', () => {
  const result = validateInitiativeInput({
    ...validInput,
    title: `  ${validInput.title}  `,
    skillIds: [skillId.toUpperCase()],
    tags: ['  Tutorías  '],
  })
  assert.equal(result.title, validInput.title)
  assert.deepEqual(result.skillIds, [skillId])
  assert.deepEqual(result.tags, ['Tutorías'])
})

test('exige el body completo y rechaza campos administrados por servidor', () => {
  assert.throws(
    () => validateInitiativeInput({ title: 'Incompleta', ownerId: skillId }),
    (error) => error.status === 400
      && Boolean(error.fields.ownerId)
      && Boolean(error.fields.description)
      && Boolean(error.fields.estimatedMembers),
  )
})

test('aplica fronteras de texto, entero, tipo y visibilidad', () => {
  assert.throws(
    () => validateInitiativeInput({
      ...validInput,
      title: '1234',
      summary: 'muy breve',
      estimatedMembers: 2.5,
      type: 'other',
      visibility: 'friends',
    }),
    (error) => Object.keys(error.fields).every((key) => (
      ['title', 'summary', 'estimatedMembers', 'type', 'visibility'].includes(key)
    )),
  )
})

test('rechaza competencias inválidas, repetidas y fuera del límite', () => {
  assert.throws(
    () => validateInitiativeInput({ ...validInput, skillIds: [skillId, skillId] }),
    (error) => error.fields.skillIds.includes('duplicadas'),
  )
  assert.throws(
    () => validateInitiativeInput({ ...validInput, skillIds: [] }),
    (error) => error.fields.skillIds.includes('entre 1 y 10'),
  )
  assert.throws(
    () => validateInitiativeInput({ ...validInput, skillIds: ['no-uuid'] }),
    (error) => error.fields.skillIds.includes('UUID'),
  )
})

test('normaliza duplicados de etiquetas con mayúsculas y tildes', () => {
  assert.throws(
    () => validateInitiativeInput({ ...validInput, tags: ['Tutorías', 'tutorias'] }),
    (error) => error.fields.tags.includes('duplicadas'),
  )
})

test('estimatedMembers acepta únicamente enteros entre 1 y 100', () => {
  for (const value of [0, 101, '4', 3.2]) {
    assert.throws(
      () => validateInitiativeInput({ ...validInput, estimatedMembers: value }),
      (error) => error.fields.estimatedMembers.includes('entero'),
    )
  }
})

test('valida y normaliza el UUID de la ruta', () => {
  const id = 'ABCDEFAB-CDEF-4ABC-8ABC-ABCDEFABCDEF'
  assert.equal(validateInitiativeId(id), id.toLowerCase())
  assert.throws(() => validateInitiativeId('invalido'), (error) => Boolean(error.fields.id))
})
