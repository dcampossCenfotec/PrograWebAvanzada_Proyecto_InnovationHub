import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const fixtureDir = dirname(fileURLToPath(import.meta.url))
const load = (name) => JSON.parse(readFileSync(join(fixtureDir, name), 'utf8'))
const fail = (message) => {
  throw new Error(message)
}
const assert = (condition, message) => {
  if (!condition) fail(message)
}
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const isUuid = (value) => typeof value === 'string' && uuidPattern.test(value)

const manifest = load('manifest.json')
const catalogs = load(manifest.files.catalogs)
const users = load(manifest.files.users)
const initiatives = load(manifest.files.initiatives)
const requests = load(manifest.files.requests)
const memberships = load(manifest.files.memberships)
const membershipEvents = load(manifest.files.membershipEvents)
const projects = load(manifest.files.projects)
const legacyMapping = load(manifest.files.legacyMapping)

const collections = { users, initiatives, requests, memberships, membershipEvents, projects }
for (const [name, entries] of Object.entries(collections)) {
  assert(Array.isArray(entries), `${name} debe ser un arreglo`)
  for (const entry of entries) assert(isUuid(entry.id), `${name}: id inválido ${entry.id}`)
}

const publicIds = new Map()
for (const [name, entries] of Object.entries({ ...collections, skills: catalogs.skills })) {
  for (const entry of entries) {
    assert(!publicIds.has(entry.id), `ID duplicado entre colecciones: ${entry.id}`)
    publicIds.set(entry.id, name)
  }
}

const userById = new Map(users.map((entry) => [entry.id, entry]))
const initiativeById = new Map(initiatives.map((entry) => [entry.id, entry]))
const requestById = new Map(requests.map((entry) => [entry.id, entry]))
const membershipById = new Map(memberships.map((entry) => [entry.id, entry]))
const categoryIds = new Set(catalogs.categories.map((entry) => entry.id))
const skillIds = new Set(catalogs.skills.map((entry) => entry.id))

assert(catalogs.categories.length === 8, 'Deben existir las ocho categorías contractuales')
assert(categoryIds.size === catalogs.categories.length, 'Hay categorías duplicadas')
assert(skillIds.size === catalogs.skills.length, 'Hay competencias duplicadas')
for (const skill of catalogs.skills) assert(isUuid(skill.id), `Skill UUID inválido: ${skill.id}`)

const emails = new Set()
for (const user of users) {
  assert(user.emailNormalized === user.email.toLowerCase(), `Email no normalizado: ${user.id}`)
  assert(!emails.has(user.emailNormalized), `Email duplicado: ${user.emailNormalized}`)
  emails.add(user.emailNormalized)
  for (const skill of user.skills) assert(skillIds.has(skill.skillId), `Skill de usuario inexistente: ${skill.skillId}`)
}

const forbiddenKeyPattern = /(password|token)/i
const scanForbiddenKeys = (value, path = 'fixtures') => {
  if (Array.isArray(value)) return value.forEach((item, index) => scanForbiddenKeys(item, `${path}[${index}]`))
  if (!value || typeof value !== 'object') return
  for (const [key, nested] of Object.entries(value)) {
    assert(!forbiddenKeyPattern.test(key), `Campo sensible no permitido en ${path}.${key}`)
    scanForbiddenKeys(nested, `${path}.${key}`)
  }
}
scanForbiddenKeys({ catalogs, users, initiatives, requests, memberships, membershipEvents, projects })

const visibilities = new Set()
const initiativeStates = new Set()
for (const initiative of initiatives) {
  assert(userById.has(initiative.ownerId), `Propietario inexistente: ${initiative.id}`)
  assert(categoryIds.has(initiative.categoryId), `Categoría inexistente: ${initiative.id}`)
  assert(initiative.skillIds.length >= 1 && initiative.skillIds.length <= 10, `Skills fuera de límite: ${initiative.id}`)
  assert(new Set(initiative.skillIds).size === initiative.skillIds.length, `Skills duplicados: ${initiative.id}`)
  for (const skillId of initiative.skillIds) assert(skillIds.has(skillId), `Skill inexistente: ${initiative.id}/${skillId}`)
  visibilities.add(initiative.visibility)
  initiativeStates.add(initiative.state)
}
assert([...['public', 'institutional', 'restricted', 'private']].every((value) => visibilities.has(value)), 'Falta una visibilidad')
assert([...['draft', 'published', 'forming_team', 'converted', 'archived']].every((value) => initiativeStates.has(value)), 'Falta un estado de iniciativa')

const pendingPairs = new Set()
const requestStates = new Set()
for (const request of requests) {
  const initiative = initiativeById.get(request.initiativeId)
  const applicant = userById.get(request.applicantId)
  assert(initiative, `Solicitud apunta a iniciativa inexistente: ${request.id}`)
  assert(applicant, `Solicitud apunta a usuario inexistente: ${request.id}`)
  assert(initiative.ownerId !== request.applicantId, `El propietario no puede solicitar: ${request.id}`)
  assert(skillIds.has(request.offeredSkillId), `Skill ofrecida inexistente: ${request.id}`)
  assert(applicant.skills.some((entry) => entry.skillId === request.offeredSkillId), `Skill ofrecida no pertenece al perfil: ${request.id}`)
  requestStates.add(request.state)
  if (request.state === 'pending') {
    const key = `${request.initiativeId}:${request.applicantId}`
    assert(!pendingPairs.has(key), `Dos solicitudes pendientes para ${key}`)
    pendingPairs.add(key)
  }
}
assert([...['pending', 'accepted', 'rejected', 'cancelled']].every((value) => requestStates.has(value)), 'Falta un estado de solicitud')

const activeMembershipPairs = new Set()
for (const membership of memberships) {
  assert(initiativeById.has(membership.initiativeId), `Membresía apunta a iniciativa inexistente: ${membership.id}`)
  assert(userById.has(membership.userId), `Membresía apunta a usuario inexistente: ${membership.id}`)
  if (membership.sourceRequestId !== null) assert(requestById.has(membership.sourceRequestId), `Solicitud fuente inexistente: ${membership.id}`)
  if (membership.state === 'active') {
    const key = `${membership.initiativeId}:${membership.userId}`
    assert(!activeMembershipPairs.has(key), `Dos membresías activas para ${key}`)
    activeMembershipPairs.add(key)
    assert(membership.retiredAt === null, `Membresía activa con retiredAt: ${membership.id}`)
  } else {
    assert(membership.state === 'retired' && membership.retiredAt, `Membresía retirada inválida: ${membership.id}`)
  }
}

for (const initiative of initiatives) {
  assert(activeMembershipPairs.has(`${initiative.id}:${initiative.ownerId}`), `Falta membresía activa del propietario: ${initiative.id}`)
}

const eventTypesByMembership = new Map()
for (const event of membershipEvents) {
  const membership = membershipById.get(event.membershipId)
  assert(membership, `Evento apunta a membresía inexistente: ${event.id}`)
  assert(event.initiativeId === membership.initiativeId && event.userId === membership.userId, `Evento no coincide con membresía: ${event.id}`)
  assert(userById.has(event.actorId), `Actor de evento inexistente: ${event.id}`)
  if (event.requestId !== null) assert(requestById.has(event.requestId), `Solicitud de evento inexistente: ${event.id}`)
  const types = eventTypesByMembership.get(event.membershipId) ?? new Set()
  types.add(event.type)
  eventTypesByMembership.set(event.membershipId, types)
}
for (const membership of memberships) {
  const types = eventTypesByMembership.get(membership.id) ?? new Set()
  assert(types.has('joined'), `Falta evento joined: ${membership.id}`)
  if (membership.state === 'retired') assert(types.has('retired'), `Falta evento retired: ${membership.id}`)
}

for (const request of requests.filter((entry) => entry.state === 'accepted')) {
  assert(memberships.some((entry) => entry.sourceRequestId === request.id && entry.state === 'active'), `Solicitud aceptada sin membresía activa: ${request.id}`)
}

const projectInitiatives = new Set()
for (const project of projects) {
  const initiative = initiativeById.get(project.sourceInitiativeId)
  assert(initiative, `Proyecto apunta a iniciativa inexistente: ${project.id}`)
  assert(initiative.state === 'converted', `Proyecto sin iniciativa converted: ${project.id}`)
  assert(project.ownerId === initiative.ownerId, `Dueño de proyecto no coincide: ${project.id}`)
  assert(!projectInitiatives.has(project.sourceInitiativeId), `Dos proyectos para una iniciativa: ${project.sourceInitiativeId}`)
  projectInitiatives.add(project.sourceInitiativeId)
}

assert(legacyMapping.length === 8, 'El mapeo heredado debe contener ocho iniciativas')
assert(new Set(legacyMapping.map((entry) => entry.legacyId)).size === 8, 'Hay legacyId duplicados')
for (const mapping of legacyMapping) assert(initiativeById.has(mapping.newId), `Mapeo apunta a iniciativa inexistente: ${mapping.legacyId}`)

for (const [alias, id] of Object.entries(manifest.actors)) {
  if (alias === 'VISITOR') assert(id === null, 'VISITOR debe representar ausencia de sesión')
  else assert(userById.has(id), `Alias de actor inválido: ${alias}`)
}
for (const [alias, id] of Object.entries(manifest.scenarios)) {
  const exists = initiativeById.has(id) || requestById.has(id) || projects.some((entry) => entry.id === id)
  assert(exists, `Alias de escenario inválido: ${alias}`)
}

const overEstimateId = manifest.scenarios.INIT_OVER_ESTIMATE
const overEstimate = initiativeById.get(overEstimateId)
const activeCount = memberships.filter((entry) => entry.initiativeId === overEstimateId && entry.state === 'active').length
assert(activeCount > overEstimate.estimatedMembers, 'Falta escenario de miembros por encima de la estimación')

const deleteId = manifest.scenarios.INIT_PUBLIC_DELETE
assert(!requests.some((entry) => entry.initiativeId === deleteId), 'La iniciativa borrable tiene solicitudes')
assert(!projects.some((entry) => entry.sourceInitiativeId === deleteId), 'La iniciativa borrable tiene proyecto')
assert(memberships.filter((entry) => entry.initiativeId === deleteId).length === 1, 'La iniciativa borrable tiene miembros adicionales')

console.log('Fixtures CO01 válidos')
console.log(JSON.stringify({
  users: users.length,
  categories: catalogs.categories.length,
  skills: catalogs.skills.length,
  initiatives: initiatives.length,
  requests: requests.length,
  memberships: memberships.length,
  membershipEvents: membershipEvents.length,
  projects: projects.length,
  visibilities: [...visibilities].sort(),
  initiativeStates: [...initiativeStates].sort(),
  requestStates: [...requestStates].sort(),
  overEstimate: { estimatedMembers: overEstimate.estimatedMembers, activeMembers: activeCount }
}, null, 2))

