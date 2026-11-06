
import { Router } from 'express'

export function createRequestsRouter(controller, requireSession) {
  const router = Router()
  router.use(requireSession)
  router.get('/', controller.list)
  router.get('/:id', controller.get)
  router.put('/:id', controller.update)
  router.post('/:id/cancel', controller.cancel)
  router.post('/:id/decision', controller.decide)
  return router
}

export function createRequestInitiativeRouter(controller, requireSession) {
  const router = Router()
  router.post('/:id/requests', requireSession, controller.create)
  return router
}
