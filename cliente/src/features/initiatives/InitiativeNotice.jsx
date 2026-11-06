
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'

const messages = {
  created: 'La iniciativa se publicó correctamente.',
  updated: 'Los cambios de la iniciativa se guardaron correctamente.',
  deleted: 'La iniciativa se eliminó definitivamente.',
  archived: 'La iniciativa se archivó y su historial se conserva.',
  requestCreated: 'Tu solicitud se envió correctamente. Puedes consultar su estado en Mis solicitudes.',
}

export function InitiativeNotice({ allowed, ready = true }) {
  const location = useLocation()
  const navigate = useNavigate()
  const noticeRef = useRef(null)
  const consumed = useRef(false)
  // Conservar el aviso visible en este montaje, pero quitarlo de la entrada histórica.
  const [notice] = useState(() => ({
    operation: allowed.includes(location.state?.initiativeOperation) && Object.hasOwn(messages, location.state?.initiativeOperation) ? location.state.initiativeOperation : null,
    pathname: location.pathname, search: location.search,
  }))
  const visible = Boolean(notice.operation && ready && notice.pathname === location.pathname && notice.search === location.search)
  useEffect(() => {
    if (!notice.operation || consumed.current) return
    consumed.current = true
    const remaining = { ...location.state }
    delete remaining.initiativeOperation
    navigate({ pathname: location.pathname, search: location.search, hash: location.hash }, { replace: true, state: Object.keys(remaining).length ? remaining : null, preventScrollReset: true })
  }, [location, navigate, notice.operation])
  useEffect(() => { if (visible) noticeRef.current?.focus() }, [visible])
  if (!visible) return null
  return <div aria-live="polite" className="alert alert-success" ref={noticeRef} role="status" tabIndex="-1">{messages[notice.operation]}</div>
}
