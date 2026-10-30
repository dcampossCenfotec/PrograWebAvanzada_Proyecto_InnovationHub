import { Link } from 'react-router'

function PlaceholderPage({ title, description, action }) {
  return (
    <section className="page-heading" aria-labelledby="placeholder-title">
      <p className="eyebrow">Avance 2 · estructura inicial</p>
      <h1 id="placeholder-title">{title}</h1>
      <p>{description}</p>
      {action ? (
        <Link className="button-link" to={action.to}>
          {action.label}
        </Link>
      ) : null}
    </section>
  )
}

export default PlaceholderPage
