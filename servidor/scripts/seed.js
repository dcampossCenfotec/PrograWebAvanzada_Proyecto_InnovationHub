import { loadEnvironment } from '../src/config/environment.js'
import { createMongoDatabase } from '../src/database/connection.js'
import { loadCatalogFixtures } from '../src/seeds/load-catalog-fixtures.js'
import { seedCatalogs } from '../src/seeds/seed-catalogs.js'

const config = loadEnvironment()
const database = createMongoDatabase({
  uri: config.mongoUri,
  databaseName: config.mongoDatabase,
  connectTimeoutMs: config.mongoConnectTimeoutMs,
})

try {
  const connection = await database.connect()
  const catalogs = await loadCatalogFixtures()
  const counts = await seedCatalogs(connection, catalogs)
  console.info(`Seed de catálogos completo: ${counts.categories} categorías y ${counts.skills} competencias.`)
} catch (error) {
  console.error(`No fue posible ejecutar el seed: ${error.message}`)
  process.exitCode = 1
} finally {
  await database.disconnect()
}
