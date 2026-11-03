import test from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { createApp } from '../../src/app.js'
import { startServer } from '../../src/server.js'
import { createMongoDatabase } from '../../src/database/connection.js'
import { assertSafeTestDatabase } from '../../src/database/safety.js'
import { createAuthModule } from '../../src/modules/auth.module.js'
import { createInitiativesModule } from '../../src/modules/initiatives.module.js'
import { createUsersModule } from '../../src/modules/users.module.js'
import { loadCatalogFixtures } from '../../src/seeds/load-catalog-fixtures.js'
import { loadUserFixtures } from '../../src/seeds/load-user-fixtures.js'
import { seedCatalogs } from '../../src/seeds/seed-catalogs.js'
import { seedUsers } from '../../src/seeds/seed-users.js'

const uri = process.env.MONGODB_TEST_URI?.trim()
const databaseName = process.env.MONGODB_TEST_DATABASE?.trim()
const hasRealDatabase = Boolean(uri && databaseName)
const demoPassword = 'DemoSegura2026'
const ownerId = '11111111-1111-4111-8111-111111111111'
const applicantId = '22222222-2222-4222-8222-222222222222'
const outsiderId = '33333333-3333-4333-8333-333333333333'
const skillId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'

const initiativeInput = {
  title: 'Tutorías colaborativas',
  type: 'idea',
  summary: 'Red universitaria para intercambiar tutorías entre carreras.',
  description: 'La iniciativa coordina sesiones y seguimiento entre estudiantes.',
  problem: 'El apoyo académico informal es difícil de localizar.',
  beneficiaries: 'Estudiantes de todas las carreras',
  categoryId: 'education',
  skillIds: [skillId],
  estimatedMembers: 2,
  visibility: 'public',
  tags: ['tutorías', 'comunidad'],
}

async function login(app, email) {
  const response = await request(app).post('/api/auth/login').send({ email, password: demoPassword }).expect(200)
  return `Bearer ${response.body.data.accessToken}`
}

test('API05 crea y modifica iniciativas de forma atómica y respeta propietario, referencias y estimados', {
  skip: hasRealDatabase ? false : 'Requiere MONGODB_TEST_URI y MONGODB_TEST_DATABASE.',
}, async () => {
  assertSafeTestDatabase({ nodeEnvironment: 'test', databaseName })
  const database = createMongoDatabase({ uri, databaseName, connectTimeoutMs: 5000, logger: { info() {} } })
  const connection = await database.connect()
  const knownCollections = [
    'categories', 'skills', 'users', 'sessions', 'initiatives', 'memberships', 'membershipEvents',
  ]

  try {
    await Promise.all(knownCollections.map((name) => connection.collection(name).deleteMany({})))
    const [catalogs, users] = await Promise.all([loadCatalogFixtures(), loadUserFixtures()])
    await seedCatalogs(connection, catalogs)
    await seedUsers(connection, users, demoPassword)
    const authModule = await createAuthModule({ connection, sessionTtlMinutes: 480 })
    const usersModule = await createUsersModule({ connection, requireSession: authModule.requireSession })
    const initiativesModule = await createInitiativesModule({
      connection,
      requireSession: authModule.requireSession,
    })
    const app = createApp({
      config: { clientOrigin: 'http://localhost:5173', bodyLimit: '100kb' },
      authModule,
      usersModule,
      initiativesModule,
      logger: { info() {}, error() {} },
    })

    await request(app).post('/api/initiatives').send(initiativeInput).expect(401)
    const [ownerAuthorization, outsiderAuthorization] = await Promise.all([
      login(app, 'ana.owner@example.test'),
      login(app, 'carla.outsider@example.test'),
    ])

    const created = await request(app)
      .post('/api/initiatives')
      .set('Authorization', ownerAuthorization)
      .send(initiativeInput)
      .expect(201)
    const initiativeId = created.body.data.id
    assert.equal(created.headers.location, `/api/initiatives/${initiativeId}`)
    assert.equal(created.body.data.state, 'published')
    assert.equal(created.body.data.owner.id, ownerId)
    assert.deepEqual(created.body.data.category, { id: 'education', name: 'Educación' })
    assert.deepEqual(created.body.data.skills, [{ id: skillId, name: 'Desarrollo web' }])
    assert.equal(created.body.data.memberCount, 1)
    assert.equal(created.body.data.availableSpaces, 1)
    assert.equal(created.body.data.access.canRequest, false)
    assert.equal(JSON.stringify(created.body).includes('_id'), false)
    assert.equal(JSON.stringify(created.body).includes('revision'), false)
    for (const field of ['searchText', 'email', 'passwordHash', 'tokenHash']) {
      assert.equal(JSON.stringify(created.body).includes(`"${field}"`), false)
    }

    const [stored, ownerMembership, ownerEvent] = await Promise.all([
      initiativesModule.models.Initiative.findOne({ id: initiativeId }).select('+revision +searchText').lean(),
      initiativesModule.models.Membership.findOne({ initiativeId, userId: ownerId }).lean(),
      initiativesModule.models.MembershipEvent.findOne({ initiativeId, userId: ownerId }).lean(),
    ])
    assert.equal(stored.ownerId, ownerId)
    assert.equal(stored.revision, 0)
    assert.match(stored.searchText, /tutorias/)
    assert.equal(ownerMembership.state, 'active')
    assert.equal(ownerEvent.membershipId, ownerMembership.id)
    assert.equal(ownerEvent.type, 'joined')

    const beforeInvalid = await initiativesModule.models.Initiative.countDocuments()
    await request(app)
      .post('/api/initiatives')
      .set('Authorization', ownerAuthorization)
      .send({ ...initiativeInput, ownerId: outsiderId })
      .expect(400)
    await request(app)
      .post('/api/initiatives')
      .set('Authorization', ownerAuthorization)
      .send({ ...initiativeInput, categoryId: 'unknown' })
      .expect(400)
    await request(app)
      .post('/api/initiatives')
      .set('Authorization', ownerAuthorization)
      .send({ ...initiativeInput, skillIds: ['99999999-9999-4999-8999-999999999999'] })
      .expect(400)
    for (const extra of [
      { state: 'draft' },
      { id: initiativeId },
      { createdAt: '2026-01-01T00:00:00.000Z' },
      { updatedAt: '2026-01-01T00:00:00.000Z' },
      { memberCount: 99 },
      { skillIds: [skillId, skillId] },
      { tags: ['Tutorías', 'tutorias'] },
      { title: 'Corto' , summary: '' },
    ]) {
      await request(app).post('/api/initiatives')
        .set('Authorization', ownerAuthorization)
        .send({ ...initiativeInput, ...extra })
        .expect(400)
    }
    await request(app).post('/api/initiatives')
      .set('Authorization', ownerAuthorization)
      .send({ title: 'Body incompleto' })
      .expect(400)
    assert.equal(await initiativesModule.models.Initiative.countDocuments(), beforeInvalid)
    assert.equal(await initiativesModule.models.Membership.countDocuments({ initiativeId }), 1)
    assert.equal(await initiativesModule.models.MembershipEvent.countDocuments({ initiativeId }), 1)

    await request(app)
      .put(`/api/initiatives/${initiativeId}`)
      .set('Authorization', outsiderAuthorization)
      .send(initiativeInput)
      .expect(403)
    assert.equal(
      (await initiativesModule.models.Initiative.findOne({ id: initiativeId })).title,
      initiativeInput.title,
    )
    await request(app).put(`/api/initiatives/${initiativeId}`).send(initiativeInput).expect(401)
    await request(app).put(`/api/initiatives/${initiativeId}`)
      .set('Authorization', ownerAuthorization)
      .send({ ...initiativeInput, ownerId: outsiderId })
      .expect(400)
    await request(app)
      .put('/api/initiatives/no-uuid')
      .set('Authorization', ownerAuthorization)
      .send(initiativeInput)
      .expect(400)
    await request(app)
      .put('/api/initiatives/99999999-9999-4999-8999-999999999999')
      .set('Authorization', ownerAuthorization)
      .send(initiativeInput)
      .expect(404)

    await initiativesModule.models.Membership.create([
      {
        id: '30000000-0000-4000-8000-000000000098',
        initiativeId,
        userId: applicantId,
        role: 'Apoyo académico',
        state: 'active',
        joinedAt: new Date('2026-11-03T13:00:00.000Z'),
        retiredAt: null,
        sourceRequestId: null,
      },
      {
        id: '30000000-0000-4000-8000-000000000097',
        initiativeId,
        userId: outsiderId,
        role: 'Coordinación',
        state: 'active',
        joinedAt: new Date('2026-11-03T13:05:00.000Z'),
        retiredAt: null,
        sourceRequestId: null,
      },
    ])

    const preserved = await request(app)
      .put(`/api/initiatives/${initiativeId}`)
      .set('Authorization', ownerAuthorization)
      .send({ ...initiativeInput, title: 'Tutorías colaborativas actualizadas' })
      .expect(200)
    assert.equal(preserved.body.data.estimatedMembers, 2)
    assert.equal(preserved.body.data.memberCount, 3)
    assert.equal(preserved.body.data.availableSpaces, 0)
    assert.equal(preserved.body.data.title, 'Tutorías colaborativas actualizadas')
    assert.equal(preserved.body.data.createdAt, created.body.data.createdAt)
    assert.equal(preserved.body.data.owner.id, ownerId)
    assert.ok(new Date(preserved.body.data.updatedAt) > new Date(created.body.data.updatedAt))

    const reduced = await request(app)
      .put(`/api/initiatives/${initiativeId}`)
      .set('Authorization', ownerAuthorization)
      .send({ ...initiativeInput, estimatedMembers: 1 })
      .expect(400)
    assert.equal(reduced.body.error.fields.estimatedMembers, 'No puede reducirse por debajo de los miembros activos.')

    await request(app)
      .put(`/api/initiatives/${initiativeId}`)
      .set('Authorization', ownerAuthorization)
      .send({ ...initiativeInput, estimatedMembers: 4 })
      .expect(200)
    const afterUpdates = await initiativesModule.models.Initiative.findOne({ id: initiativeId }).select('+revision').lean()
    assert.equal(afterUpdates.estimatedMembers, 4)
    assert.equal(afterUpdates.revision, 2)

    // Dos arranques HTTP independientes usan conexiones nuevas sobre la misma base.
    // Solo se cierran estos servidores de prueba, nunca procesos de desarrollo.
    const restartConfig = {
      nodeEnvironment: 'test', host: '127.0.0.1', port: 0,
      clientOrigin: 'http://localhost:5173', bodyLimit: '100kb',
      mongoUri: uri, mongoDatabase: databaseName, mongoConnectTimeoutMs: 5000,
      authSessionTtlMinutes: 480,
    }
    for (let restart = 0; restart < 2; restart += 1) {
      const instance = await startServer({
        config: restartConfig, logger: { info() {}, error() {} },
      })
      try {
        const persisted = await request(instance.server)
          .put(`/api/initiatives/${initiativeId}`)
          .set('Authorization', ownerAuthorization)
          .send({ ...initiativeInput, estimatedMembers: 4 })
          .expect(200)
        assert.equal(persisted.body.data.id, initiativeId)
        assert.equal(persisted.body.data.createdAt, created.body.data.createdAt)
        assert.equal(persisted.body.data.memberCount, 3)
        await request(instance.server).get('/api/initiatives').expect(200)
        await request(instance.server).get(`/api/initiatives/${initiativeId}`).expect(200)
      } finally {
        await instance.shutdown()
      }
    }

    const collisionInitiativeId = '10000000-0000-4000-8000-000000000099'
    const collisionEventId = '40000000-0000-4000-8000-000000000099'
    const collisionIds = [collisionInitiativeId, ownerMembership.id, collisionEventId]
    const ownerUser = await authModule.models.User.findOne({ id: ownerId })
    const failingModule = await createInitiativesModule({
      connection,
      requireSession: authModule.requireSession,
      serviceOptions: { createId: () => collisionIds.shift() },
    })
    await assert.rejects(failingModule.service.createInitiative(ownerUser, initiativeInput))
    assert.equal(await initiativesModule.models.Initiative.countDocuments({ id: collisionInitiativeId }), 0)
    assert.equal(await initiativesModule.models.MembershipEvent.countDocuments({ id: collisionEventId }), 0)

    await initiativesModule.models.Initiative.updateOne(
      { id: initiativeId },
      { $set: { state: 'archived' } },
    )
    const archived = await request(app)
      .put(`/api/initiatives/${initiativeId}`)
      .set('Authorization', ownerAuthorization)
      .send(initiativeInput)
      .expect(409)
    assert.equal(archived.body.error.code, 'STATE_CONFLICT')
  } finally {
    await Promise.all(knownCollections.map((name) => connection.collection(name).deleteMany({})))
    await database.disconnect()
  }
})
