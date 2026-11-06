
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router'
import { requestsService } from '../../api/services/requests.js'
import PageHeader from '../../components/PageHeader.jsx'
import StatusPanel from '../../components/StatusPanel.jsx'
import { useApiQuery } from '../../hooks/useApiQuery.js'
import { REQUEST_STATES } from './request-form.js'

function date(value) {
  return value ? new Intl.DateTimeFormat('es-CR', { dateStyle: 'medium' }).format(new Date(value)) : 'No indicada'
}

export function MyRequestsPage() {
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [cancelNotice] = useState(() => Boolean(location.state?.requestCancelled))
  useEffect(() => {
    if (!location.state?.requestCancelled) return
    const remaining = { ...location.state }
    delete remaining.requestCancelled
    navigate({ pathname: location.pathname, search: location.search }, {
      replace: true, state: Object.keys(remaining).length ? remaining : null, preventScrollReset: true,
    })
  }, [location, navigate])
  const page = Number(params.get('page') ?? 1)
  const state = params.get('state') ?? ''
  const invalid = !Number.isSafeInteger(page) || page < 1 || (state && !Object.hasOwn(REQUEST_STATES, state))
  const query = useMemo(() => ({ scope: 'mine', page, size: 12, sort: 'createdAt', order: 'desc', ...(state ? { state } : {}) }), [page, state])
  const load = useCallback(({ signal }) => requestsService.list(query, { signal }), [query])
  const results = useApiQuery({ queryKey: `my-requests:${params.toString()}`, queryFn: load, enabled: !invalid })

  function selectState(next) {
    setParams(next ? { state: next } : {})
  }
  function changePage(next) {
    const newParams = new URLSearchParams(params)
    if (next === 1) newParams.delete('page')
    else newParams.set('page', String(next))
    setParams(newParams)
  }

  return (
    <>
      <PageHeader eyebrow="Participación" title="Mis solicitudes" description="Consulta el estado de las solicitudes que has enviado. Solo puedes modificar o cancelar las pendientes." />
      {cancelNotice ? <StatusPanel variant="success" title="Solicitud cancelada"><p>La solicitud quedó cancelada y permanece en tu historial.</p></StatusPanel> : null}
      <div className="d-flex flex-wrap align-items-end gap-3 mb-4">
        <div>
          <label className="form-label fw-semibold" htmlFor="request-state-filter">Estado de la solicitud</label>
          <select id="request-state-filter" className="form-select" value={state} onChange={(event) => selectState(event.target.value)}>
            <option value="">Todos los estados</option>
            {Object.entries(REQUEST_STATES).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select>
        </div>
        <Link className="btn btn-outline-primary" to="/iniciativas">Explorar iniciativas</Link>
      </div>
      {invalid ? <StatusPanel title="Filtros no válidos" variant="error" action={<button className="btn btn-outline-primary" onClick={() => setParams({})} type="button">Restablecer</button>}><p>Revisa el estado o el número de página.</p></StatusPanel> : null}
      {!invalid && ['idle', 'loading'].includes(results.status) ? <StatusPanel title="Cargando solicitudes"><p>Consultando tu historial de participación.</p></StatusPanel> : null}
      {!invalid && results.status === 'error' ? <StatusPanel title="No fue posible consultar tus solicitudes" variant="error" action={<button className="btn btn-outline-danger" onClick={results.retry} type="button">Reintentar</button>}><p>{results.error.message}</p></StatusPanel> : null}
      {!invalid && results.status === 'empty' ? <StatusPanel title={results.data?.pagination?.total ? 'Página sin resultados' : 'Todavía no hay solicitudes'} variant="empty" action={page > 1 ? <button className="btn btn-outline-primary" onClick={() => changePage(1)} type="button">Primera página</button> : <Link className="btn btn-outline-primary" to="/iniciativas">Ver iniciativas</Link>}><p>{state ? 'No encontramos solicitudes con ese estado.' : 'Tus solicitudes aparecerán aquí cuando participes en una iniciativa.'}</p></StatusPanel> : null}
      {!invalid && results.status === 'success' ? (
        <section aria-label="Solicitudes encontradas">
          <p role="status" aria-live="polite" className="text-secondary">{results.data.pagination.total} solicitudes encontradas</p>
          <div className="row g-3">
            {results.data.data.map((item) => <article className="col-12 col-lg-6" key={item.id}>
              <div className="card shadow-sm h-100"><div className="card-body p-4">
                <div className="d-flex flex-wrap justify-content-between gap-2 align-items-center mb-2"><h2 className="h5 mb-0">{item.initiative.title}</h2><span className="badge text-bg-secondary">{REQUEST_STATES[item.state] ?? item.state}</span></div>
                <p className="mb-1"><strong>Rol:</strong> {item.role}</p>
                <p className="mb-1"><strong>Competencia:</strong> {item.offeredSkill.name}</p>
                <p className="text-secondary small">Enviada: {date(item.createdAt)}</p>
                <div className="d-flex flex-wrap gap-2"><Link className="btn btn-outline-primary" to={`/solicitudes/${item.id}`}>Ver detalle</Link>{item.state === 'pending' ? <Link className="btn btn-outline-secondary" to={`/solicitudes/${item.id}/editar`}>Editar</Link> : null}</div>
              </div></div>
            </article>)}
          </div>
          {results.data.pagination.totalPages > 1 ? (
            <nav aria-label="Paginación de solicitudes" className="d-flex align-items-center gap-3 mt-4">
              <button className="btn btn-outline-primary" type="button" disabled={page <= 1} onClick={() => changePage(page - 1)}>Anterior</button>
              <span>Página {page} de {results.data.pagination.totalPages}</span>
              <button className="btn btn-outline-primary" type="button" disabled={page >= results.data.pagination.totalPages} onClick={() => changePage(page + 1)}>Siguiente</button>
            </nav>
          ) : null}
        </section>
      ) : null}
    </>
  )
}
