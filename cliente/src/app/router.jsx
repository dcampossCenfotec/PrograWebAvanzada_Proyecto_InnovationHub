import { createBrowserRouter } from 'react-router'
import AppLayout from '../components/AppLayout.jsx'
import ApiPreviewPage from '../dev/ApiPreviewPage.jsx'
import ComponentPreviewPage from '../dev/ComponentPreviewPage.jsx'
import EntityPlaceholderPage from '../pages/EntityPlaceholderPage.jsx'
import HomePage from '../pages/HomePage.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'
import PlaceholderPage from '../pages/PlaceholderPage.jsx'
import LoginPage from '../pages/LoginPage.jsx'
import RegisterPage from '../pages/RegisterPage.jsx'
import { ProtectedRoute } from '../auth/ProtectedRoute.jsx'
import { OwnProfilePage, PublicProfilePage } from '../features/users/ProfilePages.jsx'
import { UserDirectoryPage } from '../features/users/UserDirectoryPage.jsx'
import { CatalogPage } from '../features/initiatives/CatalogPage.jsx'
import { InitiativeDetailPage } from '../features/initiatives/InitiativeDetailPage.jsx'
import { InitiativeFormPage } from '../features/initiatives/InitiativeFormPage.jsx'

function protectedPage(element) {
  return <ProtectedRoute>{element}</ProtectedRoute>
}

const placeholderRoutes = [
  {
    path: 'iniciativas',
    element: <CatalogPage />,
  },
  {
    path: 'mis-iniciativas',
    element: protectedPage(<CatalogPage mine />),
  },
  {
    path: 'iniciativas/nueva',
    element: <InitiativeFormPage />,
  },
  { path: 'perfil', element: protectedPage(<OwnProfilePage />) },
  { path: 'usuarios', element: protectedPage(<UserDirectoryPage />) },
  {
    path: 'mis-solicitudes',
    element: protectedPage(
      <PlaceholderPage
        description="Listado personal de solicitudes y sus estados."
        title="Mis solicitudes"
      />,
    ),
  },
  {
    path: 'solicitudes-recibidas',
    element: protectedPage(
      <PlaceholderPage
        description="Los propietarios revisarán solicitudes recibidas en sus iniciativas."
        title="Solicitudes recibidas"
      />,
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
    element: <LoginPage />,
  },
  {
    path: 'registro',
    element: <RegisterPage />,
  },
]

const entityRoutes = [
  {
    path: 'iniciativas/:id',
    element: <InitiativeDetailPage />,
  },
  {
    path: 'iniciativas/:id/editar',
    element: <InitiativeFormPage edit />,
  },
  {
    path: 'iniciativas/:id/participar',
    element: protectedPage(
      <EntityPlaceholderPage
        entityName="Iniciativa"
        mode="solicitud"
        title="Solicitar participación"
      />,
    ),
  },
  {
    path: 'iniciativas/:id/convertir',
    element: protectedPage(
      <EntityPlaceholderPage
        entityName="Iniciativa"
        mode="conversión"
        title="Convertir en proyecto"
      />,
    ),
  },
  {
    path: 'usuarios/:id',
    element: protectedPage(<PublicProfilePage />),
  },
  {
    path: 'solicitudes/:id',
    element: protectedPage(
      <EntityPlaceholderPage entityName="Solicitud" title="Detalle de solicitud" />,
    ),
  },
  {
    path: 'solicitudes/:id/editar',
    element: protectedPage(
      <EntityPlaceholderPage
        entityName="Solicitud"
        mode="edición"
        title="Editar solicitud"
      />,
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

export const appRoutes = [
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
]

export const router = createBrowserRouter(appRoutes)
