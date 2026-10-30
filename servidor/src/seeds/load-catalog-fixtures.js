import { readFile } from 'node:fs/promises'

const defaultFixtureUrl = new URL('../../../pruebas/fixtures/catalogs.json', import.meta.url)

export async function loadCatalogFixtures(fixtureUrl = defaultFixtureUrl) {
  const contents = await readFile(fixtureUrl, 'utf8')
  const catalogs = JSON.parse(contents)
  if (!Array.isArray(catalogs.categories) || !Array.isArray(catalogs.skills)) {
    throw new TypeError('El fixture de catálogos debe contener arreglos categories y skills.')
  }
  return catalogs
}
