
import { Router } from 'express'
import {
  createOptionalAuthenticationMiddleware,
} from '../middleware/authentication.js'

export function createProjectsRouter(
  controller,
  requireSession,
) {
  const router = Router()

  router.get(
    '/',
    createOptionalAuthenticationMiddleware(requireSession),
    controller.list,
  )

  router.get(
    '/:id',
    createOptionalAuthenticationMiddleware(requireSession),
    controller.get,
  )

  return router
}

export function createProjectInitiativeRouter(
  controller,
  requireSession,
) {
  const router = Router()

  router.post(
    '/:id/project',
    requireSession,
    controller.create,
  )

  return router
}
