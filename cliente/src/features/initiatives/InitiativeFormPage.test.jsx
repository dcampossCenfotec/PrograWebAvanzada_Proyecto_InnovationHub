import { fireEvent, render, screen, within } from '@testing-library/react'
import { createMemoryRouter, Link, RouterProvider, useLocation } from 'react-router'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { initiativesService } from '../../api/services/initiatives.js'
import { catalogsService } from '../../api/services/catalogs.js'
import { ApiError } from '../../api/errors.js'
import { AuthContext } from '../../auth/auth-context.js'
import { InitiativeFormPage } from './InitiativeFormPage.jsx'

vi.mock('../../api/services/initiatives.js', () => ({ initiativesService: { getById: vi.fn(), create: vi.fn(), update: vi.fn() } }))
vi.mock('../../api/services/catalogs.js', () => ({ catalogsService: { listCategories: vi.fn(), listSkills: vi.fn() } }))
const id = '10000000-0000-4000-8000-000000000001'
const ownerId = '11111111-1111-4111-8111-111111111111'
const skillId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2'
const owner = { status: 'authenticated', user: { id: ownerId } }
const anonymous = { status: 'anonymous', user: null }
const initiative = {
  id, title: 'Huertos escolares', type: 'idea', summary: 'Crear huertos educativos en escuelas públicas.',
  description: 'Diseñar huertos con docentes y estudiantes de escuelas.', problem: 'Faltan espacios prácticos para educación ambiental.', beneficiaries: 'Estudiantes y docentes',
  category: { id: 'sustainability', name: 'Sostenibilidad' }, skills: [{ id: skillId, name: 'Diseño' }],
  estimatedMembers: 5, memberCount: 1, visibility: 'public', tags: ['escuelas', 'educación'],
  owner: { id: ownerId }, access: { canViewDetails: true, canEdit: true }, state: 'published',
}
const showModal = HTMLDialogElement.prototype.showModal
const close = HTMLDialogElement.prototype.close
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); this.dispatchEvent(new Event('close')) }
})
afterAll(() => { HTMLDialogElement.prototype.showModal = showModal; HTMLDialogElement.prototype.close = close })
beforeEach(() => {
  catalogsService.listCategories.mockReset().mockResolvedValue({ data: [{ id: 'sustainability', name: 'Sostenibilidad' }] })
  catalogsService.listSkills.mockReset().mockResolvedValue({ data: [{ id: skillId, name: 'Diseño' }], pagination: { page: 1, totalPages: 1 } })
  initiativesService.getById.mockReset().mockResolvedValue({ data: initiative })
  initiativesService.create.mockReset().mockResolvedValue({ data: initiative })
  initiativesService.update.mockReset().mockResolvedValue({ data: initiative })
})
function Destination() { const location = useLocation(); return <p>Destino {location.pathname} · {location.state?.initiativeOperation} · {location.state?.from?.pathname}</p> }
function mount({ edit = false, auth = owner, entry } = {}) {
  const router = createMemoryRouter([
    { path: '/iniciativas/nueva', element: <><Link to="/perfil">Ir al perfil</Link><InitiativeFormPage /></> },
    { path: '/iniciativas/:id/editar', element: <InitiativeFormPage edit /> },
    { path: '/iniciativas', element: <Destination /> },
    { path: '/iniciativas/:id', element: <Destination /> },
    { path: '/perfil', element: <Destination /> },
    { path: '/mis-iniciativas', element: <Destination /> },
    { path: '/ingresar', element: <Destination /> },
  ], { initialEntries: [entry ?? (edit ? `/iniciativas/${id}/editar` : '/iniciativas/nueva')] })
  const frame = (identity) => <AuthContext.Provider value={identity}><RouterProvider router={router} /></AuthContext.Provider>
  const result = render(frame(auth))
  return { ...result, router, changeAuth: (identity) => result.rerender(frame(identity)) }
}
async function fillCreate() {
  await screen.findByRole('form', { name: 'Publicar iniciativa' })
  for (const [label, value] of [['Título', initiative.title], ['Resumen', initiative.summary], ['Descripción', initiative.description], ['Problema que atiende', initiative.problem], ['Personas beneficiarias', initiative.beneficiaries], ['Categoría', 'sustainability'], ['Estimación de integrantes', '5']]) fireEvent.change(screen.getByLabelText(label), { target: { value } })
  fireEvent.change(screen.getByLabelText('Competencia por agregar'), { target: { value: skillId } })
  fireEvent.click(screen.getByRole('button', { name: 'Agregar competencia' }))
}
function defer() { let resolve; const promise = new Promise((done) => { resolve = done }); return { resolve, promise } }

describe('carga y permisos del formulario', () => {
  it('visitante va a ingreso y no consulta catálogos ni datos de edición', async () => {
    mount({ auth: anonymous })
    await screen.findByText('Destino /ingresar · · /iniciativas/nueva')
    expect(catalogsService.listCategories).not.toHaveBeenCalled()
    expect(initiativesService.getById).not.toHaveBeenCalled()
  })
  it('carga opciones y todos los campos en edición sin permitir cambiar propietario ni estado', async () => {
    mount({ edit: true })
    await screen.findByRole('form', { name: 'Editar iniciativa' })
    expect(screen.getByLabelText('Título').value).toBe(initiative.title)
    expect(within(screen.getByRole('list', { name: 'Competencias agregadas' })).getByText('Diseño')).toBeDefined()
    expect(within(screen.getByRole('list', { name: 'Etiquetas agregadas' })).getByText('escuelas')).toBeDefined()
    expect(screen.queryByLabelText('Propietario')).toBeNull()
    expect(screen.queryByLabelText('Estado')).toBeNull()
  })
  it('rechaza UUID mal formado antes de consultar', async () => {
    mount({ entry: '/iniciativas/invalido/editar' })
    expect(screen.getByRole('heading', { name: 'Dirección de iniciativa no válida' })).toBeDefined()
    expect(initiativesService.getById).not.toHaveBeenCalled()
  })
  it('un ajeno no ve el formulario ni campos del DTO aunque pueda consultar la pública', async () => {
    mount({ edit: true, auth: { status: 'authenticated', user: { id: 'otro' } } })
    await screen.findByRole('heading', { name: 'No puedes editar esta iniciativa' })
    expect(screen.queryByRole('form')).toBeNull()
    expect(document.body.textContent).not.toContain(initiative.summary)
    expect(catalogsService.listCategories).not.toHaveBeenCalled()
  })
  it('archivada bloquea edición incluso del propietario', async () => {
    initiativesService.getById.mockResolvedValue({ data: { ...initiative, state: 'archived', access: { canEdit: false } } })
    mount({ edit: true })
    await screen.findByRole('heading', { name: 'La iniciativa archivada no puede editarse' })
    expect(screen.queryByRole('form')).toBeNull()
  })
  it('un catálogo fallido puede reintentarse', async () => {
    catalogsService.listCategories.mockRejectedValueOnce(new Error('fallo'))
    mount()
    fireEvent.click(await screen.findByRole('button', { name: 'Reintentar formulario' }))
    await screen.findByRole('form', { name: 'Publicar iniciativa' })
  })
  it('404 de edición no muestra campos ni mensajes con datos sensibles', async () => {
    initiativesService.getById.mockRejectedValue(new ApiError('TITULO-PRIVADO-SECRETO', { status: 404 }))
    mount({ edit: true })
    await screen.findByRole('heading', { name: 'Iniciativa no disponible' })
    expect(screen.queryByRole('form')).toBeNull()
    expect(document.body.textContent).not.toContain('TITULO-PRIVADO-SECRETO')
  })
  it('catálogo vacío bloquea publicar y permite actualizar', async () => {
    catalogsService.listCategories.mockResolvedValue({ data: [] })
    mount()
    await screen.findByRole('heading', { name: 'No hay catálogos suficientes para publicar' })
    expect(screen.queryByRole('button', { name: 'Publicar iniciativa' })).toBeNull()
  })
  it('cerrar sesión desmonta datos privados y dirige a ingreso sin preguntar descarte', async () => {
    const app = mount({ edit: true })
    await screen.findByRole('form', { name: 'Editar iniciativa' })
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Título privado cambiado' } })
    app.changeAuth(anonymous)
    await screen.findByText(`Destino /ingresar · · /iniciativas/${id}/editar`)
    expect(document.body.textContent).not.toContain('Título privado cambiado')
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})

describe('publicación y edición controladas', () => {
  it('valida vacíos antes de HTTP y enfoca el primer campo', async () => {
    mount()
    const form = await screen.findByRole('form', { name: 'Publicar iniciativa' })
    fireEvent.submit(form)
    expect(initiativesService.create).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(screen.getByLabelText('Título'))
  })
  it('crea con todos los campos editables, arrays/numero y vuelve al catálogo', async () => {
    mount()
    await fillCreate()
    fireEvent.change(screen.getByLabelText('Tipo de iniciativa'), { target: { value: 'need' } })
    fireEvent.change(screen.getByLabelText('Visibilidad'), { target: { value: 'private' } })
    fireEvent.change(screen.getByLabelText('Etiqueta por agregar'), { target: { value: ' Educación ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Agregar etiqueta' }))
    fireEvent.click(screen.getByRole('button', { name: 'Publicar iniciativa' }))
    await screen.findByText('Destino /iniciativas · created ·')
    expect(initiativesService.create).toHaveBeenCalledTimes(1)
    const [payload] = initiativesService.create.mock.calls[0]
    expect(payload).toMatchObject({ type: 'need', visibility: 'private', estimatedMembers: 5, skillIds: [skillId], tags: ['Educación'] })
    for (const key of ['id', 'ownerId', 'state', 'createdAt', 'memberCount']) expect(payload).not.toHaveProperty(key)
  })
  it('edita usando PUT completo y vuelve al detalle con resultado actualizado', async () => {
    mount({ edit: true })
    const form = await screen.findByRole('form', { name: 'Editar iniciativa' })
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Huertos editados desde React' } })
    fireEvent.submit(form)
    await screen.findByText(`Destino /iniciativas/${id} · updated ·`)
    expect(initiativesService.update).toHaveBeenCalledWith(id, expect.objectContaining({ title: 'Huertos editados desde React', tags: initiative.tags, skillIds: [skillId] }), expect.objectContaining({ signal: expect.any(AbortSignal) }))
    expect(initiativesService.create).not.toHaveBeenCalled()
  })
  it('bloquea doble envío y controles durante el guardado', async () => {
    const waiting = defer()
    initiativesService.create.mockReturnValue(waiting.promise)
    mount()
    await fillCreate()
    const form = screen.getByRole('form', { name: 'Publicar iniciativa' })
    fireEvent.submit(form); fireEvent.submit(form)
    expect(initiativesService.create).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Guardando…' }).disabled).toBe(true)
    expect(screen.getByRole('button', { name: 'Cancelar' }).disabled).toBe(true)
    waiting.resolve({ data: initiative })
    await screen.findByText('Destino /iniciativas · created ·')
  })
  it.each([400, 409, 0])('fallo %s conserva valores y no navega ni informa éxito', async (status) => {
    initiativesService.create.mockRejectedValue(new ApiError('Error de prueba', { status, fields: status === 400 ? { title: 'Título rechazado por API' } : {} }))
    mount()
    await fillCreate()
    fireEvent.click(screen.getByRole('button', { name: 'Publicar iniciativa' }))
    await screen.findByRole('heading', { name: 'No fue posible guardar la iniciativa' })
    expect(screen.getByLabelText('Título').value).toBe(initiative.title)
    expect(screen.queryByText(/Destino/)).toBeNull()
    if (status === 400) expect(screen.getByText('Título rechazado por API')).toBeDefined()
  })
  it('perder permiso al guardar retira el formulario y no permite más envíos', async () => {
    initiativesService.update.mockRejectedValue(new ApiError('Información sensible', { status: 403 }))
    mount({ edit: true })
    fireEvent.submit(await screen.findByRole('form', { name: 'Editar iniciativa' }))
    await screen.findByRole('heading', { name: 'No fue posible guardar la iniciativa' })
    expect(screen.queryByRole('form')).toBeNull()
    expect(document.body.textContent).not.toContain('Información sensible')
  })
  it('una respuesta de creación sin published no anuncia éxito', async () => {
    initiativesService.create.mockResolvedValue({ data: { ...initiative, state: 'draft' } })
    mount()
    await fillCreate()
    fireEvent.submit(screen.getByRole('form'))
    await screen.findByRole('heading', { name: 'No fue posible guardar la iniciativa' })
    expect(screen.queryByText(/Destino/)).toBeNull()
  })
})

describe('descartar cambios', () => {
  it('Cancelar sin cambios vuelve al catálogo sin diálogo ni escritura', async () => {
    mount()
    fireEvent.click(await screen.findByRole('button', { name: 'Cancelar' }))
    await screen.findByText('Destino /iniciativas · ·')
    expect(initiativesService.create).not.toHaveBeenCalled()
  })
  it('seguir editando conserva valores; descartar sale sin escribir y devuelve foco', async () => {
    mount()
    await screen.findByRole('form')
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Cambio sin guardar' } })
    const cancel = screen.getByRole('button', { name: 'Cancelar' })
    cancel.focus(); fireEvent.click(cancel)
    const dialog = await screen.findByRole('dialog')
    expect(document.activeElement).toBe(within(dialog).getByRole('button', { name: 'Seguir editando' }))
    fireEvent.click(within(dialog).getByRole('button', { name: 'Seguir editando' }))
    expect(document.activeElement).toBe(cancel)
    expect(screen.getByLabelText('Título').value).toBe('Cambio sin guardar')
    fireEvent.click(cancel)
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Descartar y salir' }))
    await screen.findByText('Destino /iniciativas · ·')
    expect(initiativesService.create).not.toHaveBeenCalled()
  })
  it('navegar desde otro enlace también exige confirmar los cambios', async () => {
    mount()
    await screen.findByRole('form')
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Sin guardar' } })
    fireEvent.click(screen.getByRole('link', { name: 'Ir al perfil' }))
    fireEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Descartar y salir' }))
    await screen.findByText('Destino /perfil · ·')
  })
  it('antes de recargar solicita el aviso nativo cuando hay cambios', async () => {
    mount()
    await screen.findByRole('form')
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Sin guardar' } })
    const event = new Event('beforeunload', { cancelable: true })
    fireEvent(window, event)
    expect(event.defaultPrevented).toBe(true)
  })
  it('intentar salir durante guardado bloquea el descarte y después respeta el éxito', async () => {
    const waiting = defer()
    initiativesService.create.mockReturnValue(waiting.promise)
    mount()
    await fillCreate()
    fireEvent.submit(screen.getByRole('form'))
    fireEvent.click(screen.getByRole('link', { name: 'Ir al perfil' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByRole('button', { name: 'Procesando…' }).disabled).toBe(true)
    waiting.resolve({ data: initiative })
    await screen.findByText('Destino /iniciativas · created ·')
  })
})


describe('etiqueta pendiente y guardado', () => {
  it('no descarta silenciosamente una etiqueta escrita sin agregar al guardar', async () => {
    mount()
    await fillCreate()
    fireEvent.change(screen.getByLabelText('Etiqueta por agregar'), { target: { value: 'pendiente' } })
    fireEvent.submit(screen.getByRole('form'))
    expect(initiativesService.create).not.toHaveBeenCalled()
    expect(screen.getByText('Agrega la etiqueta pendiente o borra su texto antes de guardar.')).toBeDefined()
    expect(screen.getByLabelText('Etiqueta por agregar').value).toBe('pendiente')
    fireEvent.keyDown(screen.getByLabelText('Etiqueta por agregar'), { key: 'Enter' })
    fireEvent.submit(screen.getByRole('form'))
    await screen.findByText('Destino /iniciativas · created ·')
    expect(initiativesService.create.mock.calls[0][0].tags).toEqual(['pendiente'])
    expect(initiativesService.create.mock.calls[0][0]).not.toHaveProperty('tagDraft')
  })
  it('escribir únicamente la etiqueta pendiente también activa la confirmación de descarte', async () => {
    mount()
    await screen.findByRole('form')
    fireEvent.change(screen.getByLabelText('Etiqueta por agregar'), { target: { value: 'sin agregar' } })
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    const dialog = await screen.findByRole('dialog', { name: 'Descartar cambios sin guardar' })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Seguir editando' }))
    expect(screen.getByLabelText('Etiqueta por agregar').value).toBe('sin agregar')
  })
})
