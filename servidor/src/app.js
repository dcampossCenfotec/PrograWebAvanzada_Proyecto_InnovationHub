import express from 'express'
import { createHealthController } from './controllers/health.controller.js'
import { createCorsMiddleware } from './middleware/cors.js'
import { createErrorHandler } from './middleware/error-handler.js'
import { notFoundMiddleware } from './middleware/not-found.js'
import { requestIdMiddleware } from './middleware/request-id.js'
import { createHealthRouter } from './routes/health.routes.js'
import { createHealthService } from './services/health.service.js'

export function createApp({ config, healthService = createHealthService(), logger = console }) {
  if (!config) throw new Error('createApp requiere una configuración validada.')

  const app = express()
  app.disable('x-powered-by')
  app.use(requestIdMiddleware)
  app.use(createCorsMiddleware(config.clientOrigin))
  app.use(express.json({ limit: config.bodyLimit, strict: true }))

  const healthController = createHealthController(healthService)
  app.use('/api/health', createHealthRouter(healthController))

  app.use(notFoundMiddleware)
  app.use(createErrorHandler({ logger }))
  return app
}
