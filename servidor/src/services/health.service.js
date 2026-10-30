export function createHealthService() {
  return Object.freeze({
    getStatus() {
      return 'ok'
    },
  })
}
