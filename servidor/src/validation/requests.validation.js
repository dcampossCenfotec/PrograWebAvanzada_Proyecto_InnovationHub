
import { HttpError } from '../errors/http-error.js'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const FIELDS = new Set(['message', 'offeredSkillId', 'role', 'availability'])
const QUERY = new Set(['scope', 'initiativeId', 'state', 'skill', 'role', 'from', 'to', 'page', 'size', 'sort', 'order'])
const STATES = new Set(['pending', 'accepted', 'rejected', 'cancelled'])
const AVAILABILITY = new Set(['low', 'medium', 'high'])

function invalid(fields, query = false) {
  throw new HttpError(400, query ? 'INVALID_QUERY' : 'VALIDATION_ERROR',
    query ? 'Revisa los parámetros de consulta.' : 'Revisa los campos indicados.', fields)
}

export function validateRequestId(value) {
  if (typeof value !== 'string' || !UUID.test(value)) invalid({ id: 'Debe ser un UUID válido.' })
  return value.toLowerCase()
}

export function validateRequestBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) invalid({ body: 'Debe ser un objeto JSON.' })
  const fields = {}
  for (const key of Object.keys(body)) if (!FIELDS.has(key)) fields[key] = 'Este campo no está permitido.'
  for (const key of FIELDS) if (!Object.hasOwn(body, key)) fields[key] = 'Es obligatorio.'
  const message = typeof body.message === 'string' ? body.message.trim() : ''
  const role = typeof body.role === 'string' ? body.role.trim() : ''
  if (message.length < 15 || message.length > 500) fields.message = 'Debe tener entre 15 y 500 caracteres.'
  if (role.length < 3 || role.length > 100) fields.role = 'Debe tener entre 3 y 100 caracteres.'
  if (typeof body.offeredSkillId !== 'string' || !UUID.test(body.offeredSkillId)) {
    fields.offeredSkillId = 'Selecciona una competencia válida.'
  }
  if (!AVAILABILITY.has(body.availability)) fields.availability = 'Selecciona una disponibilidad válida.'
  if (Object.keys(fields).length) invalid(fields)
  return { message, role, offeredSkillId: body.offeredSkillId.toLowerCase(), availability: body.availability }
}

export function validateRequestQuery(query, { allowReceived = false } = {}) {
  const fields = {}
  for (const key of Object.keys(query)) if (!QUERY.has(key)) fields[key] = 'Este parámetro no está permitido.'
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value) || (value !== null && typeof value === 'object')) {
      fields[key] = 'Debe enviarse una sola vez.'
    }
  }
  const scope = query.scope
  if (!['mine', ...(allowReceived ? ['received'] : [])].includes(scope)) {
    fields.scope = 'Selecciona un alcance válido.'
  }
  if (query.initiativeId !== undefined && !UUID.test(query.initiativeId)) {
    fields.initiativeId = 'Debe ser un UUID válido.'
  }
  if (query.state !== undefined && !STATES.has(query.state)) fields.state = 'Selecciona un estado válido.'
  if (query.skill !== undefined && !UUID.test(query.skill)) fields.skill = 'Debe ser un UUID válido.'
  const role = typeof query.role === 'string' ? query.role.trim() : undefined
  if (query.role !== undefined && (!role || role.length < 2 || role.length > 100)) {
    fields.role = 'Debe tener entre 2 y 100 caracteres.'
  }
  const dates = {}
  for (const key of ['from', 'to']) {
    if (query[key] === undefined) continue
    const date = typeof query[key] === 'string' ? new Date(query[key]) : new Date(NaN)
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(query[key])
      || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 19) !== query[key].slice(0, 19)) {
      fields[key] = 'Debe ser una fecha ISO 8601 UTC válida.'
    } else dates[key] = date
  }
  if (dates.from && dates.to && dates.from > dates.to) fields.to = 'Debe ser posterior o igual a from.'
  const page = query.page === undefined ? 1 : Number(query.page)
  const size = query.size === undefined ? 12 : Number(query.size)
  if (query.page !== undefined && !/^[1-9]\d*$/.test(query.page)) fields.page = 'Debe ser un entero positivo.'
  if (!Number.isSafeInteger(page) || page < 1) fields.page = 'Debe ser un entero positivo.'
  if (query.size !== undefined && !/^[1-9]\d*$/.test(query.size)) fields.size = 'Debe ser un entero entre 1 y 50.'
  if (!Number.isInteger(size) || size < 1 || size > 50) fields.size = 'Debe ser un entero entre 1 y 50.'
  const sort = query.sort ?? 'createdAt'
  const order = query.order ?? 'desc'
  if (!['createdAt', 'updatedAt', 'state'].includes(sort)) fields.sort = 'Selecciona un ordenamiento válido.'
  if (!['asc', 'desc'].includes(order)) fields.order = 'Selecciona una dirección válida.'
  if (Object.keys(fields).length) invalid(fields, true)
  return {
    scope, initiativeId: query.initiativeId?.toLowerCase(), state: query.state,
    skill: query.skill?.toLowerCase(), role, from: dates.from, to: dates.to,
    page, size, sort, order,
  }
}

export function validateNoRequestPayload(query, body, hasBody) {
  if (Object.keys(query ?? {}).length) invalid(Object.fromEntries(Object.keys(query).map((key) => [key, 'No se permiten parámetros.'])), true)
  if (hasBody || body !== undefined) invalid({ body: 'Esta operación no recibe cuerpo JSON.' })
}

export function validateEmptyRequestQuery(query) {
  if (Object.keys(query).length) invalid(Object.fromEntries(Object.keys(query).map((key) => [key, 'No se permiten parámetros.'])), true)
}
