import { NavLink, Outlet } from 'react-router'

const primaryLinks = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/iniciativas', label: 'Iniciativas' },
  { to: '/usuarios', label: 'Personas' },
  { to: '/mis-solicitudes', label: 'Solicitudes' },
  { to: '/proyectos', label: 'Proyectos' },
  { to: '/perfil', label: 'Perfil' },
]

function AppLayout() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#contenido-principal">
        Saltar al contenido
      </a>

      <header className="site-header">
        <div className="site-header__inner">
          <NavLink className="brand" to="/">
            Innovation Hub
          </NavLink>
          <nav aria-label="Navegación principal">
            <ul className="primary-navigation">
              {primaryLinks.map(({ to, label, end }) => (
                <li key={to}>
                  <NavLink
                    className={({ isActive }) =>
                      isActive ? 'navigation-link is-active' : 'navigation-link'
                    }
                    end={end}
                    to={to}
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="session-links" aria-label="Acceso">
            <NavLink to="/ingresar">Ingresar</NavLink>
            <NavLink to="/registro">Registrarse</NavLink>
          </div>
        </div>
      </header>

      <main className="page-container" id="contenido-principal" tabIndex="-1">
        <Outlet />
      </main>

      <footer className="site-footer">
        <p>Innovation Hub · Universidad CENFOTEC</p>
      </footer>
    </div>
  )
}

export default AppLayout
