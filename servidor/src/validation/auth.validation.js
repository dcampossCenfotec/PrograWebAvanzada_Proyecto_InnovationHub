import { MEMBER_TYPES } from '../models/auth.models.js'
import { HttpError } from '../errors/http-error.js'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const registrationFields = new Set([
  'firstName', 'lastName', 'memberType', 'email', 'password', 'passwordConfirmation', 'termsAccepted',
])
const loginFields = new Set(['email', 'password'])

function addUnknownFields(input, allowed, fields) {
  for (const key of Object.keys(input)) {
    if (!allowed.has(key)) fields[key] = 'Este campo no está permitido.'
  }
}

function requiredString(value, field, { minimum, maximum }, fields) {
  if (typeof value !== 'string') {
    fields[field] = 'Debe ser texto.'
    return ''
  }
  const normalized = value.trim()
  if (normalized.length < minimum || normalized.length > maximum) {
    fields[field] = `Debe tener entre ${minimum} y ${maximum} caracteres.`
  }
  return normalized
}

function validatePassword(password, fields) {
  if (typeof password !== 'string' || password.length < 10 || password.length > 128) {
    fields.password = 'Debe tener entre 10 y 128 caracteres.'
  } else if (!/\p{L}/u.test(password) || !/\p{N}/u.test(password)) {
    fields.password = 'Debe incluir al menos una letra y un número.'
  }
}

function throwIfInvalid(fields) {
  if (Object.keys(fields).length > 0) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Revisa los campos indicados.', fields)
  }
}

export function normalizeEmail(email) {
  return email.trim().toLocaleLowerCase('en-US')
}

export function validateRegistration(input) {
  const fields = {}
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Revisa los campos indicados.', { body: 'Debe ser un objeto JSON.' })
  }
  addUnknownFields(input, registrationFields, fields)
  const firstName = requiredString(input.firstName, 'firstName', { minimum: 2, maximum: 60 }, fields)
  const lastName = requiredString(input.lastName, 'lastName', { minimum: 2, maximum: 80 }, fields)
  const email = requiredString(input.email, 'email', { minimum: 3, maximum: 254 }, fields)
  if (email && !emailPattern.test(email)) fields.email = 'Debe ser un correo electrónico válido.'
  if (!MEMBER_TYPES.includes(input.memberType)) fields.memberType = 'Selecciona un tipo de miembro válido.'
  validatePassword(input.password, fields)
  if (input.passwordConfirmation !== input.password) fields.passwordConfirmation = 'Las contraseñas no coinciden.'
  if (input.termsAccepted !== true) fields.termsAccepted = 'Debes aceptar los términos.'
  throwIfInvalid(fields)
  return {
    firstName,
    lastName,
    memberType: input.memberType,
    email,
    emailNormalized: normalizeEmail(email),
    password: input.password,
  }
}

export function validateLogin(input) {
  const fields = {}
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Revisa los campos indicados.', { body: 'Debe ser un objeto JSON.' })
  }
  addUnknownFields(input, loginFields, fields)
  const email = requiredString(input.email, 'email', { minimum: 3, maximum: 254 }, fields)
  if (email && !emailPattern.test(email)) fields.email = 'Debe ser un correo electrónico válido.'
  if (typeof input.password !== 'string' || input.password.length === 0) fields.password = 'Es obligatoria.'
  throwIfInvalid(fields)
  return { emailNormalized: normalizeEmail(email), password: input.password }
}
