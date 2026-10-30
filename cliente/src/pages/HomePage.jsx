import { Link } from 'react-router'
import PageHeader from '../components/PageHeader.jsx'

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
      <section className="site-hero">
        <PageHeader
          actions={
            <>
              <Link className="btn btn-primary" to="/iniciativas">
                Explorar iniciativas
              </Link>
              <Link className="btn btn-outline-primary" to="/registro">
                Crear una cuenta
              </Link>
            </>
          }
          description="Descubre ideas, necesidades y retos de la comunidad universitaria y encuentra personas con quienes llevarlos adelante."
          eyebrow="Comunidad universitaria"
          title="Conecta ideas con personas"
          titleId="home-title"
        />
      </section>

      <section className="section-block" aria-labelledby="destinations-title">
        <h2 id="destinations-title">Rutas principales</h2>
        <div className="row g-4">
          {destinations.map(({ to, title, description }) => (
            <div className="col-12 col-md-6 col-lg-4" key={to}>
              <article className="card h-100 shadow-sm">
                <div className="card-body d-flex flex-column">
                  <h3 className="h5 card-title">{title}</h3>
                  <p className="card-text flex-grow-1">{description}</p>
                  <Link className="card-link stretched-link" to={to}>
                    Abrir sección
                  </Link>
                </div>
              </article>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

export default HomePage
