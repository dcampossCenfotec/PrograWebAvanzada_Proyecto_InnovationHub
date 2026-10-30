import test from 'node:test'
import assert from 'node:assert/strict'
import { createMongoDatabase } from '../../src/database/connection.js'
import { DatabaseConnectionError } from '../../src/database/errors.js'

function createFakeConnection({ fail = false } = {}) {
  return {
    readyState: 0,
    closeCalls: 0,
    async asPromise() {
      if (fail) throw new Error('mongodb://usuario:secreto@host/base')
      this.readyState = 1
      return this
    },
    async close() {
      this.closeCalls += 1
      this.readyState = 0
    },
  }
}

test('reutiliza la conexión activa y la cierra una sola vez', async () => {
  const connection = createFakeConnection()
  let factoryCalls = 0
  const database = createMongoDatabase({
    uri: 'mongodb://127.0.0.1:27017',
    databaseName: 'innovation_hub_test',
    connectTimeoutMs: 500,
    logger: { info() {} },
    connectionFactory() {
      factoryCalls += 1
      return connection
    },
  })

  assert.equal(await database.connect(), connection)
  assert.equal(await database.connect(), connection)
  assert.equal(database.getConnection(), connection)
  assert.equal(factoryCalls, 1)

  await database.disconnect()
  await database.disconnect()
  assert.equal(connection.closeCalls, 1)
  assert.throws(() => database.getConnection(), DatabaseConnectionError)
})

test('sanea el fallo de conexión y no expone la URI original', async () => {
  const connection = createFakeConnection({ fail: true })
  const database = createMongoDatabase({
    uri: 'mongodb://usuario:secreto@host/base',
    databaseName: 'innovation_hub_test',
    connectTimeoutMs: 500,
    logger: { info() {} },
    connectionFactory: () => connection,
  })

  await assert.rejects(
    database.connect(),
    (error) =>
      error instanceof DatabaseConnectionError &&
      error.message === 'No fue posible conectar con MongoDB.' &&
      !error.message.includes('secreto'),
  )
  assert.equal(connection.closeCalls, 1)
})
