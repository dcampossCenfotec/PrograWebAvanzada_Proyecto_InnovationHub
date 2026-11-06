
import { describe, it, expect } from 'vitest'
import { initialRequest, requestValues, validateRequest } from './request-form.js'

const id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4'
const skills = [{ id, name: 'Comunicación' }]

describe('UI11: validación de solicitudes', () => {
  it('normaliza y valida datos completos sin mutar el estado', () => {
    const values = { ...initialRequest, message: '  Voy a colaborar con el equipo durante todo el mes.  ', role: '  Comunicación  ', offeredSkillId: id }
    const checked = validateRequest(values, skills)
    expect(checked.errors).toEqual({})
    expect(checked.input.message).toBe('Voy a colaborar con el equipo durante todo el mes.')
    expect(checked.input.role).toBe('Comunicación')
    expect(values.role).toBe('  Comunicación  ')
  })
  it('impide competencias ajenas y valores demasiado cortos', () => {
    const checked = validateRequest({ ...initialRequest, message: 'hola', role: 'a', offeredSkillId: 'inventada' }, skills)
    expect(Object.keys(checked.errors).sort()).toEqual(['message', 'offeredSkillId', 'role'])
  })
  it('reconstruye un formulario de edición desde DTO', () => {
    expect(requestValues({ offeredSkill: { id }, role: 'Editor', message: 'Texto', availability: 'high' })).toEqual({
      offeredSkillId: id, message: 'Texto', role: 'Editor', availability: 'high',
    })
  })
})
