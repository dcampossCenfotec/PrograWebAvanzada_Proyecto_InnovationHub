
function asIso(value) {
  return value == null ? null : (value instanceof Date ? value : new Date(value)).toISOString()
}

export function toRequestDto({ raw, initiative, applicant, skill }) {
  return {
    id: raw.id,
    initiative: initiative ? { id: initiative.id, title: initiative.title } : { id: raw.initiativeId, title: 'Iniciativa no disponible' },
    applicant: applicant ? {
      id: applicant.id, firstName: applicant.firstName, lastName: applicant.lastName,
    } : { id: raw.applicantId, firstName: 'Usuario', lastName: 'no disponible' },
    message: raw.message,
    offeredSkill: skill ? { id: skill.id, name: skill.name } : { id: raw.offeredSkillId, name: 'Competencia no disponible' },
    role: raw.role,
    availability: raw.availability,
    state: raw.state,
    decisionComment: raw.decisionComment ?? null,
    createdAt: asIso(raw.createdAt),
    updatedAt: asIso(raw.updatedAt),
    decidedAt: asIso(raw.decidedAt),
  }
}
