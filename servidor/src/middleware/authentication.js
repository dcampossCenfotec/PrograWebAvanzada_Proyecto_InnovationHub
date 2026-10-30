import { HttpError } from '../errors/http-error.js'

function readBearerToken(header) {
  if (typeof header !== 'string') return null
  const match = /^Bearer ([A-Za-z0-9_-]+)$/.exec(header)
  return match?.[1] ?? null
}

export function createAuthenticationMiddleware(authService) {
  if (!authService) throw new TypeError('createAuthenticationMiddleware requiere el servicio de autenticación.')

  return async function requireSession(request, response, next) {
    try {
      const token = readBearerToken(request.get('authorization'))
      if (!token) throw new HttpError(401, 'AUTHENTICATION_REQUIRED', 'Se requiere una sesión válida.')
      const authentication = await authService.authenticate(token)
      request.auth = {
        user: authentication.user,
        sessionId: authentication.session.id,
      }
      response.locals.actor = { userId: authentication.user.id, sessionId: authentication.session.id }
      next()
    } catch (error) {
      next(error)
    }
  }
}
