import { Router } from 'express'
import { createOptionalAuthenticationMiddleware } from '../middleware/authentication.js'

export function createInitiativesRouter(controller, requireSession) {
  const router = Router()
  const optionalSession = createOptionalAuthenticationMiddleware(requireSession)
  router.get('/', optionalSession, controller.listInitiatives)
  router.get('/mine', requireSession, controller.listOwnInitiatives)
  router.get('/:id', optionalSession, controller.getInitiative)
  router.post('/', requireSession, controller.createInitiative)
  router.put('/:id', requireSession, controller.updateInitiative)
  router.delete('/:id', requireSession, controller.deleteInitiative)
  return router
}
