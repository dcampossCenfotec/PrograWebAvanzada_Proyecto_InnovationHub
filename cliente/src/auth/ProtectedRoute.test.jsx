import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AuthContext } from './auth-context.js'
import { ProtectedRoute } from './ProtectedRoute.jsx'

function LoginProbe() {
  const location = useLocation()
  return <p>Ingreso para {location.state?.from?.pathname}</p>
}

describe('ProtectedRoute', () => {
  it('redirige visitantes a login y conserva solo la ubicación interna estructurada', () => {
    render(
      <AuthContext.Provider value={{ status: 'anonymous' }}>
        <MemoryRouter initialEntries={['/perfil']}>
          <Routes>
            <Route path="/ingresar" element={<LoginProbe />} />
            <Route path="/perfil" element={<ProtectedRoute><h1>Perfil privado</h1></ProtectedRoute>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    )

    expect(screen.getByText('Ingreso para /perfil')).toBeTruthy()
    expect(screen.queryByText('Perfil privado')).toBeNull()
  })
})
