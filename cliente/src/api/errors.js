export class ApiError extends Error {
  constructor(message, { status = 0, code = 'NETWORK_ERROR', fields = {}, cause } = {}) {
    super(message, { cause })
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fields = fields
  }
}

export function isAbortError(error) {
  return error?.name === 'AbortError'
}
