import { createBrowserRouter } from 'react-router'
import AppLayout from '../components/AppLayout.jsx'
import ApiPreviewPage from '../dev/ApiPreviewPage.jsx'
import ComponentPreviewPage from '../dev/ComponentPreviewPage.jsx'
import EntityPlaceholderPage from '../pages/EntityPlaceholderPage.jsx'
import HomePage from '../pages/HomePage.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'
import PlaceholderPage from '../pages/PlaceholderPage.jsx'

const placeholderRoutes = [
  {
    path: 'iniciativas',
    element: (
      <PlaceholderPage
        action={{ to: '/iniciativas/nueva', label: 'Publicar iniciativa' }}
        description="Catálogo, búsqueda y filtros se incorporarán sobre la API real."
        title="Iniciativas"
      />
    ),
  },
  {
    path: 'mis-iniciativas',
    element: (
      <PlaceholderPage
        description="Aquí se consultarán iniciativas propias, privadas y archivadas."
        title="Mis iniciativas"
      />
    ),
  },
  {
    path: 'iniciativas/nueva',
    element: (
      <PlaceholderPage
        description="El formulario publicará directamente una iniciativa válida."
        title="Publicar iniciativa"
      />
    ),
  },
  {
    path: 'perfil',
    element: (
      <PlaceholderPage
        description="El perfil propio se cargará desde la sesión y la API."
        title="Mi perfil"
      />
    ),
  },
  {
    path: 'usuarios',
    element: (
      <PlaceholderPage
        description="El directorio permitirá buscar colaboradores mediante filtros del servidor."
        title="Personas"
      />
    ),
  },
  {
    path: 'mis-solicitudes',
    element: (
      <PlaceholderPage
        description="Listado personal de solicitudes y sus estados."
        title="Mis solicitudes"
      />
    ),
  },
  {
    path: 'solicitudes-recibidas',
    element: (
      <PlaceholderPage
        description="Los propietarios revisarán solicitudes recibidas en sus iniciativas."
        title="Solicitudes recibidas"
      />
    ),
  },
  {
    path: 'proyectos',
    element: (
      <PlaceholderPage
        description="Listado de proyectos visibles para el actor actual."
        title="Proyectos"
      />
    ),
  },
  {
    path: 'ingresar',
    element: (
      <PlaceholderPage
        action={{ to: '/registro', label: 'Crear una cuenta' }}
        description="El formulario y la sesión revocable se implementarán en UI04."
        title="Ingresar"
      />
    ),
  },
  {
    path: 'registro',
    element: (
      <PlaceholderPage
        action={{ to: '/ingresar', label: 'Ya tengo una cuenta' }}
        description="El registro real se conectará con la API de autenticación."
        title="Crear cuenta"
      />
    ),
  },
]

const entityRoutes = [
  {
    path: 'iniciativas/:id',
    element: (
      <EntityPlaceholderPage
        entityName="Iniciativa"
        title="Detalle de iniciativa"
      />
    ),
  },
  {
    path: 'iniciativas/:id/editar',
    element: (
      <EntityPlaceholderPage
        entityName="Iniciativa"
        mode="edición"
        title="Editar iniciativa"
      />
    ),
  },
  {
    path: 'iniciativas/:id/participar',
    element: (
      <EntityPlaceholderPage
        entityName="Iniciativa"
        mode="solicitud"
        title="Solicitar participación"
      />
    ),
  },
  {
    path: 'iniciativas/:id/convertir',
    element: (
      <EntityPlaceholderPage
        entityName="Iniciativa"
        mode="conversión"
        title="Convertir en proyecto"
      />
    ),
  },
  {
    path: 'usuarios/:id',
    element: (
      <EntityPlaceholderPage entityName="Usuario" title="Perfil de usuario" />
    ),
  },
  {
    path: 'solicitudes/:id',
    element: (
      <EntityPlaceholderPage entityName="Solicitud" title="Detalle de solicitud" />
    ),
  },
  {
    path: 'solicitudes/:id/editar',
    element: (
      <EntityPlaceholderPage
        entityName="Solicitud"
        mode="edición"
        title="Editar solicitud"
      />
    ),
  },
  {
    path: 'proyectos/:id',
    element: (
      <EntityPlaceholderPage entityName="Proyecto" title="Detalle de proyecto" />
    ),
  },
]

const developmentRoutes = import.meta.env.DEV
  ? [
      { path: 'componentes', element: <ComponentPreviewPage /> },
      { path: 'api-demo', element: <ApiPreviewPage /> },
    ]
  : []

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      ...placeholderRoutes,
      ...entityRoutes,
      ...developmentRoutes,
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
