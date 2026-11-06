
import { HttpError } from '../errors/http-error.js'
import { validateRequestId } from './requests.validation.js'

const validSorts = ['joinedAt', 'firstName', 'lastName', 'role']

export function validateMemberId(id) {
  return validateRequestId(id)
}

export function validateMembersQuery(query) {
  const allowed = new Set(['skill', 'role', 'page', 'size', 'sort', 'order'])
  const fields = {}
  for (const [key, value] of Object.entries(query)) {
    if (!allowed.has(key)) fields[key] = 'Este parámetro no está permitido.'
    if (Array.isArray(value) || (value !== null && typeof value === 'object')) {
      fields[key] = 'Debe enviarse una sola vez.'
    }
  }
  if (query.skill !== undefined) {
    try { validateRequestId(query.skill) } catch { fields.skill = 'Debe ser un UUID válido.' }
  }
  const role = typeof query.role === 'string' ? query.role.trim() : undefined
  if (query.role !== undefined && (!role || role.length < 2 || role.length > 100)) {
    fields.role = 'Debe tener entre 2 y 100 caracteres.'
  }
  const page = query.page === undefined ? 1 : Number(query.page)
  const size = query.size === undefined ? 12 : Number(query.size)
  if (!Number.isSafeInteger(page) || page < 1 || (query.page !== undefined && !/^[1-9]\d*$/.test(query.page))) fields.page = 'Debe ser un entero positivo.'
  if (!Number.isInteger(size) || size < 1 || size > 50 || (query.size !== undefined && !/^[1-9]\d*$/.test(query.size))) fields.size = 'Debe ser un entero entre 1 y 50.'
  const sort = query.sort ?? 'joinedAt'
  const order = query.order ?? 'asc'
  if (!validSorts.includes(sort)) fields.sort = 'Selecciona un ordenamiento válido.'
  if (!['asc', 'desc'].includes(order)) fields.order = 'Selecciona una dirección válida.'
  if (Object.keys(fields).length) throw new HttpError(400, 'INVALID_QUERY', 'Revisa los parámetros de consulta.', fields)
  return { skill: query.skill?.toLowerCase(), role, page, size, sort, order }
}
