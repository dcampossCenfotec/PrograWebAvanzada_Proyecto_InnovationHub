
const apiBase =
  import.meta.env.VITE_GITHUB_API_BASE_URL ||
  'https://api.github.com'

const version =
  import.meta.env.VITE_GITHUB_API_VERSION ||
  '2022-11-28'

const timeoutMs = 10000

export function parseGitHubRepositoryUrl(value) {
  if (!value) return null

  try {
    const url = new URL(value)

    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.hostname.toLowerCase() !== 'github.com' ||
      url.port ||
      url.username ||
      url.password
    ) {
      return null
    }

    const parts = url.pathname.split('/').filter(Boolean)

    if (
      parts.length !== 2 ||
      !parts.every((part) => /^[\w.-]+$/.test(part))
    ) {
      return null
    }

    const repo = parts[1].replace(/\.git$/i, '')

    return repo
      ? { owner: parts[0], repo }
      : null
  } catch {
    return null
  }
}

function githubError(response) {
  if (response.status === 404) {
    return 'El repositorio no existe o no es accesible públicamente.'
  }

  if (
    response.status === 429 ||
    (
      response.status === 403 &&
      response.headers.get('x-ratelimit-remaining') === '0'
    )
  ) {
    return 'GitHub alcanzó el límite de solicitudes. Vuelve a consultar más tarde.'
  }

  if (response.status === 403) {
    return 'GitHub rechazó la consulta pública.'
  }

  if (response.status >= 500) {
    return 'GitHub no está disponible temporalmente.'
  }

  return `No se pudo consultar GitHub (HTTP ${response.status}).`
}

export async function fetchGitHubRepository(
  repositoryUrl,
  { signal, fetcher = fetch } = {},
) {
  const parsed = parseGitHubRepositoryUrl(repositoryUrl)

  if (!parsed) return null

  const base = new URL(apiBase)

  if (
    base.protocol !== 'https:' ||
    base.hostname !== 'api.github.com' ||
    base.username ||
    base.password
  ) {
    throw new Error(
      'Configura una URL pública válida de GitHub API.',
    )
  }

  const controller = new AbortController()

  const abort = () => controller.abort()
  signal?.addEventListener('abort', abort, { once: true })

  const timer = setTimeout(
    () => controller.abort(),
    timeoutMs,
  )

  try {
    if (signal?.aborted) controller.abort()

    const response = await fetcher(
      `${base.origin}/repos/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}`,
      {
        signal: controller.signal,
        headers: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': version,
        },
      },
    )

    if (!response.ok) {
      throw new Error(githubError(response))
    }

    let data

    try {
      data = await response.json()
    } catch {
      throw new Error(
        'GitHub devolvió una respuesta JSON inválida.',
      )
    }

    if (
      !data ||
      typeof data !== 'object' ||
      typeof data.name !== 'string' ||
      typeof data.owner?.login !== 'string'
    ) {
      throw new Error(
        'GitHub devolvió datos incompletos.',
      )
    }

    return {
      name: data.name,
      owner: data.owner.login,
      description: data.description ?? null,
      language: data.language ?? null,
      defaultBranch: data.default_branch ?? null,
      updatedAt: data.updated_at ?? null,
      openIssues: Number.isInteger(data.open_issues_count)
        ? data.open_issues_count
        : null,
    }
  } catch (error) {
    if (signal?.aborted) throw error

    if (controller.signal.aborted) {
      throw new Error(
        'La consulta a GitHub superó el tiempo disponible.',
      )
    }

    if (error instanceof TypeError) {
      throw new Error(
        'No fue posible conectar con GitHub. Comprueba la conexión.',
      )
    }

    throw error
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', abort)
  }
}
