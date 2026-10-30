import { Link } from 'react-router'
import PageHeader from '../components/PageHeader.jsx'
import StatusPanel from '../components/StatusPanel.jsx'

function NotFoundPage() {
  return (
    <>
      <PageHeader
        description="La dirección no corresponde a una ruta disponible."
        eyebrow="Error 404"
        title="Página no encontrada"
        titleId="not-found-title"
      />
      <StatusPanel
        action={
          <Link className="btn btn-primary" to="/">
            Volver al inicio
          </Link>
        }
        variant="empty"
      >
        <p className="mb-0">Revisa la dirección o regresa al inicio.</p>
      </StatusPanel>
    </>
  )
}

export default NotFoundPage
