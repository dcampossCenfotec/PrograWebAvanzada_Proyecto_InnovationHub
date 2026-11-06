
export const initialRequest = Object.freeze({
  message: '', offeredSkillId: '', role: '', availability: 'medium',
})

export function requestValues(source = initialRequest) {
  return {
    message: source.message ?? '',
    offeredSkillId: source.offeredSkill?.id ?? source.offeredSkillId ?? '',
    role: source.role ?? '',
    availability: source.availability ?? 'medium',
  }
}

export function validateRequest(values, availableSkills) {
  const errors = {}
  const message = values.message.trim()
  const role = values.role.trim()
  if (message.length < 15 || message.length > 500) errors.message = 'Debe contener entre 15 y 500 caracteres.'
  if (role.length < 3 || role.length > 100) errors.role = 'Debe contener entre 3 y 100 caracteres.'
  if (!availableSkills.some(({ id }) => id === values.offeredSkillId)) {
    errors.offeredSkillId = 'Selecciona una competencia que tengas en tu perfil.'
  }
  if (!['low', 'medium', 'high'].includes(values.availability)) errors.availability = 'Selecciona una disponibilidad válida.'
  return { errors, input: { message, role, offeredSkillId: values.offeredSkillId, availability: values.availability } }
}

export const REQUEST_STATES = Object.freeze({
  pending: 'Pendiente', accepted: 'Aceptada', rejected: 'Rechazada', cancelled: 'Cancelada',
})
export const AVAILABILITY_LABELS = Object.freeze({ low: 'Baja', medium: 'Media', high: 'Alta' })
