import test from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import request from 'supertest'
import { createApp } from '../../src/app.js'
import { createMongoDatabase } from '../../src/database/connection.js'
import { assertSafeTestDatabase } from '../../src/database/safety.js'
import { runInTransaction } from '../../src/database/transaction.js'
import { HttpError } from '../../src/errors/http-error.js'
import { createAuthModule } from '../../src/modules/auth.module.js'
import { createInitiativesModule } from '../../src/modules/initiatives.module.js'
import { createInitiativesController } from '../../src/controllers/initiatives.controller.js'
import { createInitiativeRemovalService } from '../../src/services/initiative-removal.service.js'
import { lockInitiativeRevision } from '../../src/services/initiative-revision.js'
import { loadCatalogFixtures } from '../../src/seeds/load-catalog-fixtures.js'
import { loadUserFixtures } from '../../src/seeds/load-user-fixtures.js'
import { seedCatalogs } from '../../src/seeds/seed-catalogs.js'
import { seedUsers } from '../../src/seeds/seed-users.js'

const uri = process.env.MONGODB_TEST_URI?.trim()
const databaseName = process.env.MONGODB_TEST_DATABASE?.trim()
const ownerId = '11111111-1111-4111-8111-111111111111'
const applicantId = '22222222-2222-4222-8222-222222222222'
const outsiderId = '33333333-3333-4333-8333-333333333333'

const input = {
  title: 'Iniciativa para probar eliminación', type: 'idea',
  summary: 'Registro sintético para verificar conservación del historial.',
  description: 'Se comprueban transacciones, permisos y relaciones históricas antes de eliminar.',
  problem: 'Evitar documentos huérfanos y pérdida de solicitudes o membresías.',
  beneficiaries: 'Equipo del proyecto', categoryId: 'technology',
  skillIds: ['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'],
  estimatedMembers: 4, visibility: 'public', tags: ['pruebas'],
}

function deferred() {
  let resolve
  const promise = new Promise((done) => { resolve = done })
  return { promise, resolve }
}

test('API07 separa borrado y archivo con atomicidad e invariantes concurrentes', {
  skip: uri && databaseName ? false : 'Requiere MONGODB_TEST_URI y MONGODB_TEST_DATABASE.',
}, async (t) => {
  assertSafeTestDatabase({ nodeEnvironment: 'test', databaseName })
  const database = createMongoDatabase({ uri, databaseName, connectTimeoutMs: 5000, logger: { info() {} } })
  const connection = await database.connect()
  const collectionNames = ['users', 'sessions', 'categories', 'skills', 'initiatives', 'memberships', 'membershipEvents', 'requests', 'projects']
  const cleanup = () => Promise.all(collectionNames.map((name) => connection.collection(name).deleteMany({})))
  try {
    await cleanup()
    await seedCatalogs(connection, await loadCatalogFixtures())
    await seedUsers(connection, await loadUserFixtures(), 'DemoSegura2026')
    // Las colecciones de módulos posteriores existen antes de simular sus transacciones.
    await connection.collection('requests').createIndex({ id: 1 }, { unique: true })
    await connection.collection('projects').createIndex({ id: 1 }, { unique: true })
    const authModule = await createAuthModule({ connection, sessionTtlMinutes: 480 })
    const module = await createInitiativesModule({ connection, requireSession: authModule.requireSession })
    const config = { clientOrigin: 'http://localhost:5173', bodyLimit: '100kb' }
    const logger = { info() {}, error() {} }
    function buildApp(removalService = module.removalService) {
      return createApp({ config, authModule, logger, initiativesModule: {
        ...module,
        controller: createInitiativesController(module.service, module.queriesService, removalService),
      } })
    }
    const app = buildApp()
    const tokens = {}
    for (const [id, email] of [
      [ownerId, 'ana.owner@example.test'], [outsiderId, 'carla.outsider@example.test'],
    ]) {
      const response = await request(app).post('/api/auth/login')
        .send({ email, password: 'DemoSegura2026' }).expect(200)
      tokens[id] = `Bearer ${response.body.data.accessToken}`
    }
    const path = (id) => `/api/initiatives/${id}`
    const remove = (id, targetApp = app) => request(targetApp).delete(path(id)).set('Authorization', tokens[ownerId])
    const archive = (id, targetApp = app) => request(targetApp).post(`${path(id)}/archive`).set('Authorization', tokens[ownerId])
    async function create() {
      const response = await request(app).post('/api/initiatives')
        .set('Authorization', tokens[ownerId]).send(input).expect(201)
      return response.body.data.id
    }
    async function snapshot(id) {
      const result = {}
      for (const name of ['initiatives', 'memberships', 'membershipEvents', 'requests', 'projects']) {
        const filter = name === 'initiatives' ? { id }
          : name === 'projects' ? { sourceInitiativeId: id } : { initiativeId: id }
        result[name] = await connection.collection(name).find(filter).sort({ id: 1 }).toArray()
      }
      return result
    }
    async function addRequest(id, state = 'pending', session) {
      await connection.collection('requests').insertOne({
        id: randomUUID(), initiativeId: id, applicantId,
        message: 'Solicitud sintética para probar conservación de historial.',
        offeredSkillId: input.skillIds[0], role: 'Colaboración', availability: 'medium',
        state, decisionComment: null, createdAt: new Date(), updatedAt: new Date(), decidedAt: null,
      }, { session })
    }
    async function addMember(id, state = 'active', session) {
      const joinedAt = new Date()
      const membershipId = randomUUID()
      await module.models.Membership.create([{
        id: membershipId, initiativeId: id, userId: applicantId, role: 'Colaboración',
        state, joinedAt, retiredAt: state === 'retired' ? joinedAt : null,
      }], { session })
      await module.models.MembershipEvent.create([{
        id: randomUUID(), initiativeId: id, userId: applicantId, membershipId,
        type: 'joined', occurredAt: joinedAt, actorId: ownerId,
      }], { session })
    }
    async function addProject(id, session) {
      await connection.collection('projects').insertOne({
        id: randomUUID(), sourceInitiativeId: id, ownerId,
        name: 'Proyecto sintético', description: input.description, objective: input.problem,
        technologies: ['React'], startDate: '2026-11-03', estimatedEndDate: null,
        state: 'planning', repositoryUrl: null, createdAt: new Date(), updatedAt: new Date(),
      }, { session })
    }

    await t.test('propietario solo: 204 sin cuerpo y ninguna relación automática huérfana', async () => {
      const id = await create()
      const beforeUsers = await module.models.Initiative.db.collection('users').countDocuments()
      const response = await remove(id).expect(204)
      assert.equal(response.text, '')
      assert.equal(response.headers['content-type'], undefined)
      const after = await snapshot(id)
      assert.ok(Object.values(after).every((entries) => entries.length === 0))
      assert.equal(await connection.collection('users').countDocuments(), beforeUsers)
      assert.equal(await connection.collection('skills').countDocuments(), 10)
      await remove(id).expect(404)
      await request(app).get(path(id)).expect(404)
    })

    await t.test('sin sesión, ajeno, UUID inválido, body o query no permiten eliminar', async () => {
      const id = await create()
      const before = await snapshot(id)
      await request(app).delete(path(id)).expect(401)
      await request(app).delete(path(id)).set('Authorization', tokens[outsiderId]).expect(403)
      await remove('invalido').expect(400)
      await remove('99999999-9999-4999-8999-999999999999').expect(404)
      await remove(id).send({ force: true }).expect(400)
      await remove(id).type('text/plain').send('force=true').expect(400)
      await remove(`${id}?force=true`).expect(400)
      assert.deepEqual(await snapshot(id), before)
    })

    await t.test('archivo sin historial conserva el agregado y permite borrado definitivo posterior', async () => {
      const id = await create()
      const before = await snapshot(id)
      const archived = await archive(id).expect(200)
      assert.equal(archived.body.data.operation, 'archived')
      const after = await snapshot(id)
      assert.equal(after.initiatives[0].state, 'archived')
      for (const name of ['requests', 'memberships', 'membershipEvents', 'projects']) assert.deepEqual(after[name], before[name])
      await archive(id).expect(200)
      assert.deepEqual(await snapshot(id), after)
      await remove(id).expect(204)
      assert.ok(Object.values(await snapshot(id)).every((entries) => entries.length === 0))
    })

    await t.test('POST archive exige propietario y rechaza cuerpo, query e ID inválidos', async () => {
      const id = await create()
      const before = await snapshot(id)
      await request(app).post(`${path(id)}/archive`).expect(401)
      await request(app).post(`${path(id)}/archive`).set('Authorization', tokens[outsiderId]).expect(403)
      await archive('invalido').expect(400)
      await archive('99999999-9999-4999-8999-999999999999').expect(404)
      await archive(id).send({ force: true }).expect(400)
      await archive(id).type('text/plain').send('force=true').expect(400)
      await request(app).post(`${path(id)}/archive?force=true`).set('Authorization', tokens[ownerId]).expect(400)
      assert.deepEqual(await snapshot(id), before)
    })

    await t.test('DELETE con solicitudes se rechaza intacto; POST archive conserva cada estado histórico', async () => {
      for (const state of ['pending', 'cancelled', 'rejected', 'accepted']) {
        const id = await create()
        await addRequest(id, state)
        const before = await snapshot(id)
        const denied = await remove(id).expect(409)
        assert.equal(denied.body.error.code, 'INITIATIVE_HAS_HISTORY')
        assert.deepEqual(await snapshot(id), before)
        const response = await archive(id).expect(200)
        assert.deepEqual(response.body, { data: { id, state: 'archived', operation: 'archived' } })
        const after = await snapshot(id)
        assert.equal(after.initiatives[0].state, 'archived')
        for (const name of ['requests', 'memberships', 'membershipEvents', 'projects']) {
          assert.deepEqual(after[name], before[name])
        }
        const again = await archive(id).expect(200)
        assert.deepEqual(again.body, response.body)
        assert.deepEqual(await snapshot(id), after)
        await request(app).put(path(id)).set('Authorization', tokens[ownerId]).send(input).expect(409)
        await request(app).get(path(id)).expect(404)
        const detail = await request(app).get(path(id)).set('Authorization', tokens[ownerId]).expect(200)
        assert.equal(detail.body.data.access.canRequest, false)
        assert.equal(detail.body.data.access.canConvert, false)
        const catalogue = await request(app).get('/api/initiatives?size=50').set('Authorization', tokens[ownerId]).expect(200)
        assert.equal(catalogue.body.data.some((item) => item.id === id), false)
        const mine = await request(app).get('/api/initiatives/mine?size=50').set('Authorization', tokens[ownerId]).expect(200)
        assert.equal(mine.body.data.some((item) => item.id === id && item.state === 'archived'), true)
      }
    })

    await t.test('miembro activo, retirado o solo evento histórico obliga a conservar', async () => {
      for (const state of ['active', 'retired', 'event-only']) {
        const id = await create()
        await addMember(id, state === 'active' ? 'active' : 'retired')
        if (state === 'event-only') {
          await module.models.Membership.deleteMany({ initiativeId: id, userId: applicantId })
        }
        const before = await snapshot(id)
        await remove(id).expect(409)
        assert.deepEqual(await snapshot(id), before)
        await archive(id).expect(200)
        const after = await snapshot(id)
        assert.deepEqual(after.memberships, before.memberships)
        assert.deepEqual(after.membershipEvents, before.membershipEvents)
        assert.equal(after.initiatives[0].state, 'archived')
      }
    })

    await t.test('proyecto conserva origen; relación automática incompleta se archiva conservadoramente', async () => {
      const projectId = await create()
      await addProject(projectId)
      const beforeProject = (await snapshot(projectId)).projects
      await remove(projectId).expect(409)
      await archive(projectId).expect(200)
      assert.deepEqual((await snapshot(projectId)).projects, beforeProject)
      const damagedId = await create()
      await module.models.MembershipEvent.deleteMany({ initiativeId: damagedId })
      await remove(damagedId).expect(409)
      await archive(damagedId).expect(200)
      assert.equal((await snapshot(damagedId)).initiatives[0].state, 'archived')
    })

    await t.test('fallo tras borrar o archivar revierte todas las escrituras, incluida la revisión', async () => {
      for (const operation of ['deleteAggregate', 'archiveAtRevision']) {
        const id = await create()
        if (operation === 'archiveAtRevision') await addRequest(id)
        const before = await snapshot(id)
        const failingService = createInitiativeRemovalService({
          connection, initiativesRepository: module.repository,
          removalRepository: { ...module.removalRepository,
            [operation]: async (...args) => {
              await module.removalRepository[operation](...args)
              throw new Error('fallo simulado no debe llegar a HTTP')
            },
          },
        })
        const response = await (operation === 'archiveAtRevision' ? archive : remove)(id, buildApp(failingService)).expect(500)
        assert.equal(response.body.error.code, 'INTERNAL_ERROR')
        assert.equal(JSON.stringify(response.body).includes('fallo simulado'), false)
        assert.deepEqual(await snapshot(id), before)
      }
    })

    await t.test('una relación que confirma mientras DELETE ya leyó fuerza reintento y rechazo sin archivo', { timeout: 15000 }, async () => {
      for (const relation of ['request', 'member', 'project']) {
        const id = await create()
        const readReached = deferred()
        const release = deferred()
        let reads = 0
        const controlledService = createInitiativeRemovalService({
          connection, removalRepository: module.removalRepository,
          initiativesRepository: { ...module.repository,
            findById: async (...args) => {
              const current = await module.repository.findById(...args)
              reads += 1
              if (reads === 1) { readReached.resolve(); await release.promise }
              return current
            },
          },
        })
        const deletion = remove(id, buildApp(controlledService)).then((response) => response)
        try {
          await readReached.promise
          await runInTransaction(connection, async (session) => {
            const current = await module.repository.findById(id, { session, includeInternal: true })
            await lockInitiativeRevision(module.repository, current, new Date(), session)
            if (relation === 'request') await addRequest(id, 'pending', session)
            else if (relation === 'member') await addMember(id, 'active', session)
            else await addProject(id, session)
          })
        } finally { release.resolve() }
        const response = await deletion
        assert.equal(response.status, 409)
        assert.equal(response.body.error.code, 'INITIATIVE_HAS_HISTORY')
        assert.ok(reads >= 2, 'MongoDB debe reintentar usando una instantánea nueva.')
        const after = await snapshot(id)
        assert.equal(after.initiatives[0].state, 'published')
        const key = { request: 'requests', member: 'memberships', project: 'projects' }[relation]
        assert.ok(after[key].length > (relation === 'member' ? 1 : 0))
      }
    })

    await t.test('si DELETE confirma primero, un escritor concurrente no crea una solicitud huérfana', { timeout: 10000 }, async () => {
      const id = await create()
      const readReached = deferred()
      const release = deferred()
      let reads = 0
      const writer = runInTransaction(connection, async (session) => {
        const current = await module.repository.findById(id, { session, includeInternal: true })
        if (!current) throw new HttpError(404, 'NOT_FOUND', 'La iniciativa ya no existe.')
        reads += 1
        if (reads === 1) { readReached.resolve(); await release.promise }
        await lockInitiativeRevision(module.repository, current, new Date(), session)
        await addRequest(id, 'pending', session)
      }).then(() => ({ ok: true }), (error) => ({ error }))
      try {
        await readReached.promise
        await remove(id).expect(204)
      } finally { release.resolve() }
      const result = await writer
      assert.equal(result.error?.status, 404)
      assert.equal((await snapshot(id)).requests.length, 0)
      assert.equal((await snapshot(id)).initiatives.length, 0)
    })

    await t.test('DELETE concurrentes rechazan historial y archivos concurrentes son idempotentes', async () => {
      const id = await create()
      await addRequest(id, 'rejected')
      const results = await Promise.all([remove(id), remove(id)])
      assert.deepEqual(results.map(({ status }) => status), [409, 409])
      assert.equal((await snapshot(id)).initiatives[0].state, 'published')
      assert.equal((await snapshot(id)).initiatives[0].revision, 0)
      const archives = await Promise.all([archive(id), archive(id)])
      assert.deepEqual(archives.map(({ status }) => status), [200, 200])
      assert.deepEqual(archives[0].body, archives[1].body)
      const after = await snapshot(id)
      assert.equal(after.initiatives[0].revision, 1)
      assert.equal(after.requests.length, 1)

      const cleanId = await create()
      const cleanResults = await Promise.all([remove(cleanId), remove(cleanId)])
      assert.deepEqual(cleanResults.map(({ status }) => status).sort(), [204, 404])
      assert.ok(Object.values(await snapshot(cleanId)).every((entries) => entries.length === 0))
    })
  } finally {
    await cleanup()
    await database.disconnect()
  }
})
