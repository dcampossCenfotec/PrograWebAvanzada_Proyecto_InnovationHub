import { useEffect, useId, useRef } from 'react'

function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
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
    onCancel()
  }

  function handleBackdropClick(event) {
    if (event.target === dialogRef.current) onCancel()
  }

  return (
    <dialog
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
            onClick={onCancel}
            ref={cancelButtonRef}
            type="button"
          >
            {cancelLabel}
          </button>
          <button
            className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            type="button"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  )
}

export default ConfirmDialog
