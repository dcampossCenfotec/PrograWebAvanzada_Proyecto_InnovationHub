import { initiativeSearchFields, normalizeInitiativeSearch } from '../services/initiative-search.js'

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function teamAndAccess(actorId) {
  return [
    {
      $lookup: {
        from: 'memberships', localField: 'id', foreignField: 'initiativeId',
        pipeline: [
          { $match: { state: 'active' } },
          { $group: {
            _id: null,
            memberCount: { $sum: 1 },
            actorMembershipCount: { $sum: { $cond: [{ $eq: ['$userId', actorId] }, 1, 0] } },
          } },
        ],
        as: '_team',
      },
    },
    { $set: {
      memberCount: { $ifNull: [{ $arrayElemAt: ['$_team.memberCount', 0] }, 0] },
      _isMember: { $gt: [{ $ifNull: [{ $arrayElemAt: ['$_team.actorMembershipCount', 0] }, 0] }, 0] },
    } },
    { $set: {
      _canViewDetails: { $or: [
        { $eq: ['$ownerId', actorId] }, '$_isMember',
        { $in: ['$visibility', actorId ? ['public', 'institutional'] : ['public']] },
      ] },
      availableSpaces: { $max: [0, { $subtract: ['$estimatedMembers', '$memberCount'] }] },
    } },
  ]
}

function relatedData(actorId) {
  const pipeline = [
    { $lookup: {
      from: 'users', localField: 'ownerId', foreignField: 'id',
      pipeline: [{ $project: { _id: 0, id: 1, firstName: 1, lastName: 1 } }], as: '_owner',
    } },
    { $lookup: {
      from: 'categories', localField: 'categoryId', foreignField: 'id',
      pipeline: [{ $project: { _id: 0, id: 1, name: 1 } }], as: '_category',
    } },
    { $lookup: {
      from: 'skills', localField: 'skillIds', foreignField: 'id',
      pipeline: [{ $project: { _id: 0, id: 1, name: 1 } }], as: '_skills',
    } },
  ]
  if (actorId) {
    pipeline.push({ $lookup: {
      from: 'requests', localField: 'id', foreignField: 'initiativeId',
      pipeline: [{ $match: { applicantId: actorId, state: 'pending' } }, { $limit: 1 }, { $project: { _id: 1 } }],
      as: '_pending',
    } })
  }
  // La forma interna es explícita. Nunca se devuelve un documento Mongo por spread.
  pipeline.push({ $project: {
    _id: 0, id: 1, ownerId: 1, title: 1, type: 1, summary: 1, description: 1,
    problem: 1, beneficiaries: 1, categoryId: 1, skillIds: 1, estimatedMembers: 1,
    visibility: 1, state: 1, tags: 1, createdAt: 1, updatedAt: 1,
    memberCount: 1, _isMember: 1,
    _owner: { $arrayElemAt: ['$_owner', 0] },
    _category: { $arrayElemAt: ['$_category', 0] },
    _skills: 1,
    _hasPending: actorId ? { $gt: [{ $size: '$_pending' }, 0] } : { $literal: false },
  } })
  return pipeline
}

export function toInitiativeResult(row, actorId) {
  return {
    initiative: row,
    owner: row._owner,
    category: row._category,
    skills: row._skills,
    memberCount: row.memberCount,
    actorId,
    isMember: row._isMember,
    hasPending: row._hasPending,
  }
}

export function createInitiativeQueriesRepository({ Initiative }) {
  return Object.freeze({
    async backfillSearchFields() {
      const missing = { $or: [
        { publicSearchText: { $exists: false } }, { titleNormalized: { $exists: false } },
      ] }
      for await (const entry of Initiative.find(missing).select('id title summary tags').lean().cursor()) {
        // El filtro evita escribir una normalización obsoleta si se edita a la vez.
        await Initiative.updateOne(
          { id: entry.id, title: entry.title, summary: entry.summary, tags: entry.tags, ...missing },
          { $set: initiativeSearchFields(entry) },
        ).exec()
      }
    },

    async list(input, actorId, { mine = false } = {}) {
      const filter = mine
        ? { ownerId: actorId }
        : { state: input.state ?? { $in: ['published', 'forming_team', 'converted'] } }
      if (input.type) filter.type = input.type
      if (input.category) filter.categoryId = input.category
      if (input.skill) filter.skillIds = input.skill
      const pipeline = [{ $match: filter }, ...teamAndAccess(actorId)]
      if (!mine) {
        pipeline.push({ $match: { $or: [{ visibility: { $ne: 'private' } }, { _canViewDetails: true }] } })
        if (!actorId) pipeline.push({ $match: { visibility: 'public' } })
      }
      if (input.ownerId) pipeline.push({ $match: { ownerId: input.ownerId, _canViewDetails: true } })
      if (input.q) {
        const expression = new RegExp(escapeRegex(normalizeInitiativeSearch(input.q)), 'u')
        pipeline.push({ $match: { $or: [
          { _canViewDetails: true, searchText: expression },
          { _canViewDetails: false, publicSearchText: expression },
        ] } })
      }
      if (input.hasSpaces !== undefined) {
        pipeline.push({ $match: { availableSpaces: input.hasSpaces ? { $gt: 0 } : 0 } })
      }
      const direction = input.order === 'asc' ? 1 : -1
      const sortField = input.sort === 'title' ? 'titleNormalized' : input.sort
      pipeline.push({ $facet: {
        counts: [{ $count: 'total' }],
        items: [
          { $sort: { [sortField]: direction, id: direction } },
          { $skip: (input.page - 1) * input.size }, { $limit: input.size },
          ...relatedData(actorId),
        ],
      } })
      const [result] = await Initiative.aggregate(pipeline).exec()
      return {
        items: result.items.map((row) => toInitiativeResult(row, actorId)),
        total: result.counts[0]?.total ?? 0,
      }
    },

    async findDetailedById(id, actorId) {
      const [row] = await Initiative.aggregate([
        { $match: { id } }, ...teamAndAccess(actorId), ...relatedData(actorId),
      ]).exec()
      return row ? toInitiativeResult(row, actorId) : null
    },
  })
}
