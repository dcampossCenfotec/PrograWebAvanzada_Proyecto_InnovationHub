import { useCallback, useEffect, useRef, useState } from 'react'
import { useBeforeUnload, useBlocker, useNavigate } from 'react-router'
import { initiativesService } from '../../api/services/initiatives.js'
import { isAbortError } from '../../api/errors.js'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import FormField from '../../components/FormField.jsx'
import StatusPanel from '../../components/StatusPanel.jsx'
import { TYPE_OPTIONS, VISIBILITY_LABELS } from './catalog.js'
import { isInitiativeId } from './detail.js'
import { INITIATIVE_TEXT_RULES, initiativeEditorSnapshot, initiativeToValues, toInitiativePayload, validateInitiativeEditor } from './editor.js'

const fieldId = (name) => `initiative-${name}`

export function InitiativeEditor({ initiative, categories, skills }) {
  const editing = Boolean(initiative)
  const navigate = useNavigate()
  const [values, setValues] = useState(() => initiativeToValues(initiative))
  const [baseline] = useState(() => initiativeEditorSnapshot(values))
  const [fields, setFields] = useState({})
  const [requestError, setRequestError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)
  const navigationAllowed = useRef(false)
  const active = useRef(true)
  const controller = useRef(null)
  const errorRef = useRef(null)
  const dirty = initiativeEditorSnapshot(values) !== baseline
  const cancelDestination = editing ? `/iniciativas/${initiative.id}` : '/iniciativas'
  const permissionLost = [401, 403, 404].includes(requestError?.status)
  const shouldBlock = useCallback(({ currentLocation, nextLocation }) => (
    !navigationAllowed.current && (submittingRef.current || dirty)
      && (currentLocation.pathname !== nextLocation.pathname || currentLocation.search !== nextLocation.search)
  ), [dirty])
  const blocker = useBlocker(shouldBlock)
  const blockerRef = useRef(null)
  useEffect(() => { blockerRef.current = blocker }, [blocker])
  useBeforeUnload(useCallback((event) => {
    if (!navigationAllowed.current && (dirty || submittingRef.current)) {
      event.preventDefault()
      event.returnValue = ''
    }
  }, [dirty]))

  useEffect(() => {
    active.current = true
    return () => { active.current = false; controller.current?.abort() }
  }, [])

  useEffect(() => {
    if (!requestError) return
    const first = Object.keys(requestError.fields ?? {}).find((key) => document.getElementById(fieldId(key)))
    if (first && !permissionLost) document.getElementById(fieldId(first))?.focus()
    else errorRef.current?.focus()
  }, [permissionLost, requestError])

  function change(name, value) {
    setValues((current) => ({ ...current, [name]: value }))
    setFields((current) => ({ ...current, [name]: undefined }))
  }

  function focusFirstError(errors) {
    document.getElementById(fieldId(Object.keys(errors)[0]))?.focus()
  }

  async function submit(event) {
    event.preventDefault()
    if (submittingRef.current || permissionLost) return
    const errors = validateInitiativeEditor(values, { categories, skills, initiative })
    setFields(errors)
    setRequestError(null)
    if (Object.keys(errors).length) { focusFirstError(errors); return }
    submittingRef.current = true
    setSubmitting(true)
    controller.current = new AbortController()
    try {
      const payload = toInitiativePayload(values)
      const response = editing
        ? await initiativesService.update(initiative.id, payload, { signal: controller.current.signal })
        : await initiativesService.create(payload, { signal: controller.current.signal })
      if (!isInitiativeId(response?.data?.id) || (editing && response.data.id !== initiative.id) || (!editing && response.data.state !== 'published')) throw new Error('No se confirmó el guardado.')
      if (!active.current) return
      navigationAllowed.current = true
      if (blockerRef.current?.state === 'blocked') blockerRef.current.reset()
      navigate(editing ? `/iniciativas/${initiative.id}` : '/iniciativas', {
        replace: true, state: { initiativeOperation: editing ? 'updated' : 'created' },
      })
    } catch (error) {
      if (!active.current || isAbortError(error)) return
      const safeFields = Object.fromEntries(Object.entries(error.fields ?? {}).filter(([, message]) => typeof message === 'string'))
      setFields(safeFields)
      setRequestError(error)
    } finally {
      submittingRef.current = false
      if (active.current) setSubmitting(false)
    }
  }

  const unavailableSkills = (initiative?.skills ?? []).filter((skill) => !skills.some(({ id }) => id === skill.id))
  const skillOptions = [...skills, ...unavailableSkills]
  const errorMessage = permissionLost ? 'Ya no hay permiso para guardar esta iniciativa. No se enviarán nuevos cambios.'
    : requestError?.status === 400 ? 'Revisa los campos señalados. Lo escrito permanece en el formulario.'
      : requestError?.status === 409 ? 'La iniciativa cambió o su estado impide guardar. Lo escrito permanece en el formulario; consulta el detalle antes de volver a guardar.'
        : `No se pudo confirmar el guardado. Lo escrito permanece en el formulario.${editing ? '' : ' Revisa Mis iniciativas antes de volver a publicar para evitar duplicados.'}`

  return (
    <>
      {requestError ? <div ref={errorRef} tabIndex="-1"><StatusPanel title="No fue posible guardar la iniciativa" variant="error"><p>{errorMessage}</p>{!permissionLost && ![400, 409].includes(requestError.status) ? <button className="btn btn-outline-primary" onClick={() => navigate('/mis-iniciativas')} type="button">Revisar Mis iniciativas</button> : null}</StatusPanel></div> : null}
      {!permissionLost ? (
        <form aria-label={editing ? 'Editar iniciativa' : 'Publicar iniciativa'} className="card shadow-sm initiative-form" noValidate onSubmit={submit}>
          <div className="card-body p-4 p-lg-5">
            <p className="text-secondary">Todos los campos son obligatorios, excepto las etiquetas.</p>
            <fieldset disabled={submitting}>
              <legend className="h4 mb-4">Información de la iniciativa</legend>
              {Object.entries(INITIATIVE_TEXT_RULES).map(([name, rule]) => (
                <FormField error={fields[name]} hint={`Entre ${rule.min} y ${rule.max} caracteres.`} id={fieldId(name)} key={name} label={rule.label}>
                  {(inputProps) => rule.rows ? <textarea {...inputProps} className={`form-control${fields[name] ? ' is-invalid' : ''}`} maxLength={rule.max} minLength={rule.min} name={name} onChange={(event) => change(name, event.target.value)} required rows={rule.rows} value={values[name]} /> : <input {...inputProps} className={`form-control${fields[name] ? ' is-invalid' : ''}`} maxLength={rule.max} minLength={rule.min} name={name} onChange={(event) => change(name, event.target.value)} required value={values[name]} />}
                </FormField>
              ))}
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <FormField error={fields.type} id={fieldId('type')} label="Tipo de iniciativa">
                    {(inputProps) => <select {...inputProps} className="form-select" name="type" onChange={(event) => change('type', event.target.value)} required value={values.type}>{TYPE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>}
                  </FormField>
                </div>
                <div className="col-12 col-md-6">
                  <FormField error={fields.categoryId} id={fieldId('categoryId')} label="Categoría">
                    {(inputProps) => <select {...inputProps} className="form-select" name="categoryId" onChange={(event) => change('categoryId', event.target.value)} required value={values.categoryId}><option value="">Selecciona una categoría</option>{values.categoryId && !categories.some(({ id }) => id === values.categoryId) ? <option disabled value={values.categoryId}>Categoría anterior no disponible</option> : null}{categories.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}</select>}
                  </FormField>
                </div>
                <div className="col-12 col-md-6">
                  <FormField error={fields.estimatedMembers} hint="Es una estimación, no un cupo máximo. Incluye al propietario." id={fieldId('estimatedMembers')} label="Estimación de integrantes">
                    {(inputProps) => <input {...inputProps} className="form-control" inputMode="numeric" max="100" min="1" name="estimatedMembers" onChange={(event) => change('estimatedMembers', event.target.value)} required step="1" type="number" value={values.estimatedMembers} />}
                  </FormField>
                </div>
                <div className="col-12 col-md-6">
                  <FormField error={fields.visibility} hint="Pública: cualquiera. Institucional: con sesión. Restringida: resumen visible con sesión; detalle solo para equipo/propietario. Privada: solo equipo/propietario." id={fieldId('visibility')} label="Visibilidad">
                    {(inputProps) => <select {...inputProps} className="form-select" name="visibility" onChange={(event) => change('visibility', event.target.value)} required value={values.visibility}>{Object.entries(VISIBILITY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>}
                  </FormField>
                </div>
              </div>
              <fieldset aria-describedby="initiative-skillIds-description" aria-invalid={Boolean(fields.skillIds)} className="initiative-form__group" id={fieldId('skillIds')} tabIndex="-1">
                <legend className="h5">Competencias requeridas</legend>
                <p className={`form-text${fields.skillIds ? ' text-danger' : ''}`} id="initiative-skillIds-description">{fields.skillIds || 'Selecciona entre 1 y 10 competencias del catálogo.'}</p>
                <div className="initiative-form__skills">
                  {skillOptions.map((skill) => {
                    const available = skills.some(({ id }) => id === skill.id)
                    const checked = values.skillIds.includes(skill.id)
                    return <div className="form-check" key={skill.id}><input checked={checked} className="form-check-input" disabled={!available && !checked} id={`initiative-skill-${skill.id}`} onChange={() => change('skillIds', checked ? values.skillIds.filter((id) => id !== skill.id) : [...values.skillIds, skill.id])} type="checkbox" /><label className="form-check-label" htmlFor={`initiative-skill-${skill.id}`}>{skill.name}{!available ? ' (no disponible)' : ''}</label></div>
                  })}
                </div>
              </fieldset>
              <fieldset aria-describedby="initiative-tags-description" aria-invalid={Boolean(fields.tags)} className="initiative-form__group" id={fieldId('tags')} tabIndex="-1">
                <legend className="h5">Etiquetas (opcional)</legend>
                <p className={`form-text${fields.tags ? ' text-danger' : ''}`} id="initiative-tags-description">{fields.tags || 'Hasta 10 etiquetas, de 1 a 40 caracteres cada una. Cada fila representa una etiqueta.'}</p>
                {!values.tags.length ? <p className="text-secondary">No has agregado etiquetas.</p> : null}
                {values.tags.map((tag, index) => <div className="initiative-form__tag-row mb-3" key={tag.key}><div><label className="form-label" htmlFor={`initiative-tag-${tag.key}`}>Etiqueta {index + 1}</label><input className="form-control" id={`initiative-tag-${tag.key}`} maxLength="40" onChange={(event) => change('tags', values.tags.map((row) => row.key === tag.key ? { ...row, value: event.target.value } : row))} value={tag.value} /></div><button aria-label={`Quitar etiqueta ${index + 1}`} className="btn btn-outline-secondary" onClick={() => change('tags', values.tags.filter(({ key }) => key !== tag.key))} type="button">Quitar</button></div>)}
                <button className="btn btn-outline-primary" disabled={values.tags.length >= 10} onClick={() => change('tags', [...values.tags, { key: crypto.randomUUID(), value: '' }])} type="button">Agregar etiqueta</button>
              </fieldset>
            </fieldset>
            <div className="d-flex flex-wrap justify-content-end gap-2 mt-4">
              <button className="btn btn-outline-secondary" disabled={submitting} onClick={() => navigate(cancelDestination)} type="button">Cancelar</button>
              <button className="btn btn-primary" disabled={submitting} type="submit">{submitting ? 'Guardando…' : editing ? 'Guardar cambios' : 'Publicar iniciativa'}</button>
            </div>
          </div>
        </form>
      ) : <button className="btn btn-outline-primary" onClick={() => navigate(cancelDestination)} type="button">Volver sin guardar</button>}
      <ConfirmDialog cancelLabel="Seguir editando" confirmLabel="Descartar y salir" onCancel={() => blocker.reset?.()} onConfirm={() => blocker.proceed?.()} open={blocker.state === 'blocked'} pending={submitting} title={submitting ? 'Guardado en curso' : 'Descartar cambios sin guardar'}>
        <p className="mb-0">{submitting ? 'Espera a que termine el guardado antes de salir. El envío ya está en curso.' : 'Si sales ahora, perderás los cambios que todavía no has guardado.'}</p>
      </ConfirmDialog>
    </>
  )
}
