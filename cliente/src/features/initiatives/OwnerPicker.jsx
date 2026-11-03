import { useCallback, useState } from 'react'
import { usersService } from '../../api/services/users.js'
import { useApiQuery } from '../../hooks/useApiQuery.js'

export function OwnerPicker({ value, onChange, authenticated }) {
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState({ q: undefined, page: 1 })
  const [error, setError] = useState('')
  const load = useCallback(({ signal }) => usersService.list({ ...query, size: 6, sort: 'lastName', order: 'asc' }, { signal }), [query])
  const people = useApiQuery({ queryKey: `owner-options:${query.q ?? ''}:${query.page}`, queryFn: load, enabled: authenticated })
  const entries = people.status === 'success' ? people.data.data : []
  const selectedInPage = entries.some((entry) => entry.id === value)
  const pagination = people.status === 'success' ? people.data.pagination : null

  function searchPeople() {
    const q = search.trim()
    if (q && q.length < 2) { setError('Escribe al menos 2 caracteres para buscar una persona.'); return }
    setError('')
    setQuery({ q: q || undefined, page: 1 })
  }

  return (
    <fieldset className="catalog-owner-picker mt-3">
      <legend className="h6">Propietario</legend>
      <label className="form-label" htmlFor="catalog-owner">Filtrar por propietario</label>
      <select className="form-select" id="catalog-owner" onChange={(event) => onChange(event.target.value)} value={value}>
        <option value="">Todas las personas</option>
        {value && !selectedInPage ? <option value={value}>Propietario seleccionado</option> : null}
        {entries.map((entry) => <option key={entry.id} value={entry.id}>{entry.firstName} {entry.lastName}</option>)}
      </select>
      {authenticated ? (
        <>
          <label className="form-label mt-2" htmlFor="catalog-owner-search">Buscar propietario por nombre</label>
          <div className="d-flex flex-wrap gap-2">
            <input aria-describedby={error ? 'catalog-owner-error' : undefined} aria-invalid={Boolean(error)} className="form-control catalog-owner-picker__search" id="catalog-owner-search" maxLength="100" onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); searchPeople() } }} type="search" value={search} />
            <button className="btn btn-outline-primary" onClick={searchPeople} type="button">Buscar personas</button>
          </div>
          {error ? <p className="text-danger mt-2" id="catalog-owner-error" role="alert">{error}</p> : null}
          {people.status === 'loading' ? <p className="form-text" role="status">Buscando propietarios…</p> : null}
          {people.status === 'empty' ? <p className="form-text" role="status">No se encontraron personas.</p> : null}
          {people.status === 'error' ? <p className="text-danger mt-2" role="alert">No se pudieron cargar las personas. <button className="btn btn-link p-0" onClick={people.retry} type="button">Reintentar personas</button></p> : null}
          {pagination?.totalPages > 1 ? (
            <div aria-label="Páginas de propietarios" className="d-flex flex-wrap align-items-center gap-2 mt-2" role="group">
              <button className="btn btn-outline-secondary btn-sm" disabled={pagination.page <= 1} onClick={() => setQuery({ ...query, page: query.page - 1 })} type="button">Personas anteriores</button>
              <span>{pagination.page} / {pagination.totalPages}</span>
              <button className="btn btn-outline-secondary btn-sm" disabled={pagination.page >= pagination.totalPages} onClick={() => setQuery({ ...query, page: query.page + 1 })} type="button">Más personas</button>
            </div>
          ) : null}
        </>
      ) : <p className="form-text">Selecciona un propietario desde su nombre en una tarjeta para ver sus iniciativas.</p>}
    </fieldset>
  )
}
