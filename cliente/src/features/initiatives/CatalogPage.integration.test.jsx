import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { authService } from '../../api/services/auth.js'
import { setAccessToken } from '../../api/session.js'
import { AuthContext } from '../../auth/auth-context.js'
import { CatalogPage } from './CatalogPage.jsx'

// Se ejecuta explícitamente contra un seed aislado, nunca se presume
// aprobada al omitirla en una instalación sin API/MongoDB.
const enabled = import.meta.env.VITE_RUN_API_INTEGRATION === 'true'

function mount(auth = { status: 'anonymous', user: null }, { mine = false } = {}) {
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={[mine ? '/mis-iniciativas' : '/iniciativas']}>
        <CatalogPage mine={mine} />
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

async function login(email) {
  const result = await authService.login({ email, password: 'DemoSegura2026' })
  setAccessToken(result.data.accessToken)
  return { status: 'authenticated', user: result.data.user }
}

describe.skipIf(!enabled)('React conectado a Express y MongoDB reales con seed limpio', () => {
  it('visitante ve tres públicas y filtra Huertos mediante el servidor', async () => {
    mount()
    await screen.findByText('3 iniciativas encontradas', {}, { timeout: 10000 })
    await within(screen.getByLabelText('Categoría')).findByRole('option', { name: 'Sostenibilidad' })
    fireEvent.change(screen.getByLabelText('Buscar iniciativas'), { target: { value: 'HUERTOS' } })
    fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: 'sustainability' } })
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros' }))
    await screen.findByText('1 iniciativa encontrada', {}, { timeout: 10000 })
    expect(screen.getByRole('heading', { name: 'Huertos escolares' })).toBeDefined()
    expect(screen.queryByRole('heading', { name: 'Accesibilidad urbana' })).toBeNull()
  })

  it('Carla ve cinco iniciativas y no puede navegar al detalle de una restringida', async () => {
    const auth = await login('carla.outsider@example.test')
    mount(auth)
    await screen.findByText('5 iniciativas encontradas', {}, { timeout: 10000 })
    const title = screen.getByRole('heading', { name: 'Reto de reciclaje inteligente' })
    const card = title.closest('article')
    expect(within(card).queryByRole('link')).toBeNull()
    expect(within(card).getByText(/Acceso restringido/)).toBeDefined()
    expect(screen.queryByRole('heading', { name: 'Datos de calidad del aire' })).toBeNull()
  })

  it('Ana consulta ocho propias, incluidas las archivadas y el borrador', async () => {
    const auth = await login('ana.owner@example.test')
    mount(auth, { mine: true })
    await screen.findByText('8 iniciativas encontradas', {}, { timeout: 10000 })
    fireEvent.change(screen.getByLabelText('Resultados por página'), { target: { value: '12' } })
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros' }))
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(8), { timeout: 10000 })
    expect(screen.getByRole('heading', { name: 'Banco de alimentos' })).toBeDefined()
    expect(screen.getByRole('heading', { name: 'Lectura compartida' })).toBeDefined()
    expect(screen.getByText('Archivada')).toBeDefined()
    expect(screen.getByText('Borrador')).toBeDefined()
  })
})
