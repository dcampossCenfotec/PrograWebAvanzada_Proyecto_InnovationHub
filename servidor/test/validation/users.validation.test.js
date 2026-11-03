import test from 'node:test'
import assert from 'node:assert/strict'
import {
  validateEmptyQuery,
  validateProfileUpdate,
  validateSkillsQuery,
  validateUserId,
  validateUsersQuery,
} from '../../src/validation/users.validation.js'

const skillId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'
const validProfile = {
  firstName: '  Daniel ',
  lastName: ' Campos ',
  memberType: 'student',
  career: ' Ingeniería del Software ',
  bio: ' Perfil público ',
  interests: [' tecnología ', 'educación'],
  availability: 'medium',
  portfolioUrl: 'https://example.test/daniel',
  skills: [{ skillId, level: 'basic' }],
}

test('normaliza el reemplazo completo de un perfil', () => {
  assert.deepEqual(validateProfileUpdate(validProfile), {
    ...validProfile,
    firstName: 'Daniel',
    lastName: 'Campos',
    career: 'Ingeniería del Software',
    bio: 'Perfil público',
    interests: ['tecnología', 'educación'],
  })
})

test('rechaza campos inmutables, faltantes y valores fuera del contrato', () => {
  assert.throws(
    () => validateProfileUpdate({
      ...validProfile,
      email: 'nuevo@example.test',
      bio: 'x'.repeat(601),
      interests: ['Web', ' web '],
      portfolioUrl: 'javascript:alert(1)',
      skills: [{ skillId, level: 'basic' }, { skillId, level: 'advanced' }],
    }),
    (error) => Boolean(
      error.code === 'VALIDATION_ERROR' &&
      error.fields.email && error.fields.bio && error.fields.interests &&
      error.fields.portfolioUrl && error.fields.skills
    ),
  )
  const withoutBio = { ...validProfile }
  delete withoutBio.bio
  assert.throws(() => validateProfileUpdate(withoutBio), (error) => Boolean(error.fields.bio))
})

test('valida filtros, paginación y repeticiones del directorio', () => {
  assert.deepEqual(validateUsersQuery({ q: ' Ana ', page: '2', size: '5', order: 'desc' }), {
    q: 'Ana',
    skill: undefined,
    career: undefined,
    availability: undefined,
    page: 2,
    size: 5,
    sort: 'lastName',
    order: 'desc',
  })
  assert.throws(
    () => validateUsersQuery({ page: ['1', '2'], skill: 'no-uuid', unknown: 'x' }),
    (error) => Boolean(error.code === 'INVALID_QUERY' && error.fields.page && error.fields.skill && error.fields.unknown),
  )
})

test('valida UUID, catálogos públicos y límites de competencias', () => {
  assert.equal(validateUserId('11111111-1111-4111-8111-111111111111'), '11111111-1111-4111-8111-111111111111')
  assert.equal(
    validateUserId('AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA'),
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  )
  assert.throws(() => validateUserId('no-uuid'), (error) => error.code === 'VALIDATION_ERROR')
  assert.deepEqual(validateSkillsQuery({ q: ' web ', page: '1', size: '50' }), { q: 'web', page: 1, size: 50 })
  assert.throws(() => validateSkillsQuery({ q: 'x', size: '51' }), (error) => error.code === 'INVALID_QUERY')
  assert.throws(() => validateEmptyQuery({ page: '1' }), (error) => error.code === 'INVALID_QUERY')
})
