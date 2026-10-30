import { Link, useParams } from 'react-router'
import PageHeader from '../components/PageHeader.jsx'
import StatusPanel from '../components/StatusPanel.jsx'

function EntityPlaceholderPage({ title, entityName, mode = 'detalle' }) {
  const { id } = useParams()

  return (
    <>
      <PageHeader
        description={`${entityName} seleccionada: ${id}`}
        eyebrow={mode}
        title={title}
        titleId="entity-title"
      />
      <StatusPanel
        action={<Link to="/">Volver al inicio</Link>}
        title="Ruta preparada"
        variant="info"
      >
        <p>
          Identificador recibido: <code>{id}</code>
        </p>
        <p className="mb-0">
          La consulta y la lógica de negocio se incorporarán en su tarea funcional.
        </p>
      </StatusPanel>
    </>
  )
}

export default EntityPlaceholderPage
