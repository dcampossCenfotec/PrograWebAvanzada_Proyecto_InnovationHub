import { useCallback, useEffect, useRef, useState } from 'react'
import { useBeforeUnload, useBlocker, useNavigate } from 'react-router'
import { initiativesService } from '../../api/services/initiatives.js'
import { isAbortError } from '../../api/errors.js'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import FormField from '../../components/FormField.jsx'
import StatusPanel from '../../components/StatusPanel.jsx'
import { TYPE_OPTIONS, VISIBILITY_LABELS } from './catalog.js'
import { InitiativeSkillsEditor } from './InitiativeSkillsEditor.jsx'
import { InitiativeTagsEditor } from './InitiativeTagsEditor.jsx'
import { isInitiativeId } from './detail.js'
import { INITIATIVE_TEXT_RULES, initiativeEditorSnapshot, initiativeTextLength, initiativeToValues, toInitiativePayload, validateInitiativeEditor } from './editor.js'

const fieldId = (name) => `initiative-${name}`

function InitiativeTextField({ name, rule, value, error, onChange, onBlur }) {
  const length = initiativeTextLength(value)
  const remaining = length < rule.min ? `faltan ${rule.min - length} para el mínimo`
    : length > rule.max ? `sobran ${length - rule.max}` : `quedan ${rule.max - length}`
  const props = { className: `form-control${error ? ' is-invalid' : ''}`, name, onBlur, onChange: (event) => onChange(event.target.value), required: true, value }
  return <FormField counter={`${length}/${rule.max} caracteres · ${remaining}.`} error={error} hint={`Entre ${rule.min} y ${rule.max} caracteres.`} id={fieldId(name)} label={rule.label}>
    {(inputProps) => rule.rows ? <textarea {...inputProps} {...props} rows={rule.rows} /> : <input {...inputProps} {...props} />}
  </FormField>
}

export function InitiativeEditor({ initiative, categories, skills }) {
  const editing = Boolean(initiative)
  const navigate = useNavigate()
  const [form, setForm] = useState(() => ({ values: initiativeToValues(initiative), fields: {}, serverFields: {}, touched: {}, attempted: false }))
  const { values, fields } = form
  const [baseline] = useState(() => initiativeEditorSnapshot(values))
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
    const field = name === 'tagDraft' ? 'tags' : name
    setForm((current) => {
      const next = { ...current.values, [name]: value }
      const errors = validateInitiativeEditor(next, { categories, skills, initiative })
      return {
        ...current, values: next,
        serverFields: { ...current.serverFields, [field]: undefined },
        fields: { ...current.fields, [field]: current.touched[field] || current.attempted ? errors[field] : undefined },
      }
    })
  }

  function blur(name) {
    setForm((current) => ({
      ...current, touched: { ...current.touched, [name]: true },
      fields: { ...current.fields, [name]: current.serverFields[name] ?? validateInitiativeEditor(current.values, { categories, skills, initiative })[name] },
    }))
  }

  function focusFirstError(errors) {
    document.getElementById(fieldId(Object.keys(errors)[0]))?.focus()
  }

  async function submit(event) {
    event.preventDefault()
    if (submittingRef.current || permissionLost) return
    const errors = validateInitiativeEditor(values, { categories, skills, initiative })
    setForm((current) => ({ ...current, fields: errors, serverFields: {}, attempted: true }))
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
      setForm((current) => ({ ...current, fields: safeFields, serverFields: safeFields }))
      setRequestError(error)
    } finally {
      submittingRef.current = false
      if (active.current) setSubmitting(false)
    }
  }

  const errorMessage = permissionLost ? 'Ya no hay permiso para guardar esta iniciativa. No se enviarán nuevos cambios.'
    : requestError?.status === 400 ? 'Revisa los campos señalados. Lo escrito permanece en el formulario.'
      : requestError?.status === 409 ? 'La iniciativa cambió o su estado impide guardar. Lo escrito permanece en el formulario; consulta el detalle antes de volver a guardar.'
        : `No se pudo confirmar el guardado. Lo escrito permanece en el formulario.${editing ? '' : ' Revisa Mis iniciativas antes de volver a publicar para evitar duplicados.'}`

  const errorPanel = requestError ? <div ref={errorRef} tabIndex="-1"><StatusPanel title="No fue posible guardar la iniciativa" variant="error"><p>{errorMessage}</p>{!permissionLost && ![400, 409].includes(requestError.status) ? <button className="btn btn-outline-primary" onClick={() => navigate('/mis-iniciativas')} type="button">Revisar Mis iniciativas</button> : null}</StatusPanel></div> : null

  return (
    <>
      {permissionLost ? errorPanel : null}
      {!permissionLost ? (
        <form aria-label={editing ? 'Editar iniciativa' : 'Publicar iniciativa'} className="card shadow-sm initiative-form" noValidate onSubmit={submit}>
          <div className="card-body p-4 p-lg-5">
            <p className="text-secondary">Todos los campos son obligatorios, excepto las etiquetas. Los espacios al inicio y al final de los textos no cuentan para sus límites.</p>
            <fieldset disabled={submitting}>
              <legend className="h4 mb-4">Información de la iniciativa</legend>
              {Object.entries(INITIATIVE_TEXT_RULES).map(([name, rule]) => <InitiativeTextField error={fields[name]} key={name} name={name} onBlur={() => blur(name)} onChange={(value) => change(name, value)} rule={rule} value={values[name]} />)}
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <FormField error={fields.type} id={fieldId('type')} label="Tipo de iniciativa">
                    {(inputProps) => <select {...inputProps} className="form-select" name="type" onBlur={() => blur('type')} onChange={(event) => change('type', event.target.value)} required value={values.type}>{TYPE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>}
                  </FormField>
                </div>
                <div className="col-12 col-md-6">
                  <FormField error={fields.categoryId} id={fieldId('categoryId')} label="Categoría">
                    {(inputProps) => <select {...inputProps} className="form-select" name="categoryId" onBlur={() => blur('categoryId')} onChange={(event) => change('categoryId', event.target.value)} required value={values.categoryId}><option value="">Selecciona una categoría</option>{values.categoryId && !categories.some(({ id }) => id === values.categoryId) ? <option disabled value={values.categoryId}>Categoría anterior no disponible</option> : null}{categories.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}</select>}
                  </FormField>
                </div>
                <div className="col-12 col-md-6">
                  <FormField error={fields.estimatedMembers} hint="Es una estimación, no un cupo máximo. Incluye al propietario." id={fieldId('estimatedMembers')} label="Estimación de integrantes">
                    {(inputProps) => <input {...inputProps} className="form-control" inputMode="numeric" max="100" min="1" name="estimatedMembers" onBlur={() => blur('estimatedMembers')} onChange={(event) => change('estimatedMembers', event.target.value)} required step="1" type="number" value={values.estimatedMembers} />}
                  </FormField>
                </div>
                <div className="col-12 col-md-6">
                  <FormField error={fields.visibility} hint="Pública: cualquiera. Institucional: con sesión. Restringida: resumen visible con sesión; detalle solo para equipo/propietario. Privada: solo equipo/propietario." id={fieldId('visibility')} label="Visibilidad">
                    {(inputProps) => <select {...inputProps} className="form-select" name="visibility" onBlur={() => blur('visibility')} onChange={(event) => change('visibility', event.target.value)} required value={values.visibility}>{Object.entries(VISIBILITY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>}
                  </FormField>
                </div>
              </div>
              <InitiativeSkillsEditor disabled={submitting} error={fields.skillIds} initialSkills={initiative?.skills} onBlur={() => blur('skillIds')} onChange={(ids) => change('skillIds', ids)} skills={skills} value={values.skillIds} />
              <InitiativeTagsEditor disabled={submitting} draft={values.tagDraft} error={fields.tags} onBlur={() => blur('tags')} onChange={(tags) => change('tags', tags)} onDraftChange={(draft) => change('tagDraft', draft)} value={values.tags} />
            </fieldset>
            {errorPanel}
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
