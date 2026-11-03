import { createInitiativesController } from '../controllers/initiatives.controller.js'
import { ensureCatalogIndexes, getCatalogModels } from '../models/catalog.models.js'
import { ensureInitiativeIndexes, getInitiativeModels } from '../models/initiative.models.js'
import { createCatalogRepository } from '../repositories/catalog.repository.js'
import { createInitiativesRepository } from '../repositories/initiatives.repository.js'
import { createInitiativesService } from '../services/initiatives.service.js'
import { createInitiativeQueriesRepository } from '../repositories/initiative-queries.repository.js'
import { createInitiativeQueriesService } from '../services/initiative-queries.service.js'
import { createInitiativeRemovalRepository } from '../repositories/initiative-removal.repository.js'
import { createInitiativeRemovalService } from '../services/initiative-removal.service.js'

export async function createInitiativesModule({ connection, requireSession, serviceOptions = {} }) {
  if (!connection || !requireSession) {
    throw new TypeError('createInitiativesModule requiere conexión y autenticación.')
  }
  const models = getInitiativeModels(connection)
  const catalogModels = getCatalogModels(connection)
  await Promise.all([ensureInitiativeIndexes(models), ensureCatalogIndexes(catalogModels)])
  const repository = createInitiativesRepository(models)
  const queriesRepository = createInitiativeQueriesRepository(models)
  await queriesRepository.backfillSearchFields()
  const queriesService = createInitiativeQueriesService({ repository: queriesRepository })
  const catalogRepository = createCatalogRepository(catalogModels)
  const service = createInitiativesService({
    connection,
    initiativesRepository: repository,
    catalogRepository,
    ...serviceOptions,
  })
  const removalRepository = createInitiativeRemovalRepository({ connection, ...models })
  const removalService = createInitiativeRemovalService({
    connection, initiativesRepository: repository, removalRepository,
  })
  return Object.freeze({
    controller: createInitiativesController(service, queriesService, removalService),
    requireSession,
    service,
    repository,
    queriesService,
    removalService,
    removalRepository,
    models,
  })
}
