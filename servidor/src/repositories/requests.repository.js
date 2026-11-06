
function queryWithSession(query, session) {
  return session ? query.session(session) : query
}

function roleFilter(role) {
  return { $regex: role.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
}

export function createRequestsRepository({ Request, Initiative, Membership, MembershipEvent, User, Skill }) {
  if (![Request, Initiative, Membership, MembershipEvent, User, Skill].every(Boolean)) {
    throw new TypeError('El repositorio de solicitudes requiere los modelos del dominio.')
  }
  return Object.freeze({
    findInitiative(id, session, { internal = false } = {}) {
      let query = Initiative.findOne({ id })
      if (internal) query = query.select('+revision')
      return queryWithSession(query, session).exec()
    },
    findRequest(id, session) {
      return queryWithSession(Request.findOne({ id }), session).exec()
    },
    findUser(id, session) {
      return queryWithSession(User.findOne({ id, active: true }), session).exec()
    },
    findSkill(id, session) {
      return queryWithSession(Skill.findOne({ id, active: true }), session).lean().exec()
    },
    findMembership(initiativeId, userId, session) {
      return queryWithSession(Membership.findOne({ initiativeId, userId, state: 'active' }), session).exec()
    },
    findPending(initiativeId, applicantId, session) {
      return queryWithSession(Request.findOne({ initiativeId, applicantId, state: 'pending' }), session).exec()
    },
    createRequest(record, session) {
      return Request.create([record], { session }).then(([item]) => item)
    },
    updatePending({ id, applicantId, changes }, session) {
      return Request.findOneAndUpdate(
        { id, applicantId, state: 'pending' }, { $set: changes },
        { session, runValidators: true, returnDocument: 'after' },
      ).exec()
    },
    updateState({ id, state, changes }, session) {
      return Request.findOneAndUpdate(
        { id, state: 'pending' }, { $set: { state, ...changes } },
        { session, runValidators: true, returnDocument: 'after' },
      ).exec()
    },
    touchRevision(initiative, time, session) {
      return Initiative.findOneAndUpdate(
        { id: initiative.id, revision: initiative.revision },
        { $set: { updatedAt: time }, $inc: { revision: 1 } },
        { session, returnDocument: 'after' },
      ).select('+revision').exec()
    },
    async list(query, actorId) {
      const filter = {}
      if (query.scope === 'mine') filter.applicantId = actorId
      if (query.initiativeId) filter.initiativeId = query.initiativeId
      if (query.state) filter.state = query.state
      if (query.skill) filter.offeredSkillId = query.skill
      if (query.role) filter.role = roleFilter(query.role)
      if (query.from || query.to) {
        filter.createdAt = { ...(query.from ? { $gte: query.from } : {}), ...(query.to ? { $lte: query.to } : {}) }
      }
      const pipeline = [{ $match: filter }]
      const direction = query.order === 'asc' ? 1 : -1
      pipeline.push({ $facet: {
        count: [{ $count: 'total' }],
        items: [
          { $sort: { [query.sort]: direction, id: direction } },
          { $skip: (query.page - 1) * query.size }, { $limit: query.size },
          { $project: { _initiative: 0 } },
        ],
      } })
      const [result] = await Request.aggregate(pipeline).exec()
      return { rows: result.items, total: result.count[0]?.total ?? 0 }
    },
    async decorate(record, session) {
      const raw = typeof record.toObject === 'function' ? record.toObject() : record
      const [initiative, applicant, skill] = await Promise.all([
        queryWithSession(Initiative.findOne({ id: raw.initiativeId }).select('id title ownerId'), session).lean().exec(),
        queryWithSession(User.findOne({ id: raw.applicantId }).select('id firstName lastName'), session).lean().exec(),
        queryWithSession(Skill.findOne({ id: raw.offeredSkillId }).select('id name'), session).lean().exec(),
      ])
      return { raw, initiative, applicant, skill }
    },
  })
}
