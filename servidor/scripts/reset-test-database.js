import { loadEnvironment } from '../src/config/environment.js'
import { createMongoDatabase } from '../src/database/connection.js'
import { assertSafeTestDatabase } from '../src/database/safety.js'

const config = loadEnvironment()
const database = createMongoDatabase({
  uri: config.mongoUri,
  databaseName: config.mongoDatabase,
  connectTimeoutMs: config.mongoConnectTimeoutMs,
})

try {
  assertSafeTestDatabase({
    nodeEnvironment: config.nodeEnvironment,
    databaseName: config.mongoDatabase,
  })
  const connection = await database.connect()
  await connection.dropDatabase()
  console.info(`Base de pruebas ${config.mongoDatabase} eliminada.`)
} catch (error) {
  console.error(`Reset rechazado: ${error.message}`)
  process.exitCode = 1
} finally {
  await database.disconnect()
}
