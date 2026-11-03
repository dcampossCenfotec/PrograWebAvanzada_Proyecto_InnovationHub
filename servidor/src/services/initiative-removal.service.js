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
  async function execute(action, id, actorId, { query = {}, body, hasBody = false } = {}) {
    const initiativeId = validateInitiativeId(id)
    validateEmptyQuery(query)
    if (body !== undefined || hasBody) {
      throw new HttpError(400, 'VALIDATION_ERROR', 'Revisa los campos indicados.', {
        body: 'Esta operación no recibe cuerpo JSON.',
      })
    }
    return transactionRunner(connection, async (session) => {
      const initiative = await initiativesRepository.findById(initiativeId, { session, includeInternal: true })
      if (!initiative) throw new HttpError(404, 'NOT_FOUND', 'No se encontró el recurso solicitado.')
      if (initiative.ownerId !== actorId) throw new HttpError(403, 'FORBIDDEN', 'No tienes permiso para realizar esta acción.')
      if (action === 'archive' && initiative.state === 'archived') return archivedResult(initiative.id)

      const now = clock()
      const locked = await lockInitiativeRevision(initiativesRepository, initiative, now, session)
      if (action === 'archive') {
        if (!await removalRepository.archiveAtRevision(locked, now, session)) {
          throw new HttpError(409, 'CONCURRENT_MODIFICATION', 'La iniciativa cambió durante el archivado.')
        }
        return archivedResult(initiative.id)
      }

      const history = await removalRepository.inspectHistory(locked, session)
      if (!history.canDelete) {
        throw new HttpError(409, 'INITIATIVE_HAS_HISTORY', 'No se puede eliminar una iniciativa con historial. Puedes archivarla para conservar sus relaciones.')
      }
      if (!await removalRepository.deleteAggregate(locked, history, session)) {
        throw new HttpError(409, 'CONCURRENT_MODIFICATION', 'No fue posible confirmar la eliminación completa.')
      }
      return null
    })
  }
  return Object.freeze({
    deleteInitiative: (id, actorId, options) => execute('delete', id, actorId, options),
    archiveInitiative: (id, actorId, options) => execute('archive', id, actorId, options),
  })
}
