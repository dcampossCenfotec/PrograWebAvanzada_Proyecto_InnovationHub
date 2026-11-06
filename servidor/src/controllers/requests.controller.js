
import { toRequestDto } from '../dto/request.dto.js'
import { validateEmptyRequestQuery, validateNoRequestPayload } from '../validation/requests.validation.js'

function hasBody(request) {
  return Number(request.get('content-length') ?? 0) > 0 || request.get('transfer-encoding') !== undefined
}

export function createRequestsController(service) {
  if (!service) throw new TypeError('Se requiere el servicio de solicitudes.')
  return Object.freeze({
    async create(request, response, next) {
      try {
        validateEmptyRequestQuery(request.query)
        const result = await service.create(request.params.id, request.auth.user.id, request.body)
        const dto = toRequestDto(result)
        response.location(`/api/requests/${dto.id}`).status(201).json({ data: dto })
      } catch (error) { next(error) }
    },
    async list(request, response, next) {
      try {
        const result = await service.list(request.query, request.auth.user.id)
        response.status(200).json({
          data: result.items.map(toRequestDto), pagination: result.pagination,
        })
      } catch (error) { next(error) }
    },
    async get(request, response, next) {
      try {
        validateEmptyRequestQuery(request.query)
        const result = await service.get(request.params.id, request.auth.user.id)
        response.status(200).json({ data: toRequestDto(result) })
      } catch (error) { next(error) }
    },
    async update(request, response, next) {
      try {
        validateEmptyRequestQuery(request.query)
        const result = await service.update(request.params.id, request.auth.user.id, request.body)
        response.status(200).json({ data: toRequestDto(result) })
      } catch (error) { next(error) }
    },
    async cancel(request, response, next) {
      try {
        validateNoRequestPayload(request.query, request.body, hasBody(request))
        const result = await service.cancel(request.params.id, request.auth.user.id)
        response.status(200).json({ data: toRequestDto(result) })
      } catch (error) { next(error) }
    },
  })
}
