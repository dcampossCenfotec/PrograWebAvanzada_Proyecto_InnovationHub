import test from 'node:test'
import assert from 'node:assert/strict'
import { createMongoDatabase } from '../../src/database/connection.js'
import { assertSafeTestDatabase } from '../../src/database/safety.js'
import { runInTransaction } from '../../src/database/transaction.js'
import { getCatalogModels } from '../../src/models/catalog.models.js'
import { loadCatalogFixtures } from '../../src/seeds/load-catalog-fixtures.js'
import { seedCatalogs } from '../../src/seeds/seed-catalogs.js'

const uri = process.env.MONGODB_TEST_URI?.trim()
const databaseName = process.env.MONGODB_TEST_DATABASE?.trim()
const hasRealDatabase = Boolean(uri && databaseName)

test('seed, índices, persistencia y rollback funcionan en replica set real', {
  skip: hasRealDatabase ? false : 'Requiere MONGODB_TEST_URI y MONGODB_TEST_DATABASE.',
}, async () => {
  assertSafeTestDatabase({ nodeEnvironment: 'test', databaseName })
  const silentLogger = { info() {} }
  const createDatabase = () => createMongoDatabase({
    uri,
    databaseName,
    connectTimeoutMs: 5000,
    logger: silentLogger,
  })

  let database = createDatabase()
  let connection = await database.connect()
  const knownCollections = ['categories', 'skills', 'transaction_probes']

  try {
    await Promise.all(knownCollections.map((name) => connection.collection(name).deleteMany({})))
    const hello = await connection.db.admin().command({ hello: 1 })
    assert.equal(typeof hello.setName, 'string', 'MongoDB debe pertenecer a un replica set.')

    const fixtures = await loadCatalogFixtures()
    assert.deepEqual(await seedCatalogs(connection, fixtures), { categories: 8, skills: 10 })
    assert.deepEqual(await seedCatalogs(connection, fixtures), { categories: 8, skills: 10 })

    const { Category } = getCatalogModels(connection)
    await assert.rejects(
      Category.create({
        ...fixtures.categories[0],
        name: 'Nombre duplicado por ID',
        nameNormalized: 'nombre duplicado por id',
      }),
      (error) => error?.code === 11000,
    )

    const probes = connection.collection('transaction_probes')
    await probes.createIndex({ probeId: 1 }, { unique: true })
    await assert.rejects(runInTransaction(connection, async (session) => {
      await probes.insertOne({ probeId: 'rollback' }, { session })
      await probes.insertOne({ probeId: 'rollback' }, { session })
    }))
    assert.equal(await probes.countDocuments({ probeId: 'rollback' }), 0)

    await database.disconnect()
    database = createDatabase()
    connection = await database.connect()
    const persistedModels = getCatalogModels(connection)
    assert.equal(await persistedModels.Category.countDocuments(), 8)
    assert.equal(await persistedModels.Skill.countDocuments(), 10)
  } finally {
    await Promise.all(knownCollections.map((name) => connection.collection(name).deleteMany({})))
    await database.disconnect()
  }
})
