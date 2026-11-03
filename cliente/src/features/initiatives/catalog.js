export const TYPE_OPTIONS = [['idea', 'Idea'], ['need', 'Necesidad'], ['challenge', 'Reto']]
export const STATE_OPTIONS = [['published', 'Publicada'], ['forming_team', 'Formando equipo'], ['converted', 'Convertida en proyecto']]
export const VISIBILITY_LABELS = {
  public: 'Pública', institutional: 'Institucional', restricted: 'Restringida', private: 'Privada',
}
export const STATE_LABELS = { ...Object.fromEntries(STATE_OPTIONS), draft: 'Borrador', archived: 'Archivada' }
export const CATALOG_DEFAULTS = Object.freeze({
  q: '', type: '', category: '', skill: '', state: '', hasSpaces: '', ownerId: '',
  size: '6', sort: 'createdAt', order: 'desc',
})
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function validateCatalogFilters(values, { mine = false } = {}) {
  const errors = {}
  const validEnum = (key, allowed) => {
    if (values[key] && !allowed.includes(values[key])) errors[key] = 'Selecciona una opción válida.'
  }
  if (!mine) {
    const q = values.q?.trim() ?? ''
    if (q && (q.length < 2 || q.length > 100)) errors.q = 'Escribe entre 2 y 100 caracteres.'
    validEnum('type', TYPE_OPTIONS.map(([value]) => value))
    validEnum('state', STATE_OPTIONS.map(([value]) => value))
    validEnum('hasSpaces', ['true', 'false'])
    if (values.category && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.category)) errors.category = 'La categoría no es válida.'
    for (const key of ['skill', 'ownerId']) {
      if (values[key] && !uuid.test(values[key])) errors[key] = 'La selección no es válida.'
    }
  }
  if (!/^[1-9]\d*$/.test(values.size) || Number(values.size) > 50) errors.size = 'Selecciona entre 1 y 50 resultados.'
  validEnum('sort', mine ? ['createdAt', 'updatedAt', 'title', 'state'] : ['createdAt', 'updatedAt', 'title', 'memberCount'])
  validEnum('order', ['asc', 'desc'])
  return errors
}

export function readCatalogSearch(searchParams, { mine = false } = {}) {
  const allowed = mine ? ['size', 'sort', 'order'] : Object.keys(CATALOG_DEFAULTS)
  const values = Object.fromEntries(allowed.map((key) => [key, searchParams.get(key) ?? CATALOG_DEFAULTS[key]]))
  const errors = validateCatalogFilters(values, { mine })
  for (const key of searchParams.keys()) {
    if (![...allowed, 'page'].includes(key)) errors.query = 'La dirección contiene un filtro no permitido.'
    if (searchParams.getAll(key).length > 1) errors.query = 'La dirección contiene un filtro repetido.'
  }
  const page = searchParams.get('page') ?? '1'
  if (!/^[1-9]\d*$/.test(page) || !Number.isSafeInteger((Number(page) - 1) * Number(values.size))) {
    errors.page = 'La página solicitada no es válida.'
  }
  const query = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim() || undefined]))
  return { values, errors, query: { ...query, page } }
}

export function catalogSearch(values) {
  const result = new URLSearchParams()
  for (const [key, raw] of Object.entries(values)) {
    const value = raw.trim()
    if (value && value !== CATALOG_DEFAULTS[key]) result.set(key, value)
  }
  return result
}

export function ownerCatalogueLink(searchParams, ownerId, { mine = false } = {}) {
  const next = mine ? new URLSearchParams() : new URLSearchParams(searchParams)
  next.delete('page')
  next.set('ownerId', ownerId)
  return `/iniciativas?${next}`
}
