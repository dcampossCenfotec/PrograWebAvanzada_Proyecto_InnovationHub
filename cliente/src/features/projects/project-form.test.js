
import { describe, expect, it } from 'vitest'
import {
  initialProject,
  validateProject,
} from './project-form.js'
import {
  fetchGitHubRepository,
  parseGitHubRepositoryUrl,
} from '../../api/external/github.js'

const input = {
  ...initialProject,
  name: 'Proyecto tutorías',
  description: 'Un sistema de tutorías colaborativas en la universidad.',
  objective: 'Coordinar sesiones de tutorías académicas.',
  technologies: 'React, MongoDB',
  startDate: '2026-11-06',
  estimatedEndDate: '2027-02-20',
  repositoryUrl: 'https://github.com/openai/openai-node',
}

describe('UI13: validación y GitHub', () => {
  it('valida conversión y transforma tecnologías', () => {
    const valid = validateProject(input)

    expect(valid.errors).toEqual({})
    expect(valid.value.technologies).toEqual([
      'React',
      'MongoDB',
    ])

    expect(
      validateProject({
        ...input,
        startDate: '2026-02-30',
      }).errors,
    ).toHaveProperty('startDate')

    expect(
      validateProject({
        ...input,
        technologies: 'React,react',
      }).errors,
    ).toHaveProperty('technologies')
  })

  it('no confunde hosts externos con GitHub', () => {
    expect(
      parseGitHubRepositoryUrl(
        'https://github.com/openai/openai-node',
      ),
    ).toEqual({
      owner: 'openai',
      repo: 'openai-node',
    })

    expect(
      parseGitHubRepositoryUrl(
        'https://github.com.evil.test/openai/openai-node',
      ),
    ).toBe(null)

    expect(
      parseGitHubRepositoryUrl(
        'https://evil.test/github.com/openai/openai-node',
      ),
    ).toBe(null)
  })

  it('nunca llama la API externa si el repositorio no corresponde', async () => {
    const fetcher = () => {
      throw new Error('No debe llamarse')
    }

    expect(
      await fetchGitHubRepository(
        'https://example.com/a/b',
        { fetcher },
      ),
    ).toBe(null)
  })

  it('maneja respuesta pública y error 404 sin token propio', async () => {
    const fetcher = async (_url, options) => {
      expect(options.headers.Authorization).toBeUndefined()

      return {
        ok: true,
        json: async () => ({
          name: 'demo',
          owner: { login: 'demo' },
          language: null,
          open_issues_count: 0,
        }),
      }
    }

    const result = await fetchGitHubRepository(
      'https://github.com/demo/demo',
      { fetcher },
    )

    expect(result.language).toBe(null)

    await expect(
      fetchGitHubRepository(
        'https://github.com/demo/demo',
        {
          fetcher: async () => ({
            ok: false,
            status: 404,
            headers: new Headers(),
          }),
        },
      ),
    ).rejects.toThrow(/no existe o no es accesible/)
  })
})
