
import { toProjectDto } from '../dto/project.dto.js'

export function createProjectsController(service) {
  return Object.freeze({
    async create(req, res, next) {
      try {
        const result = toProjectDto(
          await service.create(
            req.params.id,
            req.auth.user.id,
            req.body,
            req.query,
          ),
        )

        res
          .location(`/api/projects/${result.id}`)
          .status(201)
          .json({ data: result })
      } catch (error) {
        next(error)
      }
    },

    async list(req, res, next) {
      try {
        const result = await service.list(
          req.query,
          req.auth?.user.id ?? null,
        )

        res.status(200).json({
          data: result.items.map(toProjectDto),
          pagination: result.pagination,
        })
      } catch (error) {
        next(error)
      }
    },

    async get(req, res, next) {
      try {
        const project = await service.get(
          req.params.id,
          req.auth?.user.id ?? null,
          req.query,
        )

        res.status(200).json({
          data: toProjectDto(project),
        })
      } catch (error) {
        next(error)
      }
    },
  })
}
