import { Link, useParams } from 'react-router'

function EntityPlaceholderPage({ title, entityName, mode = 'detalle' }) {
  const { id } = useParams()

  return (
    <section className="page-heading" aria-labelledby="entity-title">
      <p className="eyebrow">{mode}</p>
      <h1 id="entity-title">{title}</h1>
      <p>
        {entityName} seleccionada: <code>{id}</code>
      </p>
      <p>
        Esta ruta ya obtiene el identificador de la URL. La consulta y la lógica
        de negocio se incorporarán en su tarea funcional.
      </p>
      <Link to="/">Volver al inicio</Link>
    </section>
  )
}

export default EntityPlaceholderPage
