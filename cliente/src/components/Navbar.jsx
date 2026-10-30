import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router'

const primaryLinks = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/iniciativas', label: 'Iniciativas' },
  { to: '/usuarios', label: 'Personas' },
  { to: '/mis-solicitudes', label: 'Solicitudes' },
  { to: '/proyectos', label: 'Proyectos' },
  { to: '/perfil', label: 'Perfil' },
]

function Navbar() {
  const [expanded, setExpanded] = useState(false)
  const toggleRef = useRef(null)

  useEffect(() => {
    if (!expanded) return undefined

    function closeWithEscape(event) {
      if (event.key !== 'Escape') return
      setExpanded(false)
      toggleRef.current?.focus()
    }

    document.addEventListener('keydown', closeWithEscape)
    return () => document.removeEventListener('keydown', closeWithEscape)
  }, [expanded])

  function closeMenu() {
    setExpanded(false)
  }

  return (
    <header className="site-header sticky-top">
      <nav className="navbar navbar-expand-lg" aria-label="Navegación principal">
        <div className="container-xl">
          <NavLink className="navbar-brand" onClick={closeMenu} to="/">
            <span aria-hidden="true" className="brand-mark">
              IH
            </span>
            <span>Innovation Hub</span>
          </NavLink>

          <button
            aria-controls="primary-navigation"
            aria-expanded={expanded}
            aria-label={expanded ? 'Cerrar menú principal' : 'Abrir menú principal'}
            className="navbar-toggler"
            onClick={() => setExpanded((current) => !current)}
            ref={toggleRef}
            type="button"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div
            className={`collapse navbar-collapse${expanded ? ' show' : ''}`}
            id="primary-navigation"
          >
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {primaryLinks.map(({ to, label, end }) => (
                <li className="nav-item" key={to}>
                  <NavLink
                    className={({ isActive }) =>
                      isActive ? 'nav-link active' : 'nav-link'
                    }
                    end={end}
                    onClick={closeMenu}
                    to={to}
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="session-links d-flex flex-column flex-lg-row gap-2">
              <NavLink
                className="btn btn-outline-primary"
                onClick={closeMenu}
                to="/ingresar"
              >
                Ingresar
              </NavLink>
              <NavLink className="btn btn-primary" onClick={closeMenu} to="/registro">
                Registrarse
              </NavLink>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
