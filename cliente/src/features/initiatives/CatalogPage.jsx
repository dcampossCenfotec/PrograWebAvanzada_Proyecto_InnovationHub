import { useCallback, useMemo, useRef } from 'react'
import { Link, useSearchParams } from 'react-router'
import { catalogsService } from '../../api/services/catalogs.js'
import { initiativesService } from '../../api/services/initiatives.js'
import { useAuth } from '../../auth/useAuth.js'
import PageHeader from '../../components/PageHeader.jsx'
import StatusPanel from '../../components/StatusPanel.jsx'
import { useApiQuery } from '../../hooks/useApiQuery.js'
import { CatalogFilters } from './CatalogFilters.jsx'
import { CatalogPagination } from './CatalogPagination.jsx'
import { InitiativeCard } from './InitiativeCard.jsx'
import { InitiativeNotice } from './InitiativeNotice.jsx'
import { catalogSearch, ownerCatalogueLink, readCatalogSearch } from './catalog.js'
import { loadInitiativeSkills } from './catalog-options.js'

function CatalogContent({ mine, authenticated }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchKey = searchParams.toString()
  const parsed = useMemo(() => readCatalogSearch(searchParams, { mine }), [mine, searchParams])
  const invalid = Object.keys(parsed.errors).length > 0
  const titleRef = useRef(null)
  const load = useCallback(({ signal }) => (
    mine ? initiativesService.listMine(parsed.query, { signal }) : initiativesService.list(parsed.query, { signal })
  ), [mine, parsed.query])
  const results = useApiQuery({ queryKey: `initiatives:${mine}:${searchKey}`, queryFn: load, enabled: !invalid })
  const loadCategories = useCallback(({ signal }) => catalogsService.listCategories({ signal }), [])
  const categories = useApiQuery({ queryKey: 'initiative-categories', queryFn: loadCategories, enabled: !mine })
  const skills = useApiQuery({ queryKey: 'initiative-skills', queryFn: loadInitiativeSkills, enabled: !mine })
  const ready = ['success', 'empty'].includes(results.status) && !invalid
  const pagination = ready ? results.data.pagination : null
  const filtered = !mine && ['q', 'type', 'category', 'skill', 'state', 'hasSpaces', 'ownerId'].some((key) => parsed.values[key])

  function changePage(page) {
    const next = new URLSearchParams(searchParams)
    if (page === 1) next.delete('page')
    else next.set('page', String(page))
    setSearchParams(next)
    titleRef.current?.focus()
  }

  return (
    <>
      <PageHeader
        actions={authenticated ? <Link className="btn btn-primary" to="/iniciativas/nueva">Publicar iniciativa</Link> : <Link className="btn btn-outline-primary" to="/registro">Crear una cuenta</Link>}
        description={mine ? 'Las iniciativas que has publicado, incluidas las privadas, archivadas y los borradores conservados.' : 'Descubre ideas, necesidades y retos. Combina criterios para encontrar oportunidades de colaboración.'}
        eyebrow="Comunidad universitaria"
        title={mine ? 'Mis iniciativas' : 'Iniciativas'}
      />
      <InitiativeNotice allowed={mine ? ['created', 'deleted', 'archived'] : ['created']} />
      {authenticated ? (
        <nav aria-label="Vistas de iniciativas" className="d-flex flex-wrap gap-2 mb-4">
          <Link aria-current={!mine ? 'page' : undefined} className={`btn ${mine ? 'btn-outline-primary' : 'btn-primary'}`} to="/iniciativas">Explorar iniciativas</Link>
          <Link aria-current={mine ? 'page' : undefined} className={`btn ${mine ? 'btn-primary' : 'btn-outline-primary'}`} to="/mis-iniciativas">Mis iniciativas</Link>
        </nav>
      ) : null}
      {!mine ? [['categorías', categories], ['competencias', skills]].map(([label, query]) => (
        <div key={label}>
          {query.status === 'loading' ? <p className="text-secondary" role="status">Cargando {label}…</p> : null}
          {query.status === 'error' ? (
            <StatusPanel action={<button className="btn btn-outline-danger" onClick={query.retry} type="button">Reintentar {label}</button>} title={`No se pudieron cargar las ${label}`} variant="error">
              <p>Los demás filtros y los resultados siguen disponibles.</p>
            </StatusPanel>
          ) : null}
          {query.status === 'empty' ? <p className="text-secondary" role="status">No hay {label} disponibles para filtrar.</p> : null}
        </div>
      )) : null}
      {invalid ? (
        <StatusPanel action={<button className="btn btn-outline-primary" onClick={() => setSearchParams({})} type="button">Restablecer filtros</button>} title="La dirección contiene filtros no válidos" variant="error">
          <ul>{Object.entries(parsed.errors).map(([key, message]) => <li key={key}>{message}</li>)}</ul>
        </StatusPanel>
      ) : (
        <CatalogFilters
          authenticated={authenticated}
          catalogsReady={{ categories: categories.status === 'success', skills: skills.status === 'success' }}
          categories={categories.data?.data ?? []}
          initialValues={parsed.values}
          key={searchKey}
          mine={mine}
          onApply={(values) => { setSearchParams(catalogSearch(values)); titleRef.current?.focus() }}
          onClear={() => setSearchParams({})}
          skills={skills.data?.data ?? []}
        />
      )}
      <section aria-busy={results.status === 'loading'} aria-labelledby="initiative-results-title" className="section-block">
        <div className="d-flex flex-wrap align-items-baseline justify-content-between gap-2 mb-4">
          <h2 className="h3 mb-0" id="initiative-results-title" ref={titleRef} tabIndex="-1">Resultados</h2>
          {pagination ? <p aria-live="polite" className="text-secondary mb-0">{pagination.total} {pagination.total === 1 ? 'iniciativa encontrada' : 'iniciativas encontradas'}</p> : null}
        </div>
        {!mine ? <p className="text-secondary">La cantidad de integrantes es una estimación y puede superarse. Los espacios indicados no son un cupo máximo.</p> : null}
        {!invalid && results.status === 'loading' ? <StatusPanel title="Buscando iniciativas"><p>Preparando los resultados.</p></StatusPanel> : null}
        {!invalid && results.status === 'error' ? (
          <StatusPanel action={<button className="btn btn-outline-danger" onClick={results.retry} type="button">Reintentar iniciativas</button>} title="No fue posible cargar las iniciativas" variant="error">
            <p>{results.error.message}</p>
          </StatusPanel>
        ) : null}
        {ready && results.status === 'empty' ? (
          <StatusPanel
            action={pagination.total > 0 ? <button className="btn btn-outline-primary" onClick={() => changePage(1)} type="button">Ir a primera página</button>
              : filtered ? <button className="btn btn-outline-primary" onClick={() => setSearchParams({})} type="button">Ver todas las iniciativas</button>
                : authenticated ? <Link className="btn btn-primary" to="/iniciativas/nueva">Publicar la primera iniciativa</Link> : null}
            title={pagination.total > 0 ? 'Página sin resultados' : filtered ? 'Sin coincidencias' : mine ? 'Aún no has publicado iniciativas' : 'Todavía no hay iniciativas'}
            variant="empty"
          >
            <p>{pagination.total > 0 ? 'La página solicitada no contiene elementos. Regresa al inicio de los resultados.' : filtered ? 'No encontramos iniciativas con todos los criterios seleccionados.' : 'Las iniciativas disponibles aparecerán aquí.'}</p>
          </StatusPanel>
        ) : null}
        {ready && results.status === 'success' ? (
          <div className="row g-4">
            {results.data.data.map((initiative) => (
              <div className="col-12 col-md-6 col-xl-4" key={initiative.id}>
                <InitiativeCard initiative={initiative} ownerLink={(ownerId) => ownerCatalogueLink(searchParams, ownerId, { mine })} />
              </div>
            ))}
          </div>
        ) : null}
        <CatalogPagination onPage={changePage} pagination={pagination} />
      </section>
    </>
  )
}

export function CatalogPage({ mine = false }) {
  const auth = useAuth()
  if (auth.status === 'loading') return <StatusPanel title="Comprobando sesión"><p>Preparando las iniciativas que puedes consultar.</p></StatusPanel>
  if (auth.status === 'error') {
    return <StatusPanel action={<button className="btn btn-outline-primary" onClick={auth.retryRestore} type="button">Reintentar sesión</button>} title="No pudimos comprobar tu sesión" variant="error"><p>{auth.sessionError?.message}</p></StatusPanel>
  }
  // Remontar al cambiar de identidad evita conservar tarjetas privadas al salir.
  return <CatalogContent authenticated={auth.status === 'authenticated'} key={`${mine}:${auth.status}:${auth.user?.id ?? 'visitor'}`} mine={mine} />
}
