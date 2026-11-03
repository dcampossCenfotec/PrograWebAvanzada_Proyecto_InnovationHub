import { HttpError } from '../errors/http-error.js'

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const categoryPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const initiativeTypes = new Set(['idea', 'need', 'challenge'])
const visibilityValues = new Set(['public', 'institutional', 'restricted', 'private'])
const initiativeFields = new Set([
  'title', 'type', 'summary', 'description', 'problem', 'beneficiaries',
  'categoryId', 'skillIds', 'estimatedMembers', 'visibility', 'tags',
])

function validationError(fields) {
  return new HttpError(400, 'VALIDATION_ERROR', 'Revisa los campos indicados.', fields)
}

function ownObject(input) {
  return input && typeof input === 'object' && !Array.isArray(input)
}

function addUnknown(input, fields) {
  for (const key of Object.keys(input)) {
    if (!initiativeFields.has(key)) fields[key] = 'Este campo no está permitido.'
  }
}

function readTrimmed(value, field, minimum, maximum, fields) {
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

function duplicateKey(value) {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('es')
}

function readSkillIds(value, fields) {
  if (!Array.isArray(value)) {
    fields.skillIds = 'Debe ser un arreglo.'
    return []
  }
  if (value.length < 1 || value.length > 10) {
    fields.skillIds = 'Debe contener entre 1 y 10 competencias.'
    return []
  }
  const result = []
  const seen = new Set()
  for (const skillId of value) {
    if (typeof skillId !== 'string' || !uuidPattern.test(skillId)) {
      fields.skillIds = 'Cada competencia debe usar un UUID válido.'
      return []
    }
    const normalized = skillId.toLocaleLowerCase('en-US')
    if (seen.has(normalized)) {
      fields.skillIds = 'No se permiten competencias duplicadas.'
      return []
    }
    seen.add(normalized)
    result.push(normalized)
  }
  return result
}

function readTags(value, fields) {
  if (!Array.isArray(value)) {
    fields.tags = 'Debe ser un arreglo.'
    return []
  }
  if (value.length > 10) {
    fields.tags = 'Acepta como máximo 10 etiquetas.'
    return []
  }
  const result = []
  const seen = new Set()
  for (const tag of value) {
    if (typeof tag !== 'string' || tag.trim().length < 1 || tag.trim().length > 40) {
      fields.tags = 'Cada etiqueta debe tener entre 1 y 40 caracteres.'
      return []
    }
    const normalized = tag.trim()
    const key = duplicateKey(normalized)
    if (seen.has(key)) {
      fields.tags = 'No se permiten etiquetas duplicadas.'
      return []
    }
    seen.add(key)
    result.push(normalized)
  }
  return result
}

export function validateInitiativeId(id) {
  if (typeof id !== 'string' || !uuidPattern.test(id)) {
    throw validationError({ id: 'Debe ser un UUID válido.' })
  }
  return id.toLocaleLowerCase('en-US')
}

export function validateInitiativeInput(input) {
  if (!ownObject(input)) throw validationError({ body: 'Debe ser un objeto JSON.' })
  const fields = {}
  addUnknown(input, fields)
  for (const field of initiativeFields) {
    if (!(field in input)) fields[field] = 'Es obligatorio.'
  }

  const title = readTrimmed(input.title, 'title', 5, 100, fields)
  const summary = readTrimmed(input.summary, 'summary', 15, 240, fields)
  const description = readTrimmed(input.description, 'description', 20, 2000, fields)
  const problem = readTrimmed(input.problem, 'problem', 10, 500, fields)
  const beneficiaries = readTrimmed(input.beneficiaries, 'beneficiaries', 3, 150, fields)
  if (!initiativeTypes.has(input.type)) fields.type = 'Selecciona un tipo válido.'
  if (typeof input.categoryId !== 'string' || !categoryPattern.test(input.categoryId)) {
    fields.categoryId = 'Selecciona una categoría válida.'
  }
  if (!Number.isInteger(input.estimatedMembers) || input.estimatedMembers < 1 || input.estimatedMembers > 100) {
    fields.estimatedMembers = 'Debe ser un entero entre 1 y 100.'
  }
  if (!visibilityValues.has(input.visibility)) fields.visibility = 'Selecciona una visibilidad válida.'
  const skillIds = readSkillIds(input.skillIds, fields)
  const tags = readTags(input.tags, fields)

  if (Object.keys(fields).length) throw validationError(fields)
  return {
    title,
    type: input.type,
    summary,
    description,
    problem,
    beneficiaries,
    categoryId: input.categoryId,
    skillIds,
    estimatedMembers: input.estimatedMembers,
    visibility: input.visibility,
    tags,
  }
}
