
import { describe, expect, it } from 'vitest'
import { appRoutes } from './router.jsx'
import { ProtectedRoute } from '../auth/ProtectedRoute.jsx'

const children = appRoutes[0].children

const byPath = new Map(
  children
    .filter((route) => route.path)
    .map((route) => [route.path, route]),
)

const requiredPaths = [
  'iniciativas',
  'mis-iniciativas',
  'iniciativas/nueva',
  'iniciativas/:id',
  'iniciativas/:id/editar',
  'iniciativas/:id/participar',
  'iniciativas/:id/convertir',
  'perfil',
  'usuarios',
  'usuarios/:id',
  'mis-solicitudes',
  'solicitudes-recibidas',
  'solicitudes/:id',
  'solicitudes/:id/editar',
  'proyectos',
  'proyectos/:id',
  'ingresar',
  'registro',
  '*',
]

function getRenderedComponent(route) {
  const element = route?.element

  if (element?.type === ProtectedRoute) {
    return element.props.children?.type
  }

  return element?.type
}

describe('UI15: inventario de navegación del Avance 2', () => {
  it('incluye todas las rutas funcionales y la ruta 404', () => {
    for (const path of requiredPaths) {
      expect(byPath.has(path), path).toBe(true)
    }

    expect(children.some((route) => route.index)).toBe(true)
  })

  it('no conserva placeholders en solicitudes y proyectos', () => {
    const functional = [
      'mis-solicitudes',
      'solicitudes-recibidas',
      'solicitudes/:id',
      'solicitudes/:id/editar',
      'iniciativas/:id/participar',
      'iniciativas/:id/convertir',
      'proyectos',
      'proyectos/:id',
    ]

    for (const path of functional) {
      const component = getRenderedComponent(byPath.get(path))

      expect(component, path).toBeDefined()

      expect(component.name, path).not.toMatch(
        /PlaceholderPage/,
      )
    }
  })

  it('las operaciones privadas utilizan ProtectedRoute', () => {
    const protectedPaths = [
      'perfil',
      'usuarios',
      'usuarios/:id',
      'mis-solicitudes',
      'solicitudes-recibidas',
      'solicitudes/:id',
      'solicitudes/:id/editar',
      'iniciativas/:id/participar',
      'iniciativas/:id/convertir',
    ]

    for (const path of protectedPaths) {
      expect(
        byPath.get(path)?.element?.type,
        `${path} necesita autenticación`,
      ).toBe(ProtectedRoute)
    }
  })

  it('el detalle de entidades conserva parámetros dinámicos', () => {
    const dynamic = [
      'iniciativas/:id',
      'usuarios/:id',
      'solicitudes/:id',
      'proyectos/:id',
    ]

    for (const path of dynamic) {
      expect(path).toContain(':id')
      expect(byPath.get(path)).toBeDefined()
    }
  })

  it('la pantalla de proyectos es accesible como listado', () => {
    const component = getRenderedComponent(
      byPath.get('proyectos'),
    )

    expect(component.name).toBe('ProjectsPage')
  })
})
