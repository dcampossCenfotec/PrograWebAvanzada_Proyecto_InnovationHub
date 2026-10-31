import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { AuthContext } from '../auth/auth-context.js'
import LoginPage from './LoginPage.jsx'
import RegisterPage from './RegisterPage.jsx'

function renderPage(page, auth, initialEntry = '/ingresar') {
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route element={page} path={initialEntry.pathname || initialEntry} />
          <Route element={<h1>Destino protegido</h1>} path="/perfil" />
          <Route element={<h1>Nueva iniciativa</h1>} path="/iniciativas/nueva" />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

const baseAuth = {
  status: 'anonymous',
  login: vi.fn(),
  register: vi.fn(),
}

describe('pantallas de autenticación', () => {
  it('muestra validaciones de registro antes de llamar a la API', () => {
    const auth = { ...baseAuth, register: vi.fn() }
    renderPage(<RegisterPage />, auth, '/registro')
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(screen.getByText('Debes aceptar los términos.')).toBeTruthy()
    expect(auth.register).not.toHaveBeenCalled()
  })

  it('presenta el conflicto de correo en el campo y conserva los valores', async () => {
    const auth = {
      ...baseAuth,
      register: vi.fn().mockRejectedValue({
        message: 'Ya existe una cuenta con ese correo electrónico.',
        fields: { email: 'Ya está registrado.' },
      }),
    }
    renderPage(<RegisterPage />, auth, '/registro')
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Daniel' } })
    fireEvent.change(screen.getByLabelText('Apellidos'), { target: { value: 'Campos' } })
    fireEvent.change(screen.getByLabelText('Tipo de miembro'), { target: { value: 'student' } })
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'daniel@example.test' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'ClaveSegura2026' } })
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), { target: { value: 'ClaveSegura2026' } })
    fireEvent.click(screen.getByLabelText(/Acepto los términos/))
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    await screen.findByText('Ya está registrado.')
    expect(screen.getByLabelText('Correo electrónico').value).toBe('daniel@example.test')
  })

  it('bloquea doble envío y vuelve a una ruta interna segura después del login', async () => {
    let resolveLogin
    const login = vi.fn(() => new Promise((resolve) => { resolveLogin = resolve }))
    const auth = { ...baseAuth, login }
    const entry = {
      pathname: '/ingresar',
      state: { from: { pathname: '/iniciativas/nueva', search: '', hash: '' } },
    }
    renderPage(<LoginPage />, auth, entry)
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'ana@example.test' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'DemoSegura2026' } })
    const button = screen.getByRole('button', { name: 'Ingresar' })
    fireEvent.click(button)
    fireEvent.click(button)

    expect(login).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Ingresando…' }).disabled).toBe(true)
    await act(async () => resolveLogin())
    await screen.findByRole('heading', { name: 'Nueva iniciativa' })
  })
})
