const accessTokenKey = 'innovationHub.accessToken'
export const unauthorizedEventName = 'innovation-hub:unauthorized'

function getStorage() {
  return typeof window === 'undefined' ? null : window.sessionStorage
}

export function getAccessToken() {
  return getStorage()?.getItem(accessTokenKey) || null
}

export function setAccessToken(token) {
  const storage = getStorage()
  if (!storage) return
  if (token) storage.setItem(accessTokenKey, token)
  else storage.removeItem(accessTokenKey)
}

export function clearAccessToken() {
  getStorage()?.removeItem(accessTokenKey)
}

export function notifyUnauthorized() {
  clearAccessToken()
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(unauthorizedEventName))
  }
}
