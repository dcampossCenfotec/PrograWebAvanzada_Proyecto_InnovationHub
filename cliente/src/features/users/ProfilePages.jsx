import { useCallback } from 'react'
import { Navigate, useParams } from 'react-router'
import { catalogsService } from '../../api/services/catalogs.js'
import { usersService } from '../../api/services/users.js'
import { useAuth } from '../../auth/useAuth.js'
import PageHeader from '../../components/PageHeader.jsx'
import StatusPanel from '../../components/StatusPanel.jsx'
import { useApiQuery } from '../../hooks/useApiQuery.js'
import { ProfileDetails } from './ProfileDetails.jsx'
import { ProfileEditor } from './ProfileEditor.jsx'

const neverEmpty = () => false

function useProfile(id) {
  const queryFn = useCallback(async ({ signal }) => {
    const [profileResponse, skillsResponse] = await Promise.all([
      usersService.getById(id, { signal }),
      catalogsService.listSkills({ page: 1, size: 50 }, { signal }),
    ])
    return { profile: profileResponse.data, skills: skillsResponse.data }
  }, [id])
  return useApiQuery({ queryKey: `profile:${id}`, queryFn, enabled: Boolean(id), isEmpty: neverEmpty })
}

function ProfileStatus({ query }) {
  if (query.status === 'loading' || query.status === 'idle') {
    return <StatusPanel title="Cargando perfil"><p>Consultando la información más reciente.</p></StatusPanel>
  }
  if (query.status === 'error') {
    return (
      <StatusPanel action={<button className="btn btn-outline-danger" onClick={query.retry} type="button">Reintentar</button>} title="No fue posible cargar el perfil" variant="error">
        <p>{query.error.message}</p>
      </StatusPanel>
    )
  }
  return null
}

export function OwnProfilePage() {
  const auth = useAuth()
  const query = useProfile(auth.user.id)
  return (
    <>
      <PageHeader description="Completa la información que ayudará a otras personas a encontrarte para colaborar." eyebrow="Cuenta" title="Mi perfil" />
      {query.status === 'success'
        ? <ProfileEditor key={query.data.profile.updatedAt} profile={query.data.profile} skills={query.data.skills} />
        : <ProfileStatus query={query} />}
    </>
  )
}

export function PublicProfilePage() {
  const auth = useAuth()
  const { id } = useParams()
  const query = useProfile(id)
  if (id === auth.user.id) return <Navigate replace to="/perfil" />
  return (
    <>
      <PageHeader description="Información pública para encontrar personas con experiencia e intereses afines." eyebrow="Directorio" title="Perfil de usuario" />
      {query.status === 'success'
        ? <ProfileDetails profile={query.data.profile} skills={query.data.skills} />
        : <ProfileStatus query={query} />}
    </>
  )
}
