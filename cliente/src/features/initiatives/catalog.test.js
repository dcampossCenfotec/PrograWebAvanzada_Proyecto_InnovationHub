import { describe, expect, it, vi } from 'vitest'
import { catalogsService } from '../../api/services/catalogs.js'
import { catalogSearch, ownerCatalogueLink, readCatalogSearch, validateCatalogFilters } from './catalog.js'
import { loadInitiativeSkills } from './catalog-options.js'

vi.mock('../../api/services/catalogs.js', () => ({ catalogsService: { listSkills: vi.fn() } }))

describe('estado del catálogo en la URL', () => {
  it('aplicar filtros conserva valores relevantes y reinicia página', () => {
    const parsed = readCatalogSearch(new URLSearchParams('q=huertos&page=3&size=2'))
    expect(parsed.query).toMatchObject({ q: 'huertos', page: '3', size: '2' })
    const next = catalogSearch({ ...parsed.values, q: '  mentorías  ' })
    expect(next.get('q')).toBe('mentorías')
    expect(next.get('size')).toBe('2')
    expect(next.has('page')).toBe(false)
    expect(next.has('sort')).toBe(false)
  })

  it('rechaza URLs inválidas y parámetros repetidos sin lanzar errores de render', () => {
    for (const text of ['page=0', 'q=x', 'q=uno&q=dos', 'size=51', 'state=archived', 'visibility=private', 'ownerId=invalido']) {
      expect(Object.keys(readCatalogSearch(new URLSearchParams(text)).errors).length).toBeGreaterThan(0)
    }
  })

  it('mis iniciativas solo permite páginas y sus órdenes', () => {
    expect(readCatalogSearch(new URLSearchParams('sort=state'), { mine: true }).errors).toEqual({})
    expect(readCatalogSearch(new URLSearchParams('q=otro'), { mine: true }).errors.query).toBeDefined()
    expect(validateCatalogFilters({ size: '6', sort: 'memberCount', order: 'asc' }, { mine: true }).sort).toBeDefined()
  })

  it('seleccionar propietario mantiene filtros, pero reinicia la página', () => {
    const link = ownerCatalogueLink(new URLSearchParams('q=huertos&page=3'), 'owner')
    expect(link).toContain('q=huertos')
    expect(link).toContain('ownerId=owner')
    expect(link).not.toContain('page=')
    expect(ownerCatalogueLink(new URLSearchParams('sort=state'), 'owner', { mine: true })).not.toContain('sort=')
  })
})

it('lee todas las páginas del catálogo de competencias sin truncar opciones', async () => {
  catalogsService.listSkills.mockResolvedValueOnce({ data: [{ id: '1' }], pagination: { totalPages: 2 } })
    .mockResolvedValueOnce({ data: [{ id: '2' }], pagination: { totalPages: 2 } })
  const signal = new AbortController().signal
  expect(await loadInitiativeSkills({ signal })).toEqual({ data: [{ id: '1' }, { id: '2' }] })
  expect(catalogsService.listSkills).toHaveBeenLastCalledWith({ page: 2, size: 50 }, { signal })
})
