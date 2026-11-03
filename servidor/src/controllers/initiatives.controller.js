import { toInitiativeDto } from '../dto/initiative.dto.js'

export function createInitiativesController(service, queriesService, removalService) {
  return Object.freeze({
    async deleteInitiative(request, response, next) {
      try {
        const result = await removalService.deleteInitiative(request.params.id, request.auth.user.id, {
          query: request.query, body: request.body,
          hasBody: Number(request.get('content-length') ?? 0) > 0
            || request.get('transfer-encoding') !== undefined,
        })
        if (result !== null) throw new TypeError('DELETE no puede confirmar un archivo.')
        response.status(204).end()
      } catch (error) { next(error) }
    },

    async archiveInitiative(request, response, next) {
      try {
        const result = await removalService.archiveInitiative(request.params.id, request.auth.user.id, {
          query: request.query, body: request.body,
          hasBody: Number(request.get('content-length') ?? 0) > 0
            || request.get('transfer-encoding') !== undefined,
        })
        response.status(200).json({ data: result })
      } catch (error) { next(error) }
    },

    async listInitiatives(request, response, next) {
      try {
        const result = await queriesService.listInitiatives(request.query, request.auth?.user.id ?? null)
        response.status(200).json({
          data: result.items.map((item) => toInitiativeDto(item, { detail: false })),
          pagination: result.pagination,
        })
      } catch (error) { next(error) }
    },

    async listOwnInitiatives(request, response, next) {
      try {
        const result = await queriesService.listInitiatives(request.query, request.auth.user.id, { mine: true })
        response.status(200).json({
          data: result.items.map((item) => toInitiativeDto(item, { detail: false })),
          pagination: result.pagination,
        })
      } catch (error) { next(error) }
    },

    async getInitiative(request, response, next) {
      try {
        const result = await queriesService.getInitiative(
          request.params.id, request.query, request.auth?.user.id ?? null,
        )
        response.status(200).json({ data: toInitiativeDto(result) })
      } catch (error) { next(error) }
    },

    async createInitiative(request, response, next) {
      try {
        const result = await service.createInitiative(request.auth.user, request.body)
        const dto = toInitiativeDto(result)
        response.location(`/api/initiatives/${dto.id}`).status(201).json({ data: dto })
      } catch (error) { next(error) }
    },

    async updateInitiative(request, response, next) {
      try {
        const result = await service.updateInitiative(
          request.params.id,
          request.auth.user,
          request.body,
        )
        response.status(200).json({ data: toInitiativeDto(result) })
      } catch (error) { next(error) }
    },
  })
}
