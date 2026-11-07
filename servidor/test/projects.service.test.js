
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  createProjectsService,
} from '../src/services/projects.service.js'

const id = '11111111-1111-4111-8111-111111111111'
const owner = '22222222-2222-4222-8222-222222222222'

const input = {
  name: 'Proyecto tutorías',
  description: 'Red de tutorías colaborativas para estudiantes.',
  objective: 'Organizar y medir tutorías académicas.',
  technologies: ['React'],
  startDate: '2026-11-06',
  estimatedEndDate: null,
  repositoryUrl: null,
}

function setup(count = 2) {
  let project = null
  const events = []

  const initiative = {
    id,
    ownerId: owner,
    state: 'forming_team',
    visibility: 'private',
    revision: 0,
    title: 'Tutorías',
  }

  const repo = {
    findInitiative: async () => initiative,
    findProjectBySource: async () => project,
    countActiveMembers: async () => count,

    touchRevision: async () => {
      events.push('revision')
      return true
    },

    convertInitiative: async () => {
      events.push('convert')
      initiative.state = 'converted'
      return initiative
    },

    createProject: async (value) => {
      events.push('project')
      project = value
      return project
    },

    findProject: async () => project,
    findActiveMember: async () => false,

    decorate: async (p) => ({
      project: p,
      initiative,
      memberCount: count,
      owner: {
        id: owner,
        firstName: 'Ana',
        lastName: 'Rojas',
      },
    }),

    listVisible: async () => ({
      rows: project ? [project] : [],
      total: project ? 1 : 0,
    }),
  }

  const service = createProjectsService({
    connection: {},
    repository: repo,
    transactionRunner: async (_, callback) => callback({}),
    clock: () => new Date('2026-11-06T12:00:00.000Z'),
    createId: () => '33333333-3333-4333-8333-333333333333',
  })

  return { service, events, initiative }
}

test(
  'API10 convierte una sola vez, conserva origen y estado planning',
  async () => {
    const { service, events, initiative } = setup()
    const created = await service.create(id, owner, input)

    assert.equal(created.project.state, 'planning')
    assert.equal(created.project.sourceInitiativeId, id)
    assert.equal(initiative.state, 'converted')

    assert.deepEqual(
      events,
      ['revision', 'convert', 'project'],
    )

    await assert.rejects(
      service.create(id, owner, input),
      (error) =>
        error.status === 409 &&
        error.code === 'PROJECT_ALREADY_EXISTS',
    )
  },
)

test('API10 no convierte sin un segundo integrante', async () => {
  const { service, events } = setup(1)

  await assert.rejects(
    service.create(id, owner, input),
    (error) => error.status === 409,
  )

  assert.deepEqual(events, [])
})

test('API10 deniega convertir a actor ajeno', async () => {
  const { service, events } = setup()

  await assert.rejects(
    service.create(
      id,
      '44444444-4444-4444-8444-444444444444',
      input,
    ),
    (error) => error.status === 403,
  )

  assert.deepEqual(events, [])
})
