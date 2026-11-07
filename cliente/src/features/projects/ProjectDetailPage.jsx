
import { useCallback } from 'react'
import { Link, useParams } from 'react-router'
import { projectsService } from '../../api/services/projects.js'
import {
  fetchGitHubRepository,
  parseGitHubRepositoryUrl,
} from '../../api/external/github.js'
import PageHeader from '../../components/PageHeader.jsx'
import StatusPanel from '../../components/StatusPanel.jsx'
import { useApiQuery } from '../../hooks/useApiQuery.js'
import { InitiativeTeamPanel } from '../teams/InitiativeTeamPanel.jsx'
import { isInitiativeId } from '../initiatives/detail.js'

const notEmpty = () => false

function GithubSection({ url }) {
  const repo = parseGitHubRepositoryUrl(url)

  const load = useCallback(
    ({ signal }) => fetchGitHubRepository(url, { signal }),
    [url],
  )

  const result = useApiQuery({
    queryKey: `github:${url}`,
    queryFn: load,
    enabled: Boolean(repo),
    isEmpty: notEmpty,
  })

  if (!url) {
    return (
      <p>Este proyecto no tiene repositorio asociado.</p>
    )
  }

  if (!repo) {
    return (
      <p>
        El enlace no corresponde a un repositorio público
        de GitHub identificable. No se realizó una consulta externa.
      </p>
    )
  }

  return (
    <section className="card mt-4">
      <div className="card-body">
        <h2 className="h4">Repositorio en GitHub</h2>

        {['idle', 'loading'].includes(result.status) ? (
          <p role="status">Consultando GitHub…</p>
        ) : null}

        {result.status === 'error' ? (
          <StatusPanel
            variant="warning"
            title="No se pudieron obtener metadatos de GitHub"
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

        {result.status === 'success' ? (
          <dl className="row">
            <dt className="col-sm-4">Nombre</dt>
            <dd className="col-sm-8">{result.data.name}</dd>

            <dt className="col-sm-4">Propietario</dt>
            <dd className="col-sm-8">{result.data.owner}</dd>

            <dt className="col-sm-4">Descripción</dt>
            <dd className="col-sm-8">
              {result.data.description ?? 'No indicada'}
            </dd>

            <dt className="col-sm-4">Lenguaje principal</dt>
            <dd className="col-sm-8">
              {result.data.language ?? 'No especificado'}
            </dd>

            <dt className="col-sm-4">Rama principal</dt>
            <dd className="col-sm-8">
              {result.data.defaultBranch ?? 'No indicada'}
            </dd>

            <dt className="col-sm-4">Última actualización</dt>
            <dd className="col-sm-8">
              {result.data.updatedAt ?? 'No disponible'}
            </dd>

            <dt className="col-sm-4">Asuntos abiertos</dt>
            <dd className="col-sm-8">
              {result.data.openIssues ?? 'No disponible'}
            </dd>
          </dl>
        ) : null}
      </div>
    </section>
  )
}

function ProjectContent({ id }) {
  const load = useCallback(
    ({ signal }) => projectsService.getById(id, { signal }),
    [id],
  )

  const query = useApiQuery({
    queryKey: `project:${id}`,
    queryFn: load,
    isEmpty: notEmpty,
  })

  if (['loading', 'idle'].includes(query.status)) {
    return (
      <StatusPanel title="Cargando proyecto">
        <p>Verificando acceso.</p>
      </StatusPanel>
    )
  }

  if (query.status === 'error') {
    return (
      <StatusPanel
        title="No se pudo consultar el proyecto"
        variant="error"
        action={
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={query.retry}
          >
            Reintentar
          </button>
        }
      >
        <p>{query.error.message}</p>
      </StatusPanel>
    )
  }

  const project = query.data.data

  return (
    <>
      <div className="card">
        <div className="card-body p-4">
          <h2 className="h3">{project.name}</h2>
          <p>{project.description}</p>

          <dl className="row">
            <dt className="col-sm-4">Objetivo</dt>
            <dd className="col-sm-8">{project.objective}</dd>

            <dt className="col-sm-4">Propietario</dt>
            <dd className="col-sm-8">
              {project.owner.firstName} {project.owner.lastName}
            </dd>

            <dt className="col-sm-4">Estado</dt>
            <dd className="col-sm-8">{project.state}</dd>

            <dt className="col-sm-4">Fecha de inicio</dt>
            <dd className="col-sm-8">{project.startDate}</dd>

            <dt className="col-sm-4">Fin estimado</dt>
            <dd className="col-sm-8">
              {project.estimatedEndDate ?? 'No indicado'}
            </dd>

            <dt className="col-sm-4">Tecnologías</dt>
            <dd className="col-sm-8">
              {project.technologies.join(', ')}
            </dd>
          </dl>

          <Link
            className="btn btn-outline-primary"
            to={`/iniciativas/${project.sourceInitiative.id}`}
          >
            Ver iniciativa de origen: {project.sourceInitiative.title}
          </Link>
        </div>
      </div>

      <InitiativeTeamPanel
        initiativeId={project.sourceInitiative.id}
        ownerId={project.owner.id}
        onChanged={query.retry}
      />

      <GithubSection url={project.repositoryUrl} />
    </>
  )
}

export function ProjectDetailPage() {
  const { id } = useParams()

  return (
    <>
      <PageHeader eyebrow="Proyectos" title="Detalle del proyecto" />
      {isInitiativeId(id) ? (
        <ProjectContent id={id} key={id} />
      ) : (
        <StatusPanel title="Identificador inválido" variant="error">
          <p>El proyecto no tiene un identificador válido.</p>
        </StatusPanel>
      )}
    </>
  )
}
