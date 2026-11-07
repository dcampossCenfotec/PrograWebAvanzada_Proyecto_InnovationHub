
import express from 'express'
import { createHealthController } from './controllers/health.controller.js'
import { createCorsMiddleware } from './middleware/cors.js'
import { createErrorHandler } from './middleware/error-handler.js'
import { notFoundMiddleware } from './middleware/not-found.js'
import { requestIdMiddleware } from './middleware/request-id.js'
import { createHealthRouter } from './routes/health.routes.js'
import { createHealthService } from './services/health.service.js'
import { createAuthRouter } from './routes/auth.routes.js'
import { createCatalogRouter, createUsersRouter } from './routes/users.routes.js'
import { createInitiativesRouter } from './routes/initiatives.routes.js'
import {
  createRequestsRouter,
  createRequestInitiativeRouter,
} from './routes/requests.routes.js'
import { createMembersInitiativeRouter } from './routes/members.routes.js'
import {
  createProjectInitiativeRouter,
  createProjectsRouter,
} from './routes/projects.routes.js'

export function createApp({
  config,
  healthService = createHealthService(),
  authModule,
  usersModule,
  initiativesModule,
  requestsModule,
  projectsModule,
  logger = console,
}) {
  if (!config) {
    throw new Error('createApp requiere una configuración validada.')
  }

  const app = express()

  app.disable('x-powered-by')
  app.use(requestIdMiddleware)
  app.use(createCorsMiddleware(config.clientOrigin))
  app.use(express.json({
    limit: config.bodyLimit,
    strict: true,
  }))

  const healthController = createHealthController(healthService)
  app.use('/api/health', createHealthRouter(healthController))

  if (authModule) {
    app.use(
      '/api/auth',
      createAuthRouter(
        authModule.controller,
        authModule.requireSession,
      ),
    )
  }

  if (usersModule) {
    app.use(
      '/api/users',
      createUsersRouter(
        usersModule.controller,
        usersModule.requireSession,
      ),
    )
    app.use('/api', createCatalogRouter(usersModule.controller))
  }

  if (initiativesModule) {
    app.use(
      '/api/initiatives',
      createInitiativesRouter(
        initiativesModule.controller,
        initiativesModule.requireSession,
      ),
    )
  }

  if (requestsModule) {
    app.use(
      '/api/requests',
      createRequestsRouter(
        requestsModule.controller,
        requestsModule.requireSession,
      ),
    )
    app.use(
      '/api/initiatives',
      createRequestInitiativeRouter(
        requestsModule.controller,
        requestsModule.requireSession,
      ),
    )
    app.use(
      '/api/initiatives',
      createMembersInitiativeRouter(
        requestsModule.membersController,
        requestsModule.requireSession,
      ),
    )
  }

  if (projectsModule) {
    app.use(
      '/api/projects',
      createProjectsRouter(
        projectsModule.controller,
        projectsModule.requireSession,
      ),
    )
    app.use(
      '/api/initiatives',
      createProjectInitiativeRouter(
        projectsModule.controller,
        projectsModule.requireSession,
      ),
    )
  }

  app.use(notFoundMiddleware)
  app.use(createErrorHandler({ logger }))

  return app
}
