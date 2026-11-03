import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { authService } from '../../api/services/auth.js'
import { initiativesService } from '../../api/services/initiatives.js'
import { setAccessToken } from '../../api/session.js'
import { AuthContext } from '../../auth/auth-context.js'
import { CatalogPage } from './CatalogPage.jsx'
import { InitiativeDetailPage } from './InitiativeDetailPage.jsx'

const enabled = import.meta.env.VITE_RUN_API_INTEGRATION === 'true'
const publicId = '10000000-0000-4000-8000-000000000001'
const restrictedId = '10000000-0000-4000-8000-000000000003'
const institutionalId = '10000000-0000-4000-8000-000000000004'
const privateId = '10000000-0000-4000-8000-000000000006'
const archiveId = '10000000-0000-4000-8000-000000000002'
const input = {
  title: 'Prueba UI07 borrado físico', type: 'idea', summary: 'Iniciativa temporal para verificar la confirmación visual.',
  description: 'Iniciativa temporal sin solicitudes ni otros integrantes.',
  problem: 'Se necesita verificar el flujo de borrado desde React.', beneficiaries: 'Equipo de pruebas',
  categoryId: 'education', skillIds: ['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'],
  estimatedMembers: 2, visibility: 'public', tags: ['prueba-ui07'],
}
const showModal = HTMLDialogElement.prototype.showModal
const close = HTMLDialogElement.prototype.close
let testToken = null
function mount(id, auth = { status: 'anonymous', user: null }) {
  return render(<AuthContext.Provider value={auth}><MemoryRouter initialEntries={[`/iniciativas/${id}`]}><Routes><Route element={<InitiativeDetailPage />} path="/iniciativas/:id" /><Route element={<CatalogPage mine />} path="/mis-iniciativas" /></Routes></MemoryRouter></AuthContext.Provider>)
}
async function login(email = 'ana.owner@example.test') {
  const result = await authService.login({ email, password: 'DemoSegura2026' })
  testToken = result.data.accessToken
  setAccessToken(testToken)
  return { status: 'authenticated', user: result.data.user }
}

// Esta suite modifica exclusivamente fixtures de una API de test aislada.
// El seed debe estar limpio; nunca apuntarla a la API de desarrollo.
describe.skipIf(!enabled)('UI07 con Express y MongoDB reales', () => {
  beforeAll(() => {
    if (!/127\.0\.0\.1:3002\/api\/?$/.test(import.meta.env.VITE_API_BASE_URL ?? '')) throw new Error('UI07 requiere la API aislada en 127.0.0.1:3002/api.')
    HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
    HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); this.dispatchEvent(new Event('close')) }
  })
  afterAll(() => {
    HTMLDialogElement.prototype.showModal = showModal
    HTMLDialogElement.prototype.close = close
  })
  afterEach(async () => {
    if (testToken) {
      setAccessToken(testToken)
      try { await authService.logout() } finally { testToken = null; setAccessToken(null) }
    }
  })

  it('visitante consulta descripción completa de una pública', async () => {
    mount(publicId)
    await screen.findByRole('heading', { level: 1, name: 'Huertos escolares' }, { timeout: 10000 })
    expect(screen.getByText('Estudiantes y docentes')).toBeDefined()
    expect(screen.getByRole('link', { name: 'Ingresar para colaborar' })).toBeDefined()
  })
  it.each([[institutionalId, 'Inicia sesión para continuar'], [privateId, 'Iniciativa no disponible']])('visitante recibe denegación segura en %s', async (id, title) => {
    mount(id)
    await screen.findByRole('heading', { level: 1, name: title }, { timeout: 10000 })
    expect(screen.queryByRole('heading', { name: 'Descripción' })).toBeNull()
  })
  it('Carla recibe 403 al pegar la URL restringida', async () => {
    mount(restrictedId, await login('carla.outsider@example.test'))
    await screen.findByRole('heading', { level: 1, name: 'Acceso no permitido' }, { timeout: 10000 })
    expect(document.body.textContent).not.toContain('clasificar residuos comunes')
  })
  it('Ana consulta privada con acciones de propietaria', async () => {
    mount(privateId, await login())
    await screen.findByRole('heading', { level: 1, name: 'Datos de calidad del aire' }, { timeout: 10000 })
    expect(screen.getByRole('link', { name: 'Editar iniciativa' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Eliminar iniciativa' })).toBeDefined()
  })
  it('Elena consulta iniciativa de su equipo sin acciones de propietaria', async () => {
    mount(archiveId, await login('elena.member@example.test'))
    await screen.findByRole('heading', { level: 1, name: 'Accesibilidad urbana' }, { timeout: 10000 })
    expect(screen.queryByRole('link', { name: 'Editar iniciativa' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Eliminar iniciativa' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Solicitar participación' })).toBeNull()
  })
  it('cancelar no escribe; confirmar un alta sin historial borra y enfoca el aviso', async () => {
    const auth = await login()
    const created = await initiativesService.create(input)
    mount(created.data.id, auth)
    fireEvent.click(await screen.findByRole('button', { name: 'Eliminar iniciativa' }, { timeout: 10000 }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancelar' }))
    expect((await initiativesService.getById(created.data.id)).data.id).toBe(created.data.id)
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar iniciativa' }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Eliminar definitivamente' }))
    const notice = await screen.findByText('La iniciativa se eliminó definitivamente.', {}, { timeout: 10000 })
    await waitFor(() => expect(document.activeElement).toBe(notice))
    await expect(initiativesService.getById(created.data.id)).rejects.toMatchObject({ status: 404 })
  })
  it('archiva voluntariamente una iniciativa sin historial y la conserva', async () => {
    const auth = await login()
    const created = await initiativesService.create({ ...input, title: 'Prueba UI07 archivo voluntario' })
    mount(created.data.id, auth)
    fireEvent.click(await screen.findByRole('button', { name: 'Archivar iniciativa' }, { timeout: 10000 }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Confirmar archivo' }))
    await screen.findByText('La iniciativa se archivó y su historial se conserva.', {}, { timeout: 10000 })
    expect((await initiativesService.getById(created.data.id)).data.state).toBe('archived')
    expect((await initiativesService.listMine({ size: 50 })).data.some((item) => item.id === created.data.id)).toBe(true)
    await initiativesService.remove(created.data.id)
  })
  it('confirma archivo con historial y conserva detalle con estado archivado', async () => {
    mount(archiveId, await login())
    fireEvent.click(await screen.findByRole('button', { name: 'Eliminar iniciativa' }, { timeout: 10000 }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Eliminar definitivamente' }))
    await screen.findByRole('heading', { name: 'No se puede eliminar esta iniciativa' }, { timeout: 10000 })
    expect((await initiativesService.getById(archiveId)).data.state).toBe('forming_team')
    fireEvent.click(screen.getByRole('button', { name: 'Consultar estado actual' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Archivar iniciativa' }, { timeout: 10000 }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Confirmar archivo' }))
    await screen.findByText('La iniciativa se archivó y su historial se conserva.', {}, { timeout: 10000 })
    const archived = (await initiativesService.getById(archiveId)).data
    expect(archived.state).toBe('archived')
    expect(archived.memberCount).toBeGreaterThan(1)
    expect((await initiativesService.list({ size: 50 })).data.some((item) => item.id === archiveId)).toBe(false)
    expect((await initiativesService.listMine({ size: 50 })).data.some((item) => item.id === archiveId)).toBe(true)
  })
})
