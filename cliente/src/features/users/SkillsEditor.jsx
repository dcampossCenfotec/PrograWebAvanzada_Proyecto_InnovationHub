import { useState } from 'react'
import { SKILL_LEVEL_OPTIONS } from './profile.js'

export function SkillsEditor({ skills, value, error, onChange }) {
  const [skillId, setSkillId] = useState('')
  const [level, setLevel] = useState('intermediate')
  const [localError, setLocalError] = useState('')
  const selectedIds = new Set(value.map((entry) => entry.skillId))
  const skillById = new Map(skills.map((skill) => [skill.id, skill.name]))

  function addSkill() {
    if (!skillId) {
      setLocalError('Selecciona una competencia.')
      return
    }
    if (selectedIds.has(skillId)) {
      setLocalError('La competencia ya está agregada.')
      return
    }
    if (value.length >= 20) {
      setLocalError('Acepta como máximo 20 competencias.')
      return
    }
    onChange([...value, { skillId, level }])
    setSkillId('')
    setLevel('intermediate')
    setLocalError('')
  }

  function updateLevel(targetSkillId, nextLevel) {
    onChange(value.map((entry) => (
      entry.skillId === targetSkillId ? { ...entry, level: nextLevel } : entry
    )))
  }

  return (
    <fieldset className="profile-skills-editor">
      <legend className="h5">Competencias</legend>
      <div className="row g-3 align-items-end">
        <div className="col-12 col-md-5">
          <label className="form-label" htmlFor="profile-new-skill">Competencia por agregar</label>
          <select className="form-select" id="profile-new-skill" onChange={(event) => { setSkillId(event.target.value); setLocalError('') }} value={skillId}>
            <option value="">Seleccionar…</option>
            {skills.map((skill) => (
              <option disabled={selectedIds.has(skill.id)} key={skill.id} value={skill.id}>{skill.name}</option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-4">
          <label className="form-label" htmlFor="profile-new-level">Nivel por agregar</label>
          <select className="form-select" id="profile-new-level" onChange={(event) => setLevel(event.target.value)} value={level}>
            {SKILL_LEVEL_OPTIONS.map(([optionValue, label]) => <option key={optionValue} value={optionValue}>{label}</option>)}
          </select>
        </div>
        <div className="col-12 col-md-3">
          <button className="btn btn-outline-primary w-100" onClick={addSkill} type="button">Agregar competencia</button>
        </div>
      </div>
      <div className="field-error text-danger mt-2" role={localError || error ? 'alert' : undefined}>{localError || error || ''}</div>

      {value.length ? (
        <ul className="profile-skill-rows">
          {value.map((entry) => {
            const name = skillById.get(entry.skillId) || 'Competencia no disponible'
            return (
              <li key={entry.skillId}>
                <span className="fw-semibold">{name}</span>
                <label className="visually-hidden" htmlFor={`skill-level-${entry.skillId}`}>Nivel de {name}</label>
                <select className="form-select" id={`skill-level-${entry.skillId}`} onChange={(event) => updateLevel(entry.skillId, event.target.value)} value={entry.level}>
                  {SKILL_LEVEL_OPTIONS.map(([optionValue, label]) => <option key={optionValue} value={optionValue}>{label}</option>)}
                </select>
                <button className="btn btn-outline-danger" onClick={() => onChange(value.filter((item) => item.skillId !== entry.skillId))} type="button">Quitar {name}</button>
              </li>
            )
          })}
        </ul>
      ) : <p className="text-secondary mt-3 mb-0">Todavía no agregaste competencias.</p>}
    </fieldset>
  )
}
