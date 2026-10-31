import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router'
import { useAuth } from '../auth/useAuth.js'

const publicLinks = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/iniciativas', label: 'Iniciativas' },
  { to: '/proyectos', label: 'Proyectos' },
]

const authenticatedLinks = [
  { to: '/usuarios', label: 'Personas' },
  { to: '/mis-solicitudes', label: 'Solicitudes' },
]

function Navbar() {
  const auth = useAuth()
  const [expanded, setExpanded] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const [loggingOut, setLoggingOut] = useState(false)
  const toggleRef = useRef(null)
  const links = auth.status === 'authenticated'
    ? [...publicLinks, ...authenticatedLinks]
    : publicLinks

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

  async function handleLogout() {
    if (loggingOut) return
    setLoggingOut(true)
    setLogoutError('')
    try {
      await auth.logout()
      closeMenu()
    } catch (error) {
      setLogoutError(`${error.message} La sesión sigue activa; reintenta para revocarla.`)
    } finally {
      setLoggingOut(false)
    }
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
              {links.map(({ to, label, end }) => (
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

            {auth.status === 'authenticated' ? (
              <div className="session-links d-flex flex-column flex-lg-row align-items-lg-center gap-2">
                <NavLink className="session-identity" onClick={closeMenu} to="/perfil">
                  <span className="session-identity__label">Sesión de</span>
                  <span>{auth.user.firstName} {auth.user.lastName}</span>
                </NavLink>
                <button className="btn btn-outline-primary" disabled={loggingOut} onClick={handleLogout} type="button">
                  {loggingOut ? 'Cerrando…' : 'Cerrar sesión'}
                </button>
              </div>
            ) : auth.status === 'loading' ? (
              <span className="text-secondary" role="status">Comprobando sesión…</span>
            ) : auth.status === 'error' ? (
              <button className="btn btn-outline-danger" onClick={auth.retryRestore} type="button">
                Reintentar sesión
              </button>
            ) : (
              <div className="session-links d-flex flex-column flex-lg-row gap-2">
                <NavLink className="btn btn-outline-primary" onClick={closeMenu} to="/ingresar">Ingresar</NavLink>
                <NavLink className="btn btn-primary" onClick={closeMenu} to="/registro">Registrarse</NavLink>
              </div>
            )}
          </div>
        </div>
      </nav>
      {logoutError ? (
        <div className="container-xl pb-2" role="alert">
          <div className="alert alert-danger mb-0">{logoutError}</div>
        </div>
      ) : null}
    </header>
  )
}

export default Navbar
