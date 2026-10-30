import { Link } from 'react-router'

function NotFoundPage() {
  return (
    <section className="page-heading" aria-labelledby="not-found-title">
      <p className="eyebrow">Error 404</p>
      <h1 id="not-found-title">Página no encontrada</h1>
      <p>La dirección no corresponde a una ruta disponible.</p>
      <Link className="button-link" to="/">
        Volver al inicio
      </Link>
    </section>
  )
}

export default NotFoundPage
