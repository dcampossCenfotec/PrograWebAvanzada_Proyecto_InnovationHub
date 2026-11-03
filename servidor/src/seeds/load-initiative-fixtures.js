import { readFile } from 'node:fs/promises'

export async function loadInitiativeFixtures() {
  const files = [
    ['initiatives', 'initiatives.json'],
    ['memberships', 'memberships.json'],
    ['membershipEvents', 'membership-events.json'],
  ]
  const entries = await Promise.all(files.map(async ([key, filename]) => {
    const url = new URL(`../../../pruebas/fixtures/${filename}`, import.meta.url)
    return [key, JSON.parse(await readFile(url, 'utf8'))]
  }))
  return Object.fromEntries(entries)
}
