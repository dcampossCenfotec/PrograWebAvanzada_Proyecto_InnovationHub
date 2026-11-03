import { useState } from 'react'
import { OwnerPicker } from './OwnerPicker.jsx'
import { STATE_OPTIONS, TYPE_OPTIONS, validateCatalogFilters } from './catalog.js'

export function CatalogFilters({ initialValues, categories, skills, onApply, onClear, mine, authenticated, catalogsReady }) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  function update(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }
  function submit(event) {
    event.preventDefault()
    const nextErrors = validateCatalogFilters(values, { mine })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      document.getElementById(`catalog-${Object.keys(nextErrors)[0]}`)?.focus()
      return
    }
    onApply(values)
  }
  const sortOptions = [
    ['createdAt', 'Fecha de publicación'], ['updatedAt', 'Última actualización'], ['title', 'Título'],
    mine ? ['state', 'Estado'] : ['memberCount', 'Número de integrantes'],
  ]
  return (
    <form aria-label={mine ? 'Ordenar mis iniciativas' : 'Filtros de iniciativas'} className="card shadow-sm" noValidate onSubmit={submit}>
      <div className="card-body p-4">
        <h2 className="h4">{mine ? 'Orden y páginas' : 'Encuentra una iniciativa'}</h2>
        <div className="row g-3">
          {!mine ? (
            <>
              <div className="col-12 col-lg-8">
                <label className="form-label" htmlFor="catalog-q">Buscar iniciativas</label>
                <input aria-describedby={errors.q ? 'catalog-query-error' : undefined} aria-invalid={Boolean(errors.q)} className="form-control" id="catalog-q" maxLength="100" name="q" onChange={update} placeholder="Ej. huertos o educación" type="search" value={values.q} />
                {errors.q ? <p className="text-danger mt-2 mb-0" id="catalog-query-error" role="alert">{errors.q}</p> : null}
              </div>
              <div className="col-12 col-lg-4">
                <label className="form-label" htmlFor="catalog-type">Tipo</label>
                <select className="form-select" id="catalog-type" name="type" onChange={update} value={values.type}>
                  <option value="">Todos los tipos</option>
                  {TYPE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="catalog-category">Categoría</label>
                <select className="form-select" disabled={!catalogsReady.categories} id="catalog-category" name="category" onChange={update} value={values.category}>
                  <option value="">Todas las categorías</option>
                  {values.category && !categories.some((entry) => entry.id === values.category) ? <option value={values.category}>Categoría seleccionada</option> : null}
                  {categories.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="catalog-skill">Competencia requerida</label>
                <select className="form-select" disabled={!catalogsReady.skills} id="catalog-skill" name="skill" onChange={update} value={values.skill}>
                  <option value="">Todas las competencias</option>
                  {values.skill && !skills.some((entry) => entry.id === values.skill) ? <option value={values.skill}>Competencia seleccionada</option> : null}
                  {skills.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="catalog-state">Estado</label>
                <select className="form-select" id="catalog-state" name="state" onChange={update} value={values.state}>
                  <option value="">Todos los estados visibles</option>
                  {STATE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="catalog-hasSpaces">Espacios estimados</label>
                <select className="form-select" id="catalog-hasSpaces" name="hasSpaces" onChange={update} value={values.hasSpaces}>
                  <option value="">Todas las iniciativas</option>
                  <option value="true">Con espacios estimados</option>
                  <option value="false">Sin espacios estimados</option>
                </select>
              </div>
            </>
          ) : null}
          <div className="col-12 col-md-4">
            <label className="form-label" htmlFor="catalog-size">Resultados por página</label>
            <select className="form-select" id="catalog-size" name="size" onChange={update} value={values.size}>
              {[...new Set(['2', '6', '12', '24', '50', values.size])].map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label" htmlFor="catalog-sort">Ordenar por</label>
            <select className="form-select" id="catalog-sort" name="sort" onChange={update} value={values.sort}>
              {sortOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label" htmlFor="catalog-order">Dirección</label>
            <select className="form-select" id="catalog-order" name="order" onChange={update} value={values.order}>
              <option value="desc">Descendente</option><option value="asc">Ascendente</option>
            </select>
          </div>
        </div>
        {!mine ? <OwnerPicker authenticated={authenticated} onChange={(ownerId) => setValues((current) => ({ ...current, ownerId }))} value={values.ownerId} /> : null}
        <div className="d-flex flex-wrap gap-2 mt-4">
          <button className="btn btn-primary" type="submit">Aplicar filtros</button>
          <button className="btn btn-outline-secondary" onClick={onClear} type="button">Limpiar filtros</button>
        </div>
      </div>
    </form>
  )
}
