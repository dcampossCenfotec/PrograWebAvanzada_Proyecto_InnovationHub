import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { catalogsService } from '../../api/services/catalogs.js'
import { initiativesService } from '../../api/services/initiatives.js'
import { usersService } from '../../api/services/users.js'
import { AuthContext } from '../../auth/auth-context.js'
import { ProtectedRoute } from '../../auth/ProtectedRoute.jsx'
import { CatalogPage } from './CatalogPage.jsx'

vi.mock('../../api/services/catalogs.js', () => ({ catalogsService: { listCategories: vi.fn(), listSkills: vi.fn() } }))
vi.mock('../../api/services/initiatives.js', () => ({ initiativesService: { list: vi.fn(), listMine: vi.fn() } }))
vi.mock('../../api/services/users.js', () => ({ usersService: { list: vi.fn() } }))

const ownerId = '11111111-1111-4111-8111-111111111111'
const skillId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2'
const anonymous = { status: 'anonymous', user: null }
const ownerAuth = { status: 'authenticated', user: { id: ownerId, firstName: 'Ana', lastName: 'Rojas' } }
const initiative = {
  id: '10000000-0000-4000-8000-000000000001',
  title: 'Huertos escolares', type: 'idea', summary: 'Crear huertos educativos en escuelas públicas.',
  category: { id: 'sustainability', name: 'Sostenibilidad' },
  skills: [{ id: skillId, name: 'Diseño' }], memberCount: 1, estimatedMembers: 5, availableSpaces: 4,
  state: 'published', visibility: 'public', owner: { id: ownerId, firstName: 'Ana', lastName: 'Rojas' },
  access: { canViewDetails: true },
}
const payload = (data = [initiative], pagination = {}) => ({
  data, pagination: { page: 1, size: 6, total: data.length, totalPages: data.length ? 1 : 0, ...pagination },
})

function HistoryControls() {
  const location = useLocation()
  const navigate = useNavigate()
  return <><output aria-label="Dirección actual">{location.search}</output><button onClick={() => navigate(-1)} type="button">Atrás</button><button onClick={() => navigate(1)} type="button">Adelante</button></>
}

function renderCatalog({ entry = '/iniciativas', auth = anonymous } = {}) {
  const frame = (identity) => (
    <AuthContext.Provider value={identity}>
      <MemoryRouter initialEntries={[entry]}>
        <HistoryControls />
        <Routes>
          <Route element={<CatalogPage />} path="/iniciativas" />
          <Route element={<ProtectedRoute><CatalogPage mine /></ProtectedRoute>} path="/mis-iniciativas" />
          <Route element={<p>Formulario de ingreso</p>} path="/ingresar" />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
  const result = render(frame(auth))
  return { ...result, changeAuth: (identity) => result.rerender(frame(identity)) }
}

function deferred() {
  let resolve
  const promise = new Promise((done) => { resolve = done })
  return { promise, resolve }
}

beforeEach(() => {
  for (const method of [catalogsService.listCategories, catalogsService.listSkills, initiativesService.list, initiativesService.listMine, usersService.list]) method.mockReset()
  catalogsService.listCategories.mockResolvedValue({ data: [{ id: 'sustainability', name: 'Sostenibilidad' }] })
  catalogsService.listSkills.mockResolvedValue({ data: [{ id: skillId, name: 'Diseño' }], pagination: { totalPages: 1 } })
  initiativesService.list.mockResolvedValue(payload())
  initiativesService.listMine.mockResolvedValue(payload())
  usersService.list.mockResolvedValue({ data: [{ id: ownerId, firstName: 'Ana', lastName: 'Rojas' }], pagination: { page: 1, totalPages: 1 } })
})

describe('catálogo', () => {
  it('envía filtros combinados al servidor y reinicia la página sin filtrar localmente', async () => {
    renderCatalog({ entry: '/iniciativas?page=3&size=2' })
    await screen.findByRole('heading', { name: 'Huertos escolares' })
    await screen.findByRole('option', { name: 'Diseño' })
    fireEvent.change(screen.getByLabelText('Buscar iniciativas'), { target: { value: 'MENTORIAS' } })
    fireEvent.change(screen.getByLabelText('Tipo'), { target: { value: 'idea' } })
    fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: 'sustainability' } })
    fireEvent.change(screen.getByLabelText('Competencia requerida'), { target: { value: skillId } })
    fireEvent.change(screen.getByLabelText('Espacios estimados'), { target: { value: 'true' } })
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros' }))
    await waitFor(() => expect(initiativesService.list).toHaveBeenLastCalledWith(expect.objectContaining({
      q: 'MENTORIAS', type: 'idea', category: 'sustainability', skill: skillId, hasSpaces: 'true', page: '1', size: '2',
    }), expect.objectContaining({ signal: expect.any(AbortSignal) })))
    // Se conserva lo que devuelve el servidor aunque no coincida con el texto en cliente.
    await screen.findByRole('heading', { name: 'Huertos escolares' })
    expect(screen.getByLabelText('Dirección actual').textContent).not.toContain('page=3')
    expect(usersService.list).not.toHaveBeenCalled()
  })

  it('una restringida no contiene enlaces ni detalles ocultos incluso si llegan por error', async () => {
    initiativesService.list.mockResolvedValue(payload([{
      ...initiative, title: 'Iniciativa restringida', visibility: 'restricted',
      owner: { id: ownerId, firstName: 'Propietario', lastName: 'Oculto' },
      description: 'DESCRIPCION-SECRETA', problem: 'PROBLEMA-SECRETO', tags: ['ETIQUETA-SECRETA'],
      access: { canViewDetails: false },
    }]))
    renderCatalog({ auth: ownerAuth })
    const title = await screen.findByRole('heading', { name: 'Iniciativa restringida' })
    const card = title.closest('article')
    expect(within(card).queryByRole('link')).toBeNull()
    expect(card.textContent).not.toMatch(/DESCRIPCION-SECRETA|PROBLEMA-SECRETO|ETIQUETA-SECRETA|Propietario Oculto/)
    expect(within(card).getByText(/Acceso restringido/)).toBeDefined()
  })

  it('una tarjeta autorizada ofrece detalle y filtrar por propietario mediante navegación interna', async () => {
    renderCatalog()
    const detail = await screen.findByRole('link', { name: 'Ver detalle de Huertos escolares' })
    expect(detail.getAttribute('href')).toBe(`/iniciativas/${initiative.id}`)
    fireEvent.click(screen.getByRole('link', { name: 'Ver iniciativas de Ana Rojas' }))
    await waitFor(() => expect(initiativesService.list).toHaveBeenLastCalledWith(expect.objectContaining({ ownerId }), expect.anything()))
  })

  it('reconstruye controles y consultas con Atrás y Adelante', async () => {
    renderCatalog({ entry: '/iniciativas?q=huertos' })
    await screen.findByRole('heading', { name: 'Huertos escolares' })
    fireEvent.change(screen.getByLabelText('Buscar iniciativas'), { target: { value: 'mentorias' } })
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros' }))
    await waitFor(() => expect(initiativesService.list).toHaveBeenLastCalledWith(expect.objectContaining({ q: 'mentorias' }), expect.anything()))
    fireEvent.click(screen.getByRole('button', { name: 'Atrás' }))
    await waitFor(() => expect(screen.getByLabelText('Buscar iniciativas').value).toBe('huertos'))
    fireEvent.click(screen.getByRole('button', { name: 'Adelante' }))
    await waitFor(() => expect(screen.getByLabelText('Buscar iniciativas').value).toBe('mentorias'))
  })

  it('pagina conservando filtros y coloca el foco en resultados', async () => {
    initiativesService.list.mockImplementation(async (query) => payload([initiative], { page: Number(query.page), size: 2, total: 5, totalPages: 3 }))
    renderCatalog({ entry: '/iniciativas?type=idea&size=2' })
    await screen.findByText('Página 1 de 3')
    expect(screen.getByRole('button', { name: 'Anterior' }).disabled).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))
    await screen.findByText('Página 2 de 3')
    expect(initiativesService.list).toHaveBeenLastCalledWith(expect.objectContaining({ type: 'idea', size: '2', page: '2' }), expect.anything())
    expect(document.activeElement?.id).toBe('initiative-results-title')
  })

  it('distingue falta de coincidencias y limpia filtros', async () => {
    initiativesService.list.mockResolvedValue(payload([]))
    renderCatalog({ entry: '/iniciativas?q=imposible' })
    await screen.findByRole('heading', { name: 'Sin coincidencias' })
    fireEvent.click(screen.getByRole('button', { name: 'Ver todas las iniciativas' }))
    await screen.findByRole('heading', { name: 'Todavía no hay iniciativas' })
    expect(screen.getByLabelText('Buscar iniciativas').value).toBe('')
  })

  it('una página fuera del rango permite volver sin perder el filtro', async () => {
    initiativesService.list.mockResolvedValue(payload([], { page: 9, total: 3, totalPages: 1 }))
    renderCatalog({ entry: '/iniciativas?type=idea&page=9' })
    await screen.findByRole('heading', { name: 'Página sin resultados' })
    fireEvent.click(screen.getByRole('button', { name: 'Ir a primera página' }))
    await waitFor(() => expect(initiativesService.list).toHaveBeenLastCalledWith(expect.objectContaining({ type: 'idea', page: '1' }), expect.anything()))
  })

  it('un error permite reintentar y conservar los filtros', async () => {
    initiativesService.list.mockRejectedValueOnce(new Error('API sin respuesta')).mockResolvedValue(payload())
    renderCatalog({ entry: '/iniciativas?q=huertos' })
    await screen.findByRole('heading', { name: 'No fue posible cargar las iniciativas' })
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar iniciativas' }))
    await screen.findByRole('heading', { name: 'Huertos escolares' })
    expect(screen.getByLabelText('Buscar iniciativas').value).toBe('huertos')
  })

  it('un catálogo fallido no bloquea resultados y ofrece su reintento', async () => {
    catalogsService.listSkills.mockRejectedValueOnce(new Error('fallo catálogo'))
    renderCatalog()
    await screen.findByRole('heading', { name: 'Huertos escolares' })
    await screen.findByRole('heading', { name: 'No se pudieron cargar las competencias' })
    expect(screen.getByLabelText('Competencia requerida').disabled).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar competencias' }))
    await screen.findByRole('option', { name: 'Diseño' })
  })

  it('restablece una URL inválida y evita consultas con filtros inválidos', async () => {
    renderCatalog({ entry: '/iniciativas?page=0' })
    await screen.findByRole('heading', { name: 'La dirección contiene filtros no válidos' })
    expect(initiativesService.list).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Restablecer filtros' }))
    await screen.findByRole('heading', { name: 'Huertos escolares' })
  })

  it('valida una sola letra antes de consultar y conserva lo escrito', async () => {
    renderCatalog()
    await screen.findByRole('heading', { name: 'Huertos escolares' })
    const calls = initiativesService.list.mock.calls.length
    fireEvent.change(screen.getByLabelText('Buscar iniciativas'), { target: { value: 'x' } })
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros' }))
    expect(screen.getByText('Escribe entre 2 y 100 caracteres.')).toBeDefined()
    expect(screen.getByLabelText('Buscar iniciativas').value).toBe('x')
    expect(initiativesService.list).toHaveBeenCalledTimes(calls)
  })

  it('ignora una respuesta antigua y cancela su señal al cambiar filtros', async () => {
    const old = deferred()
    let oldSignal
    initiativesService.list.mockImplementation((query, { signal }) => {
      if (query.q === 'vieja') { oldSignal = signal; return old.promise }
      return Promise.resolve(payload([{ ...initiative, title: query.q === 'nueva' ? 'Respuesta nueva' : initiative.title }]))
    })
    renderCatalog()
    await screen.findByRole('heading', { name: 'Huertos escolares' })
    fireEvent.change(screen.getByLabelText('Buscar iniciativas'), { target: { value: 'vieja' } })
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros' }))
    await waitFor(() => expect(oldSignal).toBeDefined())
    fireEvent.change(screen.getByLabelText('Buscar iniciativas'), { target: { value: 'nueva' } })
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros' }))
    await screen.findByRole('heading', { name: 'Respuesta nueva' })
    await act(async () => old.resolve(payload([{ ...initiative, title: 'Respuesta antigua' }])))
    expect(screen.queryByRole('heading', { name: 'Respuesta antigua' })).toBeNull()
    expect(oldSignal.aborted).toBe(true)
  })

  it('retira inmediatamente las tarjetas privadas al cerrar sesión', async () => {
    initiativesService.list.mockResolvedValueOnce(payload([{ ...initiative, title: 'Privada del propietario', visibility: 'private' }]))
      .mockImplementation(() => new Promise(() => {}))
    const view = renderCatalog({ auth: ownerAuth })
    await screen.findByRole('heading', { name: 'Privada del propietario' })
    view.changeAuth(anonymous)
    expect(screen.queryByRole('heading', { name: 'Privada del propietario' })).toBeNull()
  })

  it('consulta propietarios con paginación y envía la selección por UUID', async () => {
    renderCatalog({ auth: ownerAuth })
    await screen.findByRole('option', { name: 'Ana Rojas' })
    expect(usersService.list).toHaveBeenCalledWith(expect.objectContaining({ page: 1, size: 6 }), expect.anything())
    fireEvent.change(screen.getByLabelText('Filtrar por propietario'), { target: { value: ownerId } })
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros' }))
    await waitFor(() => expect(initiativesService.list).toHaveBeenLastCalledWith(expect.objectContaining({ ownerId }), expect.anything()))
  })
})

describe('mis iniciativas', () => {
  it('consulta la ruta de propiedad, conserva archivadas y no envía filtros de catálogo', async () => {
    initiativesService.listMine.mockResolvedValue(payload([{ ...initiative, state: 'archived' }]))
    renderCatalog({ entry: '/mis-iniciativas?sort=state&order=asc', auth: ownerAuth })
    await screen.findByRole('heading', { name: 'Huertos escolares' })
    expect(screen.getByText('Archivada')).toBeDefined()
    expect(initiativesService.listMine).toHaveBeenCalledWith({ sort: 'state', order: 'asc', size: '6', page: '1' }, expect.anything())
    expect(initiativesService.list).not.toHaveBeenCalled()
    expect(screen.queryByLabelText('Buscar iniciativas')).toBeNull()
  })

  it('exige autenticación antes de consultar propiedad', async () => {
    renderCatalog({ entry: '/mis-iniciativas' })
    await screen.findByText('Formulario de ingreso')
    expect(initiativesService.listMine).not.toHaveBeenCalled()
  })
})
