
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { requestsService } from '../../api/services/requests.js'
import { useAuth } from '../../auth/useAuth.js'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import PageHeader from '../../components/PageHeader.jsx'
import StatusPanel from '../../components/StatusPanel.jsx'
import { useApiQuery } from '../../hooks/useApiQuery.js'
import { isAbortError } from '../../api/errors.js'
import { isInitiativeId } from '../initiatives/detail.js'
import { AVAILABILITY_LABELS, REQUEST_STATES } from './request-form.js'

const neverEmpty = () => false
const date = (value) => value ? new Intl.DateTimeFormat('es-CR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'No indicada'

function Detail({ id, userId, item, retry }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [confirm, setConfirm] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(null)
  const busy = useRef(false)
  const alive = useRef(true)
  const abortRef = useRef(null)
  useEffect(() => {
    alive.current = true
    return () => { alive.current = false; abortRef.current?.abort() }
  }, [])
  const isOwn = item.applicant?.id === userId
  const canChange = isOwn && item.state === 'pending'

  async function cancel() {
    if (busy.current || !canChange) return
    busy.current = true
    setPending(true)
    abortRef.current = new AbortController()
    try {
      await requestsService.cancel(id, { signal: abortRef.current.signal })
      if (alive.current) navigate('/mis-solicitudes', { replace: true, state: { requestCancelled: true } })
    } catch (problem) {
      if (alive.current && !isAbortError(problem)) { setConfirm(false); setError(problem); retry() }
    } finally {
      busy.current = false
      if (alive.current) setPending(false)
    }
  }

  return (
    <>
      {location.state?.requestUpdated ? <StatusPanel title="Solicitud actualizada" variant="success"><p>Se guardaron los cambios correctamente.</p></StatusPanel> : null}
      {error ? <StatusPanel title="No se confirmó la cancelación" variant="error"><p>El estado podría haber cambiado. Actualiza el detalle antes de volver a intentarlo.</p></StatusPanel> : null}
      <div className="card shadow-sm"><div className="card-body p-4 p-lg-5">
        <h2 className="h4">{item.initiative.title}</h2>
        <span className="badge text-bg-secondary mb-3">{REQUEST_STATES[item.state] ?? item.state}</span>
        <dl className="row">
          <dt className="col-sm-4">Solicitante</dt><dd className="col-sm-8">{item.applicant.firstName} {item.applicant.lastName}</dd>
          <dt className="col-sm-4">Competencia ofrecida</dt><dd className="col-sm-8">{item.offeredSkill.name}</dd>
          <dt className="col-sm-4">Rol solicitado</dt><dd className="col-sm-8">{item.role}</dd>
          <dt className="col-sm-4">Disponibilidad</dt><dd className="col-sm-8">{AVAILABILITY_LABELS[item.availability] ?? item.availability}</dd>
          <dt className="col-sm-4">Fecha de envío</dt><dd className="col-sm-8">{date(item.createdAt)}</dd>
          <dt className="col-sm-4">Último cambio</dt><dd className="col-sm-8">{date(item.updatedAt)}</dd>
          {item.decidedAt ? <><dt className="col-sm-4">Fecha de decisión</dt><dd className="col-sm-8">{date(item.decidedAt)}</dd></> : null}
          {item.decisionComment ? <><dt className="col-sm-4">Comentario de decisión</dt><dd className="col-sm-8">{item.decisionComment}</dd></> : null}
        </dl>
        <h3 className="h5">Mensaje de presentación</h3><p className="mb-4" style={{ whiteSpace: 'pre-wrap' }}>{item.message}</p>
        <div className="d-flex flex-wrap gap-2">
          <Link className="btn btn-outline-primary" to="/mis-solicitudes">Mis solicitudes</Link>
          <Link className="btn btn-outline-secondary" to={`/iniciativas/${item.initiative.id}`}>Iniciativa</Link>
          {canChange ? <Link className="btn btn-primary" to={`/solicitudes/${id}/editar`}>Editar solicitud</Link> : null}
          {canChange ? <button className="btn btn-outline-danger" type="button" onClick={() => setConfirm(true)}>Cancelar solicitud</button> : null}
        </div>
      </div></div>
      <ConfirmDialog title="Cancelar solicitud pendiente" open={confirm} pending={pending} onCancel={() => setConfirm(false)} onConfirm={cancel} confirmLabel="Confirmar cancelación">
        <p>La solicitud quedará en tu historial como cancelada. No se eliminará y no podrás volver a abrir este mismo intento.</p>
      </ConfirmDialog>
    </>
  )
}

export function RequestDetailPage() {
  const { id } = useParams()
  const auth = useAuth()
  const load = useCallback(({ signal }) => requestsService.getById(id, { signal }), [id])
  const result = useApiQuery({ queryKey: `request-detail:${id}`, queryFn: load, enabled: isInitiativeId(id), isEmpty: neverEmpty })
  return (
    <>
      <PageHeader eyebrow="Participación" title="Detalle de solicitud" description="Consulta el estado actual y el historial de tu participación." />
      {!isInitiativeId(id) ? <StatusPanel variant="error" title="Identificador inválido"><p>La dirección no corresponde a una solicitud válida.</p></StatusPanel> : null}
      {isInitiativeId(id) && ['loading', 'idle'].includes(result.status) ? <StatusPanel title="Cargando solicitud"><p>Verificando permisos y estado.</p></StatusPanel> : null}
      {result.status === 'error' ? <StatusPanel variant="error" title="No fue posible abrir la solicitud" action={<div className="d-flex gap-2"><Link to="/mis-solicitudes" className="btn btn-outline-primary">Volver</Link><button className="btn btn-outline-danger" onClick={result.retry} type="button">Reintentar</button></div>}><p>{result.error.message}</p></StatusPanel> : null}
      {result.status === 'success' ? <Detail id={id} item={result.data.data} retry={result.retry} userId={auth.user?.id} key={`${id}:${result.data.data.updatedAt}`} /> : null}
    </>
  )
}
