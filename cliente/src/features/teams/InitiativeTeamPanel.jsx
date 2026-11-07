
import { useCallback, useRef, useState } from 'react'
import { membersService } from '../../api/services/members.js'
import { useAuth } from '../../auth/useAuth.js'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import StatusPanel from '../../components/StatusPanel.jsx'
import { useApiQuery } from '../../hooks/useApiQuery.js'

export function InitiativeTeamPanel({
  initiativeId,
  ownerId,
  onChanged,
}) {
  const { user } = useAuth()
  const [target, setTarget] = useState(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const busy = useRef(false)

  const load = useCallback(
    ({ signal }) => membersService.list(
      initiativeId,
      { page, size: 12, sort: 'joinedAt', order: 'asc' },
      { signal },
    ),
    [initiativeId, page],
  )

  const result = useApiQuery({
    queryKey: `members:${initiativeId}:${page}:${user?.id ?? 'visitor'}`,
    queryFn: load,
  })

  const owner = Boolean(user && user.id === ownerId)

  async function remove() {
    if (!target || !owner || busy.current ||
        target.user.id === ownerId) return

    busy.current = true
    setPending(true)
    setError('')

    try {
      await membersService.remove(initiativeId, target.user.id)
      setTarget(null)
      result.retry()
      onChanged?.()
    } catch (problem) {
      setTarget(null)
      setError(problem.status === 409
        ? 'El equipo cambió. Actualiza la lista antes de volver a intentar.'
        : problem.message)
      result.retry()
    } finally {
      busy.current = false
      setPending(false)
    }
  }

  const pagination = result.data?.pagination

  return (
    <section className="card shadow-sm mt-4" aria-label="Equipo activo">
      <div className="card-body p-4">
        <h2 className="h4">Equipo activo</h2>

        {error ? (
          <p className="alert alert-danger" role="alert">{error}</p>
        ) : null}

        {['loading', 'idle'].includes(result.status) ? (
          <p role="status">Cargando equipo…</p>
        ) : null}

        {result.status === 'error' ? (
          <StatusPanel
            title="No se pudo consultar el equipo"
            variant="error"
            action={
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={result.retry}
              >
                Reintentar
              </button>
            }
          >
            <p>{result.error.message}</p>
          </StatusPanel>
        ) : null}

        {result.status === 'empty' ? (
          <p>No hay miembros activos en esta página.</p>
        ) : null}

        {result.status === 'success' ? (
          <ul className="list-group">
            {result.data.data.map((member) => (
              <li
                key={member.id}
                className="list-group-item d-flex flex-wrap justify-content-between gap-2 align-items-center"
              >
                <span>
                  <strong>
                    {member.user.firstName} {member.user.lastName}
                  </strong>
                  {' — '}{member.role}
                  {member.user.id === ownerId ? ' (propietario)' : ''}
                </span>

                {owner && member.user.id !== ownerId ? (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => setTarget(member)}
                  >
                    Retirar
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}

        {pagination?.totalPages > 1 ? (
          <nav
            aria-label="Páginas del equipo"
            className="d-flex gap-2 align-items-center mt-3"
          >
            <button
              className="btn btn-outline-primary"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              type="button"
            >
              Anterior
            </button>
            <span>{page} de {pagination.totalPages}</span>
            <button
              className="btn btn-outline-primary"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              type="button"
            >
              Siguiente
            </button>
          </nav>
        ) : null}

        <ConfirmDialog
          title="Retirar miembro"
          open={Boolean(target)}
          pending={pending}
          onCancel={() => setTarget(null)}
          onConfirm={remove}
          confirmLabel="Confirmar retiro"
        >
          <p>
            Retirar a {target?.user.firstName} revoca sus permisos
            de equipo. La historia de membresías se conservará.
          </p>
        </ConfirmDialog>
      </div>
    </section>
  )
}
