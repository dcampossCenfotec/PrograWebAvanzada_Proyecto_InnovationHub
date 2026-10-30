import test from 'node:test'
import assert from 'node:assert/strict'
import { hashPassword, verifyPassword } from '../../src/security/password.js'

test('scrypt usa sales aleatorias y verifica solo la contraseña correcta', async () => {
  const first = await hashPassword('ClaveSegura2026')
  const second = await hashPassword('ClaveSegura2026')

  assert.notEqual(first, second)
  assert.match(first, /^scrypt\$N=16384\$r=8\$p=1\$/)
  assert.equal(await verifyPassword('ClaveSegura2026', first), true)
  assert.equal(await verifyPassword('ClaveIncorrecta2026', first), false)
})

test('un hash dañado se rechaza sin lanzar detalles internos', async () => {
  assert.equal(await verifyPassword('ClaveSegura2026', 'texto-plano'), false)
  assert.equal(await verifyPassword('ClaveSegura2026', 'scrypt$N=2$r=8$p=1$sal$hash'), false)
})
