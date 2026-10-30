import mongoose from 'mongoose'
import { DatabaseConnectionError } from './errors.js'

export function createMongoDatabase({
  uri,
  databaseName,
  connectTimeoutMs,
  logger = console,
  connectionFactory = mongoose.createConnection.bind(mongoose),
}) {
  if (!uri || !databaseName) {
    throw new TypeError('createMongoDatabase requiere URI y nombre de base validados.')
  }

  let connection = null

  async function connect() {
    if (connection?.readyState === 1) return connection
    if (connection) await disconnect()

    const candidate = connectionFactory(uri, {
      autoIndex: false,
      dbName: databaseName,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: connectTimeoutMs,
    })
    connection = candidate

    try {
      await candidate.asPromise()
      logger.info(`MongoDB conectado a la base ${databaseName}.`)
      return candidate
    } catch {
      try {
        await candidate.close()
      } catch {
        // El error de cierre no debe ocultar el fallo de conexión original.
      }
      connection = null
      throw new DatabaseConnectionError()
    }
  }

  function getConnection() {
    if (!connection || connection.readyState !== 1) {
      throw new DatabaseConnectionError('MongoDB no está conectado.')
    }
    return connection
  }

  async function disconnect() {
    if (!connection) return
    const activeConnection = connection
    connection = null
    await activeConnection.close()
    logger.info('Conexión MongoDB cerrada.')
  }

  return Object.freeze({ connect, disconnect, getConnection })
}
