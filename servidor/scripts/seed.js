
import { loadEnvironment } from '../src/config/environment.js'
import { createMongoDatabase } from '../src/database/connection.js'
import { loadCatalogFixtures } from '../src/seeds/load-catalog-fixtures.js'
import { seedCatalogs } from '../src/seeds/seed-catalogs.js'
import { loadUserFixtures } from '../src/seeds/load-user-fixtures.js'
import { seedUsers } from '../src/seeds/seed-users.js'
import { loadInitiativeFixtures } from '../src/seeds/load-initiative-fixtures.js'
import { seedInitiatives } from '../src/seeds/seed-initiatives.js'
import { loadParticipationFixtures } from '../src/seeds/load-participation-fixtures.js'
import { seedParticipation } from '../src/seeds/seed-participation.js'

const config = loadEnvironment()

// Proteger producción antes de conectar o escribir en MongoDB.
if (config.nodeEnvironment === 'production') {
  throw new Error(
    'El seed de datos demo no se ejecuta en producción.',
  )
}

const database = createMongoDatabase({
  uri: config.mongoUri,
  databaseName: config.mongoDatabase,
  connectTimeoutMs: config.mongoConnectTimeoutMs,
})

try {
  const connection = await database.connect()

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

  const demoPassword = process.env.DEMO_USER_PASSWORD?.trim()

  const counts = await seedCatalogs(
    connection,
    catalogs,
  )

  const userCounts = await seedUsers(
    connection,
    users,
    demoPassword,
  )

  const initiativeCounts = await seedInitiatives(
    connection,
    initiatives,
  )

  const relatedCounts = await seedParticipation(
    connection,
    participation,
  )

  console.info(
    `Fixtures verificados: ${counts.categories} categorías, ${counts.skills} competencias, ` +
    `${userCounts.users} usuarios, ${initiativeCounts.initiatives} iniciativas, ` +
    `${initiativeCounts.memberships} membresías, ${initiativeCounts.membershipEvents} eventos, ` +
    `${relatedCounts.requests} solicitudes y ${relatedCounts.projects} proyectos. ` +
    `Nuevas inserciones del bloque participación: ` +
    `${relatedCounts.inserted.requests} solicitudes y ${relatedCounts.inserted.projects} proyectos.`,
  )
} catch (error) {
  console.error(
    `No fue posible ejecutar el seed: ${error.message}`,
  )

  process.exitCode = 1
} finally {
  await database.disconnect()
}
