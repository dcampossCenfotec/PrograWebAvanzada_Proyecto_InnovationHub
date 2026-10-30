const allowedEnvironments = new Set(['development', 'test', 'production'])
const bodyLimitPattern = /^[1-9]\d*(?:kb|mb)$/i
const databaseNamePattern = /^[A-Za-z0-9_-]{1,64}$/

export class ConfigurationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ConfigurationError'
  }
}

function readRequired(environment, name) {
  const value = environment[name]?.trim()
  if (!value) throw new ConfigurationError(`Falta la variable requerida ${name}.`)
  return value
}

function parseInteger(value, name, { minimum, maximum }) {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new ConfigurationError(`${name} debe ser un entero entre ${minimum} y ${maximum}.`)
  }
  return parsed
}

function parseOrigin(value) {
  let url
  try {
    url = new URL(value)
  } catch {
    throw new ConfigurationError('CLIENT_ORIGIN debe ser un origen HTTP(S) válido.')
  }

  const hasOnlyOrigin =
    ['http:', 'https:'].includes(url.protocol) &&
    url.pathname === '/' &&
    !url.search &&
    !url.hash &&
    !url.username &&
    !url.password
  if (!hasOnlyOrigin || value === '*') {
    throw new ConfigurationError('CLIENT_ORIGIN debe ser un origen HTTP(S) explícito, sin ruta ni comodín.')
  }
  return url.origin
}

function parseMongoUri(value) {
  if (!/^mongodb(?:\+srv)?:\/\//.test(value)) {
    throw new ConfigurationError('MONGODB_URI debe usar el protocolo mongodb o mongodb+srv.')
  }
  try {
    new URL(value)
  } catch {
    throw new ConfigurationError('MONGODB_URI no tiene un formato válido.')
  }
  return value
}

function parseDatabaseName(value) {
  if (!databaseNamePattern.test(value) || ['admin', 'config', 'local'].includes(value.toLowerCase())) {
    throw new ConfigurationError(
      'MONGODB_DATABASE debe tener 1 a 64 letras, números, guiones o guiones bajos y no puede ser una base reservada.',
    )
  }
  return value
}

export function loadEnvironment(environment = process.env) {
  const nodeEnvironment = (environment.NODE_ENV || 'development').trim()
  if (!allowedEnvironments.has(nodeEnvironment)) {
    throw new ConfigurationError('NODE_ENV debe ser development, test o production.')
  }

  const host = (environment.HOST || '127.0.0.1').trim()
  if (!host || /\s/.test(host)) {
    throw new ConfigurationError('HOST no puede estar vacío ni contener espacios.')
  }

  const bodyLimit = (environment.BODY_LIMIT || '100kb').trim()
  if (!bodyLimitPattern.test(bodyLimit)) {
    throw new ConfigurationError('BODY_LIMIT debe usar un entero seguido de kb o mb.')
  }

  return Object.freeze({
    nodeEnvironment,
    host,
    port: parseInteger(readRequired(environment, 'PORT'), 'PORT', { minimum: 1, maximum: 65535 }),
    clientOrigin: parseOrigin(readRequired(environment, 'CLIENT_ORIGIN')),
    bodyLimit: bodyLimit.toLowerCase(),
    mongoUri: parseMongoUri(readRequired(environment, 'MONGODB_URI')),
    mongoDatabase: parseDatabaseName(readRequired(environment, 'MONGODB_DATABASE')),
    mongoConnectTimeoutMs: parseInteger(
      environment.MONGODB_CONNECT_TIMEOUT_MS || '5000',
      'MONGODB_CONNECT_TIMEOUT_MS',
      { minimum: 100, maximum: 60000 },
    ),
    authSessionTtlMinutes: parseInteger(
      environment.AUTH_SESSION_TTL_MINUTES || '480',
      'AUTH_SESSION_TTL_MINUTES',
      { minimum: 5, maximum: 10080 },
    ),
  })
}
