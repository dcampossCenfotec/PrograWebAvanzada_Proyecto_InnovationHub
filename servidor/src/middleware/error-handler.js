import { createErrorDto } from '../dto/error.dto.js'
import { HttpError } from '../errors/http-error.js'

function normalizeError(error) {
  if (error instanceof HttpError) return error

  if (error?.type === 'entity.parse.failed') {
    return new HttpError(400, 'INVALID_JSON', 'El cuerpo de la solicitud no contiene JSON válido.')
  }

  if (error?.type === 'entity.too.large') {
    return new HttpError(400, 'INVALID_JSON', 'El cuerpo JSON excede el tamaño permitido.')
  }

  return new HttpError(500, 'INTERNAL_ERROR', 'No fue posible completar la operación.')
}

export function createErrorHandler({ logger = console } = {}) {
  return function errorHandler(error, _request, response, next) {
    if (response.headersSent) {
      next(error)
      return
    }

    const normalized = normalizeError(error)
    if (normalized.status === 500) {
      logger.error(`Fallo interno de solicitud ${response.locals.requestId || 'sin-id'}.`)
    }
    response
      .status(normalized.status)
      .json(createErrorDto(normalized))
  }
}
