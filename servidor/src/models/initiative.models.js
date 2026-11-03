import mongoose from 'mongoose'

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const schemaOptions = { strict: 'throw', versionKey: false }

const initiativeSchema = new mongoose.Schema({
  id: { type: String, required: true, immutable: true, match: uuidPattern },
  ownerId: { type: String, required: true, immutable: true, match: uuidPattern },
  title: { type: String, required: true, trim: true, minlength: 5, maxlength: 100 },
  type: { type: String, required: true, enum: ['idea', 'need', 'challenge'] },
  summary: { type: String, required: true, trim: true, minlength: 15, maxlength: 240 },
  description: { type: String, required: true, trim: true, minlength: 20, maxlength: 2000 },
  problem: { type: String, required: true, trim: true, minlength: 10, maxlength: 500 },
  beneficiaries: { type: String, required: true, trim: true, minlength: 3, maxlength: 150 },
  categoryId: { type: String, required: true, match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ },
  skillIds: {
    type: [{ type: String, match: uuidPattern }],
    required: true,
    validate: (values) => values.length >= 1 && values.length <= 10 && new Set(values).size === values.length,
  },
  estimatedMembers: { type: Number, required: true, min: 1, max: 100 },
  visibility: { type: String, required: true, enum: ['public', 'institutional', 'restricted', 'private'] },
  state: { type: String, required: true, enum: ['draft', 'published', 'forming_team', 'converted', 'archived'] },
  tags: {
    type: [{ type: String, trim: true, minlength: 1, maxlength: 40 }],
    default: [],
    validate: (values) => values.length <= 10,
  },
  searchText: { type: String, required: true, select: false, maxlength: 1000 },
  revision: { type: Number, required: true, min: 0, select: false },
  createdAt: { type: Date, required: true, immutable: true },
  updatedAt: { type: Date, required: true },
}, schemaOptions)

initiativeSchema.index({ id: 1 }, { unique: true, name: 'initiative_id_unique' })
initiativeSchema.index({ ownerId: 1, state: 1, updatedAt: -1, id: 1 }, { name: 'initiative_owner_state' })
initiativeSchema.index({ state: 1, visibility: 1, createdAt: -1, id: 1 }, { name: 'initiative_catalog' })
initiativeSchema.index({ categoryId: 1, state: 1, id: 1 }, { name: 'initiative_category' })
initiativeSchema.index({ skillIds: 1, state: 1, id: 1 }, { name: 'initiative_skills' })
initiativeSchema.index(
  { searchText: 'text' },
  { name: 'initiative_search_text', default_language: 'none' },
)

const membershipSchema = new mongoose.Schema({
  id: { type: String, required: true, immutable: true, match: uuidPattern },
  initiativeId: { type: String, required: true, immutable: true, match: uuidPattern },
  userId: { type: String, required: true, immutable: true, match: uuidPattern },
  role: { type: String, required: true, trim: true, minlength: 2, maxlength: 150 },
  state: { type: String, required: true, enum: ['active', 'retired'] },
  joinedAt: { type: Date, required: true, immutable: true },
  retiredAt: { type: Date, default: null },
  sourceRequestId: { type: String, default: null, match: uuidPattern },
}, schemaOptions)

membershipSchema.index({ id: 1 }, { unique: true, name: 'membership_id_unique' })
membershipSchema.index(
  { initiativeId: 1, userId: 1 },
  { unique: true, partialFilterExpression: { state: 'active' }, name: 'membership_active_unique' },
)
membershipSchema.index({ initiativeId: 1, state: 1, joinedAt: 1, id: 1 }, { name: 'membership_initiative' })
membershipSchema.index({ userId: 1, state: 1, id: 1 }, { name: 'membership_user' })

const membershipEventSchema = new mongoose.Schema({
  id: { type: String, required: true, immutable: true, match: uuidPattern },
  initiativeId: { type: String, required: true, immutable: true, match: uuidPattern },
  userId: { type: String, required: true, immutable: true, match: uuidPattern },
  membershipId: { type: String, required: true, immutable: true, match: uuidPattern },
  type: { type: String, required: true, enum: ['joined', 'retired'] },
  occurredAt: { type: Date, required: true, immutable: true },
  actorId: { type: String, required: true, immutable: true, match: uuidPattern },
  requestId: { type: String, default: null, match: uuidPattern },
}, schemaOptions)

membershipEventSchema.index({ id: 1 }, { unique: true, name: 'membership_event_id_unique' })
membershipEventSchema.index({ initiativeId: 1, occurredAt: 1, id: 1 }, { name: 'membership_event_initiative' })
membershipEventSchema.index({ userId: 1, occurredAt: 1, id: 1 }, { name: 'membership_event_user' })

export function getInitiativeModels(connection) {
  if (!connection) throw new TypeError('getInitiativeModels requiere una conexión.')
  return Object.freeze({
    Initiative: connection.models.Initiative
      ?? connection.model('Initiative', initiativeSchema, 'initiatives'),
    Membership: connection.models.Membership
      ?? connection.model('Membership', membershipSchema, 'memberships'),
    MembershipEvent: connection.models.MembershipEvent
      ?? connection.model('MembershipEvent', membershipEventSchema, 'membershipEvents'),
  })
}

export async function ensureInitiativeIndexes(models) {
  await Promise.all([
    models.Initiative.createIndexes(),
    models.Membership.createIndexes(),
    models.MembershipEvent.createIndexes(),
  ])
}
