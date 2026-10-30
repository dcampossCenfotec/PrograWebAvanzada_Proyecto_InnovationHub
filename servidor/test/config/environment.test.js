import test from 'node:test'
import assert from 'node:assert/strict'
import { ConfigurationError, loadEnvironment } from '../../src/config/environment.js'

const validEnvironment = {
  NODE_ENV: 'test',
  HOST: '127.0.0.1',
  PORT: '3000',
  CLIENT_ORIGIN: 'http://localhost:5173',
  BODY_LIMIT: '100kb',
}

test('carga y normaliza la configuración HTTP', () => {
  const config = loadEnvironment(validEnvironment)

  assert.deepEqual(config, {
    nodeEnvironment: 'test',
    host: '127.0.0.1',
    port: 3000,
    clientOrigin: 'http://localhost:5173',
    bodyLimit: '100kb',
  })
  assert.equal(Object.isFrozen(config), true)
})

test('falla pronto cuando falta una variable requerida', () => {
  assert.throws(
    () => loadEnvironment({ ...validEnvironment, CLIENT_ORIGIN: '' }),
    (error) =>
      error instanceof ConfigurationError &&
      error.message === 'Falta la variable requerida CLIENT_ORIGIN.',
  )
})

test('rechaza puerto, entorno, límite y origen inseguros', () => {
  assert.throws(
    () => loadEnvironment({ ...validEnvironment, PORT: '70000' }),
    /PORT debe ser un entero entre 1 y 65535/,
  )
  assert.throws(
    () => loadEnvironment({ ...validEnvironment, NODE_ENV: 'staging' }),
    /NODE_ENV debe ser development, test o production/,
  )
  assert.throws(
    () => loadEnvironment({ ...validEnvironment, BODY_LIMIT: 'mucho' }),
    /BODY_LIMIT debe usar un entero/,
  )
  assert.throws(
    () => loadEnvironment({ ...validEnvironment, BODY_LIMIT: '0kb' }),
    /BODY_LIMIT debe usar un entero/,
  )
  assert.throws(
    () => loadEnvironment({ ...validEnvironment, CLIENT_ORIGIN: '*' }),
    /CLIENT_ORIGIN debe ser un origen HTTP\(S\)/,
  )
  assert.throws(
    () => loadEnvironment({ ...validEnvironment, CLIENT_ORIGIN: 'http://localhost:5173/path' }),
    /CLIENT_ORIGIN debe ser un origen HTTP\(S\) explícito/,
  )
})
