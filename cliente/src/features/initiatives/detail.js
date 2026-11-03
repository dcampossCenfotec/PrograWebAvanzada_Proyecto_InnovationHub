export function isInitiativeId(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value ?? '')
}

const dateFormatter = new Intl.DateTimeFormat('es-CR', { dateStyle: 'long', timeStyle: 'short' })

export function initiativeDate(value) {
  const date = new Date(value)
  return value && !Number.isNaN(date.valueOf()) ? dateFormatter.format(date) : 'Sin fecha disponible'
}

export function removalOperation(response, id, action) {
  if (action === 'delete' && response === null) return 'deleted'
  if (action === 'archive' && response?.data?.id === id && response.data.operation === 'archived' && response.data.state === 'archived') return 'archived'
  throw new Error('La API no confirmó la acción solicitada.')
}
