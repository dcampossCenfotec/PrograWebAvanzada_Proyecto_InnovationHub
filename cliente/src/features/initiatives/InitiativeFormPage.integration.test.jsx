import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { authService } from '../../api/services/auth.js'
import { initiativesService } from '../../api/services/initiatives.js'
import { setAccessToken } from '../../api/session.js'
import { AuthContext } from '../../auth/auth-context.js'
import { CatalogPage } from './CatalogPage.jsx'
import { InitiativeDetailPage } from './InitiativeDetailPage.jsx'
import { InitiativeFormPage } from './InitiativeFormPage.jsx'
import { initiativeToValues, toInitiativePayload } from './editor.js'

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
    { path: '/otra', element: <p>Otra página</p> },
  ], { initialEntries: [entry] })
  return { ...render(<AuthContext.Provider value={auth}><RouterProvider router={router} /></AuthContext.Provider>), router }
}
async function fill(title) {
  await screen.findByRole('form', { name: 'Publicar iniciativa' }, { timeout: 10000 })
  for (const [label, value] of [['Título', title], ['Resumen', input.summary], ['Descripción', input.description], ['Problema que atiende', input.problem], ['Personas beneficiarias', input.beneficiaries], ['Categoría', input.categoryId], ['Estimación de integrantes', '3']]) fireEvent.change(screen.getByLabelText(label), { target: { value } })
  fireEvent.change(screen.getByLabelText('Competencia por agregar'), { target: { value: input.skillIds[0] } })
  fireEvent.click(screen.getByRole('button', { name: 'Agregar competencia' }))
  fireEvent.change(screen.getByLabelText('Etiqueta por agregar'), { target: { value: 'prueba-ui08' } })
  fireEvent.click(screen.getByRole('button', { name: 'Agregar etiqueta' }))
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
    await waitFor(() => expect(document.activeElement).toBe(notice))
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
    fireEvent.click(screen.getByRole('button', { name: 'Quitar etiqueta prueba-ui08' }))
    fireEvent.change(screen.getByLabelText('Etiqueta por agregar'), { target: { value: 'edición-persistida' } })
    fireEvent.click(screen.getByRole('button', { name: 'Agregar etiqueta' }))
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    const notice = await screen.findByText('Los cambios de la iniciativa se guardaron correctamente.', {}, { timeout: 10000 })
    await waitFor(() => expect(document.activeElement).toBe(notice))
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

  it('UI09 conserva IDs/chips al quitar, cancelar, guardar y volver a editar', async () => {
    const auth = await login()
    const design = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2'
    const web = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'
    const research = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3'
    const before = (await initiativesService.create({ ...input, title: 'Prueba UI09 colecciones persistidas', skillIds: [design, web], tags: ['conservada', 'quitar', 'última'] })).data
    const app = mount(`/iniciativas/${before.id}/editar`, auth)
    await screen.findByRole('form', { name: 'Editar iniciativa' }, { timeout: 10000 })
    fireEvent.change(screen.getByLabelText('Competencia por agregar'), { target: { value: design } })
    fireEvent.click(screen.getByRole('button', { name: 'Agregar competencia' }))
    expect(screen.getByText('Esta competencia ya está agregada.')).toBeDefined()
    fireEvent.change(screen.getByLabelText('Competencia por agregar'), { target: { value: research } })
    fireEvent.click(screen.getByRole('button', { name: 'Agregar competencia' }))
    fireEvent.click(screen.getByRole('button', { name: 'Quitar competencia Diseño' }))
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Quitar competencia' })).getByRole('button', { name: 'Cancelar' }))
    expect((await initiativesService.getById(before.id)).data.skills.map(({ id }) => id)).toEqual([design, web])
    fireEvent.click(screen.getByRole('button', { name: 'Quitar competencia Diseño' }))
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Quitar competencia' })).getByRole('button', { name: 'Quitar competencia' }))
    fireEvent.change(screen.getByLabelText('Etiqueta por agregar'), { target: { value: '  Educación  ' } })
    fireEvent.keyDown(screen.getByLabelText('Etiqueta por agregar'), { key: 'Enter' })
    fireEvent.change(screen.getByLabelText('Etiqueta por agregar'), { target: { value: 'educacion' } })
    fireEvent.click(screen.getByRole('button', { name: 'Agregar etiqueta' }))
    expect(screen.getByText(/Esta etiqueta ya está agregada/)).toBeDefined()
    fireEvent.change(screen.getByLabelText('Etiqueta por agregar'), { target: { value: 'Diseño, investigación' } })
    fireEvent.click(screen.getByRole('button', { name: 'Agregar etiqueta' }))
    fireEvent.click(screen.getByRole('button', { name: 'Quitar etiqueta quitar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    await screen.findByText('Los cambios de la iniciativa se guardaron correctamente.', {}, { timeout: 10000 })
    const saved = (await initiativesService.getById(before.id)).data
    expect(saved.skills.map(({ id }) => id)).toEqual([web, research])
    expect(saved.tags).toEqual(['conservada', 'última', 'Educación', 'Diseño, investigación'])
    app.unmount()
    mount(`/iniciativas/${before.id}/editar`, auth)
    await screen.findByRole('form', { name: 'Editar iniciativa' }, { timeout: 10000 })
    expect(within(screen.getByRole('list', { name: 'Competencias agregadas' })).getAllByRole('listitem')).toHaveLength(2)
    expect(within(screen.getByRole('list', { name: 'Etiquetas agregadas' })).getAllByRole('listitem')).toHaveLength(4)
    expect(screen.getByRole('button', { name: 'Quitar etiqueta Diseño, investigación' })).toBeDefined()
  })

  it('la API también rechaza IDs y etiquetas duplicadas sin modificar el registro', async () => {
    await login()
    const before = (await initiativesService.create({ ...input, title: 'Prueba UI09 defensa de servidor' })).data
    await expect(initiativesService.update(before.id, { ...input, skillIds: [input.skillIds[0], input.skillIds[0]] })).rejects.toMatchObject({ status: 400 })
    await expect(initiativesService.update(before.id, { ...input, tags: ['Educación', 'educacion'] })).rejects.toMatchObject({ status: 400 })
    const after = (await initiativesService.getById(before.id)).data
    expect(after.skills).toEqual(before.skills)
    expect(after.tags).toEqual(before.tags)
    expect(after.updatedAt).toBe(before.updatedAt)
  })

  it('una etiqueta pendiente bloquea publicar hasta agregarla, sin perder el texto', async () => {
    const auth = await login()
    const title = 'Prueba UI09 etiqueta pendiente'
    mount('/iniciativas/nueva', auth)
    await fill(title)
    fireEvent.change(screen.getByLabelText('Etiqueta por agregar'), { target: { value: 'pendiente' } })
    fireEvent.click(screen.getByRole('button', { name: 'Publicar iniciativa' }))
    expect(screen.getByText('Agrega la etiqueta pendiente o borra su texto antes de guardar.')).toBeDefined()
    expect((await initiativesService.list({ q: title, size: 50 })).pagination.total).toBe(0)
    fireEvent.keyDown(screen.getByLabelText('Etiqueta por agregar'), { key: 'Enter' })
    fireEvent.click(screen.getByRole('button', { name: 'Publicar iniciativa' }))
    await screen.findByText('La iniciativa se publicó correctamente.', {}, { timeout: 10000 })
    const result = await initiativesService.list({ q: title, size: 50 })
    expect(result.pagination.total).toBe(1)
    expect((await initiativesService.getById(result.data[0].id)).data.tags).toEqual(['prueba-ui08', 'pendiente'])
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

  it('UI10: creación normaliza espacios y el aviso no reaparece en historial ni al remontar', async () => {
    const auth = await login()
    const app = mount('/iniciativas/nueva', auth)
    await fill('  Prueba UI10 retorno único  ')
    fireEvent.click(screen.getByRole('button', { name: 'Publicar iniciativa' }))
    const notice = await screen.findByText('La iniciativa se publicó correctamente.', {}, { timeout: 10000 })
    await waitFor(() => expect(document.activeElement).toBe(notice))
    await waitFor(() => expect(app.router.state.location.state).toBeNull())
    const result = await initiativesService.list({ q: 'Prueba UI10 retorno único', size: 50 })
    expect(result.pagination.total).toBe(1)
    expect(result.data[0].title).toBe('Prueba UI10 retorno único')
    await act(async () => app.router.navigate('/otra'))
    await act(async () => app.router.navigate(-1))
    await screen.findByRole('link', { name: 'Ver detalle de Prueba UI10 retorno único' }, { timeout: 10000 })
    expect(screen.queryByText('La iniciativa se publicó correctamente.')).toBeNull()
    const entry = app.router.state.location.pathname
    app.unmount()
    mount(entry, auth)
    await screen.findByRole('link', { name: 'Ver detalle de Prueba UI10 retorno único' }, { timeout: 10000 })
    expect(screen.queryByText('La iniciativa se publicó correctamente.')).toBeNull()
  })

  it('UI10: límites del servidor coinciden con textos normalizados y rechazos no escriben', async () => {
    await login()
    const before = (await initiativesService.create({ ...input, title: 'Prueba UI10 límites reales' })).data
    for (const [field, min, max] of [['title', 5, 100], ['summary', 15, 240], ['description', 20, 2000], ['problem', 10, 500], ['beneficiaries', 3, 150]]) {
      for (const length of [0, min - 1, max + 1]) {
        const prior = (await initiativesService.getById(before.id)).data
        await expect(initiativesService.update(before.id, { ...input, [field]: `  ${'á'.repeat(length)}  ` })).rejects.toMatchObject({ status: 400, fields: { [field]: expect.any(String) } })
        expect((await initiativesService.getById(before.id)).data).toEqual(prior)
      }
      for (const length of [min, max]) {
        const saved = (await initiativesService.update(before.id, { ...input, [field]: `  ${'á'.repeat(length)}  ` })).data
        expect(saved[field]).toBe('á'.repeat(length))
      }
    }
  })

  it('UI10: editar con estimado superado mantiene dos, rechaza reducir y permite aumento real', async () => {
    const auth = await login()
    const id = '10000000-0000-4000-8000-000000000008'
    const before = (await initiativesService.getById(id)).data
    expect(before.estimatedMembers).toBe(2)
    expect(before.memberCount).toBe(3)
    const app = mount(`/iniciativas/${id}/editar`, auth)
    await screen.findByRole('form', { name: 'Editar iniciativa' }, { timeout: 10000 })
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Orientación laboral revisada UI10' } })
    const estimate = screen.getByLabelText('Estimación de integrantes')
    fireEvent.change(estimate, { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(screen.getByText('No puede reducirse por debajo de los miembros activos.')).toBeDefined()
    expect((await initiativesService.getById(id)).data).toEqual(before)
    await expect(initiativesService.update(id, { ...toInitiativePayload(initiativeToValues(before)), estimatedMembers: 1 })).rejects.toMatchObject({ status: 400 })
    fireEvent.change(estimate, { target: { value: '2' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    await screen.findByText('Los cambios de la iniciativa se guardaron correctamente.', {}, { timeout: 10000 })
    const saved = (await initiativesService.getById(id)).data
    expect(saved).toMatchObject({ title: 'Orientación laboral revisada UI10', estimatedMembers: 2, memberCount: 3, availableSpaces: 0 })
    expect(saved.createdAt).toBe(before.createdAt)
    expect(saved.owner.id).toBe(before.owner.id)
    await waitFor(() => expect(app.router.state.location.state).toBeNull())
    await act(async () => app.router.navigate(`/iniciativas/${id}/editar`))
    await screen.findByRole('form', { name: 'Editar iniciativa' }, { timeout: 10000 })
    fireEvent.change(screen.getByLabelText('Estimación de integrantes'), { target: { value: '4' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    await screen.findByText('Los cambios de la iniciativa se guardaron correctamente.', {}, { timeout: 10000 })
    expect((await initiativesService.getById(id)).data).toMatchObject({ estimatedMembers: 4, memberCount: 3, availableSpaces: 1 })
  })

})
