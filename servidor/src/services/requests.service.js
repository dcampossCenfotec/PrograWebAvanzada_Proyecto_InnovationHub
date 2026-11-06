
import { randomUUID } from 'node:crypto'
import { HttpError } from '../errors/http-error.js'
import { runInTransaction } from '../database/transaction.js'
import { validateRequestId, validateRequestBody, validateRequestQuery } from '../validation/requests.validation.js'
import { REQUESTABLE_STATES, requireInitiativeDetailsAccess } from './initiative-access.js'

const notFound = () => new HttpError(404, 'NOT_FOUND', 'No se encontró el recurso solicitado.')
const forbidden = () => new HttpError(403, 'FORBIDDEN', 'No tiene permiso para realizar esta acción.')
const stateConflict = () => new HttpError(409, 'STATE_CONFLICT', 'El recurso cambió y la operación ya no es válida.')
const changed = () => new HttpError(409, 'CONCURRENT_MODIFICATION', 'El recurso cambió durante la operación; actualiza e intenta nuevamente.')

function isConflict(error) {
  return error?.code === 112 || error?.code === 251
    || error?.errorLabels?.includes('TransientTransactionError')
    || error?.errorLabels?.includes('UnknownTransactionCommitResult')
}

export function createRequestsService({
  connection, repository, clock = () => new Date(), createId = randomUUID,
  transactionRunner = runInTransaction,
}) {
  if (!connection || !repository) throw new TypeError('Se requiere conexión y repositorio de solicitudes.')

  async function decorate(record, session) {
    return repository.decorate(record, session)
  }
  async function transact(operation, { duplicateCode = 'PENDING_REQUEST_EXISTS' } = {}) {
    try {
      return await transactionRunner(connection, operation)
    } catch (error) {
      if (error instanceof HttpError) throw error
      if (error?.code === 11000) {
        throw new HttpError(409, duplicateCode, 'Ya existe un registro activo incompatible con esta operación.')
      }
      if (isConflict(error)) throw changed()
      throw error
    }
  }
  async function ensureSkill(actorId, skillId, session) {
    const user = await repository.findUser(actorId, session)
    const exists = user?.skills?.some((entry) => entry.skillId === skillId)
    const skill = exists && await repository.findSkill(skillId, session)
    if (!skill) {
      throw new HttpError(400, 'VALIDATION_ERROR', 'Revisa los campos indicados.', {
        offeredSkillId: 'La competencia debe estar activa y pertenecer a tu perfil.',
      })
    }
  }
  async function requireRelatedRequest(id, actorId, session) {
    const record = await repository.findRequest(id, session)
    if (!record) throw notFound()
    const initiative = await repository.findInitiative(record.initiativeId, session, { internal: true })
    if (record.applicantId !== actorId && initiative?.ownerId !== actorId) throw forbidden()
    return { record, initiative }
  }

  return Object.freeze({
    async create(initiativeInput, actorId, body) {
      const initiativeId = validateRequestId(initiativeInput)
      const input = validateRequestBody(body)
      const saved = await transact(async (session) => {
        const initiative = await repository.findInitiative(initiativeId, session, { internal: true })
        if (!initiative) throw notFound()
        if (initiative.ownerId === actorId) throw stateConflict()
        const member = await repository.findMembership(initiativeId, actorId, session)
        requireInitiativeDetailsAccess(initiative, actorId, Boolean(member))
        if (!REQUESTABLE_STATES.includes(initiative.state)) throw stateConflict()
        if (member) throw new HttpError(409, 'ACTIVE_MEMBER_EXISTS', 'Ya formas parte de este equipo.')
        if (await repository.findPending(initiativeId, actorId, session)) {
          throw new HttpError(409, 'PENDING_REQUEST_EXISTS', 'Ya tienes una solicitud pendiente en esta iniciativa.')
        }
        await ensureSkill(actorId, input.offeredSkillId, session)
        const now = clock()
        if (!await repository.touchRevision(initiative, now, session)) throw changed()
        const record = await repository.createRequest({
          id: createId(), initiativeId, applicantId: actorId, ...input,
          state: 'pending', decisionComment: null, decidedAt: null, createdAt: now, updatedAt: now,
        }, session)
        return record
      })
      return decorate(saved)
    },
    async list(query, actorId, { received = false } = {}) {
      const input = validateRequestQuery(query, { allowReceived: received })
      const { rows, total } = await repository.list(input, actorId)
      const items = await Promise.all(rows.map((row) => decorate(row)))
      return {
        items,
        pagination: { page: input.page, size: input.size, total, totalPages: Math.ceil(total / input.size) },
      }
    },
    async get(id, actorId) {
      const requestId = validateRequestId(id)
      const { record } = await requireRelatedRequest(requestId, actorId)
      return decorate(record)
    },
    async update(id, actorId, body) {
      const requestId = validateRequestId(id)
      const input = validateRequestBody(body)
      const saved = await transact(async (session) => {
        const { record, initiative } = await requireRelatedRequest(requestId, actorId, session)
        if (record.applicantId !== actorId) throw forbidden()
        if (record.state !== 'pending') throw stateConflict()
        if (!initiative) throw notFound()
        await ensureSkill(actorId, input.offeredSkillId, session)
        const now = clock()
        if (!await repository.touchRevision(initiative, now, session)) throw changed()
        const updated = await repository.updatePending({
          id: requestId, applicantId: actorId, changes: { ...input, updatedAt: now },
        }, session)
        if (!updated) throw stateConflict()
        return updated
      })
      return decorate(saved)
    },
    async decide(id, actorId, { decision, comment }) {
      const requestId = validateRequestId(id)
      const result = await transact(async (session) => {
        const { record, initiative } = await requireRelatedRequest(requestId, actorId, session)
        if (!initiative) throw notFound()
        if (initiative.ownerId !== actorId) throw forbidden()
        if (record.state !== 'pending') throw stateConflict()
        if (decision === 'accepted' && initiative.state === 'archived') throw stateConflict()
        if (decision === 'accepted') {
          if (!REQUESTABLE_STATES.includes(initiative.state)) throw stateConflict()
          if (!await repository.findUser(record.applicantId, session)) throw stateConflict()
          if (await repository.findMembership(initiative.id, record.applicantId, session)) {
            throw new HttpError(409, 'ACTIVE_MEMBER_EXISTS', 'El solicitante ya forma parte del equipo.')
          }
        }
        const now = clock()
        if (!await repository.touchRevision(initiative, now, session)) throw changed()
        const updated = await repository.updateState({
          id: requestId, state: decision,
          changes: { decisionComment: comment, decidedAt: now, updatedAt: now },
        }, session)
        if (!updated) throw changed()
        let membership = null
        if (decision === 'accepted') {
          membership = await repository.createMembership({
            id: createId(), initiativeId: initiative.id, userId: record.applicantId,
            role: record.role, state: 'active', joinedAt: now,
            retiredAt: null, sourceRequestId: record.id,
          }, session)
          if (initiative.state === 'published'
            && !await repository.markFormingTeam(initiative.id, session)) throw changed()
          await repository.createMembershipEvent({
            id: createId(), initiativeId: initiative.id, userId: record.applicantId,
            membershipId: membership.id, type: 'joined', occurredAt: now,
            actorId, requestId: record.id,
          }, session)
        }
        return { request: updated, membership }
      }, { duplicateCode: 'ACTIVE_MEMBER_EXISTS' })
      return { request: await decorate(result.request), membership: result.membership }
    },
    async cancel(id, actorId) {
      const requestId = validateRequestId(id)
      const saved = await transact(async (session) => {
        const { record, initiative } = await requireRelatedRequest(requestId, actorId, session)
        if (record.applicantId !== actorId) throw forbidden()
        if (record.state !== 'pending') throw stateConflict()
        if (!initiative) throw notFound()
        const now = clock()
        if (!await repository.touchRevision(initiative, now, session)) throw changed()
        const updated = await repository.updateState({
          id: requestId, state: 'cancelled', changes: { updatedAt: now },
        }, session)
        if (!updated) throw stateConflict()
        return updated
      })
      return decorate(saved)
    },
  })
}
