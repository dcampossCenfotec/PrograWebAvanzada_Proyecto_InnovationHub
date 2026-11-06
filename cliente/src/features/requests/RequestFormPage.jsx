
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { initiativesService } from '../../api/services/initiatives.js'
import { requestsService } from '../../api/services/requests.js'
import { usersService } from '../../api/services/users.js'
import { loadInitiativeSkills } from '../initiatives/catalog-options.js'
import { isInitiativeId } from '../initiatives/detail.js'
import { isAbortError } from '../../api/errors.js'
import { useAuth } from '../../auth/useAuth.js'
import FormField from '../../components/FormField.jsx'
import PageHeader from '../../components/PageHeader.jsx'
import StatusPanel from '../../components/StatusPanel.jsx'
import { useApiQuery } from '../../hooks/useApiQuery.js'
import { initialRequest, requestValues, validateRequest, AVAILABILITY_LABELS } from './request-form.js'

const neverEmpty = () => false

function RequestFields({ initial, skills, initiativeId, edit, requestId }) {
  const navigate = useNavigate()
  const [values, setValues] = useState(() => requestValues(initial))
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)
  const [pending, setPending] = useState(false)
  const submitted = useRef(false)
  const alive = useRef(true)
  const activeController = useRef(null)
  useEffect(() => {
    alive.current = true
    return () => { alive.current = false; activeController.current?.abort() }
  }, [])

  function change(key, value) {
    const next = { ...values, [key]: value }
    setValues(next)
    if (errors[key]) setErrors(validateRequest(next, skills).errors)
    if (submitError) setSubmitError(null)
  }

  async function submit(event) {
    event.preventDefault()
    if (submitted.current) return
    const { errors: nextErrors, input } = validateRequest(values, skills)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    submitted.current = true
    setPending(true)
    setSubmitError(null)
    activeController.current = new AbortController()
    try {
      if (edit) {
        await requestsService.update(requestId, input, { signal: activeController.current.signal })
        if (alive.current) navigate(`/solicitudes/${requestId}`, { replace: true, state: { requestUpdated: true } })
      } else {
        await initiativesService.requestParticipation(initiativeId, input, { signal: activeController.current.signal })
        if (alive.current) navigate('/iniciativas', { replace: true, state: { initiativeOperation: 'requestCreated' } })
      }
    } catch (error) {
      if (alive.current && !isAbortError(error)) {
        setSubmitError(error)
        setErrors(error.fields ?? {})
      }
    } finally {
      submitted.current = false
      if (alive.current) setPending(false)
    }
  }

  return (
    <form aria-busy={pending} className="card shadow-sm" noValidate onSubmit={submit}>
      <div className="card-body p-4 p-lg-5">
        {submitError ? (
          <StatusPanel title="No fue posible guardar la solicitud" variant="error">
            <p>{submitError.status === 409 ? 'El estado pudo cambiar o ya existe una solicitud pendiente. Consulta tus solicitudes antes de volver a intentarlo.' : submitError.message}</p>
            {submitError.status === 409 ? <Link to="/mis-solicitudes">Ver mis solicitudes</Link> : null}
          </StatusPanel>
        ) : null}
        <FormField id="request-message" label="Mensaje de presentación" error={errors.message} counter={`${values.message.trim().length}/500`}>
          {(props) => <textarea {...props} className="form-control" maxLength={500} rows={5} required value={values.message} onChange={(event) => change('message', event.target.value)} />}
        </FormField>
        <FormField id="request-skill" label="Competencia que ofreces" error={errors.offeredSkillId} hint="Solo aparecen competencias registradas en tu perfil.">
          {(props) => <select {...props} className="form-select" required value={values.offeredSkillId} onChange={(event) => change('offeredSkillId', event.target.value)}><option value="">Selecciona una competencia</option>{skills.map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}</select>}
        </FormField>
        <FormField id="request-role" label="Rol que deseas desempeñar" error={errors.role} counter={`${values.role.trim().length}/100`}>
          {(props) => <input {...props} className="form-control" maxLength={100} required value={values.role} onChange={(event) => change('role', event.target.value)} />}
        </FormField>
        <FormField id="request-availability" label="Disponibilidad" error={errors.availability}>
          {(props) => <select {...props} className="form-select" value={values.availability} onChange={(event) => change('availability', event.target.value)}>{Object.entries(AVAILABILITY_LABELS).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select>}
        </FormField>
        <p className="text-secondary small">Enviar la solicitud no te incorpora automáticamente al equipo. El propietario debe aceptarla.</p>
        <div className="d-flex flex-wrap gap-2">
          <button disabled={pending || skills.length === 0} className="btn btn-primary" type="submit">{pending ? 'Guardando…' : edit ? 'Guardar cambios' : 'Enviar solicitud'}</button>
          <Link className="btn btn-outline-secondary" to={edit ? `/solicitudes/${requestId}` : `/iniciativas/${initiativeId}`}>Volver sin guardar</Link>
        </div>
      </div>
    </form>
  )
}

function RequestFormLoader({ id, edit, userId }) {
  const load = useCallback(async ({ signal }) => {
    const [subject, profileResponse, skillsResponse] = await Promise.all([
      edit ? requestsService.getById(id, { signal }) : initiativesService.getById(id, { signal }),
      usersService.getById(userId, { signal }),
      loadInitiativeSkills({ signal }),
    ])
    const entity = subject.data
    if (edit) {
      if (entity.applicant?.id !== userId || entity.state !== 'pending') {
        const error = new Error('La solicitud no es editable para tu cuenta.')
        error.status = entity.applicant?.id !== userId ? 403 : 409
        throw error
      }
    } else if (entity.access?.canRequest !== true) {
      const error = new Error('No está permitido solicitar participación en esta iniciativa.')
      error.status = 403
      throw error
    }
    const userSkillIds = new Set(profileResponse.data.skills?.map(({ skillId }) => skillId) ?? [])
    const skills = skillsResponse.data.filter((skill) => userSkillIds.has(skill.id))
    return { entity, skills }
  }, [id, edit, userId])
  const query = useApiQuery({ queryKey: `request-form:${edit}:${id}:${userId}`, queryFn: load, isEmpty: neverEmpty })
  if (query.status === 'loading' || query.status === 'idle') return <StatusPanel title="Cargando formulario"><p>Consultando permisos y competencias de tu perfil.</p></StatusPanel>
  if (query.status === 'error') return <StatusPanel variant="error" title="No es posible abrir el formulario" action={<div className="d-flex gap-2"><Link className="btn btn-outline-primary" to={edit ? '/mis-solicitudes' : '/iniciativas'}>Volver</Link>{![403, 404, 409].includes(query.error.status) ? <button className="btn btn-outline-danger" onClick={query.retry} type="button">Reintentar</button> : null}</div>}><p>{query.error.message}</p></StatusPanel>
  if (!query.data.skills.length) return <StatusPanel variant="warning" title="Primero agrega una competencia a tu perfil" action={<Link className="btn btn-primary" to="/perfil">Editar mi perfil</Link>}><p>Necesitas ofrecer al menos una competencia válida para participar.</p></StatusPanel>
  return <RequestFields edit={edit} initial={edit ? query.data.entity : initialRequest} initiativeId={edit ? query.data.entity.initiative.id : id} key={`${id}:${edit}`} requestId={id} skills={query.data.skills} />
}

export function RequestFormPage({ edit = false }) {
  const { id } = useParams()
  const auth = useAuth()
  return (
    <>
      <PageHeader eyebrow="Participación" title={edit ? 'Editar solicitud' : 'Solicitar participación'} description="Comparte cómo puedes colaborar con la iniciativa." />
      {!isInitiativeId(id) ? <StatusPanel variant="error" title="Identificador no válido"><p>Revisa la dirección de la página.</p></StatusPanel> : <RequestFormLoader edit={edit} id={id} key={`${id}:${auth.user?.id}`} userId={auth.user?.id} />}
    </>
  )
}
