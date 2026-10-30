import { toAuthUserDto, toOwnUserDto } from '../dto/user.dto.js'
import { HttpError } from '../errors/http-error.js'

function toSessionDto(result) {
  return {
    user: toAuthUserDto(result.user),
    accessToken: result.accessToken,
    expiresAt: result.expiresAt.toISOString(),
  }
}

export function createAuthController(authService) {
  return Object.freeze({
    async register(request, response, next) {
      try {
        const result = await authService.register(request.body)
        response.location(`/api/users/${result.user.id}`).status(201).json({ data: toSessionDto(result) })
      } catch (error) { next(error) }
    },
    async login(request, response, next) {
      try {
        const result = await authService.login(request.body)
        response.status(200).json({ data: toSessionDto(result) })
      } catch (error) { next(error) }
    },
    async logout(request, response, next) {
      try {
        if (request.body && Object.keys(request.body).length > 0) {
          throw new HttpError(400, 'VALIDATION_ERROR', 'Esta operación no acepta cuerpo.', {
            body: 'Debe omitirse.',
          })
        }
        await authService.logout(request.auth.sessionId)
        response.status(204).end()
      } catch (error) { next(error) }
    },
    me(request, response) {
      response.status(200).json({ data: toOwnUserDto(request.auth.user) })
    },
  })
}
