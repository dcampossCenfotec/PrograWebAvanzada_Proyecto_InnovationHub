import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { initiativesService } from '../../api/services/initiatives.js'
import { AuthContext } from '../../auth/auth-context.js'
import { ApiError } from '../../api/errors.js'
import { InitiativeDetailPage } from './InitiativeDetailPage.jsx'

vi.mock('../../api/services/initiatives.js', () => ({ initiativesService: { getById: vi.fn(), remove: vi.fn(), archive: vi.fn() } }))
const id = '10000000-0000-4000-8000-000000000001'
const nextId = '10000000-0000-4000-8000-000000000002'
const ownerId = '11111111-1111-4111-8111-111111111111'
const anonymous = { status: 'anonymous', user: null }
const owner = { status: 'authenticated', user: { id: ownerId } }
const outsider = { status: 'authenticated', user: { id: '33333333-3333-4333-8333-333333333333' } }
const initiative = {
  id, title: 'Huertos escolares', summary: 'Crear huertos educativos.', type: 'idea',
  category: { id: 'sustainability', name: 'Sostenibilidad' },
  visibility: 'public', state: 'published', description: 'Descripción completa\nSegunda línea.',
  problem: 'Problema de educación ambiental.', beneficiaries: 'Estudiantes y docentes',
  skills: [{ id: 'skill-1', name: 'Diseño' }], tags: ['escuelas'],
  owner: { id: ownerId, firstName: 'Ana', lastName: 'Rojas' },
  memberCount: 1, estimatedMembers: 5, availableSpaces: 4,
  createdAt: '2026-10-20T14:00:00.000Z', updatedAt: '2026-10-23T14:00:00.000Z',
  access: { canViewDetails: true, canEdit: false, canDelete: false, canArchive: false, canRequest: false, canConvert: false, canManageRequests: false },
}
const ownerInitiative = { ...initiative, access: { ...initiative.access, canEdit: true, canDelete: true, canArchive: true, canManageRequests: true } }
const originalShowModal = HTMLDialogElement.prototype.showModal
const originalClose = HTMLDialogElement.prototype.close
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); this.dispatchEvent(new Event('close')) }
})
afterAll(() => {
  HTMLDialogElement.prototype.showModal = originalShowModal
  HTMLDialogElement.prototype.close = originalClose
})
beforeEach(() => {
  initiativesService.getById.mockReset().mockResolvedValue({ data: initiative })
  initiativesService.remove.mockReset().mockResolvedValue(null)
  initiativesService.archive.mockReset().mockResolvedValue({ data: { id, state: 'archived', operation: 'archived' } })
})
function Destination() {
  const location = useLocation()
  return <p>Destino: {location.pathname} · {location.state?.initiativeOperation} · {location.state?.from?.pathname}</p>
}
function NextLink() {
  const navigate = useNavigate()
  return <button onClick={() => navigate(`/iniciativas/${nextId}`)} type="button">Abrir otra iniciativa</button>
}
function mount({ auth = anonymous, entry = `/iniciativas/${id}` } = {}) {
  const frame = (identity) => <AuthContext.Provider value={identity}><MemoryRouter initialEntries={[entry]}><NextLink /><Routes><Route element={<InitiativeDetailPage />} path="/iniciativas/:id" /><Route element={<Destination />} path="/mis-iniciativas" /><Route element={<Destination />} path="/ingresar" /></Routes></MemoryRouter></AuthContext.Provider>
  const result = render(frame(auth))
  return { ...result, changeAuth: (identity) => result.rerender(frame(identity)) }
}
function defer() { let resolve; const promise = new Promise((done) => { resolve = done }); return { resolve, promise } }
async function openRemoval(action = 'delete') {
  await screen.findByRole('heading', { level: 1, name: initiative.title })
  const trigger = screen.getByRole('button', { name: action === 'archive' ? 'Archivar iniciativa' : 'Eliminar iniciativa' })
  trigger.focus()
  fireEvent.click(trigger)
  return screen.getByRole('dialog')
}

describe('detalle de iniciativas', () => {
  it('presenta todos los campos públicos y pide ingreso para colaborar', async () => {
    mount()
    await screen.findByRole('heading', { level: 1, name: initiative.title })
    for (const label of ['Descripción', 'Problema que atiende', 'Personas beneficiarias', 'Competencias requeridas', 'Equipo y fechas', 'Acciones']) expect(screen.getByRole('heading', { name: label })).toBeDefined()
    expect(screen.getByText(/Descripción completa/).textContent).toContain('Segunda línea.')
    expect(screen.getByText(initiative.problem)).toBeDefined()
    expect(screen.getByText(initiative.beneficiaries)).toBeDefined()
    expect(screen.getByRole('link', { name: 'Ingresar para colaborar' })).toBeDefined()
    expect(screen.queryByRole('button', { name: 'Eliminar iniciativa' })).toBeNull()
    expect(screen.getByText('Creación').nextElementSibling.querySelector('time').dateTime).toBe(initiative.createdAt)
  })

  it('habilita acciones solo por capacidades y sesión', async () => {
    initiativesService.getById.mockResolvedValue({ data: { ...ownerInitiative, access: { ...ownerInitiative.access, canConvert: true } } })
    mount({ auth: owner })
    await screen.findByRole('link', { name: 'Editar iniciativa' })
    expect(screen.getByRole('link', { name: 'Convertir en proyecto' }).getAttribute('href')).toBe(`/iniciativas/${id}/convertir`)
    expect(screen.getByRole('link', { name: 'Revisar solicitudes recibidas' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Eliminar iniciativa' })).toBeDefined()
    expect(screen.queryByRole('link', { name: 'Solicitar participación' })).toBeNull()
  })

  it('permite solicitar con cero espacios si la API lo autoriza', async () => {
    initiativesService.getById.mockResolvedValue({ data: { ...initiative, memberCount: 3, estimatedMembers: 2, availableSpaces: 0, access: { ...initiative.access, canRequest: true } } })
    mount({ auth: outsider })
    const request = await screen.findByRole('link', { name: 'Solicitar participación' })
    expect(request.getAttribute('href')).toBe(`/iniciativas/${id}/participar`)
    expect(screen.getByText('Espacios estimados').nextElementSibling.textContent).toBe('0')
    expect(screen.queryByRole('link', { name: 'Editar iniciativa' })).toBeNull()
  })

  it('archivada conserva detalle y solo ofrece eliminar sujeto a historial', async () => {
    initiativesService.getById.mockResolvedValue({ data: { ...ownerInitiative, state: 'archived', access: { ...ownerInitiative.access, canEdit: false } } })
    mount({ auth: owner })
    await screen.findByRole('heading', { level: 1, name: initiative.title })
    expect(screen.getByText('Archivada')).toBeDefined()
    expect(screen.queryByRole('link', { name: 'Editar iniciativa' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Eliminar iniciativa' })).toBeDefined()
    expect(screen.queryByRole('button', { name: 'Archivar iniciativa' })).toBeNull()
  })

  it('presenta vacíos y texto sin interpretarlo como HTML', async () => {
    initiativesService.getById.mockResolvedValue({ data: { ...initiative, title: '<img src=x onerror=alert(1)>', skills: [], tags: [], beneficiaries: null } })
    mount()
    await screen.findByRole('heading', { level: 1, name: '<img src=x onerror=alert(1)>' })
    expect(screen.getByText('Sin competencias indicadas.')).toBeDefined()
    expect(screen.getByText('Sin etiquetas.')).toBeDefined()
    expect(document.querySelector('img')).toBeNull()
  })

  it('un ID mal formado no consulta la API', async () => {
    mount({ entry: '/iniciativas/no-es-un-uuid' })
    expect(screen.getByRole('heading', { level: 1, name: 'Dirección de iniciativa no válida' })).toBeDefined()
    expect(initiativesService.getById).not.toHaveBeenCalled()
  })

  it.each([[401, 'Inicia sesión para continuar'], [403, 'Acceso no permitido'], [404, 'Iniciativa no disponible']])('maneja HTTP %s sin filtrar texto sensible de errores', async (status, title) => {
    initiativesService.getById.mockRejectedValue(new ApiError('TITULO-PRIVADO-SECRETO', { status }))
    mount()
    await screen.findByRole('heading', { level: 1, name: title })
    expect(document.body.textContent).not.toContain('TITULO-PRIVADO-SECRETO')
    expect(screen.queryByRole('heading', { name: 'Descripción' })).toBeNull()
    if (status === 401) {
      fireEvent.click(screen.getByRole('link', { name: 'Ingresar' }))
      expect(screen.getByText(`Destino: /ingresar · · /iniciativas/${id}`)).toBeDefined()
    }
  })

  it('reintenta un fallo de red', async () => {
    initiativesService.getById.mockRejectedValueOnce(new ApiError('Sin red')).mockResolvedValue({ data: initiative })
    mount()
    fireEvent.click(await screen.findByRole('button', { name: 'Reintentar detalle' }))
    await screen.findByRole('heading', { level: 1, name: initiative.title })
  })

  it('una respuesta 200 sin permiso tampoco renderiza datos privados', async () => {
    initiativesService.getById.mockResolvedValue({ data: { ...initiative, title: 'TITULO-PRIVADO-SECRETO', access: { canViewDetails: false } } })
    mount()
    await screen.findByRole('heading', { name: 'Acceso no permitido' })
    expect(document.body.textContent).not.toContain('TITULO-PRIVADO-SECRETO')
  })

  it('cerrar sesión retira el detalle privado antes de que responda la consulta visitante', async () => {
    const waiting = defer()
    initiativesService.getById.mockResolvedValueOnce({ data: { ...ownerInitiative, title: 'PRIVADA-DEL-DUEÑO', visibility: 'private' } }).mockReturnValue(waiting.promise)
    const app = mount({ auth: owner })
    await screen.findByRole('heading', { level: 1, name: 'PRIVADA-DEL-DUEÑO' })
    app.changeAuth(anonymous)
    expect(document.body.textContent).not.toContain('PRIVADA-DEL-DUEÑO')
    await waitFor(() => expect(initiativesService.getById).toHaveBeenCalledTimes(2))
    waiting.resolve({ data: { ...initiative, access: { canViewDetails: false } } })
    await screen.findByRole('heading', { name: 'Acceso no permitido' })
  })

  it('al cambiar de ID cancela la consulta anterior y no recupera su respuesta', async () => {
    const old = defer()
    let signal
    initiativesService.getById.mockImplementation((value, options) => {
      if (value === id) { signal = options.signal; return old.promise }
      return Promise.resolve({ data: { ...initiative, id: nextId, title: 'Otra iniciativa' } })
    })
    mount()
    fireEvent.click(screen.getByRole('button', { name: 'Abrir otra iniciativa' }))
    await screen.findByRole('heading', { level: 1, name: 'Otra iniciativa' })
    expect(signal.aborted).toBe(true)
    old.resolve({ data: initiative })
    await Promise.resolve()
    expect(screen.queryByRole('heading', { level: 1, name: initiative.title })).toBeNull()
  })
})

describe('confirmación de eliminación o archivo', () => {
  beforeEach(() => initiativesService.getById.mockResolvedValue({ data: ownerInitiative }))

  it('abre con Cancelar enfocado; cancelar no escribe y devuelve el foco al botón', async () => {
    mount({ auth: owner })
    const dialog = await openRemoval()
    expect(document.activeElement).toBe(within(dialog).getByRole('button', { name: 'Cancelar' }))
    expect(within(dialog).getByText(initiative.title)).toBeDefined()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
    expect(initiativesService.remove).not.toHaveBeenCalled()
    expect(dialog.open).toBe(false)
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Eliminar iniciativa' }))
  })

  it('Escape y clic en el fondo cancelan sin escribir', async () => {
    mount({ auth: owner })
    const dialog = await openRemoval()
    fireEvent(dialog, new Event('cancel', { cancelable: true }))
    expect(dialog.open).toBe(false)
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar iniciativa' }))
    fireEvent.click(screen.getByRole('dialog'))
    expect(dialog.open).toBe(false)
    expect(initiativesService.remove).not.toHaveBeenCalled()
  })

  it.each([['delete', 'deleted'], ['archive', 'archived']])('envía %s exclusivamente al servicio solicitado', async (action, operation) => {
    mount({ auth: owner })
    const dialog = await openRemoval(action)
    fireEvent.click(within(dialog).getByRole('button', { name: action === 'delete' ? 'Eliminar definitivamente' : 'Confirmar archivo' }))
    await screen.findByText(`Destino: /mis-iniciativas · ${operation} ·`)
    const method = action === 'delete' ? initiativesService.remove : initiativesService.archive
    const other = action === 'delete' ? initiativesService.archive : initiativesService.remove
    expect(method).toHaveBeenCalledTimes(1)
    expect(method).toHaveBeenCalledWith(id, expect.objectContaining({ signal: expect.any(AbortSignal) }))
    expect(other).not.toHaveBeenCalled()
  })

  it('bloquea doble confirmación, Cancelar, Escape y fondo mientras guarda', async () => {
    const waiting = defer()
    initiativesService.remove.mockReturnValue(waiting.promise)
    mount({ auth: owner })
    const dialog = await openRemoval()
    const confirm = within(dialog).getByRole('button', { name: 'Eliminar definitivamente' })
    fireEvent.click(confirm)
    fireEvent.click(confirm)
    expect(within(dialog).getByRole('button', { name: 'Procesando…' }).disabled).toBe(true)
    expect(within(dialog).getByRole('button', { name: 'Cancelar' }).disabled).toBe(true)
    fireEvent(dialog, new Event('cancel', { cancelable: true }))
    fireEvent.click(dialog)
    expect(dialog.open).toBe(true)
    expect(initiativesService.remove).toHaveBeenCalledTimes(1)
    waiting.resolve(null)
    await screen.findByText('Destino: /mis-iniciativas · deleted ·')
  })

  it.each([401, 403, 404, 409, 0])('un fallo %s retira datos/capacidades antiguos y exige consulta nueva', async (status) => {
    initiativesService.remove.mockRejectedValue(new ApiError('ERROR-SENSIBLE', { status }))
    mount({ auth: owner })
    const dialog = await openRemoval()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Eliminar definitivamente' }))
    await screen.findByRole('button', { name: 'Consultar estado actual' })
    expect(screen.queryByRole('heading', { level: 1, name: initiative.title })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Eliminar iniciativa' })).toBeNull()
    expect(document.body.textContent).not.toContain('ERROR-SENSIBLE')
    fireEvent.click(screen.getByRole('button', { name: 'Consultar estado actual' }))
    await screen.findByRole('heading', { level: 1, name: initiative.title })
    expect(initiativesService.getById).toHaveBeenCalledTimes(2)
    expect(initiativesService.remove).toHaveBeenCalledTimes(1)
  })

  it('no anuncia éxito ante una respuesta de eliminación desconocida', async () => {
    initiativesService.remove.mockResolvedValue({ data: { id, state: 'archived', operation: 'archived' } })
    mount({ auth: owner })
    const dialog = await openRemoval()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Eliminar definitivamente' }))
    await screen.findByRole('heading', { name: 'No fue posible confirmar la operación' })
    expect(screen.queryByText(/Destino:/)).toBeNull()
  })
})


describe('archivo independiente', () => {
  beforeEach(() => initiativesService.getById.mockResolvedValue({ data: ownerInitiative }))

  it('tiene diálogo propio; cancelar nunca llama DELETE ni POST archive', async () => {
    mount({ auth: owner })
    const dialog = await openRemoval('archive')
    expect(within(dialog).getByRole('heading', { name: 'Archivar iniciativa' })).toBeDefined()
    expect(within(dialog).getByText(/Se conservarán su información/)).toBeDefined()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
    expect(initiativesService.archive).not.toHaveBeenCalled()
    expect(initiativesService.remove).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Archivar iniciativa' }))
  })

  it('bloquea doble archivo y no acepta un 204 como éxito de archivo', async () => {
    const waiting = defer()
    initiativesService.archive.mockReturnValue(waiting.promise)
    mount({ auth: owner })
    const dialog = await openRemoval('archive')
    const confirm = within(dialog).getByRole('button', { name: 'Confirmar archivo' })
    fireEvent.click(confirm)
    fireEvent.click(confirm)
    expect(initiativesService.archive).toHaveBeenCalledTimes(1)
    expect(initiativesService.remove).not.toHaveBeenCalled()
    waiting.resolve(null)
    await screen.findByRole('heading', { name: 'No fue posible confirmar la operación' })
  })

  it('conflicto por historial explica que no se modificó y permite volver para elegir archivo', async () => {
    initiativesService.remove.mockRejectedValue(new ApiError('No borrar', { status: 409, code: 'INITIATIVE_HAS_HISTORY' }))
    mount({ auth: owner })
    const dialog = await openRemoval()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Eliminar definitivamente' }))
    await screen.findByRole('heading', { name: 'No se puede eliminar esta iniciativa' })
    expect(screen.getByText(/se conserva sin cambios/)).toBeDefined()
    expect(initiativesService.archive).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Consultar estado actual' }))
    await screen.findByRole('button', { name: 'Archivar iniciativa' })
  })

  it('los permisos de archivo no conceden permiso para borrar', async () => {
    initiativesService.getById.mockResolvedValue({ data: { ...ownerInitiative, access: { ...ownerInitiative.access, canDelete: false } } })
    mount({ auth: owner })
    await screen.findByRole('button', { name: 'Archivar iniciativa' })
    expect(screen.queryByRole('button', { name: 'Eliminar iniciativa' })).toBeNull()
  })
})
