import { STATE_LABELS, TYPE_OPTIONS, VISIBILITY_LABELS } from './catalog.js'

const types = Object.fromEntries(TYPE_OPTIONS)

export function InitiativeBadges({ initiative }) {
  const stateTone = Object.hasOwn(STATE_LABELS, initiative.state) ? initiative.state : 'unknown'
  const visibilityTone = Object.hasOwn(VISIBILITY_LABELS, initiative.visibility) ? initiative.visibility : 'unknown'
  return (
    <>
      <div className="initiative-card__header mb-3">
        <span className="initiative-card__type">{types[initiative.type] ?? 'Iniciativa'}</span>
        <span className={`initiative-card__visibility initiative-card__visibility--${visibilityTone}`}>
          <span className="visually-hidden">Visibilidad: </span>
          {VISIBILITY_LABELS[initiative.visibility] ?? 'Visibilidad no disponible'}
        </span>
      </div>
      <div className={`initiative-card__status initiative-card__status--${stateTone}`}>
        <span className="initiative-card__status-label">Estado</span>
        <span>{STATE_LABELS[initiative.state] ?? 'Estado no disponible'}</span>
      </div>
    </>
  )
}
