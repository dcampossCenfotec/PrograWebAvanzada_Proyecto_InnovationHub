import { Router } from 'express'

export function createAuthRouter(controller, requireSession) {
  const router = Router()
  router.post('/register', controller.register)
  router.post('/login', controller.login)
  router.post('/logout', requireSession, controller.logout)
  router.get('/me', requireSession, controller.me)
  return router
}
