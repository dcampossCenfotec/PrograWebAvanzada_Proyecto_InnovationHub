import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { initiativesService } from '../../api/services/initiatives.js'
import { isAbortError } from '../../api/errors.js'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import PageHeader from '../../components/PageHeader.jsx'
import { InitiativeBadges } from './InitiativeBadges.jsx'
import { InitiativeNotice } from './InitiativeNotice.jsx'
import { initiativeDate, removalOperation } from './detail.js'

function TextSection({ title, children }) {
  return <section className="card shadow-sm"><div className="card-body p-4"><h2 className="h4">{title}</h2><p className="initiative-detail__text mb-0">{children || 'Sin información indicada.'}</p></div></section>
}

export function InitiativeDetails({ initiative, authenticated, onMutationFailure }) {
  const navigate = useNavigate()
  const [action, setAction] = useState(null)
  const [pending, setPending] = useState(false)
  const submitting = useRef(false)
  const active = useRef(true)
  const controller = useRef(null)
  const access = initiative.access ?? {}
  const archived = initiative.state === 'archived'
  const ownerName = initiative.owner ? `${initiative.owner.firstName} ${initiative.owner.lastName}` : 'Propietario no disponible'

  useEffect(() => {
    active.current = true
    return () => { active.current = false; controller.current?.abort() }
  }, [])

  async function confirmAction() {
    const allowed = action === 'delete' ? access.canDelete === true : action === 'archive' && access.canArchive === true && !archived
    if (submitting.current || !authenticated || !allowed) return
    submitting.current = true
    setPending(true)
    controller.current = new AbortController()
    try {
      const method = action === 'delete' ? initiativesService.remove : initiativesService.archive
      const response = await method(initiative.id, { signal: controller.current.signal })
      const operation = removalOperation(response, initiative.id, action)
      if (active.current) navigate('/mis-iniciativas', { replace: true, state: { initiativeOperation: operation } })
    } catch (error) {
      if (active.current && !isAbortError(error)) onMutationFailure(error)
    } finally {
      submitting.current = false
      if (active.current) setPending(false)
    }
  }

  return (
    <>
      <InitiativeNotice allowed={['updated']} />
      <p><Link to="/iniciativas">Volver al catálogo</Link>{authenticated ? <> · <Link to="/mis-iniciativas">Mis iniciativas</Link></> : null}</p>
      <section aria-labelledby="page-title" className="card shadow-sm mb-4">
        <div className="card-body p-4 p-lg-5">
          <InitiativeBadges initiative={initiative} />
          <PageHeader description={initiative.summary} eyebrow={initiative.category?.name ?? 'Iniciativa'} title={initiative.title} />
          <p className="mb-0">Por {initiative.owner ? <Link to={`/iniciativas?ownerId=${encodeURIComponent(initiative.owner.id)}`}>{ownerName}</Link> : ownerName}</p>
        </div>
      </section>
      <div className="initiative-detail__layout">
        <div className="initiative-detail__content">
          <TextSection title="Descripción">{initiative.description}</TextSection>
          <TextSection title="Problema que atiende">{initiative.problem}</TextSection>
          <TextSection title="Personas beneficiarias">{initiative.beneficiaries}</TextSection>
          <section aria-labelledby="initiative-skills-title" className="card shadow-sm">
            <div className="card-body p-4">
              <h2 className="h4" id="initiative-skills-title">Competencias requeridas</h2>
              {initiative.skills?.length ? <ul aria-label="Competencias requeridas" className="tag-list">{initiative.skills.map((skill) => <li key={skill.id}>{skill.name}</li>)}</ul> : <p className="text-secondary mb-0">Sin competencias indicadas.</p>}
              <h3 className="h5 mt-4">Etiquetas</h3>
              {initiative.tags?.length ? <ul aria-label="Etiquetas" className="tag-list">{initiative.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul> : <p className="text-secondary mb-0">Sin etiquetas.</p>}
            </div>
          </section>
        </div>
        <aside aria-label="Información y acciones de la iniciativa" className="initiative-detail__sidebar">
          <section className="card shadow-sm">
            <div className="card-body p-4">
              <h2 className="h4">Equipo y fechas</h2>
              <dl className="initiative-detail__facts">
                <div><dt>Integrantes activos</dt><dd>{initiative.memberCount}</dd></div>
                <div><dt>Estimación de integrantes</dt><dd>{initiative.estimatedMembers}</dd></div>
                <div><dt>Espacios estimados</dt><dd>{Math.max(0, initiative.availableSpaces)}</dd></div>
                <div><dt>Creación</dt><dd><time dateTime={initiative.createdAt}>{initiativeDate(initiative.createdAt)}</time></dd></div>
                <div><dt>Última actualización</dt><dd><time dateTime={initiative.updatedAt}>{initiativeDate(initiative.updatedAt)}</time></dd></div>
              </dl>
              <p className="small text-secondary mb-0">La estimación puede superarse. Tener cero espacios estimados no impide solicitar participación.</p>
            </div>
          </section>
          <section className="card shadow-sm">
            <div className="card-body p-4">
              <h2 className="h4">Acciones</h2>
              <div className="initiative-detail__actions">
                {authenticated && access.canEdit === true ? <Link className="btn btn-primary" to={`/iniciativas/${initiative.id}/editar`}>Editar iniciativa</Link> : null}
                {authenticated && access.canRequest === true ? <Link className="btn btn-primary" to={`/iniciativas/${initiative.id}/participar`}>Solicitar participación</Link> : null}
                {authenticated && access.canConvert === true ? <Link className="btn btn-outline-primary" to={`/iniciativas/${initiative.id}/convertir`}>Convertir en proyecto</Link> : null}
                {authenticated && access.canManageRequests === true ? <Link className="btn btn-outline-primary" to="/solicitudes-recibidas">Revisar solicitudes recibidas</Link> : null}
                {authenticated && access.canArchive === true && !archived ? <button className="btn btn-outline-primary" onClick={() => setAction('archive')} type="button">Archivar iniciativa</button> : null}
                {authenticated && access.canDelete === true ? <button className="btn btn-outline-danger" onClick={() => setAction('delete')} type="button">Eliminar iniciativa</button> : null}
                {!authenticated ? <Link className="btn btn-primary" state={{ from: { pathname: `/iniciativas/${initiative.id}` } }} to="/ingresar">Ingresar para colaborar</Link> : null}
              </div>
              {archived ? <p className="small text-secondary mt-3 mb-0">Esta iniciativa está archivada. Su información e historial se conservan.</p> : null}
              {authenticated && !archived && access.canRequest !== true && access.canEdit !== true ? <p className="small text-secondary mt-3 mb-0">No hay una solicitud de participación disponible para tu cuenta en este momento.</p> : null}
            </div>
          </section>
        </aside>
      </div>
      <ConfirmDialog cancelLabel="Cancelar" confirmLabel={action === 'archive' ? 'Confirmar archivo' : 'Eliminar definitivamente'} onCancel={() => setAction(null)} onConfirm={confirmAction} open={action !== null} pending={pending} title={action === 'archive' ? 'Archivar iniciativa' : 'Eliminar iniciativa'} variant={action === 'archive' ? 'primary' : 'danger'}>
        {action === 'archive' ? (
          <><p>Vas a archivar <strong>{initiative.title}</strong>.</p><p className="mb-0">La iniciativa dejará de aparecer en el catálogo. Se conservarán su información, equipo e historial y podrás consultarla en Mis iniciativas.</p></>
        ) : (
          <><p>Vas a eliminar definitivamente <strong>{initiative.title}</strong>.</p><p>Solo se permite si nunca tuvo solicitudes, otros miembros ni proyecto. El servidor volverá a comprobarlo al confirmar.</p><p className="mb-0">Si existe historial, la eliminación se rechazará sin modificar la iniciativa. Puedes elegir Archivar por separado. Una eliminación definitiva no se puede deshacer.</p></>
        )}
      </ConfirmDialog>
    </>
  )
}
