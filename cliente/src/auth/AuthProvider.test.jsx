import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authService } from '../api/services/auth.js'
import { setAccessToken, unauthorizedEventName } from '../api/session.js'
import { AuthProvider } from './AuthProvider.jsx'
import { useAuth } from './useAuth.js'

vi.mock('../api/services/auth.js', () => ({
  authService: {
    getMe: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}))

function Probe() {
  const auth = useAuth()
  return (
    <div>
      <span data-testid="status">{auth.status}</span>
      <span data-testid="user">{auth.user?.email || ''}</span>
      <span data-testid="notice">{auth.notice}</span>
      <button onClick={() => auth.login({ email: 'ana@example.test', password: 'Clave2026' })} type="button">Login</button>
      <button onClick={() => auth.logout().catch(() => {})} type="button">Logout</button>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => vi.clearAllMocks())

  it('restaura la identidad desde /auth/me cuando existe token', async () => {
    setAccessToken('opaque-token')
    authService.getMe.mockResolvedValue({ data: { email: 'ana@example.test' } })
    render(<AuthProvider><Probe /></AuthProvider>)

    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('authenticated'))
    expect(screen.getByTestId('user').textContent).toBe('ana@example.test')
    expect(authService.getMe).toHaveBeenCalledTimes(1)
  })

  it('conserva el token y ofrece reintento si la API no permite comprobar la sesión', async () => {
    setAccessToken('opaque-token')
    authService.getMe.mockRejectedValue({ code: 'NETWORK_ERROR', message: 'Sin conexión' })
    render(<AuthProvider><Probe /></AuthProvider>)

    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('error'))
    expect(sessionStorage.getItem('innovationHub.accessToken')).toBe('opaque-token')
  })

  it('guarda una sesión iniciada y reacciona a su invalidación global', async () => {
    authService.login.mockResolvedValue({
      data: { user: { email: 'ana@example.test' }, accessToken: 'new-token' },
    })
    render(<AuthProvider><Probe /></AuthProvider>)
    fireEvent.click(screen.getByText('Login'))

    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('authenticated'))
    expect(sessionStorage.getItem('innovationHub.accessToken')).toBe('new-token')

    act(() => window.dispatchEvent(new CustomEvent(unauthorizedEventName, {
      detail: { hadToken: true },
    })))
    expect(screen.getByTestId('status').textContent).toBe('anonymous')
    expect(screen.getByTestId('notice').textContent).toMatch(/sesión terminó/i)
    expect(sessionStorage.getItem('innovationHub.accessToken')).toBeNull()
  })

  it('no borra localmente una sesión cuando logout falla por red', async () => {
    setAccessToken('opaque-token')
    authService.getMe.mockResolvedValue({ data: { email: 'ana@example.test' } })
    authService.logout.mockRejectedValue({ code: 'NETWORK_ERROR' })
    render(<AuthProvider><Probe /></AuthProvider>)
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('authenticated'))

    fireEvent.click(screen.getByText('Logout'))
    await waitFor(() => expect(authService.logout).toHaveBeenCalledTimes(1))
    expect(sessionStorage.getItem('innovationHub.accessToken')).toBe('opaque-token')
    expect(screen.getByTestId('status').textContent).toBe('authenticated')
  })
})
