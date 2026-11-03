import { HttpError } from '../errors/http-error.js'
import { MEMBER_TYPES } from '../models/auth.models.js'

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const availabilityValues = new Set(['low', 'medium', 'high'])
const skillLevels = new Set(['basic', 'intermediate', 'advanced'])
const userSorts = new Set(['firstName', 'lastName', 'career', 'createdAt'])
const orderValues = new Set(['asc', 'desc'])
const profileFields = new Set([
  'firstName', 'lastName', 'memberType', 'career', 'bio', 'interests', 'availability', 'portfolioUrl', 'skills',
])

function validationError(fields) {
  return new HttpError(400, 'VALIDATION_ERROR', 'Revisa los campos indicados.', fields)
}

function queryError(fields) {
  return new HttpError(400, 'INVALID_QUERY', 'Revisa los parámetros de consulta.', fields)
}

function ownObject(input) {
  return input && typeof input === 'object' && !Array.isArray(input)
}

function addUnknown(input, allowed, fields) {
  for (const key of Object.keys(input)) {
    if (!allowed.has(key)) fields[key] = 'Este campo no está permitido.'
  }
}

function readSingleQuery(query, key, fields) {
  const value = query[key]
  if (Array.isArray(value) || (value && typeof value === 'object')) {
    fields[key] = 'Debe enviarse una sola vez.'
    return undefined
  }
  return value
}

function readTrimmed(value, field, { minimum, maximum, nullable = false }, fields) {
  if (nullable && value === null) return null
  if (typeof value !== 'string') {
    fields[field] = nullable ? 'Debe ser texto o null.' : 'Debe ser texto.'
    return ''
  }
  const normalized = value.trim()
  if (normalized.length < minimum || normalized.length > maximum) {
    fields[field] = `Debe tener entre ${minimum} y ${maximum} caracteres.`
  }
  return normalized
}

function readPositiveInteger(value, field, { minimum, maximum, fallback }, fields) {
  if (value === undefined) return fallback
  if (!/^[1-9]\d*$/.test(value)) {
    fields[field] = `Debe ser un entero entre ${minimum} y ${maximum}.`
    return fallback
  }
  const parsed = Number(value)
  if (parsed < minimum || parsed > maximum) {
    fields[field] = `Debe ser un entero entre ${minimum} y ${maximum}.`
  }
  return parsed
}

export function validateUserId(id) {
  if (!uuidPattern.test(id)) throw validationError({ id: 'Debe ser un UUID válido.' })
  return id.toLocaleLowerCase('en-US')
}

export function validateUsersQuery(query) {
  const allowed = new Set(['q', 'skill', 'career', 'availability', 'page', 'size', 'sort', 'order'])
  const fields = {}
  addUnknown(query, allowed, fields)
  const values = Object.fromEntries([...allowed].map((key) => [key, readSingleQuery(query, key, fields)]))
  const q = values.q === undefined ? undefined : readTrimmed(values.q, 'q', { minimum: 2, maximum: 100 }, fields)
  const career = values.career === undefined
    ? undefined
    : readTrimmed(values.career, 'career', { minimum: 2, maximum: 100 }, fields)
  if (values.skill !== undefined && !uuidPattern.test(values.skill)) fields.skill = 'Debe ser un UUID válido.'
  if (values.availability !== undefined && !availabilityValues.has(values.availability)) {
    fields.availability = 'Selecciona una disponibilidad válida.'
  }
  const page = readPositiveInteger(values.page, 'page', { minimum: 1, maximum: Number.MAX_SAFE_INTEGER, fallback: 1 }, fields)
  const size = readPositiveInteger(values.size, 'size', { minimum: 1, maximum: 50, fallback: 12 }, fields)
  const sort = values.sort ?? 'lastName'
  if (!userSorts.has(sort)) fields.sort = 'Selecciona un ordenamiento válido.'
  const order = values.order ?? 'asc'
  if (!orderValues.has(order)) fields.order = 'Selecciona una dirección válida.'
  if (Object.keys(fields).length) throw queryError(fields)
  return {
    q,
    skill: values.skill?.toLocaleLowerCase('en-US'),
    career,
    availability: values.availability,
    page,
    size,
    sort,
    order,
  }
}

export function validateSkillsQuery(query) {
  const allowed = new Set(['q', 'page', 'size'])
  const fields = {}
  addUnknown(query, allowed, fields)
  const qValue = readSingleQuery(query, 'q', fields)
  const pageValue = readSingleQuery(query, 'page', fields)
  const sizeValue = readSingleQuery(query, 'size', fields)
  const q = qValue === undefined ? undefined : readTrimmed(qValue, 'q', { minimum: 2, maximum: 100 }, fields)
  const page = readPositiveInteger(pageValue, 'page', { minimum: 1, maximum: Number.MAX_SAFE_INTEGER, fallback: 1 }, fields)
  const size = readPositiveInteger(sizeValue, 'size', { minimum: 1, maximum: 50, fallback: 12 }, fields)
  if (Object.keys(fields).length) throw queryError(fields)
  return { q, page, size }
}

export function validateEmptyQuery(query) {
  const fields = {}
  addUnknown(query, new Set(), fields)
  if (Object.keys(fields).length) throw queryError(fields)
}

export function validateProfileUpdate(input) {
  if (!ownObject(input)) throw validationError({ body: 'Debe ser un objeto JSON.' })
  const fields = {}
  addUnknown(input, profileFields, fields)
  for (const field of profileFields) {
    if (!(field in input)) fields[field] = 'Es obligatorio en una actualización completa.'
  }

  const firstName = readTrimmed(input.firstName, 'firstName', { minimum: 2, maximum: 60 }, fields)
  const lastName = readTrimmed(input.lastName, 'lastName', { minimum: 2, maximum: 80 }, fields)
  if (!MEMBER_TYPES.includes(input.memberType)) fields.memberType = 'Selecciona un tipo de miembro válido.'
  const career = readTrimmed(input.career, 'career', { minimum: 2, maximum: 120, nullable: true }, fields)
  const bio = readTrimmed(input.bio, 'bio', { minimum: 1, maximum: 600, nullable: true }, fields)
  const portfolioUrl = readTrimmed(
    input.portfolioUrl,
    'portfolioUrl',
    { minimum: 1, maximum: 2048, nullable: true },
    fields,
  )
  if (portfolioUrl) {
    try {
      const url = new URL(portfolioUrl)
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('protocol')
    } catch {
      fields.portfolioUrl = 'Debe ser una URL HTTP(S) válida.'
    }
  }
  if (!availabilityValues.has(input.availability)) fields.availability = 'Selecciona una disponibilidad válida.'

  const interests = []
  if (!Array.isArray(input.interests)) {
    fields.interests = 'Debe ser un arreglo.'
  } else if (input.interests.length > 15) {
    fields.interests = 'Acepta como máximo 15 intereses.'
  } else {
    const seen = new Set()
    for (const value of input.interests) {
      if (typeof value !== 'string' || value.trim().length < 1 || value.trim().length > 40) {
        fields.interests = 'Cada interés debe tener entre 1 y 40 caracteres.'
        break
      }
      const normalized = value.trim()
      const duplicateKey = normalized.toLocaleLowerCase('es')
      if (seen.has(duplicateKey)) {
        fields.interests = 'No se permiten intereses duplicados.'
        break
      }
      seen.add(duplicateKey)
      interests.push(normalized)
    }
  }

  const skills = []
  if (!Array.isArray(input.skills)) {
    fields.skills = 'Debe ser un arreglo.'
  } else if (input.skills.length > 20) {
    fields.skills = 'Acepta como máximo 20 competencias.'
  } else {
    const seen = new Set()
    for (const entry of input.skills) {
      if (!ownObject(entry) || Object.keys(entry).some((key) => !['skillId', 'level'].includes(key))) {
        fields.skills = 'Cada competencia debe contener únicamente skillId y level.'
        break
      }
      if (!uuidPattern.test(entry.skillId)) {
        fields.skills = 'Cada competencia debe usar un UUID válido.'
        break
      }
      if (!skillLevels.has(entry.level)) {
        fields.skills = 'Cada competencia debe tener un nivel válido.'
        break
      }
      const normalizedSkillId = entry.skillId.toLocaleLowerCase('en-US')
      if (seen.has(normalizedSkillId)) {
        fields.skills = 'No se permiten competencias duplicadas.'
        break
      }
      seen.add(normalizedSkillId)
      skills.push({ skillId: normalizedSkillId, level: entry.level })
    }
  }

  if (Object.keys(fields).length) throw validationError(fields)
  return {
    firstName,
    lastName,
    memberType: input.memberType,
    career,
    bio,
    interests,
    availability: input.availability,
    portfolioUrl,
    skills,
  }
}
