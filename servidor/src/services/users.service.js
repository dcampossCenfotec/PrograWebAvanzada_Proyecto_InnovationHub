import { HttpError } from '../errors/http-error.js'
import {
  validateEmptyQuery,
  validateProfileUpdate,
  validateSkillsQuery,
  validateUserId,
  validateUsersQuery,
} from '../validation/users.validation.js'

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function normalizeCatalogSearch(value) {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('es')
}

function pagination(page, size, total) {
  return { page, size, total, totalPages: Math.ceil(total / size) }
}

const notFound = () => new HttpError(404, 'NOT_FOUND', 'No se encontró el recurso solicitado.')

export function createUsersService({ usersRepository, catalogRepository, clock = () => new Date() }) {
  if (!usersRepository || !catalogRepository) {
    throw new TypeError('createUsersService requiere repositorios de usuarios y catálogos.')
  }

  return Object.freeze({
    async listUsers(query) {
      const input = validateUsersQuery(query)
      const filter = {}
      if (input.q) {
        const expression = new RegExp(escapeRegex(input.q), 'iu')
        filter.$or = [
          { firstName: expression },
          { lastName: expression },
          { career: expression },
          { bio: expression },
          { interests: expression },
        ]
      }
      if (input.skill) filter['skills.skillId'] = input.skill
      if (input.career) filter.career = new RegExp(`^${escapeRegex(input.career)}$`, 'iu')
      if (input.availability) filter.availability = input.availability
      const direction = input.order === 'asc' ? 1 : -1
      const sort = { [input.sort]: direction, id: direction }
      const [users, total] = await Promise.all([
        usersRepository.listActive({
          filter,
          sort,
          skip: (input.page - 1) * input.size,
          limit: input.size,
        }),
        usersRepository.countActive(filter),
      ])
      return { users, pagination: pagination(input.page, input.size, total) }
    },

    async getUser(id, actorId) {
      const validId = validateUserId(id)
      const user = await usersRepository.findActiveById(validId)
      if (!user) throw notFound()
      return { user, isOwn: user.id === actorId }
    },

    async updateOwnProfile(actorId, input) {
      const profile = validateProfileUpdate(input)
      const requestedSkillIds = profile.skills.map(({ skillId }) => skillId)
      const existingSkillIds = await catalogRepository.findExistingActiveSkillIds(requestedSkillIds)
      if (existingSkillIds.length !== requestedSkillIds.length) {
        throw new HttpError(400, 'VALIDATION_ERROR', 'Revisa los campos indicados.', {
          skills: 'Una o más competencias no existen o están inactivas.',
        })
      }
      const user = await usersRepository.updateActiveById(actorId, profile, clock())
      if (!user) throw notFound()
      return user
    },

    async listCategories(query) {
      validateEmptyQuery(query)
      return catalogRepository.listActiveCategories()
    },

    async listSkills(query) {
      const input = validateSkillsQuery(query)
      const filter = input.q
        ? { nameNormalized: new RegExp(escapeRegex(normalizeCatalogSearch(input.q)), 'iu') }
        : {}
      const [skills, total] = await Promise.all([
        catalogRepository.listActiveSkills({
          filter,
          skip: (input.page - 1) * input.size,
          limit: input.size,
        }),
        catalogRepository.countActiveSkills(filter),
      ])
      return { skills, pagination: pagination(input.page, input.size, total) }
    },
  })
}
