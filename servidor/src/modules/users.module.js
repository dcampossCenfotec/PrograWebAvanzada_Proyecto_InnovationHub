import { createUsersController } from '../controllers/users.controller.js'
import { getAuthModels } from '../models/auth.models.js'
import { ensureCatalogIndexes, getCatalogModels } from '../models/catalog.models.js'
import { createCatalogRepository } from '../repositories/catalog.repository.js'
import { createUsersRepository } from '../repositories/users.repository.js'
import { createUsersService } from '../services/users.service.js'

export async function createUsersModule({ connection, requireSession }) {
  if (!connection || !requireSession) throw new TypeError('createUsersModule requiere conexión y autenticación.')
  const authModels = getAuthModels(connection)
  const catalogModels = getCatalogModels(connection)
  await ensureCatalogIndexes(catalogModels)
  const usersRepository = createUsersRepository(authModels)
  const catalogRepository = createCatalogRepository(catalogModels)
  const service = createUsersService({ usersRepository, catalogRepository })
  return Object.freeze({
    controller: createUsersController(service),
    requireSession,
    service,
  })
}
