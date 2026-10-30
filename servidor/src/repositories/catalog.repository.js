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
  })
}
