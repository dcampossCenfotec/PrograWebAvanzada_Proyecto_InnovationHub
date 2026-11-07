
export const initialProject = Object.freeze({
  name: '',
  description: '',
  objective: '',
  technologies: '',
  startDate: '',
  estimatedEndDate: '',
  repositoryUrl: '',
})

export function validateProject(values) {
  const errors = {}

  const name = values.name.trim()
  const description = values.description.trim()
  const objective = values.objective.trim()

  const technologies = values.technologies
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)

  const startDate = values.startDate
  const estimatedEndDate = values.estimatedEndDate || null
  const repositoryUrl = values.repositoryUrl.trim() || null

  if (name.length < 5 || name.length > 120) {
    errors.name = 'Entre 5 y 120 caracteres.'
  }

  if (description.length < 20 || description.length > 2000) {
    errors.description = 'Entre 20 y 2000 caracteres.'
  }

  if (objective.length < 10 || objective.length > 500) {
    errors.objective = 'Entre 10 y 500 caracteres.'
  }

  if (
    technologies.length < 1 ||
    technologies.length > 20 ||
    technologies.some((v) => v.length > 50) ||
    new Set(
      technologies.map((v) => v.toLowerCase()),
    ).size !== technologies.length
  ) {
    errors.technologies =
      'Indica entre 1 y 20 tecnologías distintas, separadas por comas.'
  }

  function day(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false

    const d = new Date(`${value}T00:00:00Z`)

    return (
      !Number.isNaN(d.getTime()) &&
      d.toISOString().slice(0, 10) === value
    )
  }

  if (!day(startDate)) {
    errors.startDate = 'Indica una fecha válida.'
  }

  if (
    estimatedEndDate &&
    (
      !day(estimatedEndDate) ||
      estimatedEndDate < startDate
    )
  ) {
    errors.estimatedEndDate =
      'La fecha final debe ser posterior o igual al inicio.'
  }

  if (repositoryUrl) {
    try {
      const url = new URL(repositoryUrl)
      if (
        !['http:', 'https:'].includes(url.protocol) ||
        repositoryUrl.length > 2048
      ) {
        errors.repositoryUrl =
          'Ingresa una URL HTTP(S) de hasta 2048 caracteres.'
      }
    } catch {
      errors.repositoryUrl =
        'Ingresa una URL HTTP(S) válida.'
    }
  }

  return {
    errors,
    value: {
      name,
      description,
      objective,
      technologies,
      startDate,
      estimatedEndDate,
      repositoryUrl,
    },
  }
}
