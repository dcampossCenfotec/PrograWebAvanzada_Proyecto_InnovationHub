import { Link } from 'react-router'

const destinations = [
  {
    to: '/iniciativas',
    title: 'Explorar iniciativas',
    description: 'Consultar ideas, necesidades y retos de la comunidad.',
  },
  {
    to: '/usuarios',
    title: 'Encontrar colaboradores',
    description: 'Conocer perfiles y competencias de otros miembros.',
  },
  {
    to: '/proyectos',
    title: 'Ver proyectos',
    description: 'Revisar iniciativas que ya avanzaron a ejecución.',
  },
]

function HomePage() {
  return (
    <>
      <section className="page-heading" aria-labelledby="home-title">
        <p className="eyebrow">Comunidad universitaria</p>
        <h1 id="home-title">Conecta ideas con personas</h1>
        <p>
          Esta es la base navegable del Avance 2. Los datos reales y las
          operaciones se incorporarán en las siguientes tareas.
        </p>
        <div className="button-row">
          <Link className="button-link" to="/iniciativas">
            Explorar iniciativas
          </Link>
          <Link className="button-link button-link--secondary" to="/registro">
            Crear una cuenta
          </Link>
        </div>
      </section>

      <section aria-labelledby="destinations-title">
        <h2 id="destinations-title">Rutas principales</h2>
        <div className="placeholder-grid">
          {destinations.map(({ to, title, description }) => (
            <article className="placeholder-card" key={to}>
              <h3>{title}</h3>
              <p>{description}</p>
              <Link to={to}>Abrir sección</Link>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

export default HomePage
