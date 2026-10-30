import test from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { createApp } from '../src/app.js'

const config = Object.freeze({
  nodeEnvironment: 'test',
  host: '127.0.0.1',
  port: 3000,
  clientOrigin: 'http://localhost:5173',
  bodyLimit: '1kb',
})

const silentLogger = { error() {}, info() {} }

function buildApp(options = {}) {
  return createApp({ config, logger: silentLogger, ...options })
}

test('GET /api/health confirma solo la vida de Express', async () => {
  const response = await request(buildApp()).get('/api/health').expect(200)

  assert.deepEqual(response.body, {
    data: { status: 'ok', service: 'innovation-hub-api' },
  })
  assert.match(response.headers['x-request-id'], /^[0-9a-f-]{36}$/)
  assert.equal(response.headers['x-powered-by'], undefined)
})

test('una ruta inexistente usa el error uniforme sin detalles internos', async () => {
  const response = await request(buildApp()).get('/api/no-existe').expect(404)

  assert.deepEqual(response.body, {
    error: {
      code: 'NOT_FOUND',
      message: 'No se encontró el recurso solicitado.',
      fields: {},
    },
  })
})

test('JSON roto se traduce a 400 INVALID_JSON', async () => {
  const response = await request(buildApp())
    .post('/api/no-existe')
    .set('Content-Type', 'application/json')
    .send('{"title":')
    .expect(400)

  assert.deepEqual(response.body, {
    error: {
      code: 'INVALID_JSON',
      message: 'El cuerpo de la solicitud no contiene JSON válido.',
      fields: {},
    },
  })
})

test('un cuerpo que supera el límite se rechaza sin procesarlo', async () => {
  const response = await request(buildApp())
    .post('/api/no-existe')
    .send({ text: 'a'.repeat(2048) })
    .expect(400)

  assert.equal(response.body.error.code, 'INVALID_JSON')
  assert.equal(response.body.error.fields.constructor, Object)
})

test('un fallo inesperado produce 500 sanitizado', async () => {
  const healthService = {
    getStatus() {
      throw new Error('mongodb://usuario:secreto@host/base')
    },
  }
  const response = await request(buildApp({ healthService })).get('/api/health').expect(500)
  const serialized = JSON.stringify(response.body)

  assert.deepEqual(response.body, {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'No fue posible completar la operación.',
      fields: {},
    },
  })
  assert.equal(serialized.includes('secreto'), false)
  assert.equal(serialized.includes('stack'), false)
})

test('CORS permite el origen configurado y responde el preflight', async () => {
  const response = await request(buildApp())
    .options('/api/health')
    .set('Origin', config.clientOrigin)
    .set('Access-Control-Request-Method', 'GET')
    .expect(204)

  assert.equal(response.headers['access-control-allow-origin'], config.clientOrigin)
  assert.match(response.headers['access-control-allow-methods'], /GET/)
})

test('CORS rechaza otro origen con error uniforme', async () => {
  const response = await request(buildApp())
    .get('/api/health')
    .set('Origin', 'https://malicioso.example')
    .expect(403)

  assert.deepEqual(response.body, {
    error: {
      code: 'FORBIDDEN',
      message: 'El origen de la solicitud no está permitido.',
      fields: {},
    },
  })
})

test('una solicitud sin Origin funciona porque CORS no autentica', async () => {
  const response = await request(buildApp()).get('/api/health').expect(200)

  assert.equal(response.headers['access-control-allow-origin'], undefined)
})
