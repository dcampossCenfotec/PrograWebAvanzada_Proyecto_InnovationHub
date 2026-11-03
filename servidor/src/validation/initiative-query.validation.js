import { HttpError } from '../errors/http-error.js'

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const listFields = ['type', 'category', 'skill', 'q', 'state', 'hasSpaces', 'ownerId', 'page', 'size', 'sort', 'order']
const mineFields = ['page', 'size', 'sort', 'order']

export function validateInitiativeQuery(query, { mine = false } = {}) {
  const allowed = mine ? mineFields : listFields
  const fields = Object.create(null)
  const values = Object.create(null)
  for (const [key, value] of Object.entries(query)) {
    if (!allowed.includes(key)) {
      fields[key] = 'Este parámetro no está permitido.'
    } else if (typeof value !== 'string') {
      fields[key] = 'Debe enviarse una sola vez como texto.'
    } else {
      values[key] = value
    }
  }
  function integer(key, fallback, maximum) {
    if (values[key] === undefined) return fallback
    const parsed = Number(values[key])
    if (!/^[1-9]\d*$/.test(values[key]) || !Number.isSafeInteger(parsed) || parsed > maximum) {
      fields[key] = `Debe ser un entero entre 1 y ${maximum}.`
      return fallback
    }
    return parsed
  }
  const page = integer('page', 1, Number.MAX_SAFE_INTEGER)
  const size = integer('size', 12, 50)
  if (!Number.isSafeInteger((page - 1) * size)) fields.page = 'La página solicitada excede el rango permitido.'
  const sort = values.sort ?? 'createdAt'
  const sorts = mine ? ['createdAt', 'updatedAt', 'title', 'state'] : ['createdAt', 'updatedAt', 'title', 'memberCount']
  if (!sorts.includes(sort)) fields.sort = 'Selecciona un ordenamiento válido.'
  const order = values.order ?? 'desc'
  if (!['asc', 'desc'].includes(order)) fields.order = 'Selecciona una dirección válida.'

  const q = values.q?.trim()
  if (q !== undefined && (q.length < 2 || q.length > 100)) fields.q = 'Debe tener entre 2 y 100 caracteres.'
  if (values.type !== undefined && !['idea', 'need', 'challenge'].includes(values.type)) fields.type = 'Selecciona un tipo válido.'
  if (values.state !== undefined && !['published', 'forming_team', 'converted'].includes(values.state)) fields.state = 'Selecciona un estado de catálogo válido.'
  if (values.category !== undefined && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.category)) fields.category = 'Debe ser un ID de categoría válido.'
  for (const key of ['skill', 'ownerId']) {
    if (values[key] !== undefined && !uuidPattern.test(values[key])) fields[key] = 'Debe ser un UUID válido.'
  }
  if (values.hasSpaces !== undefined && !['true', 'false'].includes(values.hasSpaces)) fields.hasSpaces = 'Debe ser true o false.'
  if (Object.keys(fields).length) {
    throw new HttpError(400, 'INVALID_QUERY', 'Revisa los parámetros de consulta.', fields)
  }
  return {
    page, size, sort, order, q,
    type: values.type, category: values.category, state: values.state,
    skill: values.skill?.toLowerCase(), ownerId: values.ownerId?.toLowerCase(),
    hasSpaces: values.hasSpaces === undefined ? undefined : values.hasSpaces === 'true',
  }
}
