import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router'
import { initiativesService } from '../../api/services/initiatives.js'
import { useAuth } from '../../auth/useAuth.js'
import PageHeader from '../../components/PageHeader.jsx'
import StatusPanel from '../../components/StatusPanel.jsx'
import { useApiQuery } from '../../hooks/useApiQuery.js'
import { InitiativeDetails } from './InitiativeDetails.jsx'
import { isInitiativeId } from './detail.js'

const neverEmpty = () => false

function DetailError({ error, id, retry, mutation = false }) {
  const status = error?.status
  let title = mutation ? 'No fue posible confirmar la operación' : 'No fue posible cargar la iniciativa'
  let message = mutation ? 'El resultado no está confirmado. Consulta de nuevo el detalle antes de repetir la acción.' : 'Intenta consultar nuevamente cuando la conexión esté disponible.'
  if (!mutation && status === 400) { title = 'Dirección de iniciativa no válida'; message = 'Revisa la dirección o vuelve al catálogo.' }
  if (status === 401) { title = 'Inicia sesión para continuar'; message = 'Necesitas una sesión válida para consultar esta iniciativa o realizar la acción.' }
  if (status === 403) { title = 'Acceso no permitido'; message = 'Tu cuenta no tiene permiso para consultar esta iniciativa o realizar la acción.' }
  if (status === 404) { title = 'Iniciativa no disponible'; message = 'No encontramos una iniciativa disponible para tu cuenta en esta dirección.' }
  if (mutation && error?.code === 'INITIATIVE_HAS_HISTORY') { title = 'No se puede eliminar esta iniciativa'; message = 'Tiene historial relacionado y se conserva sin cambios. Si aún no está archivada, puedes volver al detalle y elegir Archivar para retirarla del catálogo.' }
  else if (mutation && status === 409) { title = 'La iniciativa cambió'; message = 'Actualiza el detalle para conocer su estado antes de volver a intentar la acción.' }
  return (
    <>
      <PageHeader eyebrow="Iniciativas" title={title} />
      <StatusPanel variant="error" action={(
        <div className="d-flex flex-wrap gap-2">
          {status === 401 ? <Link className="btn btn-primary" state={{ from: { pathname: `/iniciativas/${id}` } }} to="/ingresar">Ingresar</Link> : null}
          {retry && (mutation || ![400, 401, 403, 404].includes(status)) ? <button className="btn btn-outline-danger" onClick={retry} type="button">{mutation ? 'Consultar estado actual' : 'Reintentar detalle'}</button> : null}
          <Link className="btn btn-outline-primary" to="/iniciativas">Volver al catálogo</Link>
        </div>
      )}><p>{message}</p></StatusPanel>
    </>
  )
}

function DetailLoader({ id, authenticated, onMutationFailure }) {
  const load = useCallback(({ signal }) => initiativesService.getById(id, { signal }), [id])
  const query = useApiQuery({ queryKey: `initiative:${id}`, queryFn: load, isEmpty: neverEmpty })
  if (query.status === 'loading' || query.status === 'idle') return <StatusPanel title="Cargando iniciativa"><p>Consultando su información y los permisos actuales.</p></StatusPanel>
  if (query.status === 'error') return <DetailError error={query.error} id={id} retry={query.retry} />
  // Una respuesta defectuosa tampoco autoriza a renderizar campos de detalle.
  if (query.data?.data?.access?.canViewDetails !== true) return <DetailError error={{ status: 403 }} id={id} />
  return <InitiativeDetails authenticated={authenticated} initiative={query.data.data} onMutationFailure={onMutationFailure} />
}

function DetailSession({ id, authenticated }) {
  const [failure, setFailure] = useState(null)
  const [attempt, setAttempt] = useState(0)
  // Una mutación denegada/incierta desmonta el contenido y sus capacidades antiguas.
  if (failure) return <DetailError error={failure} id={id} mutation retry={() => { setFailure(null); setAttempt((value) => value + 1) }} />
  return <DetailLoader authenticated={authenticated} id={id} key={attempt} onMutationFailure={setFailure} />
}

export function InitiativeDetailPage() {
  const { id } = useParams()
  const auth = useAuth()
  if (!isInitiativeId(id)) return <DetailError error={{ status: 400 }} id={id} />
  if (auth.status === 'loading') return <StatusPanel title="Comprobando sesión"><p>Comprobando el acceso a la iniciativa.</p></StatusPanel>
  if (auth.status === 'error') return <StatusPanel action={<button className="btn btn-outline-primary" onClick={auth.retryRestore} type="button">Reintentar sesión</button>} title="No pudimos comprobar tu sesión" variant="error"><p>Vuelve a comprobar la sesión para continuar.</p></StatusPanel>
  return <DetailSession authenticated={auth.status === 'authenticated'} id={id} key={`${id}:${auth.status}:${auth.user?.id ?? 'visitor'}`} />
}
