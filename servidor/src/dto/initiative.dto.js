import { initiativeCapabilities } from '../services/initiative-access.js'

function toOwnerDto(owner) {
  return {
    id: owner.id,
    firstName: owner.firstName,
    lastName: owner.lastName,
  }
}

export function toInitiativeDto({
  initiative, owner, category, skills, memberCount,
  actorId = owner.id, isMember = false, hasPending = false,
}, { detail = true } = {}) {
  const skillsById = new Map(skills.map((skill) => [skill.id, skill]))
  const access = initiativeCapabilities(initiative, { actorId, isMember, memberCount, hasPending })
  const summary = {
    id: initiative.id,
    title: initiative.title,
    type: initiative.type,
    summary: initiative.summary,
    category: { id: category.id, name: category.name },
    skills: initiative.skillIds.map((id) => ({ id, name: skillsById.get(id).name })),
    estimatedMembers: initiative.estimatedMembers,
    memberCount,
    availableSpaces: Math.max(0, initiative.estimatedMembers - memberCount),
    visibility: initiative.visibility,
    state: initiative.state,
    access,
  }
  if (!access.canViewDetails) return summary
  return {
    ...summary,
    owner: toOwnerDto(owner),
    tags: [...initiative.tags],
    createdAt: initiative.createdAt.toISOString(),
    updatedAt: initiative.updatedAt.toISOString(),
    ...(detail ? {
      description: initiative.description,
      problem: initiative.problem,
      beneficiaries: initiative.beneficiaries,
    } : {}),
  }
}
