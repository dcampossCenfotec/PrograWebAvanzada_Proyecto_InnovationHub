import { loadEnvironment } from '../src/config/environment.js'
import { createMongoDatabase } from '../src/database/connection.js'
import { loadCatalogFixtures } from '../src/seeds/load-catalog-fixtures.js'
import { seedCatalogs } from '../src/seeds/seed-catalogs.js'
import { loadUserFixtures } from '../src/seeds/load-user-fixtures.js'
import { seedUsers } from '../src/seeds/seed-users.js'

const config = loadEnvironment()
const database = createMongoDatabase({
  uri: config.mongoUri,
  databaseName: config.mongoDatabase,
  connectTimeoutMs: config.mongoConnectTimeoutMs,
})

try {
  const connection = await database.connect()
  const catalogs = await loadCatalogFixtures()
  const users = await loadUserFixtures()
  const demoPassword = process.env.DEMO_USER_PASSWORD?.trim()
  if (config.nodeEnvironment === 'production') throw new Error('El seed de datos demo no se ejecuta en producción.')
  const counts = await seedCatalogs(connection, catalogs)
  const userCounts = await seedUsers(connection, users, demoPassword)
  console.info(
    `Seed completo: ${counts.categories} categorías, ${counts.skills} competencias y ${userCounts.users} usuarios demo.`,
  )
} catch (error) {
  console.error(`No fue posible ejecutar el seed: ${error.message}`)
  process.exitCode = 1
} finally {
  await database.disconnect()
}
