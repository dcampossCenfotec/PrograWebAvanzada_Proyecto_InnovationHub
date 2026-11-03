import test from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { createApp } from '../../src/app.js'
import { createMongoDatabase } from '../../src/database/connection.js'
import { assertSafeTestDatabase } from '../../src/database/safety.js'
import { createAuthModule } from '../../src/modules/auth.module.js'
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
const webSkillId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'

test('perfiles, directorio y catálogos respetan filtros, privacidad y reemplazo completo', {
  skip: hasRealDatabase ? false : 'Requiere MONGODB_TEST_URI y MONGODB_TEST_DATABASE.',
}, async () => {
  assertSafeTestDatabase({ nodeEnvironment: 'test', databaseName })
  const database = createMongoDatabase({ uri, databaseName, connectTimeoutMs: 5000, logger: { info() {} } })
  const connection = await database.connect()
  const knownCollections = ['categories', 'skills', 'users', 'sessions']

  try {
    await Promise.all(knownCollections.map((name) => connection.collection(name).deleteMany({})))
    const [catalogs, users] = await Promise.all([loadCatalogFixtures(), loadUserFixtures()])
    await seedCatalogs(connection, catalogs)
    await seedUsers(connection, users, demoPassword)
    const authModule = await createAuthModule({ connection, sessionTtlMinutes: 480 })
    const usersModule = await createUsersModule({ connection, requireSession: authModule.requireSession })
    const app = createApp({
      config: { clientOrigin: 'http://localhost:5173', bodyLimit: '100kb' },
      authModule,
      usersModule,
      logger: { info() {}, error() {} },
    })

    const categories = await request(app).get('/api/categories').expect(200)
    assert.equal(categories.body.data.length, 8)
    assert.deepEqual(Object.keys(categories.body.data[0]).sort(), ['id', 'name'])
    await request(app).get('/api/categories?page=1').expect(400).expect(({ body }) => {
      assert.equal(body.error.code, 'INVALID_QUERY')
    })

    const skills = await request(app).get('/api/skills?q=desarrollo&page=1&size=5').expect(200)
    assert.deepEqual(skills.body.data, [{ id: webSkillId, name: 'Desarrollo web' }])
    assert.deepEqual(skills.body.pagination, { page: 1, size: 5, total: 1, totalPages: 1 })
    await request(app).get('/api/skills?q=x').expect(400)
    await request(app).get('/api/skills?size=51').expect(400)

    await request(app).get('/api/users').expect(401)
    const login = await request(app).post('/api/auth/login').send({
      email: 'ana.owner@example.test', password: demoPassword,
    }).expect(200)
    const authorization = `Bearer ${login.body.data.accessToken}`

    const directory = await request(app)
      .get('/api/users?page=1&size=2&sort=lastName&order=asc')
      .set('Authorization', authorization)
      .expect(200)
    assert.deepEqual(directory.body.pagination, { page: 1, size: 2, total: 4, totalPages: 2 })
    assert.equal(directory.body.data.length, 2)
    assert.equal(JSON.stringify(directory.body).includes('email'), false)
    assert.equal(JSON.stringify(directory.body).includes('password'), false)

    const filtered = await request(app)
      .get(`/api/users?skill=${webSkillId}`)
      .set('Authorization', authorization)
      .expect(200)
    assert.equal(filtered.body.pagination.total, 0)
    const byCareer = await request(app)
      .get('/api/users?career=Ingenier%C3%ADa%20del%20Software&availability=high')
      .set('Authorization', authorization)
      .expect(200)
    assert.deepEqual(byCareer.body.data.map(({ id }) => id), [ownerId])
    const byText = await request(app)
      .get('/api/users?q=Ana')
      .set('Authorization', authorization)
      .expect(200)
    assert.deepEqual(byText.body.data.map(({ id }) => id), [ownerId])
    const unknownSkill = await request(app)
      .get('/api/users?skill=99999999-9999-4999-8999-999999999999')
      .set('Authorization', authorization)
      .expect(200)
    assert.deepEqual(unknownSkill.body.data, [])
    const emptyPage = await request(app)
      .get('/api/users?page=9&size=2')
      .set('Authorization', authorization)
      .expect(200)
    assert.deepEqual(emptyPage.body.data, [])
    assert.equal(emptyPage.body.pagination.total, 4)
    await request(app).get('/api/users?page=1&page=2').set('Authorization', authorization).expect(400)
    await request(app).get('/api/users?skill=no-uuid').set('Authorization', authorization).expect(400)

    const own = await request(app).get(`/api/users/${ownerId}`).set('Authorization', authorization).expect(200)
    assert.equal(own.body.data.email, 'ana.owner@example.test')
    const other = await request(app).get(`/api/users/${applicantId}`).set('Authorization', authorization).expect(200)
    assert.equal(other.body.data.email, undefined)
    await request(app).get('/api/users/no-uuid').set('Authorization', authorization).expect(400)
    await request(app)
      .get('/api/users/99999999-9999-4999-8999-999999999999')
      .set('Authorization', authorization)
      .expect(404)

    const profile = {
      firstName: 'Ana María',
      lastName: 'Rojas',
      memberType: 'student',
      career: null,
      bio: 'Perfil actualizado desde API04.',
      interests: [],
      availability: 'medium',
      portfolioUrl: 'https://example.test/ana',
      skills: [{ skillId: webSkillId, level: 'basic' }],
    }
    const updated = await request(app)
      .put('/api/users/me')
      .set('Authorization', authorization)
      .send(profile)
      .expect(200)
    assert.equal(updated.body.data.email, 'ana.owner@example.test')
    assert.equal(updated.body.data.firstName, 'Ana María')
    assert.deepEqual(updated.body.data.skills, profile.skills)
    assert.equal(updated.body.data.career, null)

    await request(app).put('/api/users/me').set('Authorization', authorization).send({
      ...profile, email: 'otro@example.test',
    }).expect(400)
    await request(app).put('/api/users/me').set('Authorization', authorization).send({
      ...profile,
      skills: [{ skillId: '99999999-9999-4999-8999-999999999999', level: 'advanced' }],
    }).expect(400)
    await request(app).put('/api/users/me').set('Authorization', authorization).send({
      ...profile,
      skills: [{ skillId: webSkillId, level: 'basic' }, { skillId: webSkillId, level: 'advanced' }],
    }).expect(400)
    const unchanged = await request(app).get('/api/auth/me').set('Authorization', authorization).expect(200)
    assert.deepEqual(unchanged.body.data.skills, profile.skills)
  } finally {
    await Promise.all(knownCollections.map((name) => connection.collection(name).deleteMany({})))
    await database.disconnect()
  }
})
