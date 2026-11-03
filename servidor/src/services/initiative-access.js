import { HttpError } from '../errors/http-error.js'

export const REQUESTABLE_STATES = Object.freeze(['published', 'forming_team', 'converted'])

export function canViewInitiativeDetails(initiative, actorId, isMember = false) {
  if (actorId === initiative.ownerId) return true
  if (['draft', 'archived'].includes(initiative.state)) return false
  return isMember || initiative.visibility === 'public'
    || (Boolean(actorId) && initiative.visibility === 'institutional')
}

export function requireInitiativeDetailsAccess(initiative, actorId, isMember = false) {
  if (canViewInitiativeDetails(initiative, actorId, isMember)) return
  if (initiative.visibility === 'private' || ['draft', 'archived'].includes(initiative.state)) {
    throw new HttpError(404, 'NOT_FOUND', 'No se encontró el recurso solicitado.')
  }
  if (!actorId) {
    throw new HttpError(401, 'AUTHENTICATION_REQUIRED', 'Se requiere una sesión válida.')
  }
  throw new HttpError(403, 'FORBIDDEN', 'No tienes permiso para realizar esta acción.')
}

export function initiativeCapabilities(initiative, { actorId, isMember = false, memberCount, hasPending = false }) {
  const isOwner = actorId === initiative.ownerId
  const readable = canViewInitiativeDetails(initiative, actorId, isMember)
  const requestable = REQUESTABLE_STATES.includes(initiative.state)
  return {
    canViewDetails: readable,
    canEdit: isOwner && initiative.state !== 'archived',
    canDelete: isOwner,
    canRequest: Boolean(actorId) && readable && requestable && !isOwner && !isMember && !hasPending,
    canManageRequests: isOwner,
    canViewTeam: readable,
    canConvert: isOwner && ['published', 'forming_team'].includes(initiative.state) && memberCount > 1,
  }
}
