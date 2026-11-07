
import test from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { createApp } from '../../src/app.js'
import { createMongoDatabase } from '../../src/database/connection.js'
import { assertSafeTestDatabase } from '../../src/database/safety.js'
import { createAuthModule } from '../../src/modules/auth.module.js'
import { createUsersModule } from '../../src/modules/users.module.js'
import { createInitiativesModule } from '../../src/modules/initiatives.module.js'
import { createRequestsModule } from '../../src/modules/requests.module.js'
import { createProjectsModule } from '../../src/modules/projects.module.js'
import { loadCatalogFixtures } from '../../src/seeds/load-catalog-fixtures.js'
import { loadUserFixtures } from '../../src/seeds/load-user-fixtures.js'
import { loadInitiativeFixtures } from '../../src/seeds/load-initiative-fixtures.js'
import { seedCatalogs } from '../../src/seeds/seed-catalogs.js'
import { seedUsers } from '../../src/seeds/seed-users.js'
import { seedInitiatives } from '../../src/seeds/seed-initiatives.js'

const uri = process.env.MONGODB_TEST_URI?.trim()
const databaseName = process.env.MONGODB_TEST_DATABASE?.trim()
const safeToRun = Boolean(uri && databaseName)

const ownerId = '11111111-1111-4111-8111-111111111111'
const publicInitiative = '10000000-0000-4000-8000-000000000001'
const projectSource = '10000000-0000-4000-8000-000000000002'
const privateInitiative = '10000000-0000-4000-8000-000000000006'
const applicantId = '22222222-2222-4222-8222-222222222222'

const requestBody = {
  message: 'Colaboraré en la investigación y organización de actividades.',
  offeredSkillId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4',
  role: 'Investigación',
  availability: 'medium',
}

const projectBody = {
  name: 'Proyecto accesibilidad universitaria',
  description: 'Una implementación colaborativa que mejora la accesibilidad de la ciudad.',
  objective: 'Publicar un prototipo con resultados medibles de accesibilidad.',
  technologies: ['React', 'Node.js'],
  startDate: '2026-11-07',
  estimatedEndDate: null,
  repositoryUrl: null,
}

// La suite se ejecuta en serie con las demás integraciones:
// utiliza limpieza de test.
test('API12: sesiones, autorización y carreras con HTTP y MongoDB reales', {
  skip: safeToRun
    ? false
    : 'Configura MONGODB_TEST_URI y MONGODB_TEST_DATABASE.',
}, async () => {
  assertSafeTestDatabase({
    nodeEnvironment: 'test',
    databaseName,
  })

  const database = createMongoDatabase({
    uri,
    databaseName,
    connectTimeoutMs: 5000,
    logger: { info() {} },
  })

  const connection = await database.connect()

  const collections = [
    'sessions',
    'projects',
    'requests',
    'membershipEvents',
    'memberships',
    'initiatives',
    'users',
    'categories',
    'skills',
  ]

  async function clean() {
    for (const name of collections) {
      await connection.collection(name).deleteMany({})
    }
  }

  try {
    await clean()

    const [users, catalogs, initiatives] = await Promise.all([
      loadUserFixtures(),
      loadCatalogFixtures(),
      loadInitiativeFixtures(),
    ])

    await seedCatalogs(connection, catalogs)
    await seedUsers(connection, users, 'DemoSegura2026')
    await seedInitiatives(connection, initiatives)

    const auth = await createAuthModule({
      connection,
      sessionTtlMinutes: 480,
    })

    const others = await createUsersModule({
      connection,
      requireSession: auth.requireSession,
    })

    const initiativesModule = await createInitiativesModule({
      connection,
      requireSession: auth.requireSession,
    })

    const requestsModule = await createRequestsModule({
      connection,
      requireSession: auth.requireSession,
    })

    const projectsModule = await createProjectsModule({
      connection,
      requireSession: auth.requireSession,
    })

    const app = createApp({
      config: {
        clientOrigin: 'http://localhost:5173',
        bodyLimit: '100kb',
      },
      authModule: auth,
      usersModule: others,
      initiativesModule,
      requestsModule,
      projectsModule,
      logger: { info() {}, error() {} },
    })

    const tokens = {}

    for (const user of users.filter((u) => u.active)) {
      const result = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'DemoSegura2026',
        })
        .expect(200)

      tokens[user.id] =
        `Bearer ${result.body.data.accessToken}`
    }

    const owner = tokens[ownerId]
    const applicant = tokens[applicantId]
    const outsider = tokens[
      '33333333-3333-4333-8333-333333333333'
    ]

    // Las sesiones ausentes o inválidas no pueden consultar solicitudes.
    await request(app)
      .get('/api/requests?scope=mine')
      .expect(401)

    await request(app)
      .get('/api/requests?scope=mine')
      .set('Authorization', 'Bearer inválido')
      .expect(401)

    // Los terceros no pueden solicitar participación en una privada ajena.
    await request(app)
      .post(`/api/initiatives/${privateInitiative}/requests`)
      .set('Authorization', outsider)
      .send(requestBody)
      .expect(404)

    // El propietario no puede enviarse solicitudes a sí mismo.
    await request(app)
      .post(`/api/initiatives/${publicInitiative}/requests`)
      .set('Authorization', owner)
      .send(requestBody)
      .expect(409)

    // Una consulta recibida no expone solicitudes ajenas.
    await request(app)
      .get('/api/requests?scope=received')
      .set('Authorization', applicant)
      .expect(200)

    // Dos escrituras simultáneas no pueden crear dos pendientes.
    const duplicated = await Promise.all([
      request(app)
        .post(`/api/initiatives/${publicInitiative}/requests`)
        .set('Authorization', applicant)
        .send(requestBody),

      request(app)
        .post(`/api/initiatives/${publicInitiative}/requests`)
        .set('Authorization', applicant)
        .send(requestBody),
    ])

    assert.deepEqual(
      duplicated.map((x) => x.status).sort(),
      [201, 409],
    )

    const stored = await connection
      .collection('requests')
      .find({
        initiativeId: publicInitiative,
        applicantId,
        state: 'pending',
      })
      .toArray()

    assert.equal(stored.length, 1)

    // Aceptación y cancelación simultáneas:
    // solo una transición puede finalizar correctamente.
    const id = stored[0].id

    const settled = await Promise.all([
      request(app)
        .post(`/api/requests/${id}/decision`)
        .set('Authorization', owner)
        .send({
          decision: 'accepted',
          comment: null,
        }),

      request(app)
        .post(`/api/requests/${id}/cancel`)
        .set('Authorization', applicant),
    ])

    assert.deepEqual(
      settled.map((x) => x.status).sort(),
      [200, 409],
    )

    const final = await connection
      .collection('requests')
      .findOne({ id })

    assert.ok(
      ['accepted', 'cancelled'].includes(final.state),
    )

    const linked = await connection
      .collection('memberships')
      .find({ sourceRequestId: id })
      .toArray()

    const events = await connection
      .collection('membershipEvents')
      .find({
        requestId: id,
        type: 'joined',
      })
      .toArray()

    assert.equal(
      linked.length,
      final.state === 'accepted' ? 1 : 0,
    )

    assert.equal(events.length, linked.length)

    // Solo el propietario puede convertir su iniciativa.
    await request(app)
      .post(`/api/initiatives/${projectSource}/project`)
      .set('Authorization', applicant)
      .send(projectBody)
      .expect(403)

    // Dos conversiones simultáneas no crean dos proyectos.
    const converted = await Promise.all([
      request(app)
        .post(`/api/initiatives/${projectSource}/project`)
        .set('Authorization', owner)
        .send(projectBody),

      request(app)
        .post(`/api/initiatives/${projectSource}/project`)
        .set('Authorization', owner)
        .send(projectBody),
    ])

    assert.deepEqual(
      converted.map((x) => x.status).sort(),
      [201, 409],
    )

    assert.equal(
      await connection.collection('projects').countDocuments({
        sourceInitiativeId: projectSource,
      }),
      1,
    )

    const source = await connection
      .collection('initiatives')
      .findOne({ id: projectSource })

    assert.equal(source.state, 'converted')

    // La respuesta pública no debe contener datos privados.
    const visible = await request(app)
      .get('/api/projects')
      .expect(200)

    assert.equal(visible.body.pagination.total, 1)

    const sensitive = JSON.stringify(visible.body)

    for (const forbidden of [
      'passwordHash',
      'tokenHash',
      'emailNormalized',
      'sourceRequestId',
      'mongodb://',
    ]) {
      assert.equal(
        sensitive.includes(forbidden),
        false,
        forbidden,
      )
    }

    // Logout invalida la sesión en MongoDB.
    await request(app)
      .post('/api/auth/logout')
      .set('Authorization', outsider)
      .expect(204)

    await request(app)
      .get('/api/auth/me')
      .set('Authorization', outsider)
      .expect(401)
  } finally {
    await clean()
    await database.disconnect()
  }
})
