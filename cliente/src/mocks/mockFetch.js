import catalogs from '@fixtures/catalogs.json'
import initiativesFixture from '@fixtures/initiatives.json'
import membershipsFixture from '@fixtures/memberships.json'
import projectsFixture from '@fixtures/projects.json'
import requestsFixture from '@fixtures/requests.json'
import usersFixture from '@fixtures/users.json'

const tokenActors = new Map([
  ['mock-owner-token', '11111111-1111-4111-8111-111111111111'],
  ['mock-applicant-token', '22222222-2222-4222-8222-222222222222'],
])

const defaultFixtures = {
  catalogs,
  initiatives: initiativesFixture,
  memberships: membershipsFixture,
  projects: projectsFixture,
  requests: requestsFixture,
  users: usersFixture,
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}

function errorResponse(status, code, message, fields = {}) {
  return jsonResponse({ error: { code, message, fields } }, status)
}

function abortableDelay(milliseconds, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason || new DOMException('Solicitud cancelada.', 'AbortError'))
      return
    }
    const timeoutId = setTimeout(resolve, milliseconds)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timeoutId)
        reject(signal.reason || new DOMException('Solicitud cancelada.', 'AbortError'))
      },
      { once: true },
    )
  })
}

function getActorId(headers) {
  const authorization = headers.get('Authorization')
  if (!authorization) return { actorId: null, invalid: false }
  const match = authorization.match(/^Bearer (.+)$/)
  if (!match || !tokenActors.has(match[1])) return { actorId: null, invalid: true }
  return { actorId: tokenActors.get(match[1]), invalid: false }
}

function getRoutePath(url) {
  const marker = '/api'
  const markerIndex = url.pathname.indexOf(marker)
  return markerIndex >= 0 ? url.pathname.slice(markerIndex + marker.length) || '/' : url.pathname
}

function parsePagination(url) {
  const page = Number(url.searchParams.get('page') || 1)
  const size = Number(url.searchParams.get('size') || 12)
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(size) || size < 1 || size > 50) {
    return null
  }
  return { page, size }
}

function paginate(entries, pagination) {
  const start = (pagination.page - 1) * pagination.size
  return {
    data: entries.slice(start, start + pagination.size),
    pagination: {
      ...pagination,
      total: entries.length,
      totalPages: Math.ceil(entries.length / pagination.size),
    },
  }
}

function createProjectors(fixtures, actorId) {
  const userById = new Map(fixtures.users.map((user) => [user.id, user]))
  const categoryById = new Map(fixtures.catalogs.categories.map((item) => [item.id, item]))
  const skillById = new Map(fixtures.catalogs.skills.map((item) => [item.id, item]))

  function userSummary(userId) {
    const user = userById.get(userId)
    return user
      ? {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          memberType: user.memberType,
          career: user.career,
          avatarUrl: null,
        }
      : null
  }

  function publicUser(user) {
    const { emailNormalized, active, ...safeUser } = user
    void emailNormalized
    void active
    if (actorId !== user.id) delete safeUser.email
    return safeUser
  }

  function initiative(initiativeValue) {
    const activeMemberships = fixtures.memberships.filter(
      (membership) =>
        membership.initiativeId === initiativeValue.id && membership.state === 'active',
    )
    const memberCount = activeMemberships.length
    const isOwner = actorId === initiativeValue.ownerId
    const isMember = activeMemberships.some((membership) => membership.userId === actorId)
    const canViewDetails =
      initiativeValue.visibility === 'public' ||
      initiativeValue.visibility === 'institutional' ||
      isOwner ||
      isMember

    const projected = {
      id: initiativeValue.id,
      title: initiativeValue.title,
      type: initiativeValue.type,
      summary: initiativeValue.summary,
      category: categoryById.get(initiativeValue.categoryId),
      skills: initiativeValue.skillIds.map((id) => skillById.get(id)),
      estimatedMembers: initiativeValue.estimatedMembers,
      memberCount,
      availableSpaces: Math.max(0, initiativeValue.estimatedMembers - memberCount),
      visibility: initiativeValue.visibility,
      state: initiativeValue.state,
      createdAt: initiativeValue.createdAt,
      updatedAt: initiativeValue.updatedAt,
      access: {
        canViewDetails,
        canEdit: isOwner,
        canDelete: isOwner,
        canRequest:
          Boolean(actorId) &&
          !isOwner &&
          !isMember &&
          ['published', 'forming_team', 'converted'].includes(initiativeValue.state),
        canManageRequests: isOwner,
        canViewTeam: canViewDetails,
        canConvert: isOwner && initiativeValue.state !== 'archived',
      },
    }

    if (canViewDetails) {
      Object.assign(projected, {
        description: initiativeValue.description,
        problem: initiativeValue.problem,
        beneficiaries: initiativeValue.beneficiaries,
        owner: userSummary(initiativeValue.ownerId),
        tags: initiativeValue.tags,
      })
    }

    return projected
  }

  function membership(membershipValue) {
    const { userId, ...safeMembership } = membershipValue
    return { ...safeMembership, user: userSummary(userId) }
  }

  function request(requestValue) {
    const initiativeValue = fixtures.initiatives.find(
      (item) => item.id === requestValue.initiativeId,
    )
    return {
      id: requestValue.id,
      initiative: initiativeValue
        ? { id: initiativeValue.id, title: initiativeValue.title }
        : null,
      applicant: userSummary(requestValue.applicantId),
      message: requestValue.message,
      offeredSkill: skillById.get(requestValue.offeredSkillId),
      role: requestValue.role,
      availability: requestValue.availability,
      state: requestValue.state,
      decisionComment: requestValue.decisionComment,
      createdAt: requestValue.createdAt,
      updatedAt: requestValue.updatedAt,
      decidedAt: requestValue.decidedAt,
    }
  }

  function project(projectValue) {
    const sourceInitiative = fixtures.initiatives.find(
      (item) => item.id === projectValue.sourceInitiativeId,
    )
    const memberCount = fixtures.memberships.filter(
      (item) =>
        item.initiativeId === projectValue.sourceInitiativeId && item.state === 'active',
    ).length
    return {
      id: projectValue.id,
      sourceInitiative: sourceInitiative
        ? { id: sourceInitiative.id, title: sourceInitiative.title }
        : null,
      owner: userSummary(projectValue.ownerId),
      name: projectValue.name,
      description: projectValue.description,
      objective: projectValue.objective,
      technologies: projectValue.technologies,
      startDate: projectValue.startDate,
      estimatedEndDate: projectValue.estimatedEndDate,
      state: projectValue.state,
      repositoryUrl: projectValue.repositoryUrl,
      memberCount,
      createdAt: projectValue.createdAt,
      updatedAt: projectValue.updatedAt,
    }
  }

  return { initiative, membership, project, publicUser, request, userSummary }
}

function initiativeAccessError(initiative, actorId) {
  if (initiative.visibility === 'public') return null
  if (!actorId) {
    return initiative.visibility === 'private'
      ? errorResponse(404, 'NOT_FOUND', 'No se encontró el recurso solicitado.')
      : errorResponse(401, 'AUTHENTICATION_REQUIRED', 'Debe iniciar sesión.')
  }
  if (initiative.ownerId === actorId) return null
  return initiative.visibility === 'private'
    ? errorResponse(404, 'NOT_FOUND', 'No se encontró el recurso solicitado.')
    : initiative.visibility === 'restricted'
      ? errorResponse(403, 'FORBIDDEN', 'No tiene permiso para realizar esta acción.')
      : null
}

export function createMockFetch({ fixtures = defaultFixtures, delayMs = 120 } = {}) {
  const data = structuredClone(fixtures)

  return async function mockFetch(input, init = {}) {
    await abortableDelay(delayMs, init.signal)
    const url = new URL(typeof input === 'string' ? input : input.url, 'http://mock.local')
    const method = (init.method || 'GET').toUpperCase()
    const headers = new Headers(init.headers)
    const routePath = getRoutePath(url)
    const { actorId, invalid } = getActorId(headers)
    const projectors = createProjectors(data, actorId)

    if (invalid) {
      return errorResponse(401, 'INVALID_CREDENTIALS', 'La sesión no es válida.')
    }
    if (method !== 'GET') {
      return errorResponse(
        501,
        'MOCK_NOT_IMPLEMENTED',
        'La mutación se agregará en su tarea funcional y no puede simular éxito todavía.',
      )
    }

    if (routePath === '/categories') {
      return jsonResponse({ data: data.catalogs.categories.map(({ id, name }) => ({ id, name })) })
    }

    if (routePath === '/skills') {
      const pagination = parsePagination(url)
      if (!pagination) return errorResponse(400, 'INVALID_QUERY', 'La consulta no es válida.')
      const query = (url.searchParams.get('q') || '').trim().toLocaleLowerCase('es')
      if (query.length === 1) {
        return errorResponse(400, 'INVALID_QUERY', 'La consulta no es válida.', {
          q: 'Debe contener al menos 2 caracteres.',
        })
      }
      const entries = data.catalogs.skills
        .filter((skill) => !query || skill.nameNormalized.includes(query))
        .map(({ id, name }) => ({ id, name }))
      return jsonResponse(paginate(entries, pagination))
    }

    if (routePath === '/initiatives/mine') {
      if (!actorId) return errorResponse(401, 'AUTHENTICATION_REQUIRED', 'Debe iniciar sesión.')
      const pagination = parsePagination(url)
      if (!pagination) return errorResponse(400, 'INVALID_QUERY', 'La consulta no es válida.')
      const entries = data.initiatives
        .filter((initiative) => initiative.ownerId === actorId)
        .map(projectors.initiative)
      return jsonResponse(paginate(entries, pagination))
    }

    if (routePath === '/initiatives') {
      const pagination = parsePagination(url)
      if (!pagination) return errorResponse(400, 'INVALID_QUERY', 'La consulta no es válida.')
      const visibleStates = new Set(['published', 'forming_team', 'converted'])
      const entries = data.initiatives
        .filter((initiative) => visibleStates.has(initiative.state))
        .filter((initiative) => {
          if (initiative.visibility === 'public') return true
          if (!actorId) return false
          return initiative.visibility !== 'private' || initiative.ownerId === actorId
        })
        .map(projectors.initiative)
      return jsonResponse(paginate(entries, pagination))
    }

    const membersMatch = routePath.match(/^\/initiatives\/([^/]+)\/members$/)
    if (membersMatch) {
      const initiativeValue = data.initiatives.find((item) => item.id === membersMatch[1])
      if (!initiativeValue) return errorResponse(404, 'NOT_FOUND', 'No se encontró el recurso solicitado.')
      const accessError = initiativeAccessError(initiativeValue, actorId)
      if (accessError) return accessError
      const pagination = parsePagination(url)
      if (!pagination) return errorResponse(400, 'INVALID_QUERY', 'La consulta no es válida.')
      const entries = data.memberships
        .filter((item) => item.initiativeId === initiativeValue.id && item.state === 'active')
        .map(projectors.membership)
      return jsonResponse(paginate(entries, pagination))
    }

    const initiativeMatch = routePath.match(/^\/initiatives\/([^/]+)$/)
    if (initiativeMatch) {
      const initiativeValue = data.initiatives.find((item) => item.id === initiativeMatch[1])
      if (!initiativeValue) return errorResponse(404, 'NOT_FOUND', 'No se encontró el recurso solicitado.')
      const accessError = initiativeAccessError(initiativeValue, actorId)
      if (accessError) return accessError
      return jsonResponse({ data: projectors.initiative(initiativeValue) })
    }

    if (routePath === '/users') {
      if (!actorId) return errorResponse(401, 'AUTHENTICATION_REQUIRED', 'Debe iniciar sesión.')
      const pagination = parsePagination(url)
      if (!pagination) return errorResponse(400, 'INVALID_QUERY', 'La consulta no es válida.')
      const entries = data.users.filter((user) => user.active).map(projectors.publicUser)
      return jsonResponse(paginate(entries, pagination))
    }

    const userMatch = routePath.match(/^\/users\/([^/]+)$/)
    if (userMatch) {
      if (!actorId) return errorResponse(401, 'AUTHENTICATION_REQUIRED', 'Debe iniciar sesión.')
      const user = data.users.find((item) => item.id === userMatch[1] && item.active)
      return user
        ? jsonResponse({ data: projectors.publicUser(user) })
        : errorResponse(404, 'NOT_FOUND', 'No se encontró el recurso solicitado.')
    }

    if (routePath === '/auth/me') {
      if (!actorId) return errorResponse(401, 'AUTHENTICATION_REQUIRED', 'Debe iniciar sesión.')
      const user = data.users.find((item) => item.id === actorId)
      return jsonResponse({ data: projectors.publicUser(user) })
    }

    if (routePath === '/requests') {
      if (!actorId) return errorResponse(401, 'AUTHENTICATION_REQUIRED', 'Debe iniciar sesión.')
      const scope = url.searchParams.get('scope')
      if (!['mine', 'received'].includes(scope)) {
        return errorResponse(400, 'INVALID_QUERY', 'La consulta no es válida.', {
          scope: 'Debe ser mine o received.',
        })
      }
      const pagination = parsePagination(url)
      if (!pagination) return errorResponse(400, 'INVALID_QUERY', 'La consulta no es válida.')
      const ownedIds = new Set(
        data.initiatives.filter((item) => item.ownerId === actorId).map((item) => item.id),
      )
      const entries = data.requests.filter((request) =>
        scope === 'mine' ? request.applicantId === actorId : ownedIds.has(request.initiativeId),
      ).map(projectors.request)
      return jsonResponse(paginate(entries, pagination))
    }

    const requestMatch = routePath.match(/^\/requests\/([^/]+)$/)
    if (requestMatch) {
      if (!actorId) return errorResponse(401, 'AUTHENTICATION_REQUIRED', 'Debe iniciar sesión.')
      const request = data.requests.find((item) => item.id === requestMatch[1])
      if (!request) return errorResponse(404, 'NOT_FOUND', 'No se encontró el recurso solicitado.')
      const initiativeValue = data.initiatives.find((item) => item.id === request.initiativeId)
      if (request.applicantId !== actorId && initiativeValue.ownerId !== actorId) {
        return errorResponse(403, 'FORBIDDEN', 'No tiene permiso para realizar esta acción.')
      }
      return jsonResponse({ data: projectors.request(request) })
    }

    if (routePath === '/projects') {
      const pagination = parsePagination(url)
      if (!pagination) return errorResponse(400, 'INVALID_QUERY', 'La consulta no es válida.')
      return jsonResponse(paginate(data.projects.map(projectors.project), pagination))
    }

    const projectMatch = routePath.match(/^\/projects\/([^/]+)$/)
    if (projectMatch) {
      const project = data.projects.find((item) => item.id === projectMatch[1])
      return project
        ? jsonResponse({ data: projectors.project(project) })
        : errorResponse(404, 'NOT_FOUND', 'No se encontró el recurso solicitado.')
    }

    return errorResponse(404, 'NOT_FOUND', 'No se encontró el recurso solicitado.')
  }
}
