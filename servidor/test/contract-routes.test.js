
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const routes = {
  'auth.routes.js': [
    ['post', '/register'],
    ['post', '/login'],
    ['post', '/logout'],
    ['get', '/me'],
  ],
  'users.routes.js': [
    ['get', '/'],
    ['get', '/:id'],
    ['put', '/me'],
    ['get', '/categories'],
    ['get', '/skills'],
  ],
  'initiatives.routes.js': [
    ['get', '/'],
    ['get', '/mine'],
    ['get', '/:id'],
    ['post', '/'],
    ['put', '/:id'],
    ['delete', '/:id'],
    ['post', '/:id/archive'],
  ],
  'requests.routes.js': [
    ['post', '/:id/requests'],
    ['get', '/'],
    ['get', '/:id'],
    ['put', '/:id'],
    ['post', '/:id/cancel'],
    ['post', '/:id/decision'],
  ],
  'members.routes.js': [
    ['get', '/:id/members'],
    ['delete', '/:id/members/:userId'],
  ],
  'projects.routes.js': [
    ['post', '/:id/project'],
    ['get', '/'],
    ['get', '/:id'],
  ],
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

test('API14: los 27 verbos y subrutas del contrato aparecen en sus routers', async () => {
  const total = Object.values(routes)
    .reduce((count, group) => count + group.length, 0)

  assert.equal(total, 27)

  for (const [filename, definitions] of Object.entries(routes)) {
    const url = new URL(`../src/routes/${filename}`, import.meta.url)
    const source = await readFile(url, 'utf8')

    for (const [verb, path] of definitions) {
      const expression = new RegExp(
        `\\brouter\\.${verb}\\(\\s*['"]${escapeRegex(path)}['"]`,
      )

      assert.match(
        source,
        expression,
        `${filename}: ${verb.toUpperCase()} ${path}`,
      )
    }
  }
})
