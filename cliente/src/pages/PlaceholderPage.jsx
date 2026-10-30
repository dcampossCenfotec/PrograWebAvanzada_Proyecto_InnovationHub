import { Link } from 'react-router'
import PageHeader from '../components/PageHeader.jsx'
import StatusPanel from '../components/StatusPanel.jsx'

function PlaceholderPage({ title, description, action }) {
  return (
    <>
      <PageHeader
        actions={
          action ? (
            <Link className="btn btn-primary" to={action.to}>
              {action.label}
            </Link>
          ) : null
        }
        description={description}
        eyebrow="Avance 2 · estructura inicial"
        title={title}
        titleId="placeholder-title"
      />
      <StatusPanel title="Sección en preparación" variant="info">
        <p className="mb-0">
          La navegación está disponible. Los datos y las operaciones se agregarán
          en la tarea funcional correspondiente.
        </p>
      </StatusPanel>
    </>
  )
}

export default PlaceholderPage
