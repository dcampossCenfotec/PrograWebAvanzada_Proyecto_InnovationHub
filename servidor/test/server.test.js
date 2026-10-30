import test from 'node:test'
import assert from 'node:assert/strict'
import { once } from 'node:events'
import { createServer } from 'node:net'
import { startServer } from '../src/server.js'

const config = Object.freeze({
  nodeEnvironment: 'test',
  host: '127.0.0.1',
  port: 0,
  clientOrigin: 'http://localhost:5173',
  bodyLimit: '100kb',
})

test('conecta MongoDB antes de escuchar y cierra HTTP antes de desconectar', async () => {
  const messages = []
  const events = []
  const logger = {
    info(message) { messages.push(message) },
    error(message) { messages.push(message) },
  }
  const database = {
    async connect() { events.push('database:connect') },
    async disconnect() { events.push('database:disconnect') },
  }

  const instance = await startServer({ config, logger, database })
  if (!instance.server.listening) await once(instance.server, 'listening')

  const address = instance.server.address()
  assert.equal(address.address, '127.0.0.1')
  assert.ok(address.port > 0)
  assert.deepEqual(events, ['database:connect'])

  await instance.shutdown()
  assert.equal(instance.server.listening, false)
  assert.deepEqual(events, ['database:connect', 'database:disconnect'])
  assert.equal(messages.some((message) => message.includes('Innovation Hub API')), true)
})

test('no abre el puerto cuando MongoDB no está disponible', async () => {
  const database = {
    async connect() { throw new Error('MongoDB sin respuesta') },
    async disconnect() { throw new Error('no debe llamarse') },
  }

  await assert.rejects(startServer({ config, database }), /MongoDB sin respuesta/)
})

test('cierra MongoDB si el puerto HTTP ya está ocupado', async () => {
  const occupyingServer = createServer()
  occupyingServer.listen(0, '127.0.0.1')
  await once(occupyingServer, 'listening')

  const events = []
  const database = {
    async connect() { events.push('database:connect') },
    async disconnect() { events.push('database:disconnect') },
  }

  try {
    await assert.rejects(
      startServer({
        config: { ...config, port: occupyingServer.address().port },
        database,
      }),
      (error) => error.code === 'EADDRINUSE',
    )
    assert.deepEqual(events, ['database:connect', 'database:disconnect'])
  } finally {
    occupyingServer.close()
    await once(occupyingServer, 'close')
  }
})
