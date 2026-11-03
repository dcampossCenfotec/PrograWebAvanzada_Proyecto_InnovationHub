import { Router } from 'express'

export function createUsersRouter(controller, requireSession) {
  const router = Router()
  router.get('/', requireSession, controller.listUsers)
  router.put('/me', requireSession, controller.updateOwnProfile)
  router.get('/:id', requireSession, controller.getUser)
  return router
}

export function createCatalogRouter(controller) {
  const router = Router()
  router.get('/categories', controller.listCategories)
  router.get('/skills', controller.listSkills)
  return router
}
