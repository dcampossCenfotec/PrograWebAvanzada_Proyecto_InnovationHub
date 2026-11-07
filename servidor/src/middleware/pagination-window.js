
import { HttpError } from '../errors/http-error.js'

// Solo listados de tamaño variable: /categories es un catálogo acotado.
const LIST_ROUTES = [
  /^\/api\/users\/?$/,
  /^\/api\/skills\/?$/,
  /^\/api\/initiatives\/?$/,
  /^\/api\/initiatives\/mine\/?$/,
  /^\/api\/requests\/?$/,
  /^\/api\/projects\/?$/,
  /^\/api\/initiatives\/[^/]+\/members\/?$/,
]

export function isPaginatedRoute(method, path) {
  return method === 'GET' &&
    LIST_ROUTES.some((route) => route.test(path))
}

export function validatePaginationWindow(query) {
  const errors = {}

  const parse = (name, fallback, maximum) => {
    const value = query[name]
    if (value === undefined) return fallback

    if (
      typeof value !== 'string' ||
      !/^[1-9]\d*$/.test(value)
    ) {
      errors[name] = `Debe ser un entero entre 1 y ${maximum}.`
      return fallback
    }

    const number = Number(value)

    if (
      !Number.isSafeInteger(number) ||
      number > maximum
    ) {
      errors[name] = `Debe ser un entero entre 1 y ${maximum}.`
      return fallback
    }

    return number
  }

  const page = parse('page', 1, Number.MAX_SAFE_INTEGER)
  const size = parse('size', 12, 50)

  if (!Number.isSafeInteger((page - 1) * size)) {
    errors.page =
      'La página excede el rango de desplazamiento seguro.'
  }

  if (Object.keys(errors).length) {
    throw new HttpError(
      400,
      'INVALID_QUERY',
      'Revisa los parámetros de consulta.',
      errors,
    )
  }

  return { page, size }
}

export function paginationWindowMiddleware(request, _response, next) {
  try {
    if (isPaginatedRoute(request.method, request.path)) {
      validatePaginationWindow(request.query)
    }
    next()
  } catch (error) {
    next(error)
  }
}
