
import mongoose from 'mongoose'

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const day = /^\d{4}-\d{2}-\d{2}$/

const schema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    immutable: true,
    match: uuid,
  },
  sourceInitiativeId: {
    type: String,
    required: true,
    immutable: true,
    match: uuid,
  },
  ownerId: {
    type: String,
    required: true,
    immutable: true,
    match: uuid,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 120,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 20,
    maxlength: 2000,
  },
  objective: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 500,
  },
  technologies: {
    type: [String],
    required: true,
    validate: (values) =>
      values.length >= 1 &&
      values.length <= 20 &&
      new Set(values).size === values.length,
  },
  startDate: {
    type: String,
    required: true,
    match: day,
  },
  estimatedEndDate: {
    type: String,
    default: null,
    match: day,
  },
  state: {
    type: String,
    required: true,
    enum: [
      'planning',
      'in_development',
      'paused',
      'finished',
      'archived',
    ],
  },
  repositoryUrl: {
    type: String,
    default: null,
    maxlength: 2048,
  },
  createdAt: {
    type: Date,
    required: true,
    immutable: true,
  },
  updatedAt: {
    type: Date,
    required: true,
  },
}, {
  strict: 'throw',
  versionKey: false,
})

schema.index(
  { id: 1 },
  { unique: true, name: 'project_public_id_unique' },
)

schema.index(
  { sourceInitiativeId: 1 },
  { unique: true, name: 'project_source_initiative_unique' },
)

schema.index(
  { createdAt: -1, id: 1 },
  { name: 'project_listing' },
)

export function getProjectModels(connection) {
  if (!connection) {
    throw new TypeError('Se requiere una conexión MongoDB.')
  }

  return Object.freeze({
    Project: connection.models.Project ??
      connection.model('Project', schema, 'projects'),
  })
}

export async function ensureProjectIndexes({ Project }) {
  await Project.createIndexes()
}
