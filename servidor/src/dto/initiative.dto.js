function toOwnerDto(owner) {
  return {
    id: owner.id,
    firstName: owner.firstName,
    lastName: owner.lastName,
  }
}

function calculateAccess(initiative, memberCount) {
  const active = initiative.state !== 'archived'
  return {
    canViewDetails: true,
    canEdit: active,
    canDelete: true,
    canRequest: false,
    canManageRequests: active,
    canViewTeam: true,
    canConvert: active && initiative.state !== 'converted' && memberCount > 1,
  }
}

export function toInitiativeDto({ initiative, owner, category, skills, memberCount }) {
  const skillsById = new Map(skills.map((skill) => [skill.id, skill]))
  return {
    id: initiative.id,
    title: initiative.title,
    type: initiative.type,
    summary: initiative.summary,
    description: initiative.description,
    problem: initiative.problem,
    beneficiaries: initiative.beneficiaries,
    category: { id: category.id, name: category.name },
    skills: initiative.skillIds.map((id) => ({ id, name: skillsById.get(id).name })),
    estimatedMembers: initiative.estimatedMembers,
    memberCount,
    availableSpaces: Math.max(0, initiative.estimatedMembers - memberCount),
    visibility: initiative.visibility,
    state: initiative.state,
    owner: toOwnerDto(owner),
    tags: [...initiative.tags],
    createdAt: initiative.createdAt.toISOString(),
    updatedAt: initiative.updatedAt.toISOString(),
    access: calculateAccess(initiative, memberCount),
  }
}
