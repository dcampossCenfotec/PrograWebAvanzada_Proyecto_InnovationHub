import { Link } from 'react-router'
import {
  AVAILABILITY_LABELS,
  MEMBER_TYPE_LABELS,
  SKILL_LEVEL_LABELS,
} from './profile.js'

function valueOrFallback(value) {
  return value || 'Sin indicar'
}

export function ProfileDetails({ profile, skills, showEmail = false, showOwnLink = false }) {
  const skillById = new Map(skills.map((skill) => [skill.id, skill.name]))
  return (
    <div className="profile-layout">
      <section className="card shadow-sm" aria-labelledby="profile-summary-title">
        <div className="card-body p-4">
          <div className="d-flex flex-wrap justify-content-between gap-3 align-items-start">
            <div>
              <p className="eyebrow mb-2">Perfil</p>
              <h2 className="h3 mb-1" id="profile-summary-title">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-secondary mb-0">{MEMBER_TYPE_LABELS[profile.memberType]}</p>
            </div>
            {showOwnLink ? <Link className="btn btn-outline-primary" to="/perfil">Editar mi perfil</Link> : null}
          </div>

          <dl className="profile-facts mt-4 mb-0">
            {showEmail && profile.email ? <><dt>Correo</dt><dd>{profile.email}</dd></> : null}
            <dt>Carrera o área</dt><dd>{valueOrFallback(profile.career)}</dd>
            <dt>Disponibilidad</dt><dd>{AVAILABILITY_LABELS[profile.availability]}</dd>
            <dt>Portafolio</dt>
            <dd>
              {profile.portfolioUrl ? (
                <a href={profile.portfolioUrl} rel="noreferrer" target="_blank">Abrir portafolio</a>
              ) : 'Sin indicar'}
            </dd>
          </dl>
        </div>
      </section>

      <section className="card shadow-sm" aria-labelledby="profile-about-title">
        <div className="card-body p-4">
          <h2 className="h4" id="profile-about-title">Acerca de esta persona</h2>
          <p className="profile-bio">{valueOrFallback(profile.bio)}</p>
          <h3 className="h5 mt-4">Intereses</h3>
          {profile.interests.length ? (
            <ul className="tag-list" aria-label="Intereses">
              {profile.interests.map((interest) => <li key={interest}>{interest}</li>)}
            </ul>
          ) : <p className="text-secondary mb-0">No ha agregado intereses.</p>}
        </div>
      </section>

      <section className="card shadow-sm profile-layout__wide" aria-labelledby="profile-skills-title">
        <div className="card-body p-4">
          <h2 className="h4" id="profile-skills-title">Competencias</h2>
          {profile.skills.length ? (
            <ul className="skill-display-list">
              {profile.skills.map(({ skillId, level }) => (
                <li key={skillId}>
                  <span>{skillById.get(skillId) || 'Competencia no disponible'}</span>
                  <span className="badge text-bg-light">{SKILL_LEVEL_LABELS[level]}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-secondary mb-0">No ha agregado competencias.</p>}
        </div>
      </section>
    </div>
  )
}
