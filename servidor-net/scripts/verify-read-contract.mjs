import assert from 'node:assert/strict'
import { execFile, spawn } from 'node:child_process'
import { once } from 'node:events'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { setTimeout as delay } from 'node:timers/promises'
import { createApp } from '../../servidor/src/app.js'
import { createAuthModule } from '../../servidor/src/modules/auth.module.js'
import { createUsersModule } from '../../servidor/src/modules/users.module.js'
import { createInitiativesModule } from '../../servidor/src/modules/initiatives.module.js'

// Las dependencias son las del servidor Express existente; no instala paquetes nuevos.
const require = createRequire(new URL('../../servidor/package.json', import.meta.url))
const mongoose = require('mongoose')
const run = promisify(execFile)
const netDirectory = fileURLToPath(new URL('../', import.meta.url))
const fixtureDirectory = new URL('../../pruebas/fixtures/', import.meta.url)
const cancellation = new AbortController()
process.once('SIGINT', () => cancellation.abort())
let containerId, connection, referenceServer, netProcess, netLog = ''
let comparisons = 0, expectedSqlCommands = 0

function dates(value) {
  if (Array.isArray(value)) return value.map(dates)
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key,
    entry !== null && key.endsWith('At') ? new Date(entry) : entry]))
}

async function stopNet() {
  if (!netProcess || netProcess.exitCode !== null || netProcess.signalCode !== null) return
  const closed = once(netProcess, 'close')
  const timeout = setTimeout(() => netProcess.kill('SIGKILL'), 5000)
  timeout.unref()
  netProcess.kill('SIGINT')
  await closed
  clearTimeout(timeout)
}

function noPrivateFields(value) {
  if (!value || typeof value !== 'object') return
  for (const [key, entry] of Object.entries(value)) {
    assert.ok(!['_id', 'revision', 'email', 'emailNormalized', 'passwordHash', 'tokenHash',
      'searchText', 'publicSearchText', 'titleNormalized', 'sessions'].includes(key), `Campo no permitido: ${key}`)
    noPrivateFields(entry)
  }
}

try {
  const result = await run('docker', ['run', '--detach', '--rm', '--name', `innovation-hub-t3b04-${process.pid}`,
    '--publish', '127.0.0.1::27017', 'mongo:8.0.34-noble'], { timeout: 120000 })
  containerId = result.stdout.trim()
  assert.match(containerId, /^[a-f0-9]{64}$/)
  cancellation.signal.throwIfAborted()
  const portResult = await run('docker', ['port', containerId, '27017/tcp'])
  const port = /^127\.0\.0\.1:(\d+)\s*$/.exec(portResult.stdout)?.[1]
  assert.ok(port, 'Mongo temporal debe publicar únicamente en loopback.')
  connection = await mongoose.createConnection(`mongodb://127.0.0.1:${port}/innovation_hub_t3b04_contract`,
    { serverSelectionTimeoutMS: 15000 }).asPromise()
  console.log('MongoDB temporal listo; sin volúmenes ni conexión a desarrollo.')
  const catalogs = JSON.parse(await readFile(new URL('catalogs.json', fixtureDirectory), 'utf8'))
  const fixtureNames = ['users', 'initiatives', 'requests', 'memberships', 'membership-events', 'projects']
  for (const name of fixtureNames) {
    const entries = JSON.parse(await readFile(new URL(`${name}.json`, fixtureDirectory), 'utf8')).map(dates)
    const collection = name === 'membership-events' ? 'membershipEvents' : name
    // Datos de lectura equivalentes a HasData; sin contraseñas y sin probar logins.
    await connection.collection(collection).insertMany(entries)
  }
  await connection.collection('categories').insertMany(catalogs.categories)
  await connection.collection('skills').insertMany(catalogs.skills)
  const authModule = await createAuthModule({ connection, sessionTtlMinutes: 480 })
  const usersModule = await createUsersModule({ connection, requireSession: authModule.requireSession })
  const initiativesModule = await createInitiativesModule({ connection, requireSession: authModule.requireSession })
  const app = createApp({ config: { clientOrigin: 'http://localhost:5173', bodyLimit: '100kb' },
    usersModule, initiativesModule, logger: { error() {}, info() {} } })
  referenceServer = app.listen(0, '127.0.0.1')
  await once(referenceServer, 'listening')
  const referenceUrl = `http://127.0.0.1:${referenceServer.address().port}`
  netProcess = spawn('dotnet', [
    fileURLToPath(new URL('../bin/Debug/net10.0/InnovationHub.ServidorNet.dll', import.meta.url)),
    '--environment=Development', '--urls=http://127.0.0.1:0', '--use-test-database=true'],
  { cwd: netDirectory, stdio: ['ignore', 'pipe', 'pipe'] })
  netProcess.on('error', () => {})
  netProcess.stdout.on('data', data => { netLog += data.toString() })
  netProcess.stderr.on('data', data => { netLog += data.toString() })
  let netUrl
  for (let i = 0; i < 400; i += 1) {
    cancellation.signal.throwIfAborted()
    netUrl = /Now listening on:\s*(http:\/\/127\.0\.0\.1:\d+)/.exec(netLog)?.[1]
    if (netUrl) break
    assert.ok(netProcess.exitCode === null && netProcess.signalCode === null, 'El host .NET terminó antes de iniciar.')
    await delay(100)
  }
  assert.ok(netUrl, 'El host .NET no inició en el tiempo esperado.')

  async function compare(path, status, headers = {}, label = path) {
    assert.ok(path.startsWith('/api/'))
    const responses = await Promise.all([referenceUrl, netUrl].map(base => fetch(`${base}${path}`,
      { headers, signal: AbortSignal.any([cancellation.signal, AbortSignal.timeout(15000)]) })))
    for (const response of responses) assert.equal(response.status, status, label)
    const [reference, actual] = await Promise.all(responses.map(response => response.json()))
    assert.deepEqual(actual, reference, `JSON distinto: ${label}`)
    noPrivateFields(actual)
    if (status === 200) expectedSqlCommands += 1
    else if (status === 401 || status === 404) expectedSqlCommands += headers.Authorization ? 0 : 2
    comparisons += 1
    console.log(`PASS HTTP ${status}: ${label}`)
    return actual
  }

  // Ejecuta los casos del archivo entregable, no otra lista manual desconectada.
  const requests = await readFile(new URL('../requests.http', import.meta.url), 'utf8')
  const variables = Object.fromEntries([...requests.matchAll(/^@(\w+)\s*=\s*(.*)$/gm)].map(match => [match[1], match[2]]))
  variables.baseUrl = ''
  for (const block of requests.split(/^###/m).slice(1)) {
    const status = Number(block.match(/\b(200|400|401|404)\b/)?.[1])
    const target = /^GET (.+)$/m.exec(block)?.[1].trim()
    assert.ok(target && status, 'Bloque requests.http incompleto.')
    const path = target.replace(/{{(\w+)}}/g, (_, name) => variables[name])
    const headers = Object.fromEntries([...block.matchAll(/^([A-Za-z-]+):\s*(.+)$/gm)].map(match => [match[1], match[2].trim()]))
    const actual = await compare(path, status, headers)
    if (path === '/api/initiatives/10000000-0000-4000-8000-000000000001' && status === 200) {
      assert.deepEqual(actual.data.skills.map(skill => skill.id), [
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa8'])
      assert.equal(actual.data.memberCount, 1)
      assert.equal(actual.data.availableSpaces, 4)
      assert.match(actual.data.createdAt, /\.\d{3}Z$/)
      assert.equal(actual.data.access.canDelete, false)
      assert.equal(actual.data.access.canRequest, false)
    }
    if (path.endsWith('000000000008') && status === 200) {
      assert.equal(actual.data.memberCount, 3)
      assert.equal(actual.data.availableSpaces, 0)
      assert.equal(actual.data.state, 'converted')
    }
  }
  for (const id of ['00000000-0000-0000-0000-000000000000', '10000000-0000-5000-8000-000000000001'])
    await compare(`/api/initiatives/${id}`, 400)
  await compare('/api/initiatives/AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA', 404)
  await compare('/api/categories?extra=1&extra=2', 400)
  await compare('/api/initiatives/invalido?extra=1', 400)
  await compare('/api/categories', 200, { Authorization: 'Bearer token-invalido-de-prueba' }, 'catálogo no requiere sesión')
  await compare('/api/initiatives/invalido', 401, { Authorization: 'Bearer roto' }, 'sesión inválida precede validación de ID')

  await stopNet() // Esperar cierre y drenaje de logs antes de inspeccionar SQL.
  assert.ok(netLog.includes('[InitiativeSkills]') && netLog.includes('[Memberships]') && netLog.includes('[InitiativeTags]'),
    'La consulta debe resolver M:N, equipo y etiquetas en SQL Server.')
  for (const column of ['[PasswordHash]', '[Email]', '[EmailNormalized]', '[TokenHash]'])
    assert.equal(netLog.includes(column), false, `Se seleccionó columna ajena al contrato: ${column}`)
  assert.equal((netLog.match(/Executed DbCommand/g) ?? []).length, expectedSqlCommands,
    'Consultas SQL inesperadas: cada lectura exitosa requiere una, sin N+1.')
  console.log(`OK T3B-04: ${comparisons} comparaciones HTTP/JSON con Express+MongoDB y .NET+SQL Server; proyección sin columnas privadas ni N+1.`)
} finally {
  await stopNet()
  if (referenceServer) await new Promise(resolve => referenceServer.close(resolve))
  if (connection) await connection.close()
  if (containerId) await run('docker', ['stop', containerId], { timeout: 30000 })
}
