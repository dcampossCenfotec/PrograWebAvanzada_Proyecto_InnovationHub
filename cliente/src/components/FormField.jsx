function FormField({ error, id, label, children, hint }) {
  const descriptionId = `${id}-description`
  return (
    <div className="mb-3">
      <label className="form-label fw-semibold" htmlFor={id}>{label}</label>
      {children({
        id,
        'aria-invalid': Boolean(error),
        'aria-describedby': descriptionId,
      })}
      <div className={`form-text field-error${error ? ' text-danger' : ''}`} id={descriptionId}>
        {error || hint || ''}
      </div>
    </div>
  )
}

export default FormField
