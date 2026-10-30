import { useCallback, useState } from 'react'
import { apiConfig } from '../api/config.js'
import { catalogsService } from '../api/services/catalogs.js'
import PageHeader from '../components/PageHeader.jsx'
import StatusPanel from '../components/StatusPanel.jsx'
import { useApiQuery } from '../hooks/useApiQuery.js'

function ApiPreviewPage() {
  const [search, setSearch] = useState('')
  const normalizedSearch = search.trim()
  const loadSkills = useCallback(
    ({ signal }) =>
      catalogsService.listSkills(
        { q: normalizedSearch, page: 1, size: 12 },
        { signal },
      ),
    [normalizedSearch],
  )
  const isEmpty = useCallback((payload) => payload?.data?.length === 0, [])
  const query = useApiQuery({
    queryKey: `skills:${normalizedSearch}`,
    queryFn: loadSkills,
    isEmpty,
  })

  return (
    <>
      <PageHeader
        eyebrow="Ruta exclusiva de desarrollo"
        title="Diagnóstico del cliente HTTP"
        description="Consulta el catálogo de competencias mediante la misma capa que usarán las pantallas funcionales."
      />

      <div className="row g-4">
        <section className="col-lg-5" aria-labelledby="api-settings-title">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h2 className="h5" id="api-settings-title">Configuración activa</h2>
              <dl className="mb-4">
                <dt>Modo</dt>
                <dd><code>{apiConfig.mode}</code></dd>
                <dt>URL base</dt>
                <dd><code>{apiConfig.baseUrl}</code></dd>
              </dl>

              <label className="form-label" htmlFor="api-skill-search">
                Buscar competencia
              </label>
              <input
                className="form-control"
                id="api-skill-search"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Ejemplo: desarrollo"
                type="search"
                value={search}
              />
              <p className="form-text mb-0">
                Una sola letra produce el error 400 definido por el contrato. Una
                búsqueda sin coincidencias permite revisar el estado vacío.
              </p>
            </div>
          </div>
        </section>

        <section className="col-lg-7" aria-live="polite" aria-busy={query.status === 'loading'}>
          {query.status === 'loading' ? (
            <StatusPanel title="Consultando competencias">
              Espera mientras se procesa la solicitud.
            </StatusPanel>
          ) : null}

          {query.status === 'error' ? (
            <StatusPanel
              variant="error"
              title={`${query.error.code}: ${query.error.message}`}
              action={(
                <button className="btn btn-outline-danger" onClick={query.retry} type="button">
                  Reintentar
                </button>
              )}
            >
              Estado HTTP: {query.error.status || 'sin respuesta'}
            </StatusPanel>
          ) : null}

          {query.status === 'empty' ? (
            <StatusPanel variant="empty" title="Sin coincidencias">
              Cambia la búsqueda para volver a consultar el catálogo.
            </StatusPanel>
          ) : null}

          {query.status === 'success' ? (
            <div className="card shadow-sm">
              <div className="card-body">
                <h2 className="h5">Competencias recibidas</h2>
                <ul className="list-group list-group-flush">
                  {query.data.data.map((skill) => (
                    <li className="list-group-item px-0" key={skill.id}>{skill.name}</li>
                  ))}
                </ul>
                <p className="text-body-secondary mb-0 mt-3">
                  Página {query.data.pagination.page} de {query.data.pagination.totalPages}
                  {' · '}{query.data.pagination.total} resultados
                </p>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </>
  )
}

export default ApiPreviewPage
