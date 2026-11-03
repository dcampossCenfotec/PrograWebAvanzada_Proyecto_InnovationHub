import { HttpError } from '../errors/http-error.js'
import { validateInitiativeId } from '../validation/initiatives.validation.js'
import { validateInitiativeQuery } from '../validation/initiative-query.validation.js'
import { validateEmptyQuery } from '../validation/users.validation.js'
import { requireInitiativeDetailsAccess } from './initiative-access.js'

export function createInitiativeQueriesService({ repository }) {
  return Object.freeze({
    async listInitiatives(query, actorId = null, { mine = false } = {}) {
      const input = validateInitiativeQuery(query, { mine })
      const result = await repository.list(input, actorId, { mine })
      return {
        items: result.items,
        pagination: {
          page: input.page, size: input.size, total: result.total,
          totalPages: Math.ceil(result.total / input.size),
        },
      }
    },

    async getInitiative(id, query, actorId = null) {
      const validId = validateInitiativeId(id)
      validateEmptyQuery(query)
      const result = await repository.findDetailedById(validId, actorId)
      if (!result) throw new HttpError(404, 'NOT_FOUND', 'No se encontró el recurso solicitado.')
      requireInitiativeDetailsAccess(result.initiative, actorId, result.isMember)
      return result
    },
  })
}
