# Cliente React de Innovation Hub

Base navegable del Avance 2 construida con React, Vite y React Router. Las pantallas de UI01 son marcadores explícitos: validan la estructura de rutas, pero todavía no consultan la API ni implementan operaciones de negocio.

## Requisitos

- Node.js `22.12.0` o posterior compatible. `.nvmrc` fija la versión compartida recomendada.
- npm compatible con la versión de Node instalada.

## Ejecución

```bash
npm ci
npm run dev
```

Abrir `http://localhost:5173`. La URL puede cambiar si ese puerto está ocupado; Vite lo indica en la terminal.

## Comandos

| Comando | Función |
| --- | --- |
| `npm run dev` | Servidor local con recarga durante desarrollo. |
| `npm run build` | Genera el paquete de producción en `dist/`. |
| `npm run preview` | Sirve localmente el build generado. |
| `npm run lint` | Ejecuta ESLint sobre JavaScript y JSX. |
| `npm test` | Puerta estructural actual: lint y build. Las pruebas de comportamiento se agregan con las funciones reales. |

## Tema Sass

`src/styles/app.scss` es la única entrada de estilos y compila Bootstrap 5.3.8 con Sass 1.107.0. La estructura es:

```text
src/styles/
├── _variables.scss    # Colores, tipografía y configuración previa a Bootstrap
├── _layout.scss       # Encabezado, contenido, hero y pie
├── _components.scss   # Navegación, tarjetas, estados y diálogo
└── app.scss           # Entrada importada por main.jsx
```

El build conserva cuatro advertencias de deprecación por `@import`. Bootstrap 5.3 todavía usa esa entrada Sass. `quietDeps` reduce los avisos repetidos de `node_modules`, pero no oculta los cuatro imports propios que deben migrarse cuando Bootstrap sea compatible.

No se importa `bootstrap.bundle.js`. `Navbar` y `ConfirmDialog` controlan apertura, Escape, cierre y foco mediante React y el elemento nativo `dialog`, evitando dos controladores sobre el mismo nodo.

Componentes compartidos:

- `AppLayout`: salto al contenido, encabezado, contenido y pie.
- `Navbar`: menú responsive y accesos de sesión.
- `PageHeader`: título, descripción y acciones.
- `StatusPanel`: información, éxito, advertencia, error y vacío.
- `ConfirmDialog`: confirmación modal con Cancelar como foco inicial y retorno del foco al disparador.

Con `npm run dev`, abrir `/componentes` para revisar estados y el diálogo. Esa ruta se elimina del build de producción y no representa una función para usuarios finales.

## Alcance actual

- Todas las rutas acordadas se resuelven mediante React Router.
- Las rutas de detalle leen `:id` desde la URL.
- La ruta comodín presenta un error 404 con regreso al inicio.
- La navegación interna utiliza `Link`/`NavLink` y no recarga todo el documento.
- No hay autenticación, llamadas HTTP, estado de dominio ni formularios funcionales todavía.

El contrato HTTP común está en [`../docs/api-contract.md`](../docs/api-contract.md). La guía general de ejecución se mantiene en el [`README.md` raíz](../README.md).
