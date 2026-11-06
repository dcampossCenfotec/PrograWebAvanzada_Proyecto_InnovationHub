
import { randomUUID } from 'node:crypto'
import { runInTransaction } from '../database/transaction.js'
import { HttpError } from '../errors/http-error.js'
import { requireInitiativeDetailsAccess } from './initiative-access.js'
import { validateMemberId, validateMembersQuery } from '../validation/members.validation.js'
import { validateNoRequestPayload } from '../validation/requests.validation.js'

const missing = () => new HttpError(404, 'NOT_FOUND', 'No se encontró el recurso solicitado.')
const forbidden = () => new HttpError(403, 'FORBIDDEN', 'No tiene permiso para realizar esta acción.')
const conflict = () => new HttpError(409, 'CONCURRENT_MODIFICATION', 'La iniciativa cambió durante la operación.')

export function createMembersService({ connection, repository, clock = () => new Date(), createId = randomUUID, transactionRunner = runInTransaction }) {
  if (!connection || !repository) throw new TypeError('Se requiere conexión y repositorio.')
  return Object.freeze({
    async list(id, actorId, query) {
      const initiativeId = validateMemberId(id)
      const parsed = validateMembersQuery(query)
      const initiative = await repository.findInitiative(initiativeId)
      if (!initiative) throw missing()
      const active = actorId ? await repository.findMembership(initiativeId, actorId) : null
      requireInitiativeDetailsAccess(initiative, actorId, Boolean(active))
      const { rows, total } = await repository.listMembers(initiativeId, parsed)
      return {
        rows,
        pagination: { page: parsed.page, size: parsed.size, total, totalPages: Math.ceil(total / parsed.size) },
      }
    },
    async remove(initiativeInput, userInput, actorId, { query, body, hasBody } = {}) {
      const initiativeId = validateMemberId(initiativeInput)
      const userId = validateMemberId(userInput)
      validateNoRequestPayload(query ?? {}, body, hasBody)
      try {
        await transactionRunner(connection, async (session) => {
          const initiative = await repository.findInitiative(initiativeId, session, { internal: true })
          if (!initiative) throw missing()
          if (initiative.ownerId !== actorId) throw forbidden()
          if (userId === initiative.ownerId) {
            throw new HttpError(409, 'STATE_CONFLICT', 'El propietario no puede retirarse a sí mismo.')
          }
          const membership = await repository.findMembership(initiativeId, userId, session)
          if (!membership) throw missing()
          const now = clock()
          if (!await repository.touchRevision(initiative, now, session)) throw conflict()
          const retired = await repository.retireMembership(initiativeId, userId, now, session)
          if (!retired) throw conflict()
          await repository.createMembershipEvent({
            id: createId(), initiativeId, userId,
            membershipId: retired.id, type: 'retired', occurredAt: now,
            actorId, requestId: retired.sourceRequestId ?? null,
          }, session)
        })
      } catch (error) {
        if (error instanceof HttpError) throw error
        if ([11000, 112, 251].includes(error?.code) || error?.errorLabels?.includes('TransientTransactionError')) throw conflict()
        throw error
      }
    },
  })
}
