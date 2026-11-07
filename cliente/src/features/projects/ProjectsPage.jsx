
import { useCallback, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'
import { projectsService } from '../../api/services/projects.js'
import PageHeader from '../../components/PageHeader.jsx'
import StatusPanel from '../../components/StatusPanel.jsx'
import { useApiQuery } from '../../hooks/useApiQuery.js'

export function ProjectsPage() {
  const [params, setParams] = useSearchParams()

  const page = Number(params.get('page') ?? 1)
  const sort = params.get('sort') ?? 'createdAt'
  const order = params.get('order') ?? 'desc'

  const valid =
    Number.isSafeInteger(page) &&
    page > 0 &&
    ['createdAt', 'updatedAt', 'name', 'startDate'].includes(sort) &&
    ['asc', 'desc'].includes(order)

  const query = useMemo(
    () => ({ page, size: 12, sort, order }),
    [page, sort, order],
  )

  const load = useCallback(
    ({ signal }) => projectsService.list(query, { signal }),
    [query],
  )

  const result = useApiQuery({
    queryKey: `projects:${params.toString()}`,
    queryFn: load,
    enabled: valid,
  })

  function update(values) {
    setParams((current) => {
      const next = new URLSearchParams(current)

      for (const [key, value] of Object.entries(values)) {
        if (value == null || value === '') {
          next.delete(key)
        } else {
          next.set(key, String(value))
        }
      }

      return next
    })
  }

  const pagination = result.data?.pagination

  return (
    <>
      <PageHeader
        eyebrow="Colaboración"
        title="Proyectos"
        description="Proyectos de iniciativas accesibles según tu cuenta y sus permisos."
      />

      <div className="d-flex gap-3 flex-wrap mb-4">
        <div>
          <label className="form-label" htmlFor="projects-sort">
            Ordenar por
          </label>
          <select
            id="projects-sort"
            className="form-select"
            value={sort}
            onChange={(event) =>
              update({
                sort: event.target.value,
                page: null,
              })
            }
          >
            <option value="createdAt">Creación</option>
            <option value="updatedAt">Actualización</option>
            <option value="name">Nombre</option>
            <option value="startDate">Inicio</option>
          </select>
        </div>

        <div>
          <label className="form-label" htmlFor="projects-order">
            Dirección
          </label>
          <select
            id="projects-order"
            className="form-select"
            value={order}
            onChange={(event) =>
              update({
                order: event.target.value,
                page: null,
              })
            }
          >
            <option value="desc">Descendente</option>
            <option value="asc">Ascendente</option>
          </select>
        </div>
      </div>

      {!valid ? (
        <StatusPanel
          variant="error"
          title="Parámetros inválidos"
          action={
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => setParams({})}
            >
              Restablecer
            </button>
          }
        >
          <p>Revisa la página y el orden.</p>
        </StatusPanel>
      ) : null}

      {valid && ['loading', 'idle'].includes(result.status) ? (
        <StatusPanel title="Cargando proyectos">
          <p>Consultando proyectos.</p>
        </StatusPanel>
      ) : null}

      {result.status === 'error' ? (
        <StatusPanel
          title="No se pudieron cargar proyectos"
          variant="error"
          action={
            <button
              className="btn btn-outline-primary"
              type="button"
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
        <StatusPanel
          variant="empty"
          title="Sin proyectos accesibles"
        >
          <p>No se encontraron proyectos en esta página.</p>
        </StatusPanel>
      ) : null}

      {result.status === 'success' ? (
        <>
          <p aria-live="polite">
            {pagination.total} proyectos accesibles
          </p>

          <div className="row g-3">
            {result.data.data.map((project) => (
              <article
                key={project.id}
                className="col-12 col-md-6"
              >
                <div className="card h-100">
                  <div className="card-body p-4">
                    <h2 className="h5">{project.name}</h2>
                    <p>{project.description}</p>
                    <p>
                      <strong>Origen:</strong>{' '}
                      {project.sourceInitiative.title}
                    </p>
                    <p>
                      {project.memberCount} integrantes
                      {' · '}{project.state}
                    </p>
                    <Link
                      to={`/proyectos/${project.id}`}
                      className="btn btn-outline-primary"
                    >
                      Ver proyecto
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : null}

      {pagination?.totalPages > 1 ? (
        <nav
          aria-label="Páginas de proyectos"
          className="d-flex gap-3 mt-4 align-items-center"
        >
          <button
            className="btn btn-outline-primary"
            type="button"
            disabled={page <= 1}
            onClick={() => update({ page: page - 1 })}
          >
            Anterior
          </button>
          <span>{page} de {pagination.totalPages}</span>
          <button
            className="btn btn-outline-primary"
            type="button"
            disabled={page >= pagination.totalPages}
            onClick={() => update({ page: page + 1 })}
          >
            Siguiente
          </button>
        </nav>
      ) : null}
    </>
  )
}
