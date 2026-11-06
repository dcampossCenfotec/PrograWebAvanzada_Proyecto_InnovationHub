
import mongoose from 'mongoose'

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const requestSchema = new mongoose.Schema({
  id: { type: String, required: true, immutable: true, match: uuid },
  initiativeId: { type: String, required: true, immutable: true, match: uuid },
  applicantId: { type: String, required: true, immutable: true, match: uuid },
  message: { type: String, required: true, trim: true, minlength: 15, maxlength: 500 },
  offeredSkillId: { type: String, required: true, match: uuid },
  role: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
  availability: { type: String, required: true, enum: ['low', 'medium', 'high'] },
  state: { type: String, required: true, enum: ['pending', 'accepted', 'rejected', 'cancelled'] },
  decisionComment: { type: String, default: null, maxlength: 500 },
  createdAt: { type: Date, required: true, immutable: true },
  updatedAt: { type: Date, required: true },
  decidedAt: { type: Date, default: null },
}, { strict: 'throw', versionKey: false })

requestSchema.index({ id: 1 }, { name: 'request_id_unique', unique: true })
requestSchema.index({ initiativeId: 1, applicantId: 1 }, {
  name: 'pending_request_unique', unique: true, partialFilterExpression: { state: 'pending' },
})
requestSchema.index({ applicantId: 1, createdAt: -1, id: 1 }, { name: 'request_applicant_history' })
requestSchema.index({ initiativeId: 1, state: 1, createdAt: -1, id: 1 }, { name: 'request_initiative_state' })
requestSchema.index({ offeredSkillId: 1, state: 1, id: 1 }, { name: 'request_skill_state' })

export function getRequestModels(connection) {
  if (!connection) throw new TypeError('getRequestModels requiere una conexión.')
  return Object.freeze({
    Request: connection.models.Request ?? connection.model('Request', requestSchema, 'requests'),
  })
}

export async function ensureRequestIndexes(models) {
  await models.Request.createIndexes()
}
