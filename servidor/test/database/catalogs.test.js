import test from 'node:test'
import assert from 'node:assert/strict'
import mongoose from 'mongoose'
import { getCatalogModels } from '../../src/models/catalog.models.js'
import { loadCatalogFixtures } from '../../src/seeds/load-catalog-fixtures.js'

test('los fixtures contractuales cumplen los esquemas de catálogos', async () => {
  const connection = mongoose.createConnection()
  const { Category, Skill } = getCatalogModels(connection)
  const catalogs = await loadCatalogFixtures()

  assert.equal(catalogs.categories.length, 8)
  assert.equal(catalogs.skills.length, 10)
  await Promise.all(catalogs.categories.map((entry) => new Category(entry).validate()))
  await Promise.all(catalogs.skills.map((entry) => new Skill(entry).validate()))
  await connection.close()
})

test('los esquemas rechazan IDs y campos ajenos', async () => {
  const connection = mongoose.createConnection()
  const { Category, Skill } = getCatalogModels(connection)

  await assert.rejects(new Category({
    id: 'Con Espacios',
    name: 'Categoría',
    nameNormalized: 'categoria',
    active: true,
  }).validate())
  assert.throws(() => new Skill({
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    name: 'Desarrollo web',
    nameNormalized: 'desarrollo web',
    active: true,
    secreto: 'no permitido',
  }))
  await connection.close()
})
