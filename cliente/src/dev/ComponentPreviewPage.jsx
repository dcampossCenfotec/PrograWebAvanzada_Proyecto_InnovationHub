import { useState } from 'react'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import PageHeader from '../components/PageHeader.jsx'
import StatusPanel from '../components/StatusPanel.jsx'

function ComponentPreviewPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [result, setResult] = useState('Sin acción registrada.')

  function confirmExample() {
    setResult('La acción de ejemplo fue confirmada.')
    setDialogOpen(false)
  }

  function cancelExample() {
    setResult('La acción de ejemplo fue cancelada.')
    setDialogOpen(false)
  }

  return (
    <>
      <PageHeader
        actions={
          <button
            className="btn btn-danger"
            onClick={() => setDialogOpen(true)}
            type="button"
          >
            Probar confirmación
          </button>
        }
        description="Esta ruta solo existe durante el desarrollo y permite revisar los componentes compartidos sin simular funciones del producto."
        eyebrow="Herramienta de desarrollo"
        title="Vista de componentes"
      />

      <div className="d-grid gap-3">
        <StatusPanel title="Información" variant="info">
          <p className="mb-0">Mensaje informativo y no bloqueante.</p>
        </StatusPanel>
        <StatusPanel title="Operación completada" variant="success">
          <p className="mb-0">Confirmación visible para una acción correcta.</p>
        </StatusPanel>
        <StatusPanel title="Revisión necesaria" variant="warning">
          <p className="mb-0">Advertencia que requiere atención antes de continuar.</p>
        </StatusPanel>
        <StatusPanel title="No fue posible continuar" variant="error">
          <p className="mb-0">Error anunciado mediante el rol de alerta.</p>
        </StatusPanel>
        <StatusPanel title="Sin resultados" variant="empty">
          <p className="mb-0">Estado vacío diferenciado de un error.</p>
        </StatusPanel>
      </div>

      <p className="mt-4" aria-live="polite">
        {result}
      </p>

      <ConfirmDialog
        confirmLabel="Confirmar ejemplo"
        onCancel={cancelExample}
        onConfirm={confirmExample}
        open={dialogOpen}
        title="¿Confirmar esta acción de ejemplo?"
      >
        <p className="mb-0">
          Usa Escape, Cancelar o el botón de confirmación y comprueba que el foco
          regresa al botón que abrió el diálogo.
        </p>
      </ConfirmDialog>
    </>
  )
}

export default ComponentPreviewPage
