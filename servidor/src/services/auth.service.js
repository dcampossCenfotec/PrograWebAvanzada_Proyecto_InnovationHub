import { randomUUID } from 'node:crypto'
import { HttpError } from '../errors/http-error.js'
import { runInTransaction } from '../database/transaction.js'
import { hashPassword, verifyPassword } from '../security/password.js'
import { createOpaqueToken, hashToken } from '../security/token.js'
import { validateLogin, validateRegistration } from '../validation/auth.validation.js'

const invalidCredentials = () => new HttpError(401, 'INVALID_CREDENTIALS', 'El correo o la contraseña no son válidos.')
const authenticationRequired = () => new HttpError(401, 'AUTHENTICATION_REQUIRED', 'Se requiere una sesión válida.')

function isDuplicateEmail(error) {
  return error?.code === 11000 && (error?.keyPattern?.emailNormalized || error?.keyValue?.emailNormalized)
}

export function createAuthService({
  connection,
  repository,
  sessionTtlMinutes,
  dummyPasswordHash,
  clock = () => new Date(),
  createId = randomUUID,
  passwordHasher = hashPassword,
  passwordVerifier = verifyPassword,
  tokenFactory = createOpaqueToken,
}) {
  if (!connection || !repository || !dummyPasswordHash) {
    throw new TypeError('createAuthService requiere conexión, repositorio y hash de comparación.')
  }

  async function createSession(userId, session) {
    const now = clock()
    const accessToken = tokenFactory()
    const expiresAt = new Date(now.getTime() + sessionTtlMinutes * 60_000)
    await repository.createSession({
      id: createId(),
      userId,
      tokenHash: hashToken(accessToken),
      expiresAt,
      revokedAt: null,
      createdAt: now,
    }, session)
    return { accessToken, expiresAt }
  }

  return Object.freeze({
    async register(input) {
      const data = validateRegistration(input)
      const passwordHash = await passwordHasher(data.password)
      const now = clock()
      try {
        return await runInTransaction(connection, async (session) => {
          const user = await repository.createUser({
            id: createId(),
            firstName: data.firstName,
            lastName: data.lastName,
            memberType: data.memberType,
            email: data.email,
            emailNormalized: data.emailNormalized,
            passwordHash,
            career: null,
            bio: null,
            interests: [],
            availability: 'medium',
            portfolioUrl: null,
            skills: [],
            active: true,
            createdAt: now,
            updatedAt: now,
          }, session)
          return { user, ...(await createSession(user.id, session)) }
        })
      } catch (error) {
        if (isDuplicateEmail(error)) {
          throw new HttpError(409, 'EMAIL_ALREADY_EXISTS', 'Ya existe una cuenta con ese correo electrónico.', {
            email: 'Ya está registrado.',
          })
        }
        throw error
      }
    },

    async login(input) {
      const data = validateLogin(input)
      const user = await repository.findUserByNormalizedEmail(data.emailNormalized)
      const matches = await passwordVerifier(data.password, user?.passwordHash ?? dummyPasswordHash)
      if (!user || !matches || !user.active) throw invalidCredentials()
      return { user, ...(await createSession(user.id)) }
    },

    async authenticate(accessToken) {
      if (typeof accessToken !== 'string' || accessToken.length < 20 || accessToken.length > 512) {
        throw authenticationRequired()
      }
      const session = await repository.findSessionByTokenHash(hashToken(accessToken))
      if (!session || session.revokedAt) throw authenticationRequired()
      const now = clock()
      if (session.expiresAt <= now) {
        throw new HttpError(401, 'SESSION_EXPIRED', 'La sesión expiró. Inicia sesión nuevamente.')
      }
      const user = await repository.findActiveUserById(session.userId)
      if (!user) throw authenticationRequired()
      return { user, session }
    },

    async logout(sessionId) {
      const revoked = await repository.revokeSession(sessionId, clock())
      if (!revoked) throw authenticationRequired()
    },
  })
}
