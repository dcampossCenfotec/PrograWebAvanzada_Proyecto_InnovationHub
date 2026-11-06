
import { Router } from 'express'
import { createOptionalAuthenticationMiddleware } from '../middleware/authentication.js'

export function createMembersInitiativeRouter(controller, requireSession) {
  const router = Router()
  router.get('/:id/members', createOptionalAuthenticationMiddleware(requireSession), controller.list)
  router.delete('/:id/members/:userId', requireSession, controller.remove)
  return router
}
