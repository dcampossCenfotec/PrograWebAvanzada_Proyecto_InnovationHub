import { UnsafeDatabaseOperationError } from './errors.js'

const reservedDatabases = new Set(['admin', 'config', 'local'])
const safeTestDatabasePattern = /(?:^test[_-]|[_-]test$)/i

export function assertApplicationDatabase(databaseName) {
  if (reservedDatabases.has(databaseName.toLowerCase())) {
    throw new UnsafeDatabaseOperationError(`La base reservada ${databaseName} no puede usarse para la aplicación.`)
  }
}

export function assertSafeTestDatabase({ nodeEnvironment, databaseName }) {
  if (nodeEnvironment !== 'test' || !safeTestDatabasePattern.test(databaseName)) {
    throw new UnsafeDatabaseOperationError(
      'La operación destructiva requiere NODE_ENV=test y un nombre de base que empiece o termine en test.',
    )
  }
  assertApplicationDatabase(databaseName)
}
