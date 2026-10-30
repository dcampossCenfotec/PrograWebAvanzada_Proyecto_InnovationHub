import test from 'node:test'
import assert from 'node:assert/strict'
import { once } from 'node:events'
import { startServer } from '../src/server.js'

const config = Object.freeze({
  nodeEnvironment: 'test',
  host: '127.0.0.1',
  port: 0,
  clientOrigin: 'http://localhost:5173',
  bodyLimit: '100kb',
})

test('separa la escucha de la app y permite cierre limpio', async () => {
  const messages = []
  const logger = {
    info(message) { messages.push(message) },
    error(message) { messages.push(message) },
  }
  const instance = startServer({ config, logger })
  if (!instance.server.listening) await once(instance.server, 'listening')

  const address = instance.server.address()
  assert.equal(address.address, '127.0.0.1')
  assert.ok(address.port > 0)

  await instance.shutdown()
  assert.equal(instance.server.listening, false)
  assert.equal(messages.some((message) => message.includes('Innovation Hub API')), true)
})
