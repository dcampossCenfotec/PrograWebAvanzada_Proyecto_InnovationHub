import { useCallback, useEffect, useMemo, useState } from 'react'
import { authService } from '../api/services/auth.js'
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
  unauthorizedEventName,
} from '../api/session.js'
import { isAbortError } from '../api/errors.js'
import { AuthContext } from './auth-context.js'

export function AuthProvider({ children }) {
  const [status, setStatus] = useState(() => getAccessToken() ? 'loading' : 'anonymous')
  const [user, setUser] = useState(null)
  const [sessionError, setSessionError] = useState(null)
  const [notice, setNotice] = useState('')

  const finishSession = useCallback((message = '') => {
    clearAccessToken()
    setUser(null)
    setStatus('anonymous')
    setSessionError(null)
    setNotice(message)
  }, [])

  const restoreSession = useCallback(async (signal) => {
    if (!getAccessToken()) {
      finishSession()
      return
    }
    setStatus('loading')
    setSessionError(null)
    try {
      const response = await authService.getMe({ signal })
      setUser(response.data)
      setStatus('authenticated')
    } catch (error) {
      if (isAbortError(error)) return
      if (error.status === 401) {
        finishSession('Tu sesión terminó. Ingresa nuevamente para continuar.')
        return
      }
      setStatus('error')
      setSessionError(error)
    }
  }, [finishSession])

  useEffect(() => {
    const controller = new AbortController()
    function handleUnauthorized(event) {
      finishSession(
        event.detail?.hadToken
          ? 'Tu sesión terminó. Ingresa nuevamente para continuar.'
          : '',
      )
    }
    window.addEventListener(unauthorizedEventName, handleUnauthorized)
    queueMicrotask(() => {
      if (!controller.signal.aborted) void restoreSession(controller.signal)
    })
    return () => {
      controller.abort(new DOMException('Sesión desmontada.', 'AbortError'))
      window.removeEventListener(unauthorizedEventName, handleUnauthorized)
    }
  }, [finishSession, restoreSession])

  const startSession = useCallback((result) => {
    setAccessToken(result.accessToken)
    setUser(result.user)
    setStatus('authenticated')
    setSessionError(null)
    setNotice('')
  }, [])

  const login = useCallback(async (values) => {
    const response = await authService.login(values)
    startSession(response.data)
    return response.data.user
  }, [startSession])

  const register = useCallback(async (values) => {
    const response = await authService.register(values)
    startSession(response.data)
    return response.data.user
  }, [startSession])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
      finishSession('Cerraste sesión correctamente.')
    } catch (error) {
      if (error.status === 401) {
        finishSession('La sesión ya había terminado.')
        return
      }
      throw error
    }
  }, [finishSession])

  const value = useMemo(() => ({
    status,
    user,
    sessionError,
    notice,
    clearNotice: () => setNotice(''),
    login,
    register,
    logout,
    retryRestore: () => restoreSession(),
  }), [login, logout, notice, register, restoreSession, sessionError, status, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
