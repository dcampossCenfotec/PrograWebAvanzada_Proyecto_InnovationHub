import { getInitiativeModels, ensureInitiativeIndexes } from '../models/initiative.models.js'
import { runInTransaction } from '../database/transaction.js'
import { initiativeSearchFields } from '../services/initiative-search.js'

export async function seedInitiatives(connection, fixtures) {
  const models = getInitiativeModels(connection)
  await ensureInitiativeIndexes(models)
  await runInTransaction(connection, async (session) => {
    for (const fixture of fixtures.initiatives) {
      const { id, ownerId, createdAt, ...editable } = fixture
      await models.Initiative.updateOne({ id }, {
        $set: { ...editable, ...initiativeSearchFields(fixture) },
        $setOnInsert: { id, ownerId, createdAt, revision: 0 },
      }, { upsert: true, runValidators: true, session })
    }
    for (const fixture of fixtures.memberships) {
      const { id, initiativeId, userId, joinedAt, ...editable } = fixture
      await models.Membership.updateOne({ id }, {
        $set: editable,
        $setOnInsert: { id, initiativeId, userId, joinedAt },
      }, { upsert: true, runValidators: true, session })
    }
    for (const fixture of fixtures.membershipEvents) {
      await models.MembershipEvent.updateOne({ id: fixture.id }, {
        $setOnInsert: fixture,
      }, { upsert: true, runValidators: true, session })
    }
  })
  return {
    initiatives: fixtures.initiatives.length,
    memberships: fixtures.memberships.length,
    membershipEvents: fixtures.membershipEvents.length,
  }
}
