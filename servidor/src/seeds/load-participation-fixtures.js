
import { readFile } from 'node:fs/promises'

export async function loadParticipationFixtures() {
  const [requests, projects] = await Promise.all(
    ['requests.json', 'projects.json'].map(async (filename) => {
      const url = new URL(
        `../../../pruebas/fixtures/${filename}`,
        import.meta.url,
      )

      return JSON.parse(
        await readFile(url, 'utf8'),
      )
    }),
  )

  if (
    !Array.isArray(requests) ||
    !Array.isArray(projects)
  ) {
    throw new TypeError(
      'Los fixtures de solicitudes y proyectos deben ser arreglos.',
    )
  }

  return { requests, projects }
}
