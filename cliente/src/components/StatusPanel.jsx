const variantClasses = {
  info: 'alert-info',
  success: 'alert-success',
  warning: 'alert-warning',
  error: 'alert-danger',
  empty: 'alert-light',
}

function StatusPanel({ variant = 'info', title, children, action }) {
  const role = variant === 'error' ? 'alert' : 'status'

  return (
    <section
      className={`status-panel alert ${variantClasses[variant] ?? variantClasses.info}`}
      role={role}
    >
      {title ? <h2 className="status-panel__title">{title}</h2> : null}
      <div className="status-panel__content">{children}</div>
      {action ? <div className="status-panel__action">{action}</div> : null}
    </section>
  )
}

export default StatusPanel
