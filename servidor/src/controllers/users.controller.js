import { toOwnUserDto, toPublicUserDto } from '../dto/user.dto.js'

function toCatalogDto(entry) {
  return { id: entry.id, name: entry.name }
}

export function createUsersController(service) {
  return Object.freeze({
    async listUsers(request, response, next) {
      try {
        const result = await service.listUsers(request.query)
        response.status(200).json({
          data: result.users.map(toPublicUserDto),
          pagination: result.pagination,
        })
      } catch (error) { next(error) }
    },

    async getUser(request, response, next) {
      try {
        const result = await service.getUser(request.params.id, request.auth.user.id)
        response.status(200).json({
          data: result.isOwn ? toOwnUserDto(result.user) : toPublicUserDto(result.user),
        })
      } catch (error) { next(error) }
    },

    async updateOwnProfile(request, response, next) {
      try {
        const user = await service.updateOwnProfile(request.auth.user.id, request.body)
        response.status(200).json({ data: toOwnUserDto(user) })
      } catch (error) { next(error) }
    },

    async listCategories(request, response, next) {
      try {
        const categories = await service.listCategories(request.query)
        response.status(200).json({ data: categories.map(toCatalogDto) })
      } catch (error) { next(error) }
    },

    async listSkills(request, response, next) {
      try {
        const result = await service.listSkills(request.query)
        response.status(200).json({
          data: result.skills.map(toCatalogDto),
          pagination: result.pagination,
        })
      } catch (error) { next(error) }
    },
  })
}
