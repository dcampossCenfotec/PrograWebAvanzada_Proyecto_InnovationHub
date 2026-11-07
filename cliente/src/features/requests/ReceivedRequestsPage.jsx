
import { useCallback, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { requestsService } from '../../api/services/requests.js'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import PageHeader from '../../components/PageHeader.jsx'
import StatusPanel from '../../components/StatusPanel.jsx'
import { useApiQuery } from '../../hooks/useApiQuery.js'
import { REQUEST_STATES } from './request-form.js'

const DEFAULTS = {
  initiativeId: '', state: '', skill: '', role: '',
  from: '', to: '', sort: 'createdAt', order: 'desc',
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const iso = (date, end = false) =>
  date ? `${date}T${end ? '23:59:59' : '00:00:00'}Z` : ''

export function ReceivedRequestsPage() {
  const [params, setParams] = useSearchParams()
  const [draft, setDraft] = useState(() =>
    Object.fromEntries(
      Object.keys(DEFAULTS).map((key) => [
        key, params.get(key) ?? DEFAULTS[key],
      ]),
    ),
  )

  const [selection, setSelection] = useState(null)
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState('')
  const working = useRef(false)

  const page = Number(params.get('page') ?? 1)

  const query = useMemo(() => ({
    scope: 'received',
    page,
    size: 12,
    ...Object.fromEntries(
      ['initiativeId', 'state', 'skill', 'role', 'sort', 'order']
        .map((key) => [key, params.get(key)])
        .filter(([, value]) => value),
    ),
    ...(params.get('from')
      ? { from: iso(params.get('from')) } : {}),
    ...(params.get('to')
      ? { to: iso(params.get('to'), true) } : {}),
  }), [params, page])

  const load = useCallback(
    ({ signal }) => requestsService.list(query, { signal }),
    [query],
  )

  const invalid =
    !Number.isSafeInteger(page) ||
    page < 1 ||
    (query.initiativeId && !UUID.test(query.initiativeId)) ||
    (query.skill && !UUID.test(query.skill)) ||
    (query.from && Number.isNaN(Date.parse(query.from))) ||
    (query.to && Number.isNaN(Date.parse(query.to))) ||
    (query.from && query.to && query.from > query.to)

  const result = useApiQuery({
    queryKey: `received:${params.toString()}`,
    queryFn: load,
    enabled: !invalid,
  })

  function apply(event) {
    event.preventDefault()
    const next = new URLSearchParams()

    for (const [key, value] of Object.entries(draft)) {
      if (value) next.set(key, value.trim())
    }

    setParams(next)
  }

  function changePage(next) {
    const updated = new URLSearchParams(params)
    if (next === 1) updated.delete('page')
    else updated.set('page', String(next))
    setParams(updated)
  }

  async function decide() {
    if (!selection || working.current) return

    working.current = true
    setBusy(true)
    setNotice('')
    setActionError('')

    try {
      await requestsService.decide(selection.item.id, {
        decision: selection.decision,
        comment: comment.trim() || null,
      })

      setSelection(null)
      setComment('')
      setNotice(
        'La decisión se registró. El equipo se actualiza desde la base de datos.',
      )
      result.retry()
    } catch (error) {
      setSelection(null)
      setActionError(
        error.status === 409
          ? 'La solicitud cambió en otra sesión. Revisa el estado actualizado.'
          : error.message,
      )
      result.retry()
    } finally {
      working.current = false
      setBusy(false)
    }
  }

  function field(key, label, type = 'text') {
    return (
      <div className="col-12 col-md-4" key={key}>
        <label className="form-label" htmlFor={`received-${key}`}>
          {label}
        </label>
        <input
          className="form-control"
          id={`received-${key}`}
          type={type}
          value={draft[key]}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              [key]: event.target.value,
            }))
          }
        />
      </div>
    )
  }

  const pagination = result.data?.pagination

  return (
    <>
      <PageHeader
        eyebrow="Colaboración"
        title="Solicitudes recibidas"
        description="Revisa y resuelve las solicitudes de tus iniciativas. Solo el propietario puede decidir."
      />

      <form className="card card-body mb-4" onSubmit={apply}>
        <div className="row g-3">
          {field('initiativeId', 'UUID de iniciativa')}

          <div className="col-12 col-md-4">
            <label htmlFor="received-state" className="form-label">
              Estado
            </label>
            <select
              id="received-state"
              className="form-select"
              value={draft.state}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  state: event.target.value,
                }))
              }
            >
              <option value="">Todos</option>
              {Object.entries(REQUEST_STATES).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {field('skill', 'UUID de competencia')}
          {field('role', 'Rol contiene')}
          {field('from', 'Desde', 'date')}
          {field('to', 'Hasta', 'date')}

          <div className="col-12 col-md-4">
            <label className="form-label" htmlFor="received-sort">
              Ordenar por
            </label>
            <select
              id="received-sort"
              className="form-select"
              value={draft.sort}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  sort: event.target.value,
                }))
              }
            >
              <option value="createdAt">Creación</option>
              <option value="updatedAt">Actualización</option>
              <option value="state">Estado</option>
            </select>
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label" htmlFor="received-order">
              Dirección
            </label>
            <select
              className="form-select"
              id="received-order"
              value={draft.order}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  order: event.target.value,
                }))
              }
            >
              <option value="desc">Descendente</option>
              <option value="asc">Ascendente</option>
            </select>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2 mt-3">
          <button className="btn btn-primary" type="submit">
            Aplicar filtros
          </button>
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={() => {
              setDraft(DEFAULTS)
              setParams({})
            }}
          >
            Limpiar
          </button>
        </div>
      </form>

      {notice ? (
        <p className="alert alert-success" role="status">{notice}</p>
      ) : null}

      {actionError ? (
        <StatusPanel title="No se confirmó la decisión" variant="error">
          <p>{actionError}</p>
        </StatusPanel>
      ) : null}

      {invalid ? (
        <StatusPanel variant="error" title="Filtros inválidos">
          <p>
            Corrige el UUID o el rango de fechas y vuelve a aplicar los filtros.
          </p>
        </StatusPanel>
      ) : null}

      {!invalid && ['loading', 'idle'].includes(result.status) ? (
        <StatusPanel title="Consultando solicitudes">
          <p>Cargando solicitudes recibidas.</p>
        </StatusPanel>
      ) : null}

      {!invalid && result.status === 'error' ? (
        <StatusPanel
          variant="error"
          title="No se pudo consultar"
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

      {!invalid && result.status === 'empty' ? (
        <StatusPanel variant="empty" title="Sin solicitudes">
          <p>
            No existen solicitudes que coincidan con los filtros actuales.
          </p>
        </StatusPanel>
      ) : null}

      {!invalid && result.status === 'success' ? (
        <section aria-label="Solicitudes recibidas">
          <p aria-live="polite">
            {pagination.total} solicitudes encontradas
          </p>

          <div className="row g-3">
            {result.data.data.map((item) => (
              <article key={item.id} className="col-12 col-lg-6">
                <div className="card h-100">
                  <div className="card-body">
                    <h2 className="h5">{item.initiative.title}</h2>
                    <p>
                      {item.applicant.firstName} {item.applicant.lastName}
                      {' · '}{item.offeredSkill.name}
                    </p>
                    <p>
                      <strong>Rol:</strong> {item.role}
                      {' · '}
                      <strong>Estado:</strong> {REQUEST_STATES[item.state]}
                    </p>
                    <p style={{ whiteSpace: 'pre-wrap' }}>
                      {item.message}
                    </p>
                    <Link
                      className="btn btn-outline-primary me-2"
                      to={`/solicitudes/${item.id}`}
                    >
                      Ver detalle
                    </Link>
                    {item.state === 'pending' ? (
                      <>
                        <button
                          className="btn btn-primary me-2"
                          type="button"
                          onClick={() => {
                            setSelection({ item, decision: 'accepted' })
                            setComment('')
                          }}
                        >
                          Aceptar
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          type="button"
                          onClick={() => {
                            setSelection({ item, decision: 'rejected' })
                            setComment('')
                          }}
                        >
                          Rechazar
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {pagination?.totalPages > 1 ? (
        <nav
          className="d-flex gap-3 mt-4 align-items-center"
          aria-label="Páginas de solicitudes"
        >
          <button
            className="btn btn-outline-primary"
            type="button"
            disabled={page <= 1}
            onClick={() => changePage(page - 1)}
          >
            Anterior
          </button>
          <span>Página {page} de {pagination.totalPages}</span>
          <button
            className="btn btn-outline-primary"
            type="button"
            disabled={page >= pagination.totalPages}
            onClick={() => changePage(page + 1)}
          >
            Siguiente
          </button>
        </nav>
      ) : null}

      <ConfirmDialog
        title={selection?.decision === 'accepted'
          ? 'Aceptar solicitud' : 'Rechazar solicitud'}
        open={Boolean(selection)}
        pending={busy}
        onCancel={() => setSelection(null)}
        onConfirm={decide}
        confirmLabel="Confirmar decisión"
      >
        <p>
          Confirma tu decisión sobre la solicitud de{' '}
          {selection?.item.applicant.firstName}.
          La aceptación incorporará al solicitante al equipo.
        </p>
        <label className="form-label" htmlFor="decision-comment">
          Comentario opcional
        </label>
        <textarea
          className="form-control"
          id="decision-comment"
          maxLength={500}
          rows={3}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
        />
      </ConfirmDialog>
    </>
  )
}
