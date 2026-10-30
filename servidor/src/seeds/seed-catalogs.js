import { getCatalogModels, ensureCatalogIndexes } from '../models/catalog.models.js'
import { createCatalogRepository } from '../repositories/catalog.repository.js'
import { runInTransaction } from '../database/transaction.js'

export async function seedCatalogs(connection, catalogs) {
  const models = getCatalogModels(connection)
  await ensureCatalogIndexes(models)
  const repository = createCatalogRepository(models)

  await runInTransaction(connection, async (session) => {
    await repository.upsertCatalogs(catalogs, { session })
  })

  return repository.countCatalogs()
}
