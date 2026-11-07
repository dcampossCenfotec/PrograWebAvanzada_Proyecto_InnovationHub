
import { HttpError } from '../errors/http-error.js'
import { validateInitiativeId } from './initiatives.validation.js'

const fields = new Set([
  'name',
  'description',
  'objective',
  'technologies',
  'startDate',
  'estimatedEndDate',
  'repositoryUrl',
])

const error = (details, query = false) => {
  throw new HttpError(
    400,
    query ? 'INVALID_QUERY' : 'VALIDATION_ERROR',
    'Revisa los campos indicados.',
    details,
  )
}

const string = (value, key, min, max, issues) => {
  const text = typeof value === 'string' ? value.trim() : ''
  if (text.length < min || text.length > max) {
    issues[key] = `Debe contener entre ${min} y ${max} caracteres.`
  }
  return text
}

function calendarDay(value) {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) return false

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() + 1 === month &&
    date.getUTCDate() === day
  )
}

export function validateProjectId(id) {
  return validateInitiativeId(id)
}

export function validateProjectBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    error({ body: 'Se requiere objeto JSON.' })
  }

  const issues = {}
  for (const key of Object.keys(body)) {
    if (!fields.has(key)) {
      issues[key] = 'Campo no permitido.'
    }
  }

  const name = string(body.name, 'name', 5, 120, issues)
  const description = string(
    body.description, 'description', 20, 2000, issues,
  )
  const objective = string(
    body.objective, 'objective', 10, 500, issues,
  )

  const technologies = Array.isArray(body.technologies)
    ? body.technologies.map((x) =>
      typeof x === 'string' ? x.trim() : '')
    : []

  if (
    !technologies.length ||
    technologies.length > 20 ||
    technologies.some((x) => x.length < 1 || x.length > 50) ||
    new Set(
      technologies.map((x) => x.toLocaleLowerCase('es')),
    ).size !== technologies.length
  ) {
    issues.technologies =
      'Indica entre 1 y 20 tecnologías únicas de 1 a 50 caracteres.'
  }

  if (!calendarDay(body.startDate)) {
    issues.startDate = 'Indica una fecha real YYYY-MM-DD.'
  }

  const estimatedEndDate = body.estimatedEndDate ?? null

  if (
    estimatedEndDate !== null &&
    (
      !calendarDay(estimatedEndDate) ||
      (
        calendarDay(body.startDate) &&
        estimatedEndDate < body.startDate
      )
    )
  ) {
    issues.estimatedEndDate =
      'La fecha final debe ser válida y no preceder al inicio.'
  }

  const repositoryUrl =
    body.repositoryUrl == null || body.repositoryUrl === ''
      ? null
      : string(body.repositoryUrl, 'repositoryUrl', 1, 2048, issues)

  if (repositoryUrl) {
    try {
      const url = new URL(repositoryUrl)
      if (
        !['http:', 'https:'].includes(url.protocol) ||
        !url.hostname
      ) {
        issues.repositoryUrl = 'Se requiere URL HTTP(S) válida.'
      }
    } catch {
      issues.repositoryUrl = 'Se requiere URL HTTP(S) válida.'
    }
  }

  if (Object.keys(issues).length) error(issues)

  return {
    name,
    description,
    objective,
    technologies,
    startDate: body.startDate,
    estimatedEndDate,
    repositoryUrl,
  }
}

export function validateProjectsQuery(query) {
  const issues = {}

  for (const [key, value] of Object.entries(query)) {
    if (!['page', 'size', 'sort', 'order'].includes(key)) {
      issues[key] = 'Parámetro no permitido.'
    }
    if (typeof value !== 'string') {
      issues[key] = 'Se espera un único valor.'
    }
  }

  const page = query.page === undefined ? 1 : Number(query.page)
  const size = query.size === undefined ? 12 : Number(query.size)

  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    (query.page && !/^[1-9]\d*$/.test(query.page))
  ) {
    issues.page = 'Entero positivo.'
  }

  if (
    !Number.isInteger(size) ||
    size < 1 ||
    size > 50 ||
    (query.size && !/^[1-9]\d*$/.test(query.size))
  ) {
    issues.size = 'Entero entre 1 y 50.'
  }

  const sort = query.sort ?? 'createdAt'
  const order = query.order ?? 'desc'

  if (
    !['createdAt', 'updatedAt', 'name', 'startDate'].includes(sort)
  ) {
    issues.sort = 'Ordenamiento no permitido.'
  }

  if (!['asc', 'desc'].includes(order)) {
    issues.order = 'Dirección no permitida.'
  }

  if (Object.keys(issues).length) error(issues, true)

  return { page, size, sort, order }
}

export function validateProjectEmptyQuery(query) {
  if (Object.keys(query).length) {
    error(
      Object.fromEntries(
        Object.keys(query).map((x) =>
          [x, 'Parámetro no permitido.']),
      ),
      true,
    )
  }
}
