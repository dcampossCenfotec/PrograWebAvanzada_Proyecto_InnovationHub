export function createErrorDto({ code, message, fields = {} }) {
  return {
    error: {
      code,
      message,
      fields,
    },
  }
}
