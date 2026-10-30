import { createAuthRepository } from '../repositories/auth.repository.js'
import { getAuthModels, ensureAuthIndexes } from '../models/auth.models.js'
import { hashPassword } from '../security/password.js'
import { createAuthService } from '../services/auth.service.js'
import { createAuthenticationMiddleware } from '../middleware/authentication.js'
import { createAuthController } from '../controllers/auth.controller.js'

export async function createAuthModule({ connection, sessionTtlMinutes }) {
  const models = getAuthModels(connection)
  await ensureAuthIndexes(models)
  const repository = createAuthRepository(models)
  const dummyPasswordHash = await hashPassword('comparacion-interna-2026')
  const service = createAuthService({
    connection,
    repository,
    sessionTtlMinutes,
    dummyPasswordHash,
  })
  return Object.freeze({
    service,
    controller: createAuthController(service),
    requireSession: createAuthenticationMiddleware(service),
    models,
  })
}
