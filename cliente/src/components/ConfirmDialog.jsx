import { useEffect, useId, useRef } from 'react'

function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  pending = false,
  onConfirm,
  onCancel,
}) {
  const dialogRef = useRef(null)
  const cancelButtonRef = useRef(null)
  const previousFocusRef = useRef(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      previousFocusRef.current = document.activeElement
      dialog.showModal()
      cancelButtonRef.current?.focus()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  function restoreFocus() {
    previousFocusRef.current?.focus()
  }

  function handleCancel(event) {
    event.preventDefault()
    if (!pending) onCancel()
  }

  function handleBackdropClick(event) {
    if (!pending && event.target === dialogRef.current) onCancel()
  }

  return (
    <dialog
      aria-busy={pending}
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="confirm-dialog"
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      onClose={restoreFocus}
      ref={dialogRef}
    >
      <div className="confirm-dialog__content">
        <div className="confirm-dialog__header">
          <h2 className="h4 mb-0" id={titleId}>
            {title}
          </h2>
        </div>
        <div className="confirm-dialog__body" id={descriptionId}>
          {children}
        </div>
        <div className="confirm-dialog__footer">
          <button
            className="btn btn-outline-secondary"
            disabled={pending}
            onClick={onCancel}
            ref={cancelButtonRef}
            type="button"
          >
            {cancelLabel}
          </button>
          <button
            className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            disabled={pending}
            onClick={onConfirm}
            type="button"
          >
            {pending ? 'Procesando…' : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  )
}

export default ConfirmDialog
