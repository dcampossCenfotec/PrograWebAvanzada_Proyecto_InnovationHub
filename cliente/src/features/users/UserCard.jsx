import { Link } from 'react-router'
import {
  AVAILABILITY_LABELS,
  MEMBER_TYPE_LABELS,
  SKILL_LEVEL_LABELS,
} from './profile.js'

export function UserCard({ user, skillById }) {
  return (
    <article className="card user-card h-100 shadow-sm">
      <div className="card-body d-flex flex-column p-4">
        <p className="eyebrow mb-2">{MEMBER_TYPE_LABELS[user.memberType]}</p>
        <h2 className="h4 card-title">{user.firstName} {user.lastName}</h2>
        <p className="text-secondary">{user.career || 'Carrera o área sin indicar'}</p>
        <p><span className="fw-semibold">Disponibilidad:</span> {AVAILABILITY_LABELS[user.availability]}</p>
        {user.skills.length ? (
          <ul className="tag-list mb-4" aria-label={`Competencias de ${user.firstName}`}>
            {user.skills.slice(0, 3).map(({ skillId, level }) => (
              <li key={skillId}>{skillById.get(skillId) || 'Competencia'} · {SKILL_LEVEL_LABELS[level]}</li>
            ))}
          </ul>
        ) : <p className="text-secondary">Sin competencias registradas.</p>}
        <Link className="btn btn-outline-primary mt-auto align-self-start" to={`/usuarios/${user.id}`}>
          Ver perfil
        </Link>
      </div>
    </article>
  )
}
