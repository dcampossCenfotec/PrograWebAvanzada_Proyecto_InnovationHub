import { describe, expect, it } from 'vitest'
import { profileToValues, toProfilePayload, validateProfile } from './profile.js'

const profile = {
  firstName: 'Ana',
  lastName: 'Rojas',
  memberType: 'student',
  career: null,
  bio: null,
  interests: ['educación', 'tecnología'],
  availability: 'high',
  portfolioUrl: null,
  skills: [{ skillId: 'skill-1', level: 'advanced' }],
}

it('transforma null y arreglos entre el DTO y el formulario completo', () => {
  const values = profileToValues(profile)
  expect(values.career).toBe('')
  expect(values.interestsText).toBe('educación, tecnología')
  expect(toProfilePayload({ ...values, firstName: ' Ana ', interestsText: ' educación, datos ' })).toEqual({
    firstName: 'Ana',
    lastName: 'Rojas',
    memberType: 'student',
    career: null,
    bio: null,
    interests: ['educación', 'datos'],
    availability: 'high',
    portfolioUrl: null,
    skills: [{ skillId: 'skill-1', level: 'advanced' }],
  })
})

describe('validación de perfil', () => {
  it('rechaza duplicados, URL insegura y límites antes de llamar a la API', () => {
    const fields = validateProfile({
      ...profileToValues(profile),
      firstName: 'x',
      bio: 'x'.repeat(601),
      interestsText: 'Web, web',
      portfolioUrl: 'javascript:alert(1)',
      skills: [{ skillId: 'skill-1', level: 'basic' }, { skillId: 'skill-1', level: 'advanced' }],
    })
    expect(Object.keys(fields).sort()).toEqual([
      'bio', 'firstName', 'interests', 'portfolioUrl', 'skills',
    ])
  })

  it('acepta campos opcionales vacíos y un reemplazo válido', () => {
    expect(validateProfile(profileToValues(profile))).toEqual({})
  })
})
