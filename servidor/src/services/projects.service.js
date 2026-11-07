
import { randomUUID } from 'node:crypto'
import { HttpError } from '../errors/http-error.js'
import { runInTransaction } from '../database/transaction.js'
import { requireInitiativeDetailsAccess } from './initiative-access.js'
import {
  validateProjectBody,
  validateProjectEmptyQuery,
  validateProjectId,
  validateProjectsQuery,
} from '../validation/projects.validation.js'

const notFound = () =>
  new HttpError(
    404,
    'NOT_FOUND',
    'No se encontró el recurso solicitado.',
  )

const forbidden = () =>
  new HttpError(
    403,
    'FORBIDDEN',
    'No tiene permiso para realizar esta acción.',
  )

const conflict = () =>
  new HttpError(
    409,
    'STATE_CONFLICT',
    'La iniciativa no cumple las condiciones para convertirse.',
  )

export function createProjectsService({
  connection,
  repository,
  transactionRunner = runInTransaction,
  clock = () => new Date(),
  createId = randomUUID,
}) {
  if (!connection || !repository) {
    throw new TypeError(
      'Faltan conexión y repositorio de proyectos.',
    )
  }

  async function readable(project, actorId) {
    const details = await repository.decorate(project)
    if (!details) throw notFound()

    const member = actorId
      ? await repository.findActiveMember(
          details.initiative.id,
          actorId,
        )
      : false

    requireInitiativeDetailsAccess(
      details.initiative,
      actorId,
      Boolean(member),
    )

    return details
  }

  return Object.freeze({
    async create(initiativeInput, actorId, body, query = {}) {
      const id = validateProjectId(initiativeInput)
      validateProjectEmptyQuery(query)
      const input = validateProjectBody(body)
      let project

      try {
        project = await transactionRunner(
          connection,
          async (session) => {
            const initiative = await repository.findInitiative(
              id,
              session,
            )

            if (!initiative) throw notFound()
            if (initiative.ownerId !== actorId) throw forbidden()

            if (await repository.findProjectBySource(id, session)) {
              throw new HttpError(
                409,
                'PROJECT_ALREADY_EXISTS',
                'Esta iniciativa ya tiene proyecto.',
              )
            }

            if (
              !['published', 'forming_team'].includes(initiative.state)
            ) {
              throw conflict()
            }

            if (
              await repository.countActiveMembers(id, session) < 2
            ) {
              throw conflict()
            }

            const now = clock()

            if (
              !await repository.touchRevision(
                initiative,
                now,
                session,
              )
            ) {
              throw new HttpError(
                409,
                'CONCURRENT_MODIFICATION',
                'La iniciativa cambió. Reintenta.',
              )
            }

            if (
              !await repository.convertInitiative(
                id,
                now,
                session,
              )
            ) {
              throw conflict()
            }

            return repository.createProject({
              id: createId(),
              sourceInitiativeId: id,
              ownerId: actorId,
              ...input,
              state: 'planning',
              createdAt: now,
              updatedAt: now,
            }, session)
          },
        )
      } catch (error) {
        if (error instanceof HttpError) throw error

        if (error?.code === 11000) {
          throw new HttpError(
            409,
            'PROJECT_ALREADY_EXISTS',
            'Esta iniciativa ya tiene proyecto.',
          )
        }

        if (
          [112, 251].includes(error?.code) ||
          error?.errorLabels?.includes('TransientTransactionError')
        ) {
          throw new HttpError(
            409,
            'CONCURRENT_MODIFICATION',
            'La iniciativa cambió. Reintenta.',
          )
        }

        throw error
      }

      return readable(project, actorId)
    },

    async list(query, actorId = null) {
      const input = validateProjectsQuery(query)
      const { rows, total } = await repository.listVisible(
        actorId,
        input,
      )

      const items = []
      for (const item of rows) {
        const value = await readable(item, actorId)
        items.push(value)
      }

      return {
        items,
        pagination: {
          page: input.page,
          size: input.size,
          total,
          totalPages: Math.ceil(total / input.size),
        },
      }
    },

    async get(id, actorId = null, query = {}) {
      const projectId = validateProjectId(id)
      validateProjectEmptyQuery(query)

      const project = await repository.findProject(projectId)

      if (!project) throw notFound()

      return readable(project, actorId)
    },
  })
}
