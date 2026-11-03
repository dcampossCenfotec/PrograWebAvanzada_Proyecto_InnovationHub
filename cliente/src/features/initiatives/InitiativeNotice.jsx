import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'

const messages = {
  created: 'La iniciativa se publicó correctamente.',
  updated: 'Los cambios de la iniciativa se guardaron correctamente.',
  deleted: 'La iniciativa se eliminó definitivamente.',
  archived: 'La iniciativa se archivó y su historial se conserva.',
}

export function InitiativeNotice({ allowed }) {
  const location = useLocation()
  const noticeRef = useRef(null)
  const operation = location.state?.initiativeOperation
  const recognized = typeof operation === 'string' && allowed.includes(operation) && Object.hasOwn(messages, operation)
  useEffect(() => { if (recognized) noticeRef.current?.focus() }, [recognized, location.key])
  if (!recognized) return null
  return <div className="alert alert-success" ref={noticeRef} role="status" tabIndex="-1">{messages[operation]}</div>
}
