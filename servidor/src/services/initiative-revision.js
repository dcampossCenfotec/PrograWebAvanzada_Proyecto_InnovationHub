import { HttpError } from '../errors/http-error.js'

// Todas las transacciones que agreguen o retiren relaciones deben escribir
// esta misma revisión antes de modificar las colecciones relacionadas.
export async function lockInitiativeRevision(repository, initiative, updatedAt, session) {
  const locked = await repository.touchRevision(initiative.id, initiative.revision, updatedAt, session)
  if (!locked) {
    throw new HttpError(
      409,
      'CONCURRENT_MODIFICATION',
      'La iniciativa cambió durante la operación. Actualiza e intenta nuevamente.',
    )
  }
  return locked
}
