const allowedEnvironments = new Set(['development', 'test', 'production'])
const bodyLimitPattern = /^[1-9]\d*(?:kb|mb)$/i

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

function parsePort(value) {
  const port = Number(value)
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new ConfigurationError('PORT debe ser un entero entre 1 y 65535.')
  }
  return port
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
    port: parsePort(readRequired(environment, 'PORT')),
    clientOrigin: parseOrigin(readRequired(environment, 'CLIENT_ORIGIN')),
    bodyLimit: bodyLimit.toLowerCase(),
  })
}
