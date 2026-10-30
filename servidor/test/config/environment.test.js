import test from 'node:test'
import assert from 'node:assert/strict'
import { ConfigurationError, loadEnvironment } from '../../src/config/environment.js'

const validEnvironment = {
  NODE_ENV: 'test',
  HOST: '127.0.0.1',
  PORT: '3000',
  CLIENT_ORIGIN: 'http://localhost:5173',
  BODY_LIMIT: '100kb',
  MONGODB_URI: 'mongodb://127.0.0.1:27017/?replicaSet=innovationHubRs&directConnection=true',
  MONGODB_DATABASE: 'innovation_hub_test',
  MONGODB_CONNECT_TIMEOUT_MS: '5000',
}

test('carga y normaliza la configuración HTTP y MongoDB', () => {
  const config = loadEnvironment(validEnvironment)

  assert.deepEqual(config, {
    nodeEnvironment: 'test',
    host: '127.0.0.1',
    port: 3000,
    clientOrigin: 'http://localhost:5173',
    bodyLimit: '100kb',
    mongoUri: validEnvironment.MONGODB_URI,
    mongoDatabase: 'innovation_hub_test',
    mongoConnectTimeoutMs: 5000,
    authSessionTtlMinutes: 480,
  })
  assert.equal(Object.isFrozen(config), true)
})

test('falla pronto cuando falta una variable requerida', () => {
  for (const name of ['CLIENT_ORIGIN', 'MONGODB_URI', 'MONGODB_DATABASE']) {
    assert.throws(
      () => loadEnvironment({ ...validEnvironment, [name]: '' }),
      (error) => error instanceof ConfigurationError && error.message === `Falta la variable requerida ${name}.`,
    )
  }
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

test('rechaza URI, timeout y nombre de base MongoDB inválidos', () => {
  assert.throws(
    () => loadEnvironment({ ...validEnvironment, MONGODB_URI: 'https://localhost:27017' }),
    /MONGODB_URI debe usar el protocolo mongodb/,
  )
  assert.throws(
    () => loadEnvironment({ ...validEnvironment, MONGODB_DATABASE: 'admin' }),
    /MONGODB_DATABASE debe tener/,
  )
  assert.throws(
    () => loadEnvironment({ ...validEnvironment, MONGODB_DATABASE: 'base con espacios' }),
    /MONGODB_DATABASE debe tener/,
  )
  assert.throws(
    () => loadEnvironment({ ...validEnvironment, MONGODB_CONNECT_TIMEOUT_MS: '20' }),
    /MONGODB_CONNECT_TIMEOUT_MS debe ser un entero entre 100 y 60000/,
  )
})

test('valida la duración de la sesión', () => {
  assert.equal(loadEnvironment({ ...validEnvironment, AUTH_SESSION_TTL_MINUTES: '60' }).authSessionTtlMinutes, 60)
  assert.throws(
    () => loadEnvironment({ ...validEnvironment, AUTH_SESSION_TTL_MINUTES: '0' }),
    /AUTH_SESSION_TTL_MINUTES debe ser un entero entre 5 y 10080/,
  )
})
