import { Outlet } from 'react-router'
import Navbar from './Navbar.jsx'

function AppLayout() {
  return (
    <div className="app-shell">
      <a className="visually-hidden-focusable skip-link" href="#contenido-principal">
        Saltar al contenido
      </a>
      <Navbar />

      <main className="container-xl page-container" id="contenido-principal" tabIndex="-1">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container-xl">
          <p className="mb-1 fw-semibold">Innovation Hub</p>
          <p className="mb-0">Universidad CENFOTEC · Programación Web Avanzada</p>
        </div>
      </footer>
    </div>
  )
}

export default AppLayout
