import assert from 'node:assert/strict'
import { execFile, spawn } from 'node:child_process'
import { once } from 'node:events'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { setTimeout as delay } from 'node:timers/promises'

// Destructivo solo para Test, tras guardas y comparación. Nunca cambia user-secrets.
const testDatabase = 'InnovationHub_Tarea3_Test'
assert.deepEqual(process.argv.slice(2), [`--confirm=${testDatabase}`],
  `Para reconstruir exclusivamente Test: node scripts/verify-rebuild.mjs --confirm=${testDatabase}`)
const cwd = fileURLToPath(new URL('../', import.meta.url))
const dll = fileURLToPath(new URL('../bin/Debug/net10.0/InnovationHub.ServidorNet.dll', import.meta.url))
const runFile = promisify(execFile)
const cancellation = new AbortController()
process.once('SIGINT', () => cancellation.abort())
process.once('SIGTERM', () => cancellation.abort())
let host, hostLog = ''

async function run(label, executable, args, { expectedFailure = false } = {}) {
  cancellation.signal.throwIfAborted()
  let output
  try {
    const result = await runFile(executable, args, { cwd, timeout: 300000, maxBuffer: 8 * 1024 * 1024,
      signal: cancellation.signal, killSignal: 'SIGINT', env: { ...process.env, DOTNET_NOLOGO: 'true' } })
    output = result.stdout + result.stderr
  } catch (error) {
    // No volcar salidas externas: un fallo de conexión podría incluir información privada.
    if (!expectedFailure || typeof error.code !== 'number')
      throw new Error(`${label}: falló (${error.code ?? error.name}); revisar localmente sin compartir secretos.`)
    output = error.stdout + error.stderr
    console.log(`PASS: ${label} (rechazo esperado).`)
    return output
  }
  assert.equal(expectedFailure, false, `${label}: se esperaba rechazo.`)
  console.log(`PASS: ${label}.`)
  return output
}

function terminal(mode, test = false) {
  return [dll, '--environment=Development', `--${mode}=true`, ...(test ? ['--use-test-database=true'] : [])]
}

async function snapshot(test) {
  const output = await run(`huella ${test ? 'Test' : 'Dev'}`, 'dotnet', terminal('database-fingerprint', test))
  const match = /SNAPSHOT (InnovationHub_Tarea3_(?:Dev|Test)) ([A-F0-9]{64})/.exec(output)
  assert.equal(match?.[1], test ? testDatabase : 'InnovationHub_Tarea3_Dev')
  return match[2]
}

async function stopHost() {
  if (!host || host.exitCode !== null || host.signalCode !== null) return
  const closed = once(host, 'close')
  const timeout = setTimeout(() => host.kill('SIGKILL'), 5000)
  timeout.unref()
  host.kill('SIGINT')
  try { await closed } finally { clearTimeout(timeout) }
}

try {
  const sdk = await run('SDK fijado', 'dotnet', ['--version'])
  assert.equal(sdk.trim(), '10.0.404')
  await run('restaurar herramienta local', 'dotnet', ['tool', 'restore'])
  const ef = await run('versión EF local', 'dotnet', ['ef', '--version'])
  assert.match(ef, /\b10\.0\.15\b/)
  await run('restore locked', 'dotnet', ['restore', '--locked-mode'])
  await run('build estricto', 'dotnet', ['build', '--no-restore', '--warnaserror'])
  await run('Docker disponible', 'docker', ['info', '--format', '{{.ServerVersion}}'])

  const rejected = await run('guarda rechaza Dev', 'dotnet', terminal('verify-rebuild-target'), { expectedFailure: true })
  assert.ok(rejected.includes('La reconstrucción solo permite InnovationHub_Tarea3_Test'))
  const target = await run('comprobar destino y objetos Test', 'dotnet', terminal('verify-rebuild-target', true))
  assert.ok(target.includes(`REBUILD_TARGET ${testDatabase}`))
  await run('comparar esquema y todas las filas Dev/Test antes de borrar', 'dotnet', terminal('compare-databases'))
  const baseline = await snapshot(false)
  assert.equal(await snapshot(true), baseline)
  const before = await run('restricciones e historia antes de borrar', 'dotnet', terminal('verify-domain', true))
  assert.ok(before.includes('OK T3B-03'))
  assert.equal(await snapshot(true), baseline, 'Las pruebas previas deben revertir todas sus escrituras.')

  const efArgs = ['--no-build', '--', '--environment', 'Development', '--use-test-database=true']
  console.log(`Destino confirmado: ${testDatabase}; solo siembra equivalente a Dev. Reconstrucción iniciada.`)
  await run('EF database drop --force exclusivamente Test', 'dotnet', ['ef', 'database', 'drop', '--force', ...efArgs])
  await run('confirmar que Test fue eliminada', 'dotnet', terminal('check-test-absent', true))

  // Iniciar sin hacer GET: así se demuestra que el arranque por sí solo no crea la base.
  host = spawn('dotnet', [dll, '--environment=Development', '--urls=http://127.0.0.1:0', '--use-test-database=true'],
    { cwd, stdio: ['ignore', 'pipe', 'pipe'] })
  host.on('error', () => {})
  host.stdout.on('data', data => { hostLog += data.toString() })
  host.stderr.on('data', data => { hostLog += data.toString() })
  for (let i = 0; i < 400 && !/Now listening on: http:\/\/127\.0\.0\.1:\d+/.test(hostLog); i += 1) {
    cancellation.signal.throwIfAborted()
    assert.ok(host.exitCode === null && host.signalCode === null, 'El host terminó antes de escuchar.')
    await delay(100)
  }
  assert.match(hostLog, /Now listening on: http:\/\/127\.0\.0\.1:\d+/)
  await run('arranque HTTP sin crear ni migrar Test', 'dotnet', terminal('check-test-absent', true))
  await stopHost()

  await run('aplicar ambas migraciones desde cero', 'dotnet', ['ef', 'database', 'update', ...efArgs])
  assert.equal(await snapshot(true), baseline, 'La reconstrucción debe conservar esquema, filas e historial exactos.')
  await run('repetir database update', 'dotnet', ['ef', 'database', 'update', ...efArgs])
  assert.equal(await snapshot(true), baseline, 'Update repetido no debe duplicar ni modificar la siembra.')
  const domain = await run('restricciones e historia tras reconstruir', 'dotnet', terminal('verify-domain', true))
  assert.ok(domain.includes('OK T3B-03'))

  // Cada ejecución crea y cierra hosts nuevos: se repiten los 21 casos tras reiniciar.
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const contract = await run(`contrato HTTP, arranque ${attempt}`, process.execPath, ['scripts/verify-read-contract.mjs'])
    assert.match(contract, /OK T3B-04: 21 comparaciones/)
    assert.equal(await snapshot(true), baseline, 'Las lecturas y los reinicios no alteran SQL.')
  }
  assert.equal(await snapshot(false), baseline, 'Dev debe permanecer intacta durante toda la reconstrucción.')
  await run('comparación final Dev/Test', 'dotnet', terminal('compare-databases'))
  await run('modelo sin cambios pendientes', 'dotnet', ['ef', 'migrations', 'has-pending-model-changes', ...efArgs])
  console.log('OK T3B-05: Test reconstruida; dos migraciones, 14 tablas y 107 filas idénticas; update idempotente; 42 comparaciones HTTP; Dev intacta. Aceptación de Francisco pendiente.')
} finally {
  await stopHost()
}
