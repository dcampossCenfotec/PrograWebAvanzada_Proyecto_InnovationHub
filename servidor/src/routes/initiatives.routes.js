import { Router } from 'express'

export function createInitiativesRouter(controller, requireSession) {
  const router = Router()
  router.post('/', requireSession, controller.createInitiative)
  router.put('/:id', requireSession, controller.updateInitiative)
  return router
}
