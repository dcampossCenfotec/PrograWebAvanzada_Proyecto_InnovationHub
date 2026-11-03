function toUpsertOperation(entry) {
  return {
    updateOne: {
      filter: { id: entry.id },
      update: {
        $set: {
          name: entry.name,
          nameNormalized: entry.nameNormalized,
          active: entry.active,
        },
        $setOnInsert: { id: entry.id },
      },
      upsert: true,
    },
  }
}

async function upsertEntries(Model, entries, session) {
  if (entries.length === 0) return
  await Model.bulkWrite(entries.map(toUpsertOperation), { ordered: true, session })
}

export function createCatalogRepository({ Category, Skill }) {
  if (!Category || !Skill) throw new TypeError('El repositorio requiere los modelos Category y Skill.')

  return Object.freeze({
    async upsertCatalogs({ categories, skills }, { session } = {}) {
      await upsertEntries(Category, categories, session)
      await upsertEntries(Skill, skills, session)
    },

    async countCatalogs() {
      const [categories, skills] = await Promise.all([
        Category.countDocuments(),
        Skill.countDocuments(),
      ])
      return { categories, skills }
    },

    listActiveCategories() {
      return Category.find({ active: true }).sort({ nameNormalized: 1, id: 1 }).lean().exec()
    },

    listActiveSkills({ filter, skip, limit }) {
      return Skill.find({ active: true, ...filter })
        .sort({ nameNormalized: 1, id: 1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec()
    },

    countActiveSkills(filter) {
      return Skill.countDocuments({ active: true, ...filter }).exec()
    },

    async findExistingActiveSkillIds(ids) {
      if (ids.length === 0) return []
      const skills = await Skill.find({ id: { $in: ids }, active: true }).select({ id: 1, _id: 0 }).lean().exec()
      return skills.map(({ id }) => id)
    },

    findActiveCategoryById(id, { session } = {}) {
      return Category.findOne({ id, active: true }).session(session ?? null).lean().exec()
    },

    findActiveSkillsByIds(ids, { session } = {}) {
      if (ids.length === 0) return []
      return Skill.find({ id: { $in: ids }, active: true })
        .session(session ?? null)
        .select({ id: 1, name: 1, _id: 0 })
        .lean()
        .exec()
    },
  })
}
