import test from 'node:test'
import assert from 'node:assert/strict'
import { assertApplicationDatabase, assertSafeTestDatabase } from '../../src/database/safety.js'
import { UnsafeDatabaseOperationError } from '../../src/database/errors.js'

test('impide usar bases reservadas de MongoDB', () => {
  for (const databaseName of ['admin', 'config', 'local']) {
    assert.throws(() => assertApplicationDatabase(databaseName), UnsafeDatabaseOperationError)
  }
  assert.doesNotThrow(() => assertApplicationDatabase('innovation_hub'))
})

test('el reset solo admite una base de pruebas en NODE_ENV test', () => {
  assert.doesNotThrow(() => assertSafeTestDatabase({
    nodeEnvironment: 'test',
    databaseName: 'innovation_hub_test',
  }))
  assert.doesNotThrow(() => assertSafeTestDatabase({
    nodeEnvironment: 'test',
    databaseName: 'test-innovation-hub',
  }))

  assert.throws(() => assertSafeTestDatabase({
    nodeEnvironment: 'development',
    databaseName: 'innovation_hub_test',
  }), UnsafeDatabaseOperationError)
  assert.throws(() => assertSafeTestDatabase({
    nodeEnvironment: 'test',
    databaseName: 'innovation_hub',
  }), UnsafeDatabaseOperationError)
})
