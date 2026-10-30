# Cliente React de Innovation Hub

Base navegable del Avance 2 construida con React, Vite y React Router. Incluye una capa HTTP común, servicios por dominio, estados de consulta y un mock de lectura basado en los fixtures compartidos. Las pantallas funcionales siguen siendo marcadores hasta sus tareas correspondientes.

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
| `npm run test:unit` | Ejecuta una vez las pruebas de Vitest. |
| `npm run test:watch` | Mantiene Vitest observando cambios. |
| `npm test` | Ejecuta pruebas unitarias, ESLint y build de producción. |

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

## Cliente HTTP y datos de desarrollo

Todas las llamadas pasan por `src/api/http.js`. Esta capa incorpora la URL base, serializa query y JSON, agrega el token de `sessionStorage`, interpreta respuestas `204`, aplica timeout y convierte los errores al tipo `ApiError`. Los módulos de `src/api/services/` exponen los 26 endpoints del contrato sin mezclar HTTP con componentes.

Copiar `.env.example` a `.env.local` únicamente cuando sea necesario cambiar la configuración local:

```bash
cp .env.example .env.local
```

Variables admitidas:

| Variable | Valor por defecto en desarrollo | Uso |
| --- | --- | --- |
| `VITE_API_MODE` | `real` | `real` consulta Express; `mock` habilita lecturas locales. |
| `VITE_API_BASE_URL` | `http://localhost:3000/api` | URL base, sin endpoint final. |
| `VITE_API_TIMEOUT_MS` | `15000` | Tiempo máximo entre 100 y 60000 milisegundos. |

Para trabajar sin el servidor, usar `VITE_API_MODE=mock` en `.env.local` y reiniciar Vite. El mock importa directamente `pruebas/fixtures/`; no mantiene una segunda copia. Implementa las consultas GET necesarias para catálogos, iniciativas, usuarios, solicitudes, equipos y proyectos. Las mutaciones devuelven `501 MOCK_NOT_IMPLEMENTED` hasta que cada función implemente su conducta, para que una simulación no oculte trabajo faltante.

Los endpoints protegidos se pueden revisar desde la consola del navegador con identidades sintéticas:

```js
sessionStorage.setItem('innovationHub.accessToken', 'mock-owner-token')
sessionStorage.setItem('innovationHub.accessToken', 'mock-applicant-token')
```

Recargar después del cambio. El primer token representa al propietario de los fixtures; el segundo, a un solicitante. El modo mock no puede compilarse como build de producción: `VITE_API_MODE=mock npm run build` falla de forma deliberada.

Durante `npm run dev`, `/api-demo` consulta competencias y permite observar carga, éxito, vacío y error. Buscar una sola letra genera el `400` contractual; una cadena inexistente genera el estado vacío. En modo `real`, la ruta comprueba la conexión con el servidor configurado.

## Alcance actual

- Todas las rutas acordadas se resuelven mediante React Router.
- Las rutas de detalle leen `:id` desde la URL.
- La ruta comodín presenta un error 404 con regreso al inicio.
- La navegación interna utiliza `Link`/`NavLink` y no recarga todo el documento.
- La infraestructura HTTP y sus estados de consulta están disponibles para las tareas funcionales.
- La autenticación, las mutaciones y los formularios de negocio todavía no están implementados.

El contrato HTTP común está en [`../docs/api-contract.md`](../docs/api-contract.md). La guía general de ejecución se mantiene en el [`README.md` raíz](../README.md).
