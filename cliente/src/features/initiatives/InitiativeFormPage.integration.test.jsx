import { fireEvent, render, screen, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { authService } from '../../api/services/auth.js'
import { initiativesService } from '../../api/services/initiatives.js'
import { setAccessToken } from '../../api/session.js'
import { AuthContext } from '../../auth/auth-context.js'
import { CatalogPage } from './CatalogPage.jsx'
import { InitiativeDetailPage } from './InitiativeDetailPage.jsx'
import { InitiativeFormPage } from './InitiativeFormPage.jsx'

const enabled = import.meta.env.VITE_RUN_API_INTEGRATION === 'true'
const showModal = HTMLDialogElement.prototype.showModal
const close = HTMLDialogElement.prototype.close
const input = {
  title: 'Prueba UI08 temporal', type: 'idea', summary: 'Colaboración académica para probar publicación desde React.',
  description: 'Organizar sesiones académicas con estudiantes y docentes de diferentes carreras.',
  problem: 'Se necesita conectar a personas que requieren apoyo académico.', beneficiaries: 'Estudiantes universitarios',
  categoryId: 'education', skillIds: ['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2'],
  estimatedMembers: 3, visibility: 'public', tags: ['prueba-ui08'],
}
let testToken = null
async function login(email = 'ana.owner@example.test') {
  const result = await authService.login({ email, password: 'DemoSegura2026' })
  testToken = result.data.accessToken
  setAccessToken(testToken)
  return { status: 'authenticated', user: result.data.user }
}
function mount(entry, auth) {
  const router = createMemoryRouter([
    { path: '/iniciativas/nueva', element: <InitiativeFormPage /> },
    { path: '/iniciativas/:id/editar', element: <InitiativeFormPage edit /> },
    { path: '/iniciativas/:id', element: <InitiativeDetailPage /> },
    { path: '/iniciativas', element: <CatalogPage /> },
  ], { initialEntries: [entry] })
  return render(<AuthContext.Provider value={auth}><RouterProvider router={router} /></AuthContext.Provider>)
}
async function fill(title) {
  await screen.findByRole('form', { name: 'Publicar iniciativa' }, { timeout: 10000 })
  for (const [label, value] of [['Título', title], ['Resumen', input.summary], ['Descripción', input.description], ['Problema que atiende', input.problem], ['Personas beneficiarias', input.beneficiaries], ['Categoría', input.categoryId], ['Estimación de integrantes', '3']]) fireEvent.change(screen.getByLabelText(label), { target: { value } })
  fireEvent.click(screen.getByLabelText('Diseño'))
  fireEvent.click(screen.getByRole('button', { name: 'Agregar etiqueta' }))
  fireEvent.change(screen.getByLabelText('Etiqueta 1'), { target: { value: 'prueba-ui08' } })
}

describe.skipIf(!enabled)('UI08 con React, Express y MongoDB reales', () => {
  beforeAll(() => {
    if (!/127\.0\.0\.1:3002\/api\/?$/.test(import.meta.env.VITE_API_BASE_URL ?? '')) throw new Error('UI08 requiere la API de test aislada en 127.0.0.1:3002/api.')
    HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
    HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); this.dispatchEvent(new Event('close')) }
  })
  afterAll(() => { HTMLDialogElement.prototype.showModal = showModal; HTMLDialogElement.prototype.close = close })
  afterEach(async () => {
    if (testToken) {
      setAccessToken(testToken)
      try { await authService.logout() } finally { testToken = null; setAccessToken(null) }
    }
  })

  it('publica todos los campos una sola vez ante doble envío y enfoca el aviso del catálogo', async () => {
    const auth = await login()
    const title = 'Prueba UI08 creación con doble envío'
    mount('/iniciativas/nueva', auth)
    await fill(title)
    const form = screen.getByRole('form', { name: 'Publicar iniciativa' })
    fireEvent.submit(form); fireEvent.submit(form)
    const notice = await screen.findByText('La iniciativa se publicó correctamente.', {}, { timeout: 10000 })
    expect(document.activeElement).toBe(notice)
    const catalogue = await initiativesService.list({ q: title, size: 50 })
    expect(catalogue.pagination.total).toBe(1)
    const saved = (await initiativesService.getById(catalogue.data[0].id)).data
    expect(saved.state).toBe('published')
    expect(saved.description).toBe(input.description)
    expect(saved.problem).toBe(input.problem)
    expect(saved.beneficiaries).toBe(input.beneficiaries)
    expect(saved.tags).toEqual(input.tags)
    expect(saved.memberCount).toBe(1)
    expect(saved.owner.id).toBe(auth.user.id)
  })

  it('edita, conserva identidad/equipo/creación y persiste al montar nuevamente el detalle', async () => {
    const auth = await login()
    const before = (await initiativesService.create({ ...input, title: 'Prueba UI08 edición inicial' })).data
    const app = mount(`/iniciativas/${before.id}/editar`, auth)
    await screen.findByRole('form', { name: 'Editar iniciativa' }, { timeout: 10000 })
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Prueba UI08 edición persistida' } })
    fireEvent.change(screen.getByLabelText('Visibilidad'), { target: { value: 'private' } })
    fireEvent.change(screen.getByLabelText('Etiqueta 1'), { target: { value: 'edición-persistida' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    const notice = await screen.findByText('Los cambios de la iniciativa se guardaron correctamente.', {}, { timeout: 10000 })
    expect(document.activeElement).toBe(notice)
    const after = (await initiativesService.getById(before.id)).data
    expect(after.id).toBe(before.id)
    expect(after.owner.id).toBe(before.owner.id)
    expect(after.createdAt).toBe(before.createdAt)
    expect(after.memberCount).toBe(before.memberCount)
    expect(after.visibility).toBe('private')
    expect(after.tags).toEqual(['edición-persistida'])
    app.unmount()
    mount(`/iniciativas/${before.id}`, auth)
    await screen.findByRole('heading', { level: 1, name: 'Prueba UI08 edición persistida' }, { timeout: 10000 })
    expect(screen.getByText('Privada')).toBeDefined()
  })

  it('cancelar con cambios no ejecuta actualización y vuelve al detalle original', async () => {
    const auth = await login()
    const before = (await initiativesService.create({ ...input, title: 'Prueba UI08 descarte' })).data
    mount(`/iniciativas/${before.id}/editar`, auth)
    await screen.findByRole('form', { name: 'Editar iniciativa' }, { timeout: 10000 })
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'No debe persistir' } })
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    fireEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Seguir editando' }))
    expect(screen.getByLabelText('Título').value).toBe('No debe persistir')
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Descartar y salir' }))
    await screen.findByRole('heading', { level: 1, name: before.title }, { timeout: 10000 })
    expect((await initiativesService.getById(before.id)).data.title).toBe(before.title)
  })

  it('Carla no recibe formulario al pegar edición de una iniciativa pública ajena', async () => {
    mount('/iniciativas/10000000-0000-4000-8000-000000000001/editar', await login('carla.outsider@example.test'))
    await screen.findByRole('heading', { name: 'No puedes editar esta iniciativa' }, { timeout: 10000 })
    expect(screen.queryByRole('form')).toBeNull()
    expect(document.body.textContent).not.toContain('Diseñar huertos piloto')
  })

  it('Ana no puede editar una archivada aunque pegue su URL', async () => {
    mount('/iniciativas/10000000-0000-4000-8000-000000000005/editar', await login())
    await screen.findByRole('heading', { name: 'La iniciativa archivada no puede editarse' }, { timeout: 10000 })
    expect(screen.queryByRole('form')).toBeNull()
  })
})
