
import {
  createProjectsController,
} from '../controllers/projects.controller.js'

import {
  getAuthModels,
} from '../models/auth.models.js'

import {
  getInitiativeModels,
} from '../models/initiative.models.js'

import {
  ensureProjectIndexes,
  getProjectModels,
} from '../models/project.models.js'

import {
  createProjectsRepository,
} from '../repositories/projects.repository.js'

import {
  createProjectsService,
} from '../services/projects.service.js'

export async function createProjectsModule({
  connection,
  requireSession,
}) {
  if (!connection || !requireSession) {
    throw new TypeError(
      'Se requiere MongoDB y autenticación.',
    )
  }

  const models = {
    ...getProjectModels(connection),
    ...getInitiativeModels(connection),
    ...getAuthModels(connection),
  }

  await ensureProjectIndexes(models)

  const repository = createProjectsRepository(models)

  const service = createProjectsService({
    connection,
    repository,
  })

  return Object.freeze({
    controller: createProjectsController(service),
    requireSession,
    repository,
    service,
    models,
  })
}
