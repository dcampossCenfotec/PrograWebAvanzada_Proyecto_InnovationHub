import catalogs from '@fixtures/catalogs.json'
import initiativesFixture from '@fixtures/initiatives.json'
import membershipsFixture from '@fixtures/memberships.json'
import projectsFixture from '@fixtures/projects.json'
import requestsFixture from '@fixtures/requests.json'
import usersFixture from '@fixtures/users.json'

const defaultTokenActors = new Map([
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
const registrationFields = new Set([
  'firstName', 'lastName', 'memberType', 'email', 'password', 'passwordConfirmation', 'termsAccepted',
])
const memberTypes = new Set(['student', 'professor', 'administrative', 'graduate', 'external'])
const availabilityValues = new Set(['low', 'medium', 'high'])
const skillLevels = new Set(['basic', 'intermediate', 'advanced'])
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizeSearch(value) {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('es')
}

function jsonResponse(payload, status = 200, headers = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
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

function getActorId(headers, tokenActors) {
  const authorization = headers.get('Authorization')
  if (!authorization) return { actorId: null, expired: false, invalid: false }
  const match = authorization.match(/^Bearer (.+)$/)
  if (match?.[1] === 'mock-expired-token') return { actorId: null, expired: true, invalid: false }
  if (!match || !tokenActors.has(match[1])) return { actorId: null, expired: false, invalid: true }
  return { actorId: tokenActors.get(match[1]), expired: false, invalid: false }
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

function initiativeList(entries, url, project, { mine = false } = {}) {
  const pagination = parsePagination(url)
  const allowed = mine ? ['page', 'size', 'sort', 'order']
    : ['q', 'type', 'category', 'skill', 'state', 'hasSpaces', 'ownerId', 'page', 'size', 'sort', 'order']
  const invalidQuery = () => errorResponse(400, 'INVALID_QUERY', 'La consulta no es válida.')
  if (!pagination) return invalidQuery()
  for (const key of url.searchParams.keys()) {
    if (!allowed.includes(key) || url.searchParams.getAll(key).length > 1) return invalidQuery()
  }
  const value = (key) => url.searchParams.get(key)
  const q = value('q')?.trim()
  const sort = value('sort') ?? 'createdAt'
  const order = value('order') ?? 'desc'
  const sorts = mine ? ['createdAt', 'updatedAt', 'title', 'state'] : ['createdAt', 'updatedAt', 'title', 'memberCount']
  if (!sorts.includes(sort) || !['asc', 'desc'].includes(order)) return invalidQuery()
  if (q !== undefined && (q.length < 2 || q.length > 100)) return invalidQuery()
  if (value('type') && !['idea', 'need', 'challenge'].includes(value('type'))) return invalidQuery()
  if (value('state') && !['published', 'forming_team', 'converted'].includes(value('state'))) return invalidQuery()
  if (value('hasSpaces') && !['true', 'false'].includes(value('hasSpaces'))) return invalidQuery()
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  for (const key of ['skill', 'ownerId']) if (value(key) && !uuid.test(value(key))) return invalidQuery()
  let rows = entries.map((initiative) => ({ initiative, summary: project(initiative, { detail: false }) }))
  rows = rows.filter(({ initiative, summary }) => (
    (!value('type') || initiative.type === value('type')) &&
    (!value('category') || initiative.categoryId === value('category')) &&
    (!value('skill') || initiative.skillIds.includes(value('skill'))) &&
    (!value('state') || initiative.state === value('state')) &&
    (!value('ownerId') || summary.owner?.id === value('ownerId')) &&
    (!value('hasSpaces') || (value('hasSpaces') === 'true' ? summary.availableSpaces > 0 : summary.availableSpaces === 0)) &&
    (!q || normalizeSearch([summary.title, summary.summary, ...(summary.access.canViewDetails ? summary.tags ?? [] : [])].join(' ')).includes(normalizeSearch(q)))
  ))
  const direction = order === 'asc' ? 1 : -1
  function sortValue(row) {
    if (sort === 'memberCount') return row.summary.memberCount
    if (sort === 'title') return normalizeSearch(row.initiative.title)
    return row.initiative[sort]
  }
  rows.sort((left, right) => {
    const a = sortValue(left)
    const b = sortValue(right)
    const result = a < b ? -1 : a > b ? 1 : left.initiative.id.localeCompare(right.initiative.id)
    return result * direction
  })
  return jsonResponse(paginate(rows.map(({ summary }) => summary), pagination))
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

  function publicUser(user, includeOwnEmail = true) {
    const { emailNormalized, active, ...safeUser } = user
    void emailNormalized
    void active
    if (!includeOwnEmail || actorId !== user.id) delete safeUser.email
    return safeUser
  }

  function initiative(initiativeValue, { detail = true } = {}) {
    const activeMemberships = fixtures.memberships.filter(
      (membership) =>
        membership.initiativeId === initiativeValue.id && membership.state === 'active',
    )
    const memberCount = activeMemberships.length
    const isOwner = actorId === initiativeValue.ownerId
    const isMember = activeMemberships.some((membership) => membership.userId === actorId)
    const visibleState = !['draft', 'archived'].includes(initiativeValue.state)
    const canViewDetails = isOwner || (visibleState && (
      initiativeValue.visibility === 'public' ||
      (Boolean(actorId) && initiativeValue.visibility === 'institutional') || isMember
    ))
    const hasPending = fixtures.requests.some((item) => item.initiativeId === initiativeValue.id && item.applicantId === actorId && item.state === 'pending')

    const projected = {
      id: initiativeValue.id,
      title: initiativeValue.title,
      type: initiativeValue.type,
      summary: initiativeValue.summary,
      category: { id: initiativeValue.categoryId, name: categoryById.get(initiativeValue.categoryId)?.name },
      skills: initiativeValue.skillIds.map((id) => ({ id, name: skillById.get(id)?.name })),
      estimatedMembers: initiativeValue.estimatedMembers,
      memberCount,
      availableSpaces: Math.max(0, initiativeValue.estimatedMembers - memberCount),
      visibility: initiativeValue.visibility,
      state: initiativeValue.state,
      access: {
        canViewDetails,
        canEdit: isOwner && initiativeValue.state !== 'archived',
        canDelete: isOwner,
        canRequest:
          Boolean(actorId) &&
          canViewDetails && !hasPending &&
          !isOwner &&
          !isMember &&
          ['published', 'forming_team', 'converted'].includes(initiativeValue.state),
        canManageRequests: isOwner,
        canViewTeam: canViewDetails,
        canConvert: isOwner && ['published', 'forming_team'].includes(initiativeValue.state) && memberCount > 1,
      },
    }

    if (canViewDetails) {
      Object.assign(projected, {
        ...(detail ? { description: initiativeValue.description, problem: initiativeValue.problem, beneficiaries: initiativeValue.beneficiaries } : {}),
        owner: userSummary(initiativeValue.ownerId),
        tags: initiativeValue.tags,
        createdAt: initiativeValue.createdAt,
        updatedAt: initiativeValue.updatedAt,
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

function initiativeAccessError(initiative, actorId, memberships) {
  if (initiative.ownerId === actorId) return null
  if (['draft', 'archived'].includes(initiative.state)) return errorResponse(404, 'NOT_FOUND', 'No se encontró el recurso solicitado.')
  if (memberships.some((item) => item.initiativeId === initiative.id && item.userId === actorId && item.state === 'active')) return null
  if (initiative.visibility === 'public') return null
  if (!actorId) {
    return initiative.visibility === 'private'
      ? errorResponse(404, 'NOT_FOUND', 'No se encontró el recurso solicitado.')
      : errorResponse(401, 'AUTHENTICATION_REQUIRED', 'Debe iniciar sesión.')
  }
  return initiative.visibility === 'private'
    ? errorResponse(404, 'NOT_FOUND', 'No se encontró el recurso solicitado.')
    : initiative.visibility === 'restricted'
      ? errorResponse(403, 'FORBIDDEN', 'No tiene permiso para realizar esta acción.')
      : null
}

export function createMockFetch({ fixtures = defaultFixtures, delayMs = 120 } = {}) {
  const data = structuredClone(fixtures)
  const tokenActors = new Map(defaultTokenActors)
  const credentials = new Map(
    data.users.map((user) => [user.emailNormalized, {
      userId: user.id,
      password: 'DemoSegura2026',
    }]),
  )
  let sessionSequence = 0

  function authUser(user) {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      memberType: user.memberType,
      email: user.email,
    }
  }

  function createSessionResponse(user, status = 200) {
    sessionSequence += 1
    const accessToken = `mock-session-${sessionSequence}-${user.id}`
    tokenActors.set(accessToken, user.id)
    return jsonResponse({
      data: {
        user: authUser(user),
        accessToken,
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      },
    }, status, status === 201 ? { Location: `/api/users/${user.id}` } : {})
  }

  return async function mockFetch(input, init = {}) {
    await abortableDelay(delayMs, init.signal)
    const url = new URL(typeof input === 'string' ? input : input.url, 'http://mock.local')
    const method = (init.method || 'GET').toUpperCase()
    const headers = new Headers(init.headers)
    const routePath = getRoutePath(url)
    const { actorId, expired, invalid } = getActorId(headers, tokenActors)
    const projectors = createProjectors(data, actorId)

    if (invalid) {
      return errorResponse(401, 'INVALID_CREDENTIALS', 'La sesión no es válida.')
    }
    if (expired) {
      return errorResponse(401, 'SESSION_EXPIRED', 'La sesión expiró. Inicia sesión nuevamente.')
    }

    if (method === 'POST' && routePath === '/auth/register') {
      const body = JSON.parse(init.body || '{}')
      const email = typeof body.email === 'string' ? body.email.trim() : ''
      const emailNormalized = email.toLocaleLowerCase('en-US')
      const fields = {}
      for (const key of Object.keys(body)) {
        if (!registrationFields.has(key)) fields[key] = 'Este campo no está permitido.'
      }
      if (typeof body.firstName !== 'string' || body.firstName.trim().length < 2 || body.firstName.trim().length > 60) fields.firstName = 'Debe tener entre 2 y 60 caracteres.'
      if (typeof body.lastName !== 'string' || body.lastName.trim().length < 2 || body.lastName.trim().length > 80) fields.lastName = 'Debe tener entre 2 y 80 caracteres.'
      if (!memberTypes.has(body.memberType)) fields.memberType = 'Selecciona un tipo de miembro válido.'
      if (!emailPattern.test(email) || email.length > 254) fields.email = 'Debe ser un correo electrónico válido.'
      if (typeof body.password !== 'string' || body.password.length < 10 || body.password.length > 128 || !/\p{L}/u.test(body.password) || !/\p{N}/u.test(body.password)) fields.password = 'Debe tener entre 10 y 128 caracteres, una letra y un número.'
      if (body.passwordConfirmation !== body.password) fields.passwordConfirmation = 'Las contraseñas no coinciden.'
      if (body.termsAccepted !== true) fields.termsAccepted = 'Debes aceptar los términos.'
      if (Object.keys(fields).length > 0) {
        return errorResponse(400, 'VALIDATION_ERROR', 'Revisa los campos indicados.', fields)
      }
      if (credentials.has(emailNormalized)) {
        return errorResponse(409, 'EMAIL_ALREADY_EXISTS', 'Ya existe una cuenta con ese correo electrónico.', {
          email: 'Ya está registrado.',
        })
      }
      const now = new Date().toISOString()
      const user = {
        id: crypto.randomUUID(),
        firstName: body.firstName.trim(),
        lastName: body.lastName.trim(),
        memberType: body.memberType,
        email,
        emailNormalized,
        career: null,
        bio: null,
        interests: [],
        availability: 'medium',
        portfolioUrl: null,
        skills: [],
        active: true,
        createdAt: now,
        updatedAt: now,
      }
      data.users.push(user)
      credentials.set(emailNormalized, { userId: user.id, password: body.password })
      return createSessionResponse(user, 201)
    }

    if (method === 'POST' && routePath === '/auth/login') {
      const body = JSON.parse(init.body || '{}')
      const emailNormalized = typeof body.email === 'string'
        ? body.email.trim().toLocaleLowerCase('en-US')
        : ''
      const credential = credentials.get(emailNormalized)
      const user = credential ? data.users.find((item) => item.id === credential.userId) : null
      if (!user || !user.active || credential.password !== body.password) {
        return errorResponse(401, 'INVALID_CREDENTIALS', 'El correo o la contraseña no son válidos.')
      }
      return createSessionResponse(user)
    }

    if (method === 'POST' && routePath === '/auth/logout') {
      if (!actorId) return errorResponse(401, 'AUTHENTICATION_REQUIRED', 'Debe iniciar sesión.')
      const token = headers.get('Authorization').slice('Bearer '.length)
      tokenActors.delete(token)
      return new Response(null, { status: 204 })
    }

    if (method === 'PUT' && routePath === '/users/me') {
      if (!actorId) return errorResponse(401, 'AUTHENTICATION_REQUIRED', 'Debe iniciar sesión.')
      const body = JSON.parse(init.body || '{}')
      const allowed = new Set([
        'firstName', 'lastName', 'memberType', 'career', 'bio', 'interests', 'availability', 'portfolioUrl', 'skills',
      ])
      const fields = {}
      for (const key of Object.keys(body)) {
        if (!allowed.has(key)) fields[key] = 'Este campo no está permitido.'
      }
      for (const key of allowed) {
        if (!(key in body)) fields[key] = 'Es obligatorio en una actualización completa.'
      }
      if (typeof body.firstName !== 'string' || body.firstName.trim().length < 2 || body.firstName.trim().length > 60) fields.firstName = 'Debe tener entre 2 y 60 caracteres.'
      if (typeof body.lastName !== 'string' || body.lastName.trim().length < 2 || body.lastName.trim().length > 80) fields.lastName = 'Debe tener entre 2 y 80 caracteres.'
      if (!memberTypes.has(body.memberType)) fields.memberType = 'Selecciona un tipo de miembro válido.'
      if (body.career !== null && (typeof body.career !== 'string' || body.career.trim().length < 2 || body.career.trim().length > 120)) fields.career = 'Debe tener entre 2 y 120 caracteres o ser null.'
      if (body.bio !== null && (typeof body.bio !== 'string' || !body.bio.trim() || body.bio.trim().length > 600)) fields.bio = 'Acepta entre 1 y 600 caracteres o null.'
      if (!availabilityValues.has(body.availability)) fields.availability = 'Selecciona una disponibilidad válida.'
      if (!Array.isArray(body.interests) || body.interests.length > 15 || body.interests.some((value) => typeof value !== 'string' || !value.trim() || value.trim().length > 40)) fields.interests = 'Revisa los intereses.'
      if (
        Array.isArray(body.interests) &&
        body.interests.every((value) => typeof value === 'string') &&
        new Set(body.interests.map((value) => normalizeSearch(value.trim()))).size !== body.interests.length
      ) fields.interests = 'No se permiten intereses duplicados.'
      if (body.portfolioUrl !== null) {
        try {
          const portfolio = new URL(body.portfolioUrl)
          if (!['http:', 'https:'].includes(portfolio.protocol) || body.portfolioUrl.length > 2048) throw new Error('url')
        } catch {
          fields.portfolioUrl = 'Debe ser una URL HTTP(S) válida.'
        }
      }
      if (!Array.isArray(body.skills) || body.skills.length > 20) fields.skills = 'Revisa las competencias.'
      else {
        const knownSkillIds = new Set(data.catalogs.skills.filter((skill) => skill.active).map((skill) => skill.id))
        const ids = body.skills.map((skill) => skill?.skillId)
        if (
          body.skills.some((skill) => !skill || !knownSkillIds.has(skill.skillId) || !skillLevels.has(skill.level)) ||
          new Set(ids).size !== ids.length
        ) fields.skills = 'Una competencia no existe, está repetida o tiene nivel inválido.'
      }
      if (Object.keys(fields).length) {
        return errorResponse(400, 'VALIDATION_ERROR', 'Revisa los campos indicados.', fields)
      }
      const user = data.users.find((item) => item.id === actorId && item.active)
      if (!user) return errorResponse(404, 'NOT_FOUND', 'No se encontró el recurso solicitado.')
      Object.assign(user, {
        firstName: body.firstName.trim(),
        lastName: body.lastName.trim(),
        memberType: body.memberType,
        career: body.career?.trim() || null,
        bio: body.bio?.trim() || null,
        interests: body.interests.map((value) => value.trim()),
        availability: body.availability,
        portfolioUrl: body.portfolioUrl?.trim() || null,
        skills: body.skills.map(({ skillId, level }) => ({ skillId, level })),
        updatedAt: new Date().toISOString(),
      })
      return jsonResponse({ data: projectors.publicUser(user) })
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
        .filter((skill) => !query || skill.nameNormalized.includes(normalizeSearch(query)))
        .sort((left, right) => left.nameNormalized.localeCompare(right.nameNormalized, 'es'))
        .map(({ id, name }) => ({ id, name }))
      return jsonResponse(paginate(entries, pagination))
    }

    if (routePath === '/initiatives/mine') {
      if (!actorId) return errorResponse(401, 'AUTHENTICATION_REQUIRED', 'Debe iniciar sesión.')
      return initiativeList(data.initiatives.filter((initiative) => initiative.ownerId === actorId), url, projectors.initiative, { mine: true })
    }

    if (routePath === '/initiatives') {
      const visibleStates = new Set(['published', 'forming_team', 'converted'])
      const entries = data.initiatives
        .filter((initiative) => visibleStates.has(initiative.state))
        .filter((initiative) => {
          if (initiative.visibility === 'public') return true
          if (!actorId) return false
          return initiative.visibility !== 'private' || initiative.ownerId === actorId
            || data.memberships.some((item) => item.initiativeId === initiative.id && item.userId === actorId && item.state === 'active')
        })
      return initiativeList(entries, url, projectors.initiative)
    }

    const membersMatch = routePath.match(/^\/initiatives\/([^/]+)\/members$/)
    if (membersMatch) {
      const initiativeValue = data.initiatives.find((item) => item.id === membersMatch[1])
      if (!initiativeValue) return errorResponse(404, 'NOT_FOUND', 'No se encontró el recurso solicitado.')
      const accessError = initiativeAccessError(initiativeValue, actorId, data.memberships)
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
      const accessError = initiativeAccessError(initiativeValue, actorId, data.memberships)
      if (accessError) return accessError
      return jsonResponse({ data: projectors.initiative(initiativeValue) })
    }

    if (routePath === '/users') {
      if (!actorId) return errorResponse(401, 'AUTHENTICATION_REQUIRED', 'Debe iniciar sesión.')
      const pagination = parsePagination(url)
      if (!pagination) return errorResponse(400, 'INVALID_QUERY', 'La consulta no es válida.')
      const rawQ = (url.searchParams.get('q') || '').trim()
      const rawCareer = (url.searchParams.get('career') || '').trim()
      const skill = url.searchParams.get('skill') || ''
      const availability = url.searchParams.get('availability') || ''
      const sort = url.searchParams.get('sort') || 'lastName'
      const order = url.searchParams.get('order') || 'asc'
      if (
        rawQ.length === 1 || rawCareer.length === 1 ||
        (availability && !availabilityValues.has(availability)) ||
        !['firstName', 'lastName', 'career', 'createdAt'].includes(sort) ||
        !['asc', 'desc'].includes(order)
      ) return errorResponse(400, 'INVALID_QUERY', 'La consulta no es válida.')
      const q = normalizeSearch(rawQ)
      const career = normalizeSearch(rawCareer)
      const entries = data.users
        .filter((user) => user.active)
        .filter((user) => !q || normalizeSearch([
          user.firstName, user.lastName, user.career || '', user.bio || '', ...(user.interests || []),
        ].join(' ')).includes(q))
        .filter((user) => !career || normalizeSearch(user.career || '') === career)
        .filter((user) => !skill || user.skills.some((entry) => entry.skillId === skill))
        .filter((user) => !availability || user.availability === availability)
        .sort((left, right) => {
          const compared = String(left[sort] || '').localeCompare(String(right[sort] || ''), 'es')
          const stable = compared || left.id.localeCompare(right.id)
          return order === 'desc' ? -stable : stable
        })
        .map((user) => projectors.publicUser(user, false))
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
