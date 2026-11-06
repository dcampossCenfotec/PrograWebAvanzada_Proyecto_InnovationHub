
import { toMembershipDto } from '../dto/membership.dto.js'

function hasBody(request) {
  return Number(request.get('content-length') ?? 0) > 0 || request.get('transfer-encoding') !== undefined
}

export function createMembersController(service) {
  return Object.freeze({
    async list(request, response, next) {
      try {
        const result = await service.list(request.params.id, request.auth?.user.id ?? null, request.query)
        response.status(200).json({ data: result.rows.map(toMembershipDto), pagination: result.pagination })
      } catch (error) { next(error) }
    },
    async remove(request, response, next) {
      try {
        await service.remove(request.params.id, request.params.userId, request.auth.user.id, {
          query: request.query, body: request.body, hasBody: hasBody(request),
        })
        response.status(204).end()
      } catch (error) { next(error) }
    },
  })
}
