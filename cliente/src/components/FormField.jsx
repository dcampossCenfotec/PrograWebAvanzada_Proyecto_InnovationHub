function FormField({ error, id, label, children, hint, counter }) {
  const descriptionId = `${id}-description`
  return (
    <div className="mb-3">
      <label className="form-label fw-semibold" htmlFor={id}>{label}</label>
      {children({
        id,
        'aria-invalid': Boolean(error),
        'aria-describedby': counter ? `${descriptionId} ${id}-counter` : descriptionId,
      })}
      <div className={`form-text field-error${error ? ' text-danger' : ''}`} id={descriptionId}>
        {error || hint || ''}
      </div>
      {counter ? <div className="form-text" id={`${id}-counter`}>{counter}</div> : null}
    </div>
  )
}

export default FormField
