function PageHeader({ eyebrow, title, description, actions, titleId = 'page-title' }) {
  return (
    <header className="page-header" aria-labelledby={titleId}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1 id={titleId}>{title}</h1>
      {description ? <p className="page-header__description">{description}</p> : null}
      {actions ? <div className="page-header__actions">{actions}</div> : null}
    </header>
  )
}

export default PageHeader
