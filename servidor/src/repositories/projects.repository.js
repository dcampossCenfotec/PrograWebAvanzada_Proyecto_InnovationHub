
function withSession(query, session) {
  return session ? query.session(session) : query
}

export function createProjectsRepository({
  Project,
  Initiative,
  Membership,
  User,
}) {
  if (![Project, Initiative, Membership, User].every(Boolean)) {
    throw new TypeError('Faltan modelos de proyectos.')
  }

  return Object.freeze({
    findInitiative(id, session) {
      return withSession(
        Initiative.findOne({ id }).select('+revision'),
        session,
      ).exec()
    },

    findProjectBySource(sourceInitiativeId, session) {
      return withSession(
        Project.findOne({ sourceInitiativeId }),
        session,
      ).lean().exec()
    },

    findProject(id) {
      return Project.findOne({ id }).lean().exec()
    },

    countActiveMembers(initiativeId, session) {
      return withSession(
        Membership.countDocuments({
          initiativeId,
          state: 'active',
        }),
        session,
      ).exec()
    },

    findActiveMember(initiativeId, userId) {
      return Membership.exists({
        initiativeId,
        userId,
        state: 'active',
      }).exec()
    },

    touchRevision(initiative, now, session) {
      return Initiative.findOneAndUpdate(
        { id: initiative.id, revision: initiative.revision },
        {
          $set: { updatedAt: now },
          $inc: { revision: 1 },
        },
        { session, returnDocument: 'after' },
      ).select('+revision').exec()
    },

    convertInitiative(id, now, session) {
      return Initiative.findOneAndUpdate(
        {
          id,
          state: { $in: ['published', 'forming_team'] },
        },
        {
          $set: {
            state: 'converted',
            updatedAt: now,
          },
        },
        { session, returnDocument: 'after' },
      ).exec()
    },

    createProject(data, session) {
      return Project.create([data], { session })
        .then(([created]) => created.toObject())
    },

    async decorate(project) {
      const initiative = await Initiative.findOne({
        id: project.sourceInitiativeId,
      }).select(
        'id title ownerId visibility state',
      ).lean().exec()

      if (!initiative) return null

      const owner = await User.findOne({
        id: project.ownerId,
      }).select(
        'id firstName lastName',
      ).lean().exec()

      const memberCount = await Membership.countDocuments({
        initiativeId: initiative.id,
        state: 'active',
      }).exec()

      return {
        project,
        initiative,
        owner,
        memberCount,
      }
    },

    async listVisible(actorId, {
      page,
      size,
      sort,
      order,
    }) {
      const pipeline = [
        {
          $lookup: {
            from: 'initiatives',
            localField: 'sourceInitiativeId',
            foreignField: 'id',
            as: '_origin',
          },
        },
        { $unwind: '$_origin' },
        {
          $lookup: {
            from: 'memberships',
            let: { id: '$sourceInitiativeId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$initiativeId', '$$id'] },
                      { $eq: ['$state', 'active'] },
                      { $eq: ['$userId', actorId] },
                    ],
                  },
                },
              },
              { $limit: 1 },
            ],
            as: '_actorMembership',
          },
        },
        {
          $match: {
            $or: [
              ...(actorId
                ? [{ '_origin.ownerId': actorId }]
                : []),
              {
                '_origin.state': {
                  $nin: ['draft', 'archived'],
                },
                '_origin.visibility': 'public',
              },
              ...(actorId ? [{
                '_origin.state': {
                  $nin: ['draft', 'archived'],
                },
                '_origin.visibility': 'institutional',
              }] : []),
              {
                '_origin.state': {
                  $nin: ['draft', 'archived'],
                },
                '_actorMembership.0': { $exists: true },
              },
            ],
          },
        },
        {
          $facet: {
            count: [{ $count: 'total' }],
            items: [
              {
                $sort: {
                  [sort]: order === 'asc' ? 1 : -1,
                  id: order === 'asc' ? 1 : -1,
                },
              },
              { $skip: (page - 1) * size },
              { $limit: size },
              {
                $project: {
                  _id: 0,
                  _origin: 0,
                  _actorMembership: 0,
                },
              },
            ],
          },
        },
      ]

      const [result] = await Project.aggregate(pipeline).exec()

      return {
        rows: result.items,
        total: result.count[0]?.total ?? 0,
      }
    },
  })
}
