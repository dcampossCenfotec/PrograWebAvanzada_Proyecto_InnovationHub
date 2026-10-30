export function createHealthDto(status) {
  return {
    data: {
      status,
      service: 'innovation-hub-api',
    },
  }
}
