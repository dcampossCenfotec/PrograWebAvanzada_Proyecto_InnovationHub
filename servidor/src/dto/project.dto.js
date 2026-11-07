
export function toProjectDto({
  project,
  initiative,
  owner,
  memberCount,
}) {
  return {
    id: project.id,

    sourceInitiative: {
      id: initiative.id,
      title: initiative.title,
    },

    owner: owner
      ? {
          id: owner.id,
          firstName: owner.firstName,
          lastName: owner.lastName,
        }
      : {
          id: project.ownerId,
          firstName: 'Usuario',
          lastName: 'no disponible',
        },

    name: project.name,
    description: project.description,
    objective: project.objective,
    technologies: [...project.technologies],
    startDate: project.startDate,
    estimatedEndDate: project.estimatedEndDate ?? null,
    state: project.state,
    repositoryUrl: project.repositoryUrl ?? null,
    memberCount,
    createdAt: new Date(project.createdAt).toISOString(),
    updatedAt: new Date(project.updatedAt).toISOString(),
  }
}
