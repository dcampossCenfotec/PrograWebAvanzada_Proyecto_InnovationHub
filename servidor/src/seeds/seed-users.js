import { getAuthModels, ensureAuthIndexes } from '../models/auth.models.js'
import { hashPassword } from '../security/password.js'

export async function seedUsers(connection, users, demoPassword) {
  if (!Array.isArray(users) || users.length === 0) throw new TypeError('El seed requiere usuarios de prueba.')
  if (typeof demoPassword !== 'string' || demoPassword.length < 10 || demoPassword.length > 128 || !/\p{L}/u.test(demoPassword) || !/\p{N}/u.test(demoPassword)) {
    throw new TypeError('DEMO_USER_PASSWORD debe tener entre 10 y 128 caracteres, una letra y un número.')
  }

  const models = getAuthModels(connection)
  await ensureAuthIndexes(models)
  for (const fixture of users) {
    const existing = await models.User.findOne({ id: fixture.id }).select('+passwordHash').exec()
    if (existing) {
      await models.User.updateOne({ id: fixture.id }, { $set: fixture }, { runValidators: true }).exec()
      continue
    }
    await models.User.create({ ...fixture, passwordHash: await hashPassword(demoPassword) })
  }
  return { users: users.length }
}
