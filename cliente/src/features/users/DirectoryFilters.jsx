import { useState } from 'react'
import { AVAILABILITY_OPTIONS } from './profile.js'

export function DirectoryFilters({ initialValues, skills, onApply, onClear }) {
  const [values, setValues] = useState(initialValues)

  function updateField(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onApply(values)
  }

  return (
    <form className="card directory-filters shadow-sm" onSubmit={handleSubmit}>
      <div className="card-body p-4">
        <h2 className="h4">Buscar colaboradores</h2>
        <div className="row g-3">
          <div className="col-12 col-lg-6">
            <label className="form-label" htmlFor="directory-query">Nombre o texto del perfil</label>
            <input className="form-control" id="directory-query" maxLength="100" name="q" onChange={updateField} placeholder="Ej. Ana o investigación" value={values.q} />
          </div>
          <div className="col-12 col-lg-6">
            <label className="form-label" htmlFor="directory-career">Carrera o área exacta</label>
            <input className="form-control" id="directory-career" maxLength="100" name="career" onChange={updateField} placeholder="Ej. Ingeniería del Software" value={values.career} />
          </div>
          <div className="col-12 col-md-6 col-lg-4">
            <label className="form-label" htmlFor="directory-skill">Competencia</label>
            <select className="form-select" id="directory-skill" name="skill" onChange={updateField} value={values.skill}>
              <option value="">Todas</option>
              {skills.map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}
            </select>
          </div>
          <div className="col-12 col-md-6 col-lg-4">
            <label className="form-label" htmlFor="directory-availability">Disponibilidad</label>
            <select className="form-select" id="directory-availability" name="availability" onChange={updateField} value={values.availability}>
              <option value="">Todas</option>
              {AVAILABILITY_OPTIONS.map(([optionValue, label]) => <option key={optionValue} value={optionValue}>{label}</option>)}
            </select>
          </div>
          <div className="col-12 col-md-6 col-lg-4">
            <label className="form-label" htmlFor="directory-size">Resultados por página</label>
            <select className="form-select" id="directory-size" name="size" onChange={updateField} value={values.size}>
              <option value="2">2</option>
              <option value="6">6</option>
              <option value="12">12</option>
              <option value="24">24</option>
            </select>
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="directory-sort">Ordenar por</label>
            <select className="form-select" id="directory-sort" name="sort" onChange={updateField} value={values.sort}>
              <option value="lastName">Apellidos</option>
              <option value="firstName">Nombre</option>
              <option value="career">Carrera o área</option>
              <option value="createdAt">Fecha de registro</option>
            </select>
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="directory-order">Dirección</label>
            <select className="form-select" id="directory-order" name="order" onChange={updateField} value={values.order}>
              <option value="asc">Ascendente</option>
              <option value="desc">Descendente</option>
            </select>
          </div>
        </div>
        <div className="d-flex flex-wrap gap-2 mt-4">
          <button className="btn btn-primary" type="submit">Aplicar filtros</button>
          <button className="btn btn-outline-secondary" onClick={onClear} type="button">Limpiar filtros</button>
        </div>
      </div>
    </form>
  )
}
