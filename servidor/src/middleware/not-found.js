import { HttpError } from '../errors/http-error.js'

export function notFoundMiddleware(_request, _response, next) {
  next(new HttpError(404, 'NOT_FOUND', 'No se encontró el recurso solicitado.'))
}
