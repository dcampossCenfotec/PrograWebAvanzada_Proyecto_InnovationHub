import { describe, expect, it } from 'vitest'
import {
  getSafeReturnPath,
  normalizeRegistration,
  validateLogin,
  validateRegistration,
} from './validation.js'

const validRegistration = {
  firstName: ' Daniel ',
  lastName: ' Campos ',
  memberType: 'student',
  email: ' DANIEL@EXAMPLE.TEST ',
  password: 'ClaveSegura2026',
  passwordConfirmation: 'ClaveSegura2026',
  termsAccepted: true,
}

describe('validación de autenticación', () => {
  it('normaliza solo los campos permitidos por el registro de API03', () => {
    expect(validateRegistration(validRegistration)).toEqual({})
    expect(normalizeRegistration(validRegistration)).toMatchObject({
      firstName: 'Daniel',
      lastName: 'Campos',
      email: 'DANIEL@EXAMPLE.TEST',
    })
    expect(normalizeRegistration(validRegistration)).not.toHaveProperty('career')
  })

  it('detecta correo, contraseña, confirmación y términos inválidos', () => {
    expect(validateRegistration({
      ...validRegistration,
      email: 'correo-invalido',
      password: 'sin-numeros',
      passwordConfirmation: 'otra',
      termsAccepted: false,
    })).toMatchObject({
      email: expect.any(String),
      password: expect.any(String),
      passwordConfirmation: expect.any(String),
      termsAccepted: expect.any(String),
    })
    expect(validateLogin({ email: 'invalido', password: '' })).toEqual({
      email: 'Escribe un correo válido.',
      password: 'Escribe tu contraseña.',
    })
  })

  it('solo restaura rutas internas estructuradas', () => {
    expect(getSafeReturnPath({ from: { pathname: '/iniciativas/nueva', search: '?from=home' } }))
      .toBe('/iniciativas/nueva?from=home')
    expect(getSafeReturnPath({ from: { pathname: '//evil.example' } })).toBe('/perfil')
    expect(getSafeReturnPath({ from: { pathname: '/ingresar' } })).toBe('/perfil')
    expect(getSafeReturnPath({ from: 'https://evil.example' })).toBe('/perfil')
  })
})
