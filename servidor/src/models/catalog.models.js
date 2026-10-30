import mongoose from 'mongoose'

const sharedFields = {
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  nameNormalized: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  active: { type: Boolean, required: true },
}

const schemaOptions = {
  strict: 'throw',
  versionKey: false,
}

const categorySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    immutable: true,
    match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  },
  ...sharedFields,
}, schemaOptions)

categorySchema.index({ id: 1 }, { unique: true, name: 'category_id_unique' })
categorySchema.index({ nameNormalized: 1 }, { unique: true, name: 'category_name_normalized_unique' })

const skillSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    immutable: true,
    match: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  },
  ...sharedFields,
}, schemaOptions)

skillSchema.index({ id: 1 }, { unique: true, name: 'skill_id_unique' })
skillSchema.index({ nameNormalized: 1 }, { unique: true, name: 'skill_name_normalized_unique' })

export function getCatalogModels(connection) {
  if (!connection) throw new TypeError('getCatalogModels requiere una conexión.')
  return Object.freeze({
    Category: connection.models.Category ?? connection.model('Category', categorySchema, 'categories'),
    Skill: connection.models.Skill ?? connection.model('Skill', skillSchema, 'skills'),
  })
}

export async function ensureCatalogIndexes(models) {
  await Promise.all([models.Category.createIndexes(), models.Skill.createIndexes()])
}
