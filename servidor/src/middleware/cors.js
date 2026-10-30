import cors from 'cors'
import { HttpError } from '../errors/http-error.js'

export function createCorsMiddleware(clientOrigin) {
  return cors({
    origin(origin, callback) {
      if (!origin || origin === clientOrigin) {
        callback(null, true)
        return
      }
      callback(
        new HttpError(
          403,
          'FORBIDDEN',
          'El origen de la solicitud no está permitido.',
        ),
      )
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    exposedHeaders: ['X-Request-Id'],
    optionsSuccessStatus: 204,
  })
}
