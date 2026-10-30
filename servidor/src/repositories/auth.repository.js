export function createAuthRepository({ User, Session }) {
  if (!User || !Session) throw new TypeError('createAuthRepository requiere modelos de usuario y sesión.')

  return Object.freeze({
    createUser(data, session) {
      return new User(data).save({ session })
    },
    findUserByNormalizedEmail(emailNormalized) {
      return User.findOne({ emailNormalized }).select('+passwordHash').exec()
    },
    findActiveUserById(id) {
      return User.findOne({ id, active: true }).exec()
    },
    createSession(data, session) {
      return new Session(data).save({ session })
    },
    findSessionByTokenHash(tokenHash) {
      return Session.findOne({ tokenHash }).select('+tokenHash').exec()
    },
    revokeSession(id, revokedAt) {
      return Session.findOneAndUpdate(
        { id, revokedAt: null, expiresAt: { $gt: revokedAt } },
        { $set: { revokedAt } },
        { returnDocument: 'after' },
      ).exec()
    },
  })
}
