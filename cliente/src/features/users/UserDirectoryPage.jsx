import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { catalogsService } from '../../api/services/catalogs.js'
import { usersService } from '../../api/services/users.js'
import PageHeader from '../../components/PageHeader.jsx'
import StatusPanel from '../../components/StatusPanel.jsx'
import { useApiQuery } from '../../hooks/useApiQuery.js'
import { DirectoryFilters } from './DirectoryFilters.jsx'
import { UserCard } from './UserCard.jsx'

const defaultFilters = Object.freeze({
  q: '', career: '', skill: '', availability: '', size: '6', sort: 'lastName', order: 'asc',
})

function filtersFromSearch(searchParams) {
  return {
    q: searchParams.get('q') || '',
    career: searchParams.get('career') || '',
    skill: searchParams.get('skill') || '',
    availability: searchParams.get('availability') || '',
    size: searchParams.get('size') || defaultFilters.size,
    sort: searchParams.get('sort') || defaultFilters.sort,
    order: searchParams.get('order') || defaultFilters.order,
  }
}

function toDirectoryQuery(searchParams) {
  const filters = filtersFromSearch(searchParams)
  return {
    ...filters,
    q: filters.q.trim() || undefined,
    career: filters.career.trim() || undefined,
    skill: filters.skill || undefined,
    availability: filters.availability || undefined,
    page: searchParams.get('page') || '1',
    size: filters.size,
  }
}

export function UserDirectoryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchKey = searchParams.toString()
  const query = useMemo(() => toDirectoryQuery(searchParams), [searchParams])
  const listQueryFn = useCallback(({ signal }) => usersService.list(query, { signal }), [query])
  const usersQuery = useApiQuery({ queryKey: `users:${searchKey}`, queryFn: listQueryFn })
  const skillsQueryFn = useCallback(({ signal }) => catalogsService.listSkills({ page: 1, size: 50 }, { signal }), [])
  const skillsQuery = useApiQuery({ queryKey: 'directory-skills', queryFn: skillsQueryFn })
  const skills = skillsQuery.data?.data ?? []
  const skillById = new Map(skills.map((skill) => [skill.id, skill.name]))
  const filterValues = filtersFromSearch(searchParams)

  function applyFilters(values) {
    const next = new URLSearchParams()
    for (const [key, value] of Object.entries(values)) {
      const normalized = typeof value === 'string' ? value.trim() : value
      if (normalized && normalized !== defaultFilters[key]) next.set(key, normalized)
    }
    setSearchParams(next)
  }

  function changePage(page) {
    const next = new URLSearchParams(searchParams)
    if (page === 1) next.delete('page')
    else next.set('page', String(page))
    setSearchParams(next)
    document.getElementById('directory-results-title')?.focus()
  }

  const pagination = usersQuery.data?.pagination
  return (
    <>
      <PageHeader description="Busca personas por nombre, carrera, competencias y disponibilidad. Los filtros se ejecutan en el servidor." eyebrow="Comunidad" title="Personas" />

      {skillsQuery.status === 'loading' ? (
        <StatusPanel title="Cargando competencias"><p>Preparando las opciones del filtro.</p></StatusPanel>
      ) : null}
      {skillsQuery.status === 'error' ? (
        <StatusPanel action={<button className="btn btn-outline-danger" onClick={skillsQuery.retry} type="button">Reintentar catálogo</button>} title="No fue posible cargar las competencias" variant="error">
          <p>{skillsQuery.error.message}</p>
        </StatusPanel>
      ) : null}
      {skillsQuery.status === 'empty' ? (
        <StatusPanel title="Catálogo de competencias vacío" variant="warning">
          <p>El directorio sigue disponible, pero no se puede filtrar por competencia.</p>
        </StatusPanel>
      ) : null}

      <DirectoryFilters
        initialValues={filterValues}
        key={searchKey}
        onApply={applyFilters}
        onClear={() => setSearchParams({})}
        skills={skills}
      />

      <section className="section-block" aria-labelledby="directory-results-title">
        <div className="d-flex flex-wrap align-items-baseline justify-content-between gap-2 mb-4">
          <h2 className="h3 mb-0" id="directory-results-title" tabIndex="-1">Resultados</h2>
          {pagination ? <p className="text-secondary mb-0">{pagination.total} personas encontradas</p> : null}
        </div>

        {usersQuery.status === 'loading' ? (
          <StatusPanel title="Buscando personas"><p>Aplicando los filtros seleccionados.</p></StatusPanel>
        ) : null}
        {usersQuery.status === 'error' ? (
          <StatusPanel action={<button className="btn btn-outline-danger" onClick={usersQuery.retry} type="button">Reintentar</button>} title="No fue posible consultar el directorio" variant="error">
            <p>{usersQuery.error.message}</p>
          </StatusPanel>
        ) : null}
        {usersQuery.status === 'empty' ? (
          <StatusPanel action={<button className="btn btn-outline-primary" onClick={() => setSearchParams({})} type="button">Ver todas las personas</button>} title="Sin coincidencias" variant="empty">
            <p>No encontramos personas con todos los criterios seleccionados.</p>
          </StatusPanel>
        ) : null}
        {usersQuery.status === 'success' ? (
          <div className="row g-4">
            {usersQuery.data.data.map((user) => (
              <div className="col-12 col-md-6 col-xl-4" key={user.id}>
                <UserCard skillById={skillById} user={user} />
              </div>
            ))}
          </div>
        ) : null}

        {pagination?.totalPages > 1 ? (
          <nav className="directory-pagination" aria-label="Páginas del directorio">
            <button className="btn btn-outline-primary" disabled={pagination.page <= 1} onClick={() => changePage(pagination.page - 1)} type="button">Anterior</button>
            <span>Página {pagination.page} de {pagination.totalPages}</span>
            <button className="btn btn-outline-primary" disabled={pagination.page >= pagination.totalPages} onClick={() => changePage(pagination.page + 1)} type="button">Siguiente</button>
          </nav>
        ) : null}
      </section>
    </>
  )
}
