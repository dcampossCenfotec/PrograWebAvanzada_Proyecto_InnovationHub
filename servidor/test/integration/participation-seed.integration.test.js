
import test from 'node:test'
import assert from 'node:assert/strict'
import { createMongoDatabase } from '../../src/database/connection.js'
import { assertSafeTestDatabase } from '../../src/database/safety.js'
import { loadCatalogFixtures } from '../../src/seeds/load-catalog-fixtures.js'
import { loadUserFixtures } from '../../src/seeds/load-user-fixtures.js'
import { loadInitiativeFixtures } from '../../src/seeds/load-initiative-fixtures.js'
import { loadParticipationFixtures } from '../../src/seeds/load-participation-fixtures.js'
import { seedCatalogs } from '../../src/seeds/seed-catalogs.js'
import { seedUsers } from '../../src/seeds/seed-users.js'
import { seedInitiatives } from '../../src/seeds/seed-initiatives.js'
import { seedParticipation } from '../../src/seeds/seed-participation.js'

const uri = process.env.MONGODB_TEST_URI?.trim()
const databaseName = process.env.MONGODB_TEST_DATABASE?.trim()

test('API13 carga solicitudes y proyectos una sola vez sin reabrir estados', {
  skip: uri && databaseName
    ? false
    : 'Requiere variables MONGODB_TEST_URI y MONGODB_TEST_DATABASE.',
}, async () => {
  assertSafeTestDatabase({
    nodeEnvironment: 'test',
    databaseName,
  })

  const database = createMongoDatabase({
    uri,
    databaseName,
    connectTimeoutMs: 5000,
    logger: { info() {} },
  })

  const connection = await database.connect()

  const names = [
    'sessions',
    'projects',
    'requests',
    'membershipEvents',
    'memberships',
    'initiatives',
    'users',
    'categories',
    'skills',
  ]

  const cleanup = async () => {
    for (const name of names) {
      await connection.collection(name).deleteMany({})
    }
  }

  try {
    await cleanup()

    const [
      catalogs,
      users,
      initiatives,
      participation,
    ] = await Promise.all([
      loadCatalogFixtures(),
      loadUserFixtures(),
      loadInitiativeFixtures(),
      loadParticipationFixtures(),
    ])

    await seedCatalogs(connection, catalogs)
    await seedUsers(connection, users, 'DemoSegura2026')
    await seedInitiatives(connection, initiatives)

    const first = await seedParticipation(
      connection,
      participation,
    )

    assert.deepEqual(
      first.inserted,
      { requests: 5, projects: 1 },
    )

    const requestId = participation.requests.find(
      (row) => row.state === 'pending',
    ).id

    const changed = await connection.collection('requests').updateOne(
      { id: requestId },
      {
        $set: { state: 'cancelled' },
      },
    )

    assert.equal(changed.matchedCount, 1)

    const second = await seedParticipation(
      connection,
      participation,
    )

    assert.deepEqual(
      second.inserted,
      { requests: 0, projects: 0 },
    )

    assert.equal(
      await connection.collection('requests').countDocuments(),
      5,
    )

    assert.equal(
      await connection.collection('projects').countDocuments(),
      1,
    )

    assert.equal(
      (
        await connection.collection('requests')
          .findOne({ id: requestId })
      ).state,
      'cancelled',
    )

    assert.equal(
      (
        await connection.collection('projects').findOne({})
      ).sourceInitiativeId,
      '10000000-0000-4000-8000-000000000008',
    )
  } finally {
    await cleanup()
    await database.disconnect()
  }
})
