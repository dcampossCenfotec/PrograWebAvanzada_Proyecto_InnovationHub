import { Navigate, useLocation } from 'react-router'
import StatusPanel from '../components/StatusPanel.jsx'
import { useAuth } from './useAuth.js'

export function ProtectedRoute({ children }) {
  const auth = useAuth()
  const location = useLocation()

  if (auth.status === 'loading') {
    return (
      <StatusPanel title="Comprobando sesión">
        <p>Estamos verificando tu acceso antes de mostrar esta página.</p>
      </StatusPanel>
    )
  }

  if (auth.status === 'error') {
    return (
      <StatusPanel
        action={
          <button className="btn btn-outline-primary" onClick={auth.retryRestore} type="button">
            Reintentar
          </button>
        }
        title="No pudimos comprobar tu sesión"
        variant="error"
      >
        <p>{auth.sessionError?.message || 'Revisa la conexión con la API.'}</p>
      </StatusPanel>
    )
  }

  if (auth.status !== 'authenticated') {
    return <Navigate replace state={{ from: location }} to="/ingresar" />
  }

  return children
}
