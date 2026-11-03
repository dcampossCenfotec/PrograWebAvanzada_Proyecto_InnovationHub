export const INITIATIVE_TEXT_RULES = Object.freeze({
  title: { label: 'Título', min: 5, max: 100, rows: 0 },
  summary: { label: 'Resumen', min: 15, max: 240, rows: 3 },
  description: { label: 'Descripción', min: 20, max: 2000, rows: 7 },
  problem: { label: 'Problema que atiende', min: 10, max: 500, rows: 4 },
  beneficiaries: { label: 'Personas beneficiarias', min: 3, max: 150, rows: 2 },
})

export function initiativeToValues(initiative) {
  return {
    title: initiative?.title ?? '', type: initiative?.type ?? 'idea',
    summary: initiative?.summary ?? '', description: initiative?.description ?? '',
    problem: initiative?.problem ?? '', beneficiaries: initiative?.beneficiaries ?? '',
    categoryId: initiative?.category?.id ?? '',
    skillIds: initiative?.skills?.map(({ id }) => id) ?? [],
    estimatedMembers: initiative ? String(initiative.estimatedMembers) : '',
    tagDraft: '',
    visibility: initiative?.visibility ?? 'public',
    tags: (initiative?.tags ?? []).map((value) => ({ key: crypto.randomUUID(), value })),
  }
}

export function initiativeEditorSnapshot(values) {
  return JSON.stringify({ ...values, tags: values.tags.map(({ value }) => value) })
}

export function normalizeInitiativeText(value) {
  return value.trim()
}

export function initiativeTextLength(value) {
  return normalizeInitiativeText(value).length
}

export function toInitiativePayload(values) {
  return {
    ...Object.fromEntries(Object.keys(INITIATIVE_TEXT_RULES).map((key) => [key, normalizeInitiativeText(values[key])])),
    type: values.type, categoryId: values.categoryId,
    skillIds: [...values.skillIds], estimatedMembers: Number(values.estimatedMembers),
    visibility: values.visibility,
    tags: values.tags.map(({ value }) => value.trim()).filter(Boolean),
  }
}

export function initiativeTagKey(value) {
  return value.trim().normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('es')
}

export function validateInitiativeEditor(values, { categories, skills, initiative } = {}) {
  const fields = {}
  for (const [key, rule] of Object.entries(INITIATIVE_TEXT_RULES)) {
    const length = initiativeTextLength(values[key])
    if (length < rule.min || length > rule.max) fields[key] = `Debe tener entre ${rule.min} y ${rule.max} caracteres.`
  }
  if (!['idea', 'need', 'challenge'].includes(values.type)) fields.type = 'Selecciona un tipo válido.'
  if (!['public', 'institutional', 'restricted', 'private'].includes(values.visibility)) fields.visibility = 'Selecciona una visibilidad válida.'
  if (!categories.some(({ id }) => id === values.categoryId)) fields.categoryId = 'Selecciona una categoría disponible.'
  if (!/^[1-9]\d*$/.test(values.estimatedMembers) || Number(values.estimatedMembers) > 100) fields.estimatedMembers = 'Debe ser un entero entre 1 y 100.'
  else if (initiative && Number(values.estimatedMembers) < initiative.estimatedMembers && Number(values.estimatedMembers) < initiative.memberCount) fields.estimatedMembers = 'No puede reducirse por debajo de los miembros activos.'
  if (values.skillIds.length < 1 || values.skillIds.length > 10) fields.skillIds = 'Selecciona entre 1 y 10 competencias.'
  else if (new Set(values.skillIds).size !== values.skillIds.length || values.skillIds.some((id) => !skills.some((skill) => skill.id === id))) fields.skillIds = 'Selecciona competencias disponibles y sin duplicados.'
  const tags = values.tags.map(({ value }) => value.trim()).filter(Boolean)
  if (tags.length > 10 || tags.some((tag) => tag.length > 40)) fields.tags = 'Acepta hasta 10 etiquetas de 1 a 40 caracteres.'
  else if (new Set(tags.map(initiativeTagKey)).size !== tags.length) fields.tags = 'No repitas etiquetas.'
  if (values.tagDraft?.trim()) fields.tags = 'Agrega la etiqueta pendiente o borra su texto antes de guardar.'
  return fields
}
