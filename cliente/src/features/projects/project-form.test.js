
import { describe, it, expect } from 'vitest'
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
  description:
    'Un sistema de tutorías colaborativas en la universidad.',
  objective:
    'Coordinar sesiones de tutorías académicas.',
  technologies: 'React, MongoDB',
  startDate: '2026-11-08',
  estimatedEndDate: '2027-02-20',
  repositoryUrl: 'https://github.com/openai/openai-node',
}

const repositoryUrl = 'https://github.com/demo/demo'

function errorResponse(status, remaining = null) {
  return {
    ok: false,
    status,
    headers: new Headers(
      remaining === null
        ? {}
        : { 'x-ratelimit-remaining': remaining },
    ),
  }
}

describe('UI15: formularios de proyectos', () => {
  it('valida un proyecto completo sin modificar el estado original', () => {
    const values = { ...input }

    const result = validateProject(values)

    expect(result.errors).toEqual({})

    expect(result.value.technologies).toEqual([
      'React',
      'MongoDB',
    ])

    expect(values.technologies).toBe('React, MongoDB')
    expect(result.value.startDate).toBe('2026-11-08')
  })

  it('rechaza fechas imposibles y fin anterior al inicio', () => {
    expect(
      validateProject({
        ...input,
        startDate: '2026-02-30',
      }).errors,
    ).toHaveProperty('startDate')

    expect(
      validateProject({
        ...input,
        estimatedEndDate: '2025-11-08',
      }).errors,
    ).toHaveProperty('estimatedEndDate')
  })

  it('rechaza tecnologías duplicadas y campos insuficientes', () => {
    const result = validateProject({
      ...input,
      name: 'A',
      description: 'Corta',
      objective: 'Breve',
      technologies: 'React,react',
    })

    expect(result.errors).toHaveProperty('name')
    expect(result.errors).toHaveProperty('description')
    expect(result.errors).toHaveProperty('objective')
    expect(result.errors).toHaveProperty('technologies')
  })

  it('rechaza URL sin HTTP(S)', () => {
    const result = validateProject({
      ...input,
      repositoryUrl: 'file:///etc/passwd',
    })

    expect(result.errors).toHaveProperty('repositoryUrl')
  })
})

describe('UI15: integración pública con GitHub', () => {
  it('identifica un repositorio legítimo', () => {
    expect(
      parseGitHubRepositoryUrl(
        'https://github.com/openai/openai-node',
      ),
    ).toEqual({
      owner: 'openai',
      repo: 'openai-node',
    })
  })

  it('rechaza dominios similares y URLs no permitidas', () => {
    const invalid = [
      'https://github.com.evil.test/openai/openai-node',
      'https://evil.test/github.com/openai/openai-node',
      'file:///github.com/demo/repo',
      'https://github.com/demo',
      'https://user:pass@github.com/demo/repo',
      'https://github.com:8080/demo/repo',
    ]

    for (const url of invalid) {
      expect(parseGitHubRepositoryUrl(url), url).toBe(null)
    }
  })

  it('no consulta GitHub para un repositorio no identificado', async () => {
    const fetcher = () => {
      throw new Error('No debe ejecutarse')
    }

    const result = await fetchGitHubRepository(
      'https://example.com/a/b',
      { fetcher },
    )

    expect(result).toBe(null)
  })

  it('obtiene metadatos sin enviar tokens de Innovation Hub', async () => {
    const fetcher = async (url, options) => {
      expect(url).toContain('/repos/demo/demo')

      expect(
        options.headers.Authorization,
      ).toBeUndefined()

      expect(
        options.headers.Accept,
      ).toBe('application/vnd.github+json')

      return {
        ok: true,
        json: async () => ({
          name: 'demo',
          owner: { login: 'demo' },
          description: 'Repositorio público',
          language: 'JavaScript',
          default_branch: 'main',
          updated_at: '2026-11-08T12:00:00Z',
          open_issues_count: 2,
        }),
      }
    }

    const result = await fetchGitHubRepository(
      repositoryUrl,
      { fetcher },
    )

    expect(result).toEqual({
      name: 'demo',
      owner: 'demo',
      description: 'Repositorio público',
      language: 'JavaScript',
      defaultBranch: 'main',
      updatedAt: '2026-11-08T12:00:00Z',
      openIssues: 2,
    })
  })

  it('distingue un repositorio inexistente o privado', async () => {
    await expect(
      fetchGitHubRepository(repositoryUrl, {
        fetcher: async () => errorResponse(404),
      }),
    ).rejects.toThrow(
      /no existe o no es accesible públicamente/,
    )
  })

  it('informa cuando GitHub alcanza su límite de solicitudes', async () => {
    await expect(
      fetchGitHubRepository(repositoryUrl, {
        fetcher: async () => errorResponse(403, '0'),
      }),
    ).rejects.toThrow(/límite de solicitudes/)
  })

  it('maneja un fallo temporal del servicio', async () => {
    await expect(
      fetchGitHubRepository(repositoryUrl, {
        fetcher: async () => errorResponse(503),
      }),
    ).rejects.toThrow(/no está disponible/)
  })

  it('rechaza JSON inválido sin bloquear la interfaz', async () => {
    await expect(
      fetchGitHubRepository(repositoryUrl, {
        fetcher: async () => ({
          ok: true,
          json: async () => {
            throw new SyntaxError('JSON inválido')
          },
        }),
      }),
    ).rejects.toThrow(/respuesta JSON inválida/)
  })

  it('rechaza una respuesta con datos incompletos', async () => {
    await expect(
      fetchGitHubRepository(repositoryUrl, {
        fetcher: async () => ({
          ok: true,
          json: async () => ({
            name: 'demo',
            owner: null,
          }),
        }),
      }),
    ).rejects.toThrow(/datos incompletos/)
  })
})
