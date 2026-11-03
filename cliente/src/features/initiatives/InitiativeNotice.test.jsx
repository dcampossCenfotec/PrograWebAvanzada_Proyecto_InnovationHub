import { StrictMode, useState } from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, Link, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { InitiativeNotice } from './InitiativeNotice.jsx'

const messages = {
  created: 'La iniciativa se publicó correctamente.', updated: 'Los cambios de la iniciativa se guardaron correctamente.',
  deleted: 'La iniciativa se eliminó definitivamente.', archived: 'La iniciativa se archivó y su historial se conserva.',
}
function Page({ loading = false }) {
  const [ready, setReady] = useState(!loading)
  return <><InitiativeNotice allowed={Object.keys(messages)} ready={ready} /><button onClick={() => setReady(true)} type="button">Completar consulta</button><Link to="/otra">Salir</Link></>
}
function mount(entry, { loading = false, strict = false } = {}) {
  const router = createMemoryRouter([
    { path: '/antes', element: <p>Antes</p> },
    { path: '/iniciativas', element: <Page loading={loading} /> },
    { path: '/otra', element: <p>Otra página</p> },
  ], { initialEntries: ['/antes', entry], initialIndex: 1 })
  const provider = <RouterProvider router={router} />
  return { ...render(strict ? <StrictMode>{provider}</StrictMode> : provider), router }
}

describe('UI10: avisos consumidos una sola vez', () => {
  it.each(Object.entries(messages))('%s enfoca/consume sin borrar otros datos ni añadir entradas y no reaparece Atrás/Adelante', async (operation, message) => {
    const app = mount({ pathname: '/iniciativas', search: '?q=huertos', hash: '#resultados', state: { initiativeOperation: operation, preserved: 'dato' } })
    const notice = await screen.findByText(message)
    expect(document.activeElement).toBe(notice)
    expect(notice.getAttribute('aria-live')).toBe('polite')
    await waitFor(() => expect(app.router.state.location.state).toEqual({ preserved: 'dato' }))
    expect(app.router.state.location.search).toBe('?q=huertos')
    expect(app.router.state.location.hash).toBe('#resultados')
    fireEvent.click(screen.getByRole('link', { name: 'Salir' }))
    await screen.findByText('Otra página')
    await act(async () => app.router.navigate(-1))
    expect(screen.queryByText(message)).toBeNull()
    await act(async () => app.router.navigate(-1))
    expect(screen.getByText('Antes')).toBeDefined()
    await act(async () => app.router.navigate(1))
    expect(screen.queryByText(message)).toBeNull()
  })

  it('una recarga simulada reconstruye desde el historial consumido sin repetir el éxito', async () => {
    const app = mount({ pathname: '/iniciativas', state: { initiativeOperation: 'created' } })
    await screen.findByText(messages.created)
    await waitFor(() => expect(app.router.state.location.state).toBeNull())
    const persisted = app.router.state.location
    app.unmount()
    mount(persisted)
    expect(screen.queryByText(messages.created)).toBeNull()
  })

  it('espera datos frescos antes de mostrar y enfocar; consume aun mientras carga', async () => {
    const app = mount({ pathname: '/iniciativas', state: { initiativeOperation: 'created' } }, { loading: true })
    await waitFor(() => expect(app.router.state.location.state).toBeNull())
    expect(screen.queryByText(messages.created)).toBeNull()
    const button = screen.getByRole('button', { name: 'Completar consulta' })
    button.focus()
    fireEvent.click(button)
    expect(document.activeElement).toBe(screen.getByText(messages.created))
  })

  it('StrictMode conserva el aviso actual y consume la entrada sin ciclos', async () => {
    const app = mount({ pathname: '/iniciativas', state: { initiativeOperation: 'updated' } }, { strict: true })
    await waitFor(() => expect(app.router.state.location.state).toBeNull())
    expect(screen.getAllByText(messages.updated)).toHaveLength(1)
  })

  it('una operación desconocida no produce éxito ni modifica datos de navegación', () => {
    const app = mount({ pathname: '/iniciativas', state: { initiativeOperation: 'inexistente', preserved: true } })
    expect(screen.queryByRole('status')).toBeNull()
    expect(app.router.state.location.state).toEqual({ initiativeOperation: 'inexistente', preserved: true })
  })
})
