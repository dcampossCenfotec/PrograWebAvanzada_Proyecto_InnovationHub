import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { catalogsService } from '../../api/services/catalogs.js'
import { usersService } from '../../api/services/users.js'
import { AuthContext } from '../../auth/auth-context.js'
import { OwnProfilePage, PublicProfilePage } from './ProfilePages.jsx'
import { UserDirectoryPage } from './UserDirectoryPage.jsx'

vi.mock('../../api/services/catalogs.js', () => ({
  catalogsService: { listSkills: vi.fn() },
}))
vi.mock('../../api/services/users.js', () => ({
  usersService: { getById: vi.fn(), list: vi.fn(), updateMe: vi.fn() },
}))

const skills = [
  { id: 'skill-design', name: 'Diseño' },
  { id: 'skill-research', name: 'Investigación' },
]
const ownProfile = {
  id: 'user-owner',
  firstName: 'Ana',
  lastName: 'Rojas',
  memberType: 'student',
  email: 'ana@example.test',
  career: 'Ingeniería del Software',
  avatarUrl: null,
  bio: 'Perfil inicial',
  interests: ['educación'],
  availability: 'high',
  portfolioUrl: null,
  skills: [{ skillId: 'skill-design', level: 'advanced' }],
  createdAt: '2026-10-10T14:00:00.000Z',
  updatedAt: '2026-10-10T14:00:00.000Z',
}
const auth = {
  status: 'authenticated',
  user: { id: ownProfile.id, firstName: 'Ana', lastName: 'Rojas' },
  updateUser: vi.fn(),
}

function renderRoute(element, path, initialEntry = path) {
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes><Route element={element} path={path} /></Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

beforeEach(() => {
  catalogsService.listSkills.mockResolvedValue({ data: skills, pagination: { page: 1, size: 50, total: 2, totalPages: 1 } })
  usersService.getById.mockResolvedValue({ data: ownProfile })
  usersService.updateMe.mockResolvedValue({
    data: { ...ownProfile, firstName: 'Ana María', updatedAt: '2026-11-02T15:00:00.000Z' },
  })
})

describe('perfil propio', () => {
  it('mantiene el correo fuera del payload y guarda competencias por ID y nivel', async () => {
    renderRoute(<OwnProfilePage />, '/perfil')
    const email = await screen.findByLabelText('Correo electrónico')
    expect(email.readOnly).toBe(true)
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana María' } })
    fireEvent.change(screen.getByLabelText('Competencia por agregar'), { target: { value: 'skill-research' } })
    fireEvent.change(screen.getByLabelText('Nivel por agregar'), { target: { value: 'intermediate' } })
    fireEvent.click(screen.getByRole('button', { name: 'Agregar competencia' }))
    fireEvent.click(screen.getByRole('button', { name: 'Guardar perfil' }))

    await screen.findByText('Perfil guardado correctamente.')
    expect(usersService.updateMe).toHaveBeenCalledTimes(1)
    const payload = usersService.updateMe.mock.calls[0][0]
    expect(payload.email).toBeUndefined()
    expect(payload.firstName).toBe('Ana María')
    expect(payload.skills).toEqual([
      { skillId: 'skill-design', level: 'advanced' },
      { skillId: 'skill-research', level: 'intermediate' },
    ])
    expect(auth.updateUser).toHaveBeenCalledWith(expect.objectContaining({ firstName: 'Ana María' }))
  })

  it('conserva los cambios cuando el servidor rechaza el formulario', async () => {
    usersService.updateMe.mockRejectedValue({
      message: 'Revisa los campos indicados.',
      fields: { bio: 'La biografía fue rechazada por el servidor.' },
    })
    renderRoute(<OwnProfilePage />, '/perfil')
    const biography = await screen.findByLabelText('Biografía')
    fireEvent.change(biography, { target: { value: 'Texto que debe conservarse' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar perfil' }))

    await screen.findByText('La biografía fue rechazada por el servidor.')
    expect(screen.getByLabelText('Biografía').value).toBe('Texto que debe conservarse')
  })
})

it('un perfil ajeno no muestra correo ni controles de edición', async () => {
  usersService.getById.mockResolvedValue({
    data: { ...ownProfile, id: 'user-other', firstName: 'Luis', email: 'filtrado@example.test' },
  })
  renderRoute(<PublicProfilePage />, '/usuarios/:id', '/usuarios/user-other')
  await screen.findByRole('heading', { name: 'Luis Rojas' })
  expect(screen.queryByText('Correo')).toBeNull()
  expect(screen.queryByRole('button', { name: 'Guardar perfil' })).toBeNull()
})

describe('directorio', () => {
  it('envía filtros al servidor y reinicia la página', async () => {
    usersService.list.mockResolvedValue({
      data: [{ ...ownProfile, email: undefined }],
      pagination: { page: 1, size: 2, total: 1, totalPages: 1 },
    })
    renderRoute(<UserDirectoryPage />, '/usuarios', '/usuarios?page=3&size=2')
    await screen.findByRole('heading', { name: 'Ana Rojas' })
    fireEvent.change(screen.getByLabelText('Nombre o texto del perfil'), { target: { value: 'Ana' } })
    fireEvent.change(screen.getByLabelText('Competencia'), { target: { value: 'skill-design' } })
    fireEvent.change(screen.getByLabelText('Disponibilidad'), { target: { value: 'high' } })
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros' }))

    await waitFor(() => expect(usersService.list).toHaveBeenLastCalledWith(
      expect.objectContaining({ q: 'Ana', skill: 'skill-design', availability: 'high', page: '1', size: '2' }),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    ))
  })

  it('presenta el estado vacío y permite limpiar filtros', async () => {
    usersService.list.mockResolvedValue({
      data: [], pagination: { page: 1, size: 6, total: 0, totalPages: 0 },
    })
    renderRoute(<UserDirectoryPage />, '/usuarios', '/usuarios?q=nadie')
    await screen.findByRole('heading', { name: 'Sin coincidencias' })
    fireEvent.click(screen.getByRole('button', { name: 'Ver todas las personas' }))
    await waitFor(() => expect(usersService.list).toHaveBeenLastCalledWith(
      expect.objectContaining({ q: undefined, page: '1' }),
      expect.anything(),
    ))
  })

  it('pagina mediante una nueva consulta sin filtrar datos descargados', async () => {
    usersService.list.mockResolvedValue({
      data: [{ ...ownProfile, email: undefined }],
      pagination: { page: 1, size: 2, total: 4, totalPages: 2 },
    })
    renderRoute(<UserDirectoryPage />, '/usuarios', '/usuarios?size=2')
    await screen.findByText('Página 1 de 2')
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))

    await waitFor(() => expect(usersService.list).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: '2', size: '2' }),
      expect.anything(),
    ))
  })
})
