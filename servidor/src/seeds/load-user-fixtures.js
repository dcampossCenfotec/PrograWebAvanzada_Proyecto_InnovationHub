import { readFile } from 'node:fs/promises'

const fixturesUrl = new URL('../../../pruebas/fixtures/users.json', import.meta.url)

export async function loadUserFixtures() {
  return JSON.parse(await readFile(fixturesUrl, 'utf8'))
}
