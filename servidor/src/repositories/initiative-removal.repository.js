export function createInitiativeRemovalRepository({ connection, Initiative, Membership, MembershipEvent }) {
  if (!connection || !Initiative || !Membership || !MembershipEvent) {
    throw new TypeError('El repositorio de eliminación requiere conexión y modelos de iniciativa/equipo.')
  }
  const requests = connection.collection('requests')
  const projects = connection.collection('projects')

  return Object.freeze({
    async inspectHistory(initiative, session) {
      const initiativeId = initiative.id
      // No filtrar por estado: cualquier intento o proyecto obliga a conservar historia.
      if (await requests.findOne({ initiativeId }, { session, projection: { _id: 1 } })) {
        return { canDelete: false }
      }
      if (await projects.findOne({ sourceInitiativeId: initiativeId }, { session, projection: { _id: 1 } })) {
        return { canDelete: false }
      }
      // converted prueba una conversión anterior incluso si la referencia fue dañada.
      if (initiative.state === 'converted') return { canDelete: false }

      const memberships = await Membership.find({ initiativeId }).session(session).limit(2).lean().exec()
      if (memberships.length !== 1) return { canDelete: false }
      const [membership] = memberships
      if (membership.userId !== initiative.ownerId || membership.state !== 'active' || membership.sourceRequestId != null) {
        return { canDelete: false }
      }

      const events = await MembershipEvent.find({ initiativeId }).session(session).limit(2).lean().exec()
      if (events.length !== 1) return { canDelete: false }
      const [event] = events
      if (event.userId !== initiative.ownerId || event.actorId !== initiative.ownerId
        || event.membershipId !== membership.id || event.type !== 'joined'
        || event.requestId != null || event.occurredAt.getTime() !== membership.joinedAt.getTime()) {
        return { canDelete: false }
      }
      return { canDelete: true, membershipId: membership.id, eventId: event.id }
    },

    async deleteAggregate(initiative, history, session) {
      const removedInitiative = await Initiative.deleteOne({
        id: initiative.id, ownerId: initiative.ownerId, revision: initiative.revision,
      }, { session }).exec()
      const removedEvent = await MembershipEvent.deleteOne({
        id: history.eventId, initiativeId: initiative.id, userId: initiative.ownerId,
      }, { session }).exec()
      const removedMembership = await Membership.deleteOne({
        id: history.membershipId, initiativeId: initiative.id, userId: initiative.ownerId,
      }, { session }).exec()
      return removedInitiative.deletedCount === 1
        && removedEvent.deletedCount === 1 && removedMembership.deletedCount === 1
    },

    archiveAtRevision(initiative, updatedAt, session) {
      return Initiative.findOneAndUpdate({
        id: initiative.id, ownerId: initiative.ownerId, revision: initiative.revision,
      }, {
        $set: { state: 'archived', updatedAt },
      }, { session, runValidators: true, returnDocument: 'after' }).exec()
    },
  })
}
