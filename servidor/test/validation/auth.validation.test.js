import test from 'node:test'
import assert from 'node:assert/strict'
import { validateLogin, validateRegistration } from '../../src/validation/auth.validation.js'

const validRegistration = {
  firstName: '  María ',
  lastName: ' Mora  ',
  memberType: 'student',
  email: '  Maria@Example.TEST ',
  password: 'ClaveSegura2026',
  passwordConfirmation: 'ClaveSegura2026',
  termsAccepted: true,
}

test('normaliza nombres y correo de un registro válido', () => {
  const result = validateRegistration(validRegistration)
  assert.equal(result.firstName, 'María')
  assert.equal(result.email, 'Maria@Example.TEST')
  assert.equal(result.emailNormalized, 'maria@example.test')
  assert.equal('passwordConfirmation' in result, false)
})

test('rechaza campos ajenos, contraseña débil, confirmación y términos', () => {
  assert.throws(
    () => validateRegistration({
      ...validRegistration,
      password: 'sin-numeros',
      passwordConfirmation: 'otra',
      termsAccepted: false,
      role: 'admin',
    }),
    (error) => Boolean(error.code === 'VALIDATION_ERROR' &&
      error.fields.password && error.fields.passwordConfirmation && error.fields.termsAccepted && error.fields.role),
  )
})

test('login normaliza correo y no acepta propiedades adicionales', () => {
  assert.deepEqual(validateLogin({ email: ' ANA@EXAMPLE.TEST ', password: 'x' }), {
    emailNormalized: 'ana@example.test',
    password: 'x',
  })
  assert.throws(
    () => validateLogin({ email: 'ana@example.test', password: 'x', active: true }),
    (error) => Boolean(error.fields.active),
  )
})
