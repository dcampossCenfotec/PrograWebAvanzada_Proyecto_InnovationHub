import { toInitiativeDto } from '../dto/initiative.dto.js'

export function createInitiativesController(service) {
  return Object.freeze({
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
