function withSession(query, session) {
  return session ? query.session(session) : query
}

export function createInitiativesRepository({ Initiative, Membership, MembershipEvent }) {
  if (!Initiative || !Membership || !MembershipEvent) {
    throw new TypeError('El repositorio requiere modelos de iniciativas y membresías.')
  }

  return Object.freeze({
    async createAggregate({ initiative, membership, event }, session) {
      const [created] = await Initiative.create([initiative], { session })
      await Membership.create([membership], { session })
      await MembershipEvent.create([event], { session })
      return created
    },

    findById(id, { session, includeInternal = false } = {}) {
      let query = Initiative.findOne({ id })
      if (includeInternal) query = query.select('+revision +searchText')
      return withSession(query, session).exec()
    },

    countActiveMemberships(initiativeId, { session } = {}) {
      return withSession(
        Membership.countDocuments({ initiativeId, state: 'active' }),
        session,
      ).exec()
    },

    updateOwnedAtRevision({ id, ownerId, revision, changes, updatedAt }, session) {
      return Initiative.findOneAndUpdate(
        { id, ownerId, revision, state: { $ne: 'archived' } },
        { $set: { ...changes, updatedAt }, $inc: { revision: 1 } },
        { returnDocument: 'after', runValidators: true, session },
      ).exec()
    },

    touchRevision(id, revision, updatedAt, session) {
      return Initiative.findOneAndUpdate(
        { id, revision },
        { $set: { updatedAt }, $inc: { revision: 1 } },
        { returnDocument: 'after', session },
      ).select('+revision').exec()
    },
  })
}
