import { describe, expect, it } from 'vitest'
import { INITIATIVE_TEXT_RULES, initiativeEditorSnapshot, initiativeTextLength, initiativeToValues, toInitiativePayload, validateInitiativeEditor } from './editor.js'

const id = '10000000-0000-4000-8000-000000000001'
const skill = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'
const initiative = {
  id, title: 'Tutorías entre estudiantes', type: 'idea', summary: 'Apoyo académico colaborativo entre estudiantes.',
  description: 'Un espacio para organizar sesiones académicas entre estudiantes.', problem: 'Es difícil encontrar apoyo académico.', beneficiaries: 'Estudiantes universitarios',
  category: { id: 'education' }, skills: [{ id: skill }], estimatedMembers: 2, memberCount: 3,
  visibility: 'public', tags: ['Diseño, investigación', 'Educación'],
}
const catalogs = { categories: [{ id: 'education' }], skills: [{ id: skill }], initiative }

describe('datos del formulario de iniciativas', () => {
  it('reconstruye campos sin perder etiquetas con comas ni campos multilínea', () => {
    const values = initiativeToValues({ ...initiative, description: 'Primera línea\nSegunda línea de descripción.' })
    expect(toInitiativePayload(values).tags).toEqual(initiative.tags)
    expect(toInitiativePayload(values).description).toContain('\n')
    expect(values.skillIds).toEqual([skill])
  })
  it('solo envía los once campos editables e ignora identidad, capacidades y fechas inyectadas', () => {
    const values = { ...initiativeToValues(initiative), id, ownerId: 'otro', state: 'archived', memberCount: 99, createdAt: 'ayer', access: { canEdit: true } }
    expect(Object.keys(toInitiativePayload(values)).sort()).toEqual(['title', 'type', 'summary', 'description', 'problem', 'beneficiaries', 'categoryId', 'skillIds', 'estimatedMembers', 'visibility', 'tags'].sort())
    expect(typeof toInitiativePayload(values).estimatedMembers).toBe('number')
  })
  it('detecta vacíos y rechaza estimados no enteros, negativos o mayores a 100', () => {
    expect(Object.keys(validateInitiativeEditor(initiativeToValues(), catalogs))).toContain('title')
    for (const estimatedMembers of ['0', '-1', '1.5', '1e2', '101', '']) expect(validateInitiativeEditor({ ...initiativeToValues(initiative), estimatedMembers }, catalogs)).toHaveProperty('estimatedMembers')
  })
  it('conserva un estimado superado pero impide una reducción por debajo de integrantes', () => {
    expect(validateInitiativeEditor(initiativeToValues(initiative), catalogs)).toEqual({})
    expect(validateInitiativeEditor({ ...initiativeToValues(initiative), estimatedMembers: '1' }, catalogs)).toHaveProperty('estimatedMembers')
    expect(validateInitiativeEditor({ ...initiativeToValues(initiative), estimatedMembers: '4' }, catalogs)).toEqual({})
  })
  it('valida categorías/competencias disponibles y duplicados de etiquetas con tildes', () => {
    const values = initiativeToValues(initiative)
    expect(validateInitiativeEditor({ ...values, categoryId: 'unknown', skillIds: ['unknown'] }, catalogs)).toMatchObject({ categoryId: expect.any(String), skillIds: expect.any(String) })
    values.tags = [{ key: '1', value: 'Educación' }, { key: '2', value: 'educacion' }]
    expect(validateInitiativeEditor(values, catalogs)).toHaveProperty('tags')
  })
  it('la detección de cambios ignora claves de filas y conserva los valores originales', () => {
    const a = initiativeToValues(initiative)
    const b = initiativeToValues(initiative)
    expect(initiativeEditorSnapshot(a)).toBe(initiativeEditorSnapshot(b))
    b.tags[0].value = 'Otra etiqueta'
    expect(initiativeEditorSnapshot(a)).not.toBe(initiativeEditorSnapshot(b))
  })
})


describe('UI10: normalización contractual de textos', () => {
  it.each(Object.entries(INITIATIVE_TEXT_RULES))('%s comparte límites entre validación, contador y payload', (name, rule) => {
    for (const length of [0, rule.min - 1, rule.min, rule.max, rule.max + 1]) {
      const values = { ...initiativeToValues(initiative), [name]: `  ${'á'.repeat(length)}  ` }
      expect(initiativeTextLength(values[name])).toBe(length)
      expect(toInitiativePayload(values)[name]).toBe('á'.repeat(length))
      expect(Boolean(validateInitiativeEditor(values, catalogs)[name])).toBe(length < rule.min || length > rule.max)
    }
  })
  it('mantiene saltos internos y usa longitud UTF-16, igual que el servidor', () => {
    expect(initiativeTextLength('  A\nB  ')).toBe(3)
    expect(initiativeTextLength('  😀  ')).toBe(2)
    expect(toInitiativePayload({ ...initiativeToValues(initiative), description: '  Primera línea\nSegunda línea.  ' }).description).toBe('Primera línea\nSegunda línea.')
  })
})
