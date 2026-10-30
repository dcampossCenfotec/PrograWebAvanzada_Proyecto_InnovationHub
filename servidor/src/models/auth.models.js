import mongoose from 'mongoose'

export const MEMBER_TYPES = Object.freeze(['student', 'professor', 'administrative', 'graduate', 'external'])
const AVAILABILITY = ['low', 'medium', 'high']
const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced']
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const skillSchema = new mongoose.Schema({
  skillId: { type: String, required: true, match: uuidPattern },
  level: { type: String, required: true, enum: SKILL_LEVELS },
}, { _id: false, strict: 'throw' })

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, immutable: true, match: uuidPattern },
  firstName: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
  lastName: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  memberType: { type: String, required: true, enum: MEMBER_TYPES },
  email: { type: String, required: true, trim: true, maxlength: 254 },
  emailNormalized: { type: String, required: true, trim: true, maxlength: 254 },
  passwordHash: { type: String, required: true, select: false },
  career: { type: String, default: null, maxlength: 120 },
  bio: { type: String, default: null, maxlength: 1000 },
  interests: { type: [String], default: [], validate: (values) => values.length <= 15 },
  availability: { type: String, enum: AVAILABILITY, default: 'medium' },
  portfolioUrl: { type: String, default: null, maxlength: 2048 },
  skills: { type: [skillSchema], default: [] },
  active: { type: Boolean, required: true, default: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
}, { strict: 'throw', versionKey: false })

userSchema.index({ id: 1 }, { unique: true, name: 'user_id_unique' })
userSchema.index({ emailNormalized: 1 }, { unique: true, name: 'user_email_normalized_unique' })
userSchema.index({ 'skills.skillId': 1, lastName: 1, firstName: 1, id: 1 }, { name: 'user_directory_skill' })
userSchema.index({ career: 1, availability: 1, id: 1 }, { name: 'user_directory_profile' })

const sessionSchema = new mongoose.Schema({
  id: { type: String, required: true, immutable: true, match: uuidPattern },
  userId: { type: String, required: true, match: uuidPattern },
  tokenHash: { type: String, required: true, select: false },
  expiresAt: { type: Date, required: true },
  revokedAt: { type: Date, default: null },
  createdAt: { type: Date, required: true },
}, { strict: 'throw', versionKey: false })

sessionSchema.index({ id: 1 }, { unique: true, name: 'session_id_unique' })
sessionSchema.index({ tokenHash: 1 }, { unique: true, name: 'session_token_hash_unique' })
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, name: 'session_expiration_ttl' })
sessionSchema.index({ userId: 1, createdAt: -1 }, { name: 'session_user_history' })

export function getAuthModels(connection) {
  if (!connection) throw new TypeError('getAuthModels requiere una conexión.')
  return Object.freeze({
    User: connection.models.User ?? connection.model('User', userSchema, 'users'),
    Session: connection.models.Session ?? connection.model('Session', sessionSchema, 'sessions'),
  })
}

export async function ensureAuthIndexes(models) {
  await Promise.all([models.User.createIndexes(), models.Session.createIndexes()])
}
