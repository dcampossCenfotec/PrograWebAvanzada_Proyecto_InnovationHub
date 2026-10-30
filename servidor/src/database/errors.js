export class DatabaseConnectionError extends Error {
  constructor(message = 'No fue posible conectar con MongoDB.') {
    super(message)
    this.name = 'DatabaseConnectionError'
  }
}

export class UnsafeDatabaseOperationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'UnsafeDatabaseOperationError'
  }
}
