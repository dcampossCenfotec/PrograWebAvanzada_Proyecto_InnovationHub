import { useCallback } from 'react'
import { Link, useParams } from 'react-router'
import { initiativesService } from '../../api/services/initiatives.js'
import { catalogsService } from '../../api/services/catalogs.js'
import { ApiError } from '../../api/errors.js'
import { useAuth } from '../../auth/useAuth.js'
import { ProtectedRoute } from '../../auth/ProtectedRoute.jsx'
import PageHeader from '../../components/PageHeader.jsx'
import StatusPanel from '../../components/StatusPanel.jsx'
import { useApiQuery } from '../../hooks/useApiQuery.js'
import { loadInitiativeSkills } from './catalog-options.js'
import { isInitiativeId } from './detail.js'
import { InitiativeEditor } from './InitiativeEditor.jsx'

const neverEmpty = () => false

function FormLoader({ id, edit, userId }) {
  const load = useCallback(async ({ signal }) => {
    const initiative = edit ? (await initiativesService.getById(id, { signal })).data : null
    if (edit) {
      if (initiative?.owner?.id !== userId || initiative?.access?.canEdit !== true) {
        const archivedOwner = initiative?.owner?.id === userId && initiative.state === 'archived'
        throw new ApiError('No se puede editar.', { status: archivedOwner ? 409 : 403 })
      }
    }
    const [categories, skills] = await Promise.all([
      catalogsService.listCategories({ signal }), loadInitiativeSkills({ signal }),
    ])
    return { initiative, categories: categories.data, skills: skills.data }
  }, [edit, id, userId])
  const query = useApiQuery({ queryKey: `initiative-form:${edit}:${id ?? 'new'}`, queryFn: load, enabled: !edit || isInitiativeId(id), isEmpty: neverEmpty })
  if (edit && !isInitiativeId(id)) return <StatusPanel title="Dirección de iniciativa no válida" variant="error" action={<Link to="/iniciativas">Volver al catálogo</Link>}><p>Revisa la dirección antes de editar.</p></StatusPanel>
  if (query.status === 'loading' || query.status === 'idle') return <StatusPanel title="Preparando formulario"><p>Cargando los catálogos y los datos que puedes editar.</p></StatusPanel>
  if (query.status === 'error') {
    const status = query.error.status
    const title = status === 403 ? 'No puedes editar esta iniciativa' : status === 404 ? 'Iniciativa no disponible' : status === 409 ? 'La iniciativa archivada no puede editarse' : 'No fue posible cargar el formulario'
    return <StatusPanel title={title} variant="error" action={<div className="d-flex flex-wrap gap-2">{![403, 404, 409].includes(status) ? <button className="btn btn-outline-danger" onClick={query.retry} type="button">Reintentar formulario</button> : null}<Link className="btn btn-outline-primary" to="/iniciativas">Volver al catálogo</Link></div>}><p>{[403, 404, 409].includes(status) ? 'No se habilitará el formulario sin permiso de edición.' : 'Comprueba la conexión y vuelve a intentarlo.'}</p></StatusPanel>
  }
  if (!query.data.categories.length || !query.data.skills.length) return <StatusPanel title="No hay catálogos suficientes para publicar" variant="warning" action={<button className="btn btn-outline-primary" onClick={query.retry} type="button">Actualizar catálogos</button>}><p>Se necesita al menos una categoría y una competencia disponibles.</p></StatusPanel>
  return <InitiativeEditor categories={query.data.categories} initiative={query.data.initiative} skills={query.data.skills} />
}

export function InitiativeFormPage({ edit = false }) {
  const { id } = useParams()
  const auth = useAuth()
  return (
    <ProtectedRoute>
      <PageHeader description={edit ? 'Actualiza la información de tu iniciativa. El equipo y su historial se conservan.' : 'Comparte una idea, necesidad o reto. Una iniciativa válida se publica al guardar.'} eyebrow="Iniciativas" title={edit ? 'Editar iniciativa' : 'Publicar iniciativa'} />
      <FormLoader edit={edit} id={id} key={`${edit}:${id ?? 'new'}:${auth.user?.id}`} userId={auth.user?.id} />
    </ProtectedRoute>
  )
}
