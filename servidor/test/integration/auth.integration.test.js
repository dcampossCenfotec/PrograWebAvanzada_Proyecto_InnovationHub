import test from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { createApp } from '../../src/app.js'
import { createMongoDatabase } from '../../src/database/connection.js'
import { assertSafeTestDatabase } from '../../src/database/safety.js'
import { createAuthModule } from '../../src/modules/auth.module.js'
import { hashToken } from '../../src/security/token.js'
import { loadUserFixtures } from '../../src/seeds/load-user-fixtures.js'
import { seedUsers } from '../../src/seeds/seed-users.js'

const uri = process.env.MONGODB_TEST_URI?.trim()
const databaseName = process.env.MONGODB_TEST_DATABASE?.trim()
const hasRealDatabase = Boolean(uri && databaseName)
const demoPassword = 'DemoSegura2026'

const registration = {
  firstName: 'Sofía',
  lastName: 'Campos',
  memberType: 'student',
  email: 'sofia.concurrente@example.test',
  password: 'Registro2026Seguro',
  passwordConfirmation: 'Registro2026Seguro',
  termsAccepted: true,
}

test('autenticación persiste hashes, protege carreras y revoca sesiones en MongoDB real', {
  skip: hasRealDatabase ? false : 'Requiere MONGODB_TEST_URI y MONGODB_TEST_DATABASE.',
}, async () => {
  assertSafeTestDatabase({ nodeEnvironment: 'test', databaseName })
  const database = createMongoDatabase({
    uri,
    databaseName,
    connectTimeoutMs: 5000,
    logger: { info() {} },
  })
  const connection = await database.connect()
  const knownCollections = ['users', 'sessions']

  try {
    await Promise.all(knownCollections.map((name) => connection.collection(name).deleteMany({})))
    const fixtures = await loadUserFixtures()
    await seedUsers(connection, fixtures, demoPassword)
    const authModule = await createAuthModule({ connection, sessionTtlMinutes: 480 })
    const app = createApp({
      config: {
        clientOrigin: 'http://localhost:5173',
        bodyLimit: '100kb',
      },
      authModule,
      logger: { info() {}, error() {} },
    })

    const hashesBefore = await authModule.models.User.find({}).select('+passwordHash').sort({ id: 1 }).lean()
    assert.equal(hashesBefore.length, 5)
    assert.equal(new Set(hashesBefore.map(({ passwordHash }) => passwordHash)).size, 5)
    await seedUsers(connection, fixtures, demoPassword)
    const hashesAfter = await authModule.models.User.find({}).select('+passwordHash').sort({ id: 1 }).lean()
    assert.deepEqual(hashesAfter.map(({ passwordHash }) => passwordHash), hashesBefore.map(({ passwordHash }) => passwordHash))

    const concurrent = await Promise.all([
      request(app).post('/api/auth/register').send(registration),
      request(app).post('/api/auth/register').send({ ...registration, firstName: 'Otra' }),
    ])
    assert.deepEqual(concurrent.map(({ status }) => status).sort(), [201, 409])
    assert.equal(await authModule.models.User.countDocuments({ emailNormalized: registration.email }), 1)
    const registered = concurrent.find(({ status }) => status === 201)
    assert.match(registered.headers.location, /^\/api\/users\/[0-9a-f-]{36}$/)
    assert.equal(JSON.stringify(registered.body).includes('password'), false)
    assert.equal(JSON.stringify(registered.body).includes('Hash'), false)

    const unknown = await request(app).post('/api/auth/login').send({
      email: 'nadie@example.test', password: demoPassword,
    }).expect(401)
    const wrong = await request(app).post('/api/auth/login').send({
      email: fixtures[0].email, password: 'Equivocada2026',
    }).expect(401)
    const inactive = await request(app).post('/api/auth/login').send({
      email: fixtures[3].email, password: demoPassword,
    }).expect(401)
    assert.deepEqual(wrong.body, unknown.body)
    assert.deepEqual(inactive.body, unknown.body)

    const login = await request(app).post('/api/auth/login').send({
      email: fixtures[0].email.toUpperCase(), password: demoPassword,
    }).expect(200)
    const token = login.body.data.accessToken
    assert.ok(token.length >= 40)
    assert.equal(await authModule.models.Session.countDocuments({ tokenHash: token }), 0)
    assert.equal(await authModule.models.Session.countDocuments({ tokenHash: hashToken(token) }), 1)

    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`).expect(200)
    assert.equal(me.body.data.email, fixtures[0].email)
    assert.equal(me.body.data.passwordHash, undefined)
    assert.equal(me.body.data.avatarUrl, null)

    await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${token}`).expect(204)
    await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`).expect(401)
    await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${token}`).expect(401)
    await request(app).get('/api/auth/me').set('Authorization', 'Bearer token-corrupto').expect(401)
    await request(app).get('/api/auth/me').expect(401)

    const expiringLogin = await request(app).post('/api/auth/login').send({
      email: fixtures[1].email, password: demoPassword,
    }).expect(200)
    await authModule.models.Session.updateOne(
      { tokenHash: hashToken(expiringLogin.body.data.accessToken) },
      { $set: { expiresAt: new Date(Date.now() - 1000) } },
    )
    const expired = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${expiringLogin.body.data.accessToken}`)
      .expect(401)
    assert.equal(expired.body.error.code, 'SESSION_EXPIRED')
  } finally {
    await Promise.all(knownCollections.map((name) => connection.collection(name).deleteMany({})))
    await database.disconnect()
  }
})
