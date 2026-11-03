import { Link } from 'react-router'
import { InitiativeBadges } from './InitiativeBadges.jsx'

export function InitiativeCard({ initiative, ownerLink }) {
  const readable = initiative.access?.canViewDetails === true
  const owner = readable ? initiative.owner : null
  const ownerName = owner ? `${owner.firstName} ${owner.lastName}` : ''
  return (
    <article className="card initiative-card h-100 shadow-sm">
      <div className="card-body d-flex flex-column p-4">
        <InitiativeBadges initiative={initiative} />
        <h3 className="h4 initiative-card__title">{initiative.title}</h3>
        <p className="text-secondary mb-2">{initiative.category?.name ?? 'Sin categoría'}</p>
        <p className="initiative-card__summary">{initiative.summary}</p>
        {owner ? (
          <p>Por <Link aria-label={`Ver iniciativas de ${ownerName}`} to={ownerLink(owner.id)}>{ownerName}</Link></p>
        ) : null}
        <h4 className="h6">Competencias requeridas</h4>
        {initiative.skills?.length ? (
          <ul className="tag-list mb-3">
            {initiative.skills.map((skill) => <li key={skill.id}>{skill.name}</li>)}
          </ul>
        ) : <p className="text-secondary">Sin competencias indicadas.</p>}
        <dl className="initiative-card__counts mt-auto">
          <div><dt>Integrantes</dt><dd>{initiative.memberCount}</dd></div>
          <div><dt>Estimación</dt><dd>{initiative.estimatedMembers}</dd></div>
          <div><dt>Espacios estimados</dt><dd>{Math.max(0, initiative.availableSpaces)}</dd></div>
        </dl>
        {readable ? (
          <Link aria-label={`Ver detalle de ${initiative.title}`} className="btn btn-outline-primary align-self-start" to={`/iniciativas/${encodeURIComponent(initiative.id)}`}>
            Ver detalle
          </Link>
        ) : (
          <p className="initiative-card__restriction mb-0">Acceso restringido. Solo el propietario y los miembros activos pueden consultar el detalle.</p>
        )}
      </div>
    </article>
  )
}
