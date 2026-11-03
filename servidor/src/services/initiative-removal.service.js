import { HttpError } from '../errors/http-error.js'
import { runInTransaction } from '../database/transaction.js'
import { validateInitiativeId } from '../validation/initiatives.validation.js'
import { validateEmptyQuery } from '../validation/users.validation.js'
import { lockInitiativeRevision } from './initiative-revision.js'

const archivedResult = (id) => ({ id, state: 'archived', operation: 'archived' })

export function createInitiativeRemovalService({
  connection, initiativesRepository, removalRepository,
  clock = () => new Date(), transactionRunner = runInTransaction,
}) {
  if (!connection || !initiativesRepository || !removalRepository) {
    throw new TypeError('La eliminación de iniciativas requiere conexión y repositorios.')
  }
  return Object.freeze({
    async deleteInitiative(id, actorId, { query = {}, body, hasBody = false } = {}) {
      const initiativeId = validateInitiativeId(id)
      validateEmptyQuery(query)
      if (body !== undefined || hasBody) {
        throw new HttpError(400, 'VALIDATION_ERROR', 'Revisa los campos indicados.', {
          body: 'Esta operación no recibe cuerpo JSON.',
        })
      }
      return transactionRunner(connection, async (session) => {
        const initiative = await initiativesRepository.findById(
          initiativeId, { session, includeInternal: true },
        )
        if (!initiative) throw new HttpError(404, 'NOT_FOUND', 'No se encontró el recurso solicitado.')
        if (initiative.ownerId !== actorId) {
          throw new HttpError(403, 'FORBIDDEN', 'No tienes permiso para realizar esta acción.')
        }
        if (initiative.state === 'archived') return archivedResult(initiative.id)

        const now = clock()
        const locked = await lockInitiativeRevision(initiativesRepository, initiative, now, session)
        const history = await removalRepository.inspectHistory(locked, session)
        if (history.canDelete) {
          if (!await removalRepository.deleteAggregate(locked, history, session)) {
            throw new HttpError(409, 'CONCURRENT_MODIFICATION', 'No fue posible confirmar la eliminación completa.')
          }
          return null
        }
        if (!await removalRepository.archiveAtRevision(locked, now, session)) {
          throw new HttpError(409, 'CONCURRENT_MODIFICATION', 'La iniciativa cambió durante el archivado.')
        }
        return archivedResult(initiative.id)
      })
    },
  })
}
