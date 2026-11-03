import { useEffect, useRef, useState } from 'react'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'

export function InitiativeSkillsEditor({ skills, initialSkills = [], value, onChange, error, disabled = false }) {
  const [candidate, setCandidate] = useState('')
  const [localError, setLocalError] = useState('')
  const [removal, setRemoval] = useState(null)
  const focusTarget = useRef(null)
  const skillName = (id) => skills.find((skill) => skill.id === id)?.name ?? initialSkills.find((skill) => skill.id === id)?.name ?? 'Competencia no disponible'

  useEffect(() => {
    if (focusTarget.current && !removal) {
      document.getElementById(focusTarget.current)?.focus()
      focusTarget.current = null
    }
  }, [removal, value])

  function add() {
    if (disabled) return
    if (!skills.some(({ id }) => id === candidate)) setLocalError('Selecciona una competencia disponible del catálogo.')
    else if (value.includes(candidate)) setLocalError('Esta competencia ya está agregada.')
    else if (value.length >= 10) setLocalError('Puedes agregar como máximo 10 competencias.')
    else {
      onChange([...value, candidate])
      setCandidate('')
      setLocalError('')
      document.getElementById('initiative-new-skill')?.focus()
      return
    }
    document.getElementById('initiative-new-skill')?.focus()
  }

  function confirmRemoval() {
    if (disabled || !removal) return
    const index = value.indexOf(removal)
    const nextId = value[index + 1] ?? value[index - 1]
    focusTarget.current = nextId ? `initiative-skill-remove-${nextId}` : 'initiative-new-skill'
    onChange(value.filter((id) => id !== removal))
    setRemoval(null)
    setLocalError('')
  }

  const message = localError || error
  return (
    <fieldset aria-describedby="initiative-skillIds-description" aria-invalid={Boolean(message)} className="initiative-form__group" id="initiative-skillIds" tabIndex="-1">
      <legend className="h5">Competencias requeridas</legend>
      <p className={`form-text${message ? ' text-danger' : ''}`} id="initiative-skillIds-description" role={message ? 'alert' : undefined}>{message || `${value.length}/10 competencias. Agrega al menos una desde el catálogo.`}</p>
      <label className="form-label" htmlFor="initiative-new-skill">Competencia por agregar</label>
      <div className="initiative-control-entry">
        <select aria-describedby="initiative-skillIds-description" aria-invalid={Boolean(localError)} className="form-select" disabled={disabled} id="initiative-new-skill" onChange={(event) => { setCandidate(event.target.value); setLocalError('') }} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); add() } }} value={candidate}>
          <option value="">Selecciona una competencia</option>
          {skills.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
        </select>
        <button className="btn btn-outline-primary" disabled={disabled} onClick={add} type="button">Agregar competencia</button>
      </div>
      {value.length ? <ul aria-label="Competencias agregadas" className="initiative-selected-skills mt-3">
        {value.map((id) => <li key={id}><span>{skillName(id)}{!skills.some((skill) => skill.id === id) ? ' (no disponible)' : ''}</span><button aria-label={`Quitar competencia ${skillName(id)}`} className="btn btn-outline-secondary btn-sm" disabled={disabled} id={`initiative-skill-remove-${id}`} onClick={() => setRemoval(id)} type="button">Quitar</button></li>)}
      </ul> : <p className="text-secondary mt-3 mb-0">No has agregado competencias.</p>}
      <ConfirmDialog cancelLabel="Cancelar" confirmLabel="Quitar competencia" onCancel={() => setRemoval(null)} onConfirm={confirmRemoval} open={Boolean(removal)} pending={disabled} title="Quitar competencia">
        <p className="mb-0">¿Quieres quitar <strong>{removal ? skillName(removal) : ''}</strong> de las competencias requeridas? La iniciativa se actualizará cuando guardes el formulario.</p>
      </ConfirmDialog>
    </fieldset>
  )
}
