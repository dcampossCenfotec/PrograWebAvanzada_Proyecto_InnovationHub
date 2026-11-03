import { useEffect, useRef, useState } from 'react'
import { initiativeTagKey } from './editor.js'

export function InitiativeTagsEditor({ value, onChange, draft, onDraftChange, error, onBlur, disabled = false }) {
  const [localError, setLocalError] = useState('')
  const inputRef = useRef(null)
  const focusTarget = useRef(null)
  const message = localError || error

  useEffect(() => {
    if (focusTarget.current) {
      document.getElementById(focusTarget.current)?.focus()
      focusTarget.current = null
    }
  }, [value])

  function add() {
    if (disabled) return
    const tag = draft.trim()
    if (!tag) setLocalError('Escribe una etiqueta antes de agregar.')
    else if (tag.length > 40) setLocalError('Cada etiqueta acepta como máximo 40 caracteres.')
    else if (value.some(({ value: existing }) => initiativeTagKey(existing) === initiativeTagKey(tag))) setLocalError('Esta etiqueta ya está agregada, incluso con otras mayúsculas o tildes.')
    else if (value.length >= 10) setLocalError('Puedes agregar como máximo 10 etiquetas.')
    else {
      onChange([...value, { key: crypto.randomUUID(), value: tag }])
      onDraftChange('')
      setLocalError('')
    }
    inputRef.current?.focus()
  }

  function remove(key) {
    if (disabled) return
    const index = value.findIndex((tag) => tag.key === key)
    const next = value[index + 1] ?? value[index - 1]
    focusTarget.current = next ? `initiative-tag-remove-${next.key}` : 'initiative-new-tag'
    onChange(value.filter((tag) => tag.key !== key))
    setLocalError('')
  }

  return (
    <fieldset aria-describedby="initiative-tags-description" aria-invalid={Boolean(message)} className="initiative-form__group" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) onBlur?.() }} id="initiative-tags" tabIndex="-1">
      <legend className="h5">Etiquetas (opcional)</legend>
      <p className={`form-text${message ? ' text-danger' : ''}`} id="initiative-tags-description" role={message ? 'alert' : undefined}>{message || `${value.length}/10 etiquetas. Escribe una etiqueta y agrégala con Enter o el botón; las comas forman parte de la etiqueta.`}</p>
      <label className="form-label" htmlFor="initiative-new-tag">Etiqueta por agregar</label>
      <div className="initiative-control-entry">
        <input aria-describedby="initiative-tags-description initiative-tag-length" aria-invalid={Boolean(localError)} className="form-control" disabled={disabled} id="initiative-new-tag" onChange={(event) => { onDraftChange(event.target.value); setLocalError('') }} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); if (!event.nativeEvent.isComposing && event.keyCode !== 229) add() } }} ref={inputRef} value={draft} />
        <button className="btn btn-outline-primary" disabled={disabled} onClick={add} type="button">Agregar etiqueta</button>
      </div>
      <p className="form-text" id="initiative-tag-length">{draft.trim().length}/40 caracteres.</p>
      {value.length ? <ul aria-label="Etiquetas agregadas" className="initiative-chip-list">
        {value.map((tag) => <li className="initiative-chip" key={tag.key}><span>{tag.value}</span><button aria-label={`Quitar etiqueta ${tag.value}`} disabled={disabled} id={`initiative-tag-remove-${tag.key}`} onClick={() => remove(tag.key)} type="button"><span aria-hidden="true">×</span></button></li>)}
      </ul> : <p className="text-secondary mb-0">No has agregado etiquetas.</p>}
    </fieldset>
  )
}
