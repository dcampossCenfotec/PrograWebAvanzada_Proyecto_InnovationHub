export const MEMBER_TYPE_OPTIONS = Object.freeze([
  ['student', 'Estudiante'],
  ['professor', 'Docente'],
  ['administrative', 'Personal administrativo'],
  ['graduate', 'Persona graduada'],
  ['external', 'Persona externa'],
])

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function textLength(value, minimum, maximum, label, fields) {
  const normalized = value.trim()
  if (normalized.length < minimum || normalized.length > maximum) {
    fields[label] = `Debe tener entre ${minimum} y ${maximum} caracteres.`
  }
}

export function validateLogin(values) {
  const fields = {}
  const email = values.email.trim()
  if (!emailPattern.test(email) || email.length > 254) fields.email = 'Escribe un correo válido.'
  if (!values.password) fields.password = 'Escribe tu contraseña.'
  return fields
}

export function validateRegistration(values) {
  const fields = {}
  textLength(values.firstName, 2, 60, 'firstName', fields)
  textLength(values.lastName, 2, 80, 'lastName', fields)
  if (!MEMBER_TYPE_OPTIONS.some(([value]) => value === values.memberType)) {
    fields.memberType = 'Selecciona un tipo de miembro.'
  }
  const email = values.email.trim()
  if (!emailPattern.test(email) || email.length > 254) fields.email = 'Escribe un correo válido.'
  if (values.password.length < 10 || values.password.length > 128) {
    fields.password = 'Debe tener entre 10 y 128 caracteres.'
  } else if (!/\p{L}/u.test(values.password) || !/\p{N}/u.test(values.password)) {
    fields.password = 'Debe incluir al menos una letra y un número.'
  }
  if (values.passwordConfirmation !== values.password) {
    fields.passwordConfirmation = 'Las contraseñas no coinciden.'
  }
  if (!values.termsAccepted) fields.termsAccepted = 'Debes aceptar los términos.'
  return fields
}

export function normalizeRegistration(values) {
  return {
    ...values,
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
  }
}

export function getSafeReturnPath(locationState) {
  const from = locationState?.from
  if (!from || typeof from.pathname !== 'string') return '/perfil'
  if (!from.pathname.startsWith('/') || from.pathname.startsWith('//')) return '/perfil'
  if (['/ingresar', '/registro'].includes(from.pathname)) return '/perfil'
  const search = typeof from.search === 'string' && from.search.startsWith('?') ? from.search : ''
  const hash = typeof from.hash === 'string' && from.hash.startsWith('#') ? from.hash : ''
  return `${from.pathname}${search}${hash}`
}
