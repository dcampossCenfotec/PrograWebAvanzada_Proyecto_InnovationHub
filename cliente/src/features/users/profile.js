import { MEMBER_TYPE_OPTIONS } from '../../auth/validation.js'

export const MEMBER_TYPE_LABELS = Object.freeze(Object.fromEntries(MEMBER_TYPE_OPTIONS))
export const AVAILABILITY_OPTIONS = Object.freeze([
  ['low', 'Baja'],
  ['medium', 'Media'],
  ['high', 'Alta'],
])
export const AVAILABILITY_LABELS = Object.freeze(Object.fromEntries(AVAILABILITY_OPTIONS))
export const SKILL_LEVEL_OPTIONS = Object.freeze([
  ['basic', 'Básico'],
  ['intermediate', 'Intermedio'],
  ['advanced', 'Avanzado'],
])
export const SKILL_LEVEL_LABELS = Object.freeze(Object.fromEntries(SKILL_LEVEL_OPTIONS))

function parseInterests(value) {
  if (!value.trim()) return []
  return value.split(',').map((interest) => interest.trim()).filter(Boolean)
}

export function profileToValues(profile) {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    memberType: profile.memberType,
    career: profile.career ?? '',
    bio: profile.bio ?? '',
    interestsText: (profile.interests ?? []).join(', '),
    availability: profile.availability,
    portfolioUrl: profile.portfolioUrl ?? '',
    skills: (profile.skills ?? []).map(({ skillId, level }) => ({ skillId, level })),
  }
}

function validateText(value, field, minimum, maximum, fields) {
  const normalized = value.trim()
  if (normalized.length < minimum || normalized.length > maximum) {
    fields[field] = `Debe tener entre ${minimum} y ${maximum} caracteres.`
  }
}

export function validateProfile(values) {
  const fields = {}
  validateText(values.firstName, 'firstName', 2, 60, fields)
  validateText(values.lastName, 'lastName', 2, 80, fields)
  if (!MEMBER_TYPE_LABELS[values.memberType]) fields.memberType = 'Selecciona un tipo de miembro.'
  if (values.career.trim()) validateText(values.career, 'career', 2, 120, fields)
  if (values.bio.trim().length > 600) fields.bio = 'Acepta como máximo 600 caracteres.'
  if (!AVAILABILITY_LABELS[values.availability]) fields.availability = 'Selecciona una disponibilidad.'

  const interests = parseInterests(values.interestsText)
  const normalizedInterests = new Set(interests.map((value) => value.toLocaleLowerCase('es')))
  if (interests.length > 15) fields.interests = 'Acepta como máximo 15 intereses.'
  else if (interests.some((value) => value.length > 40)) fields.interests = 'Cada interés acepta hasta 40 caracteres.'
  else if (normalizedInterests.size !== interests.length) fields.interests = 'No repitas intereses.'

  if (values.portfolioUrl.trim()) {
    try {
      const url = new URL(values.portfolioUrl.trim())
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('protocol')
    } catch {
      fields.portfolioUrl = 'Escribe una URL que comience con http:// o https://.'
    }
  }

  if (values.skills.length > 20) fields.skills = 'Acepta como máximo 20 competencias.'
  else if (new Set(values.skills.map(({ skillId }) => skillId)).size !== values.skills.length) {
    fields.skills = 'No repitas competencias.'
  }
  return fields
}

export function toProfilePayload(values) {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    memberType: values.memberType,
    career: values.career.trim() || null,
    bio: values.bio.trim() || null,
    interests: parseInterests(values.interestsText),
    availability: values.availability,
    portfolioUrl: values.portfolioUrl.trim() || null,
    skills: values.skills.map(({ skillId, level }) => ({ skillId, level })),
  }
}
