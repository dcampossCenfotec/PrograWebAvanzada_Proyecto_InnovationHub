
import test from 'node:test'
import assert from 'node:assert/strict'
import { createErrorHandler } from '../src/middleware/error-handler.js'

function invoke(error) {
  const logs = []

  const response = {
    headersSent: false,
    locals: { requestId: 'auditoria-123' },

    status(code) {
      this.statusCode = code
      return this
    },

    json(body) {
      this.body = body
      return this
    },
  }

  createErrorHandler({
    logger: {
      error: (message) => logs.push(message),
    },
  })(
    error,
    {},
    response,
    () => {
      throw new Error('No debe propagar')
    },
  )

  return { response, logs }
}

test('API12 devuelve 500 sin datos de MongoDB, stack ni credenciales', () => {
  const secret = 'mongodb://admin:password@localhost:27017'

  const { response, logs } = invoke(
    new Error(
      `Falló índice users.emailNormalized; URI=${secret}`,
    ),
  )

  assert.equal(response.statusCode, 500)

  assert.deepEqual(response.body, {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'No fue posible completar la operación.',
      fields: {},
    },
  })

  assert.ok(
    logs.some((line) => line.includes('auditoria-123')),
  )

  assert.equal(
    JSON.stringify({
      response: response.body,
      logs,
    }).includes(secret),
    false,
  )
})

test('API12 JSON malformado responde 400 seguro', () => {
  const { response } = invoke({
    type: 'entity.parse.failed',
    stack: 'datos internos',
  })

  assert.equal(response.statusCode, 400)
  assert.equal(response.body.error.code, 'INVALID_JSON')

  assert.equal(
    JSON.stringify(response.body).includes('stack'),
    false,
  )
})
