import { randomUUID } from 'node:crypto'
import { runInTransaction } from '../database/transaction.js'
import { HttpError } from '../errors/http-error.js'
import { validateInitiativeId, validateInitiativeInput } from '../validation/initiatives.validation.js'
import { initiativeSearchFields } from './initiative-search.js'

const notFound = () => new HttpError(404, 'NOT_FOUND', 'No se encontró el recurso solicitado.')
const forbidden = () => new HttpError(403, 'FORBIDDEN', 'No tienes permiso para realizar esta acción.')

function validationError(fields) {
  return new HttpError(400, 'VALIDATION_ERROR', 'Revisa los campos indicados.', fields)
}

export function createInitiativesService({
  connection,
  initiativesRepository,
  catalogRepository,
  clock = () => new Date(),
  createId = randomUUID,
  transactionRunner = runInTransaction,
}) {
  if (!connection || !initiativesRepository || !catalogRepository) {
    throw new TypeError('createInitiativesService requiere conexión y repositorios.')
  }

  async function resolveCatalogs(input, session) {
    const category = await catalogRepository.findActiveCategoryById(input.categoryId, { session })
    const skills = await catalogRepository.findActiveSkillsByIds(input.skillIds, { session })
    const fields = {}
    if (!category) fields.categoryId = 'La categoría no existe o está inactiva.'
    if (skills.length !== input.skillIds.length) {
      fields.skillIds = 'Una o más competencias no existen o están inactivas.'
    }
    if (Object.keys(fields).length) throw validationError(fields)
    return { category, skills }
  }

  return Object.freeze({
    async createInitiative(owner, body) {
      const input = validateInitiativeInput(body)
      const now = clock()
      return transactionRunner(connection, async (session) => {
        const catalogs = await resolveCatalogs(input, session)
        const initiativeId = createId()
        const membershipId = createId()
        const initiative = await initiativesRepository.createAggregate({
          initiative: {
            id: initiativeId,
            ownerId: owner.id,
            ...input,
            state: 'published',
            ...initiativeSearchFields(input),
            revision: 0,
            createdAt: now,
            updatedAt: now,
          },
          membership: {
            id: membershipId,
            initiativeId,
            userId: owner.id,
            role: 'Propietario',
            state: 'active',
            joinedAt: now,
            retiredAt: null,
            sourceRequestId: null,
          },
          event: {
            id: createId(),
            initiativeId,
            userId: owner.id,
            membershipId,
            type: 'joined',
            occurredAt: now,
            actorId: owner.id,
            requestId: null,
          },
        }, session)
        return { initiative, owner, ...catalogs, memberCount: 1 }
      })
    },

    async updateInitiative(id, actor, body) {
      const initiativeId = validateInitiativeId(id)
      const input = validateInitiativeInput(body)
      const now = clock()
      return transactionRunner(connection, async (session) => {
        const current = await initiativesRepository.findById(
          initiativeId,
          { session, includeInternal: true },
        )
        if (!current) throw notFound()
        if (current.ownerId !== actor.id) throw forbidden()
        if (current.state === 'archived') {
          throw new HttpError(409, 'STATE_CONFLICT', 'La iniciativa archivada no puede modificarse.')
        }
        const catalogs = await resolveCatalogs(input, session)
        const memberCount = await initiativesRepository.countActiveMemberships(initiativeId, { session })
        if (input.estimatedMembers < current.estimatedMembers && input.estimatedMembers < memberCount) {
          throw validationError({
            estimatedMembers: 'No puede reducirse por debajo de los miembros activos.',
          })
        }
        const initiative = await initiativesRepository.updateOwnedAtRevision({
          id: initiativeId,
          ownerId: actor.id,
          revision: current.revision,
          changes: { ...input, ...initiativeSearchFields(input) },
          updatedAt: now,
        }, session)
        if (!initiative) {
          throw new HttpError(
            409,
            'INITIATIVE_CHANGED',
            'La iniciativa cambió mientras se guardaba. Actualiza e intenta nuevamente.',
          )
        }
        return { initiative, owner: actor, ...catalogs, memberCount }
      })
    },
  })
}
