export async function runInTransaction(connection, operation) {
  if (!connection || typeof operation !== 'function') {
    throw new TypeError('runInTransaction requiere conexión y operación.')
  }

  const session = await connection.startSession()
  let result
  try {
    await session.withTransaction(async () => {
      result = await operation(session)
    })
    return result
  } finally {
    await session.endSession()
  }
}
