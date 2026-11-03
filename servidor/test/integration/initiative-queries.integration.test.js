import test from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import request from 'supertest'
import { createApp } from '../../src/app.js'
import { createMongoDatabase } from '../../src/database/connection.js'
import { assertSafeTestDatabase } from '../../src/database/safety.js'
import { createAuthModule } from '../../src/modules/auth.module.js'
import { createUsersModule } from '../../src/modules/users.module.js'
import { createInitiativesModule } from '../../src/modules/initiatives.module.js'
import { loadUserFixtures } from '../../src/seeds/load-user-fixtures.js'
import { loadCatalogFixtures } from '../../src/seeds/load-catalog-fixtures.js'
import { loadInitiativeFixtures } from '../../src/seeds/load-initiative-fixtures.js'
import { seedUsers } from '../../src/seeds/seed-users.js'
import { seedCatalogs } from '../../src/seeds/seed-catalogs.js'
import { seedInitiatives } from '../../src/seeds/seed-initiatives.js'

const uri = process.env.MONGODB_TEST_URI?.trim()
const databaseName = process.env.MONGODB_TEST_DATABASE?.trim()
const ownerId = '11111111-1111-4111-8111-111111111111'
const memberId = '55555555-5555-4555-8555-555555555555'
const outsiderId = '33333333-3333-4333-8333-333333333333'

test('API06 protege detalle y conteos, combina filtros y pagina en MongoDB sin revelar campos ocultos', {
  skip: uri && databaseName ? false : 'Requiere MONGODB_TEST_URI y MONGODB_TEST_DATABASE.',
}, async () => {
  assertSafeTestDatabase({ nodeEnvironment: 'test', databaseName })
  const database = createMongoDatabase({ uri, databaseName, connectTimeoutMs: 5000, logger: { info() {} } })
  const connection = await database.connect()
  const collections = ['users', 'sessions', 'categories', 'skills', 'initiatives', 'memberships', 'membershipEvents', 'requests']
  const cleanup = () => Promise.all(collections.map((name) => connection.collection(name).deleteMany({})))
  try {
    await cleanup()
    const [users, catalogs, fixtures] = await Promise.all([
      loadUserFixtures(), loadCatalogFixtures(), loadInitiativeFixtures(),
    ])
    await seedCatalogs(connection, catalogs)
    await seedUsers(connection, users, 'DemoSegura2026')
    const counts = await seedInitiatives(connection, fixtures)
    assert.deepEqual(counts, { initiatives: 8, memberships: 12, membershipEvents: 13 })
    await seedInitiatives(connection, fixtures)
    for (const [name, count] of Object.entries(counts)) {
      assert.equal(await connection.collection(name).countDocuments(), count)
    }

    // Simular documentos creados con API05 para comprobar migración compatible.
    await connection.collection('initiatives').updateMany({}, { $unset: { publicSearchText: '', titleNormalized: '' } })
    const authModule = await createAuthModule({ connection, sessionTtlMinutes: 480 })
    const usersModule = await createUsersModule({ connection, requireSession: authModule.requireSession })
    const initiativesModule = await createInitiativesModule({ connection, requireSession: authModule.requireSession })
    assert.equal(await connection.collection('initiatives').countDocuments({ publicSearchText: { $exists: true } }), 8)
    const app = createApp({
      config: { clientOrigin: 'http://localhost:5173', bodyLimit: '100kb' },
      authModule, usersModule, initiativesModule, logger: { info() {}, error() {} },
    })
    const tokens = {}
    for (const user of users.filter(({ active }) => active)) {
      const login = await request(app).post('/api/auth/login')
        .send({ email: user.email, password: 'DemoSegura2026' }).expect(200)
      tokens[user.id] = `Bearer ${login.body.data.accessToken}`
    }
    function get(path, actorId = null) {
      const operation = request(app).get(`/api/initiatives${path}`)
      return actorId ? operation.set('Authorization', tokens[actorId]) : operation
    }
    const visitorCatalog = await get('').expect(200)
    assert.equal(visitorCatalog.body.pagination.total, 3)
    const outsiderCatalog = await get('', outsiderId).expect(200)
    assert.equal(outsiderCatalog.body.pagination.total, 5)
    assert.equal((await get('', ownerId).expect(200)).body.pagination.total, 6)
    assert.equal((await get('/mine', ownerId).expect(200)).body.pagination.total, 8)
    assert.equal((await get('/mine', memberId).expect(200)).body.pagination.total, 0)
    await get('/mine').expect(401)

    const privateFixture = fixtures.initiatives.find(({ visibility }) => visibility === 'private')
    const restrictedFixture = fixtures.initiatives.find(({ visibility }) => visibility === 'restricted')
    const safeRestricted = outsiderCatalog.body.data.find(({ id }) => id === restrictedFixture.id)
    for (const field of ['owner', 'tags', 'description', 'problem', 'beneficiaries', 'createdAt', 'updatedAt']) {
      assert.equal(safeRestricted[field], undefined)
    }
    assert.equal(safeRestricted.access.canViewDetails, false)
    assert.equal(safeRestricted.access.canRequest, false)
    assert.equal(outsiderCatalog.body.data.some(({ id }) => id === privateFixture.id), false)

    const matrix = []
    for (const visibility of ['public', 'institutional', 'restricted', 'private']) {
      const row = fixtures.initiatives[0]
      const created = await initiativesModule.service.createInitiative(users[0], {
        title: `Matriz de acceso ${visibility}`,
        type: row.type, summary: 'Resumen visible de la iniciativa para probar permisos.',
        description: 'TextoSecretoDescripcion que jamás debe aparecer en el catálogo restringido.',
        problem: 'TextoSecretoProblema de acceso condicionado.',
        beneficiaries: row.beneficiaries, categoryId: row.categoryId, skillIds: row.skillIds,
        estimatedMembers: 1, visibility, tags: [`EtiquetaOculta${visibility}`],
      })
      const id = created.initiative.id
      matrix.push({ id, visibility })
      await initiativesModule.models.Membership.create({
        id: randomUUID(), initiativeId: id, userId: memberId,
        role: 'Participante', state: 'active', joinedAt: new Date(),
      })
      const visitorExpected = { public: 200, institutional: 401, restricted: 401, private: 404 }[visibility]
      const outsiderExpected = { public: 200, institutional: 200, restricted: 403, private: 404 }[visibility]
      await get(`/${id}`).expect(visitorExpected)
      await get(`/${id}`, outsiderId).expect(outsiderExpected)
      for (const actorId of [ownerId, memberId]) {
        const detail = await get(`/${id}`, actorId).expect(200)
        assert.equal(detail.body.data.description.startsWith('TextoSecretoDescripcion'), true)
        assert.equal(detail.body.data.memberCount, 2)
        assert.equal(detail.body.data.availableSpaces, 0)
        assert.equal(detail.body.data.access.canEdit, actorId === ownerId)
        assert.equal(detail.body.data.access.canRequest, false)
        assert.equal(detail.body.data.access.canConvert, actorId === ownerId)
      }
    }
    const restricted = matrix.find(({ visibility }) => visibility === 'restricted')
    const hidden = await get('?q=EtiquetaOcultarestricted', outsiderId).expect(200)
    assert.equal(hidden.body.pagination.total, 0)
    assert.equal((await get('?q=EtiquetaOcultarestricted', ownerId).expect(200)).body.pagination.total, 1)
    assert.equal((await get('?q=TextoSecretoDescripcion', ownerId).expect(200)).body.pagination.total, 0)
    const ownerFilter = await get(`?ownerId=${ownerId}`, outsiderId).expect(200)
    assert.equal(ownerFilter.body.data.some(({ id }) => id === restricted.id), false)
    assert.equal((await get('?q=MATRIZ', outsiderId).expect(200)).body.pagination.total, 3)

    const publicEntry = matrix.find(({ visibility }) => visibility === 'public')
    assert.equal((await get(`/${publicEntry.id}`, outsiderId).expect(200)).body.data.access.canRequest, true)
    await connection.collection('requests').insertOne({
      id: randomUUID(), initiativeId: publicEntry.id, applicantId: outsiderId, state: 'pending',
    })
    assert.equal((await get(`/${publicEntry.id}`, outsiderId).expect(200)).body.data.access.canRequest, false)
    await connection.collection('requests').deleteMany({})

    const privateEntry = matrix.find(({ visibility }) => visibility === 'private')
    await initiativesModule.models.Membership.updateOne({ initiativeId: privateEntry.id, userId: memberId }, {
      $set: { state: 'retired', retiredAt: new Date() },
    })
    await get(`/${privateEntry.id}`, memberId).expect(404)
    const afterRetirement = await get('', memberId).expect(200)
    assert.equal(afterRetirement.body.data.some(({ id }) => id === privateEntry.id), false)

    const combined = await get(
      `?q=HUERTOS&type=idea&category=sustainability&skill=${fixtures.initiatives[0].skillIds[0]}&state=published&hasSpaces=true&ownerId=${ownerId}`,
    ).expect(200)
    assert.deepEqual(combined.body.data.map(({ id }) => id), [fixtures.initiatives[0].id])
    const accents = await get('?q=MENTORIAS', outsiderId).expect(200)
    assert.deepEqual(accents.body.data.map(({ id }) => id), [fixtures.initiatives[3].id])
    assert.equal((await get('?q=.*', outsiderId).expect(200)).body.pagination.total, 0)
    assert.equal((await get('?skill=99999999-9999-4999-8999-999999999999', outsiderId).expect(200)).body.pagination.total, 0)
    const withoutSpaces = await get('?hasSpaces=false', ownerId).expect(200)
    assert.ok(withoutSpaces.body.data.every(({ availableSpaces }) => availableSpaces === 0))

    for (const suffix of [
      '?page=0', '?size=0', '?size=51', '?page=-1', '?sort=email', '?order=other',
      '?state=archived', '?type=otro', '?hasSpaces=yes', '?ownerId=mal', '?skill=mal',
      '?q=uno&q=dos', '?q[$ne]=x', '?visibility=private', '?from=2026-11-03',
    ]) {
      const invalid = await get(suffix, ownerId).expect(400)
      assert.equal(invalid.body.error.code, 'INVALID_QUERY')
    }
    await get('/mine?ownerId=otro', ownerId).expect(400)
    await get('/invalido', ownerId).expect(400)
    await get('/99999999-9999-4999-8999-999999999999', ownerId).expect(404)
    await get(`/${publicEntry.id}?extra=1`, ownerId).expect(400)
    await request(app).get('/api/initiatives').set('Authorization', 'Bearer roto').expect(401)

    for (const state of ['draft', 'archived']) {
      const entry = fixtures.initiatives.find((item) => item.state === state)
      await get(`/${entry.id}`, ownerId).expect(200)
      await get(`/${entry.id}`, outsiderId).expect(404)
      await get(`/${entry.id}`).expect(404)
    }
    const data = Object.fromEntries(Object.entries(fixtures.initiatives[0])
      .filter(([key]) => !['ownerId', 'id', 'state', 'createdAt', 'updatedAt'].includes(key)))
    for (let index = 0; index < 25; index += 1) {
      await initiativesModule.service.createInitiative(users[0], { ...data, title: 'Paginación estable' })
    }
    const pages = []
    for (let page = 1; page <= 4; page += 1) {
      const response = await get(`?q=paginacion&sort=title&order=asc&page=${page}&size=10`).expect(200)
      assert.deepEqual(response.body.pagination, { page, size: 10, total: 25, totalPages: 3 })
      pages.push(response.body.data)
    }
    assert.deepEqual(pages.map((page) => page.length), [10, 10, 5, 0])
    const ids = pages.flat().map(({ id }) => id)
    assert.equal(new Set(ids).size, 25)
    assert.deepEqual(ids, [...ids].sort())
    const sortedCount = await get('?sort=memberCount&order=desc&size=50', ownerId).expect(200)
    const memberCounts = sortedCount.body.data.map(({ memberCount }) => memberCount)
    assert.deepEqual(memberCounts, [...memberCounts].sort((a, b) => b - a))
    for (const field of ['_id', 'revision', 'searchText', 'publicSearchText', 'titleNormalized', 'email', 'passwordHash', 'tokenHash']) {
      assert.equal(JSON.stringify(sortedCount.body).includes(`"${field}"`), false)
    }
  } finally {
    await cleanup()
    await database.disconnect()
  }
})
