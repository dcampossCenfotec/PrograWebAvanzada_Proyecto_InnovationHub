
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { createApp } from './app.js'
import { loadEnvironment } from './config/environment.js'
import { createMongoDatabase } from './database/connection.js'
import { createAuthModule } from './modules/auth.module.js'
import { createUsersModule } from './modules/users.module.js'
import { createInitiativesModule } from './modules/initiatives.module.js'
import { createRequestsModule } from './modules/requests.module.js'
import { createProjectsModule } from './modules/projects.module.js'

function closeHttpServer(server) {
  return new Promise((resolveClose, rejectClose) => {
    if (!server.listening) {
      resolveClose()
      return
    }

    server.close((error) => {
      if (error) rejectClose(error)
      else resolveClose()
    })
  })
}

function openHttpServer(app, config, logger) {
  return new Promise((resolveOpen, rejectOpen) => {
    const server = app.listen(config.port, config.host)

    const onError = (error) => {
      server.removeListener('listening', onListening)
      rejectOpen(error)
    }

    const onListening = () => {
      server.removeListener('error', onError)
      logger.info(
        `Innovation Hub API disponible en http://${config.host}:${config.port}.`,
      )
      resolveOpen(server)
    }

    server.once('error', onError)
    server.once('listening', onListening)
  })
}

export async function startServer({
  config = loadEnvironment(),
  logger = console,
  database,
  authModuleFactory = createAuthModule,
  usersModuleFactory = createUsersModule,
  initiativesModuleFactory = createInitiativesModule,
  requestsModuleFactory = createRequestsModule,
  projectsModuleFactory = createProjectsModule,
} = {}) {
  const activeDatabase = database ?? createMongoDatabase({
    uri: config.mongoUri,
    databaseName: config.mongoDatabase,
    connectTimeoutMs: config.mongoConnectTimeoutMs,
    logger,
  })

  const connection = await activeDatabase.connect()

  let server
  let app
  let authModule
  let usersModule
  let initiativesModule
  let requestsModule
  let projectsModule

  try {
    authModule = await authModuleFactory({
      connection,
      sessionTtlMinutes: config.authSessionTtlMinutes,
    })

    usersModule = await usersModuleFactory({
      connection,
      requireSession: authModule.requireSession,
    })

    initiativesModule = await initiativesModuleFactory({
      connection,
      requireSession: authModule.requireSession,
    })

    requestsModule = await requestsModuleFactory({
      connection,
      requireSession: authModule.requireSession,
    })

    projectsModule = await projectsModuleFactory({
      connection,
      requireSession: authModule.requireSession,
    })

    app = createApp({
      config,
      authModule,
      usersModule,
      initiativesModule,
      requestsModule,
      projectsModule,
      logger,
    })

    server = await openHttpServer(app, config, logger)
  } catch (error) {
    await activeDatabase.disconnect()
    throw error
  }

  let stopping = false

  const shutdown = async () => {
    if (stopping) return
    stopping = true

    try {
      await closeHttpServer(server)
    } finally {
      await activeDatabase.disconnect()
    }
  }

  async function stopFromSignal(signal) {
    logger.info(
      `Señal ${signal} recibida; cerrando HTTP y MongoDB.`,
    )
    try {
      await shutdown()
    } catch {
      logger.error(
        'No fue posible cerrar el servidor limpiamente.',
      )
      process.exitCode = 1
    }
  }

  const signalHandlers = new Map(
    ['SIGINT', 'SIGTERM'].map((signal) => {
      const handler = () => void stopFromSignal(signal)
      process.once(signal, handler)
      return [signal, handler]
    }),
  )

  server.once('close', () => {
    signalHandlers.forEach((handler, signal) =>
      process.removeListener(signal, handler))
  })

  return {
    app,
    server,
    shutdown,
    database: activeDatabase,
    authModule,
    usersModule,
    initiativesModule,
    requestsModule,
    projectsModule,
  }
}

const isMainModule =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isMainModule) {
  startServer().catch((error) => {
    console.error(
      `No fue posible iniciar Innovation Hub API: ${error.message}`,
    )
    process.exitCode = 1
  })
}
