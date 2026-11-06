
import { createRequestsController } from '../controllers/requests.controller.js'
import { getAuthModels } from '../models/auth.models.js'
import { getCatalogModels } from '../models/catalog.models.js'
import { getInitiativeModels } from '../models/initiative.models.js'
import { ensureRequestIndexes, getRequestModels } from '../models/request.models.js'
import { createRequestsRepository } from '../repositories/requests.repository.js'
import { createRequestsService } from '../services/requests.service.js'

export async function createRequestsModule({ connection, requireSession }) {
  if (!connection || !requireSession) throw new TypeError('Se requiere MongoDB y autenticación.')
  const models = {
    ...getRequestModels(connection), ...getInitiativeModels(connection),
    ...getAuthModels(connection), ...getCatalogModels(connection),
  }
  await ensureRequestIndexes(models)
  const repository = createRequestsRepository(models)
  const service = createRequestsService({ connection, repository })
  return Object.freeze({
    controller: createRequestsController(service), requireSession, service, repository, models,
  })
}
