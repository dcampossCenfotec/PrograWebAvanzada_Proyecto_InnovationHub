import { catalogsService } from '../../api/services/catalogs.js'

export async function loadInitiativeSkills({ signal }) {
  const first = await catalogsService.listSkills({ page: 1, size: 50 }, { signal })
  const skills = [...first.data]
  for (let page = 2; page <= first.pagination.totalPages; page += 1) {
    const next = await catalogsService.listSkills({ page, size: 50 }, { signal })
    skills.push(...next.data)
  }
  return { data: skills }
}
