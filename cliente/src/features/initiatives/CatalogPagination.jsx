export function CatalogPagination({ pagination, onPage }) {
  if (!pagination?.total || (pagination.totalPages <= 1 && pagination.page <= 1)) return null
  return (
    <nav aria-label="Páginas de iniciativas" className="directory-pagination">
      <button className="btn btn-outline-primary" disabled={pagination.page <= 1} onClick={() => onPage(pagination.page - 1)} type="button">Anterior</button>
      <span>Página {pagination.page} de {pagination.totalPages}</span>
      <button className="btn btn-outline-primary" disabled={pagination.page >= pagination.totalPages} onClick={() => onPage(pagination.page + 1)} type="button">Siguiente</button>
    </nav>
  )
}
