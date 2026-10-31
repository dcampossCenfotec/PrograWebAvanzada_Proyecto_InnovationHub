import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { AuthContext } from '../auth/auth-context.js'
import Navbar from './Navbar.jsx'

describe('Navbar autenticada', () => {
  it('muestra identidad de la API y permite reintentar si logout falla por red', async () => {
    const logout = vi.fn().mockRejectedValue(new Error('No fue posible conectar con la API.'))
    render(
      <AuthContext.Provider value={{
        status: 'authenticated',
        user: { firstName: 'Ana', lastName: 'Rojas' },
        logout,
      }}>
        <MemoryRouter><Navbar /></MemoryRouter>
      </AuthContext.Provider>,
    )

    expect(screen.getByText('Ana Rojas')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    const error = await screen.findByRole('alert')

    expect(error.textContent).toMatch(/sesión sigue activa/i)
    expect(screen.getByRole('button', { name: 'Cerrar sesión' }).disabled).toBe(false)
    expect(logout).toHaveBeenCalledTimes(1)
  })

  it('no presenta una sesión incomprobable como anónima', () => {
    const retryRestore = vi.fn()
    render(
      <AuthContext.Provider value={{ status: 'error', retryRestore }}>
        <MemoryRouter><Navbar /></MemoryRouter>
      </AuthContext.Provider>,
    )

    expect(screen.queryByText('Ingresar')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar sesión' }))
    expect(retryRestore).toHaveBeenCalledTimes(1)
  })
})
