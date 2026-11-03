# Cliente React de Innovation Hub

Cliente React del Avance 2 con navegación, autenticación real, perfiles, directorio, catálogo, detalle y formularios de iniciativas, capa HTTP común, servicios por dominio, estados de consulta y un mock basado en los fixtures compartidos. Las pantallas de dominio que todavía no alcanzaron su tarea permanecen como marcadores explícitos.

## Requisitos

- Node.js `22.12.0` o posterior compatible. `.nvmrc` fija la versión compartida recomendada.
- npm compatible con la versión de Node instalada.

## Ejecución

```bash
npm ci --cache /private/tmp/innovation-hub-npm-cache
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

Todas las llamadas pasan por `src/api/http.js`. Esta capa incorpora la URL base, serializa query y JSON, agrega el token de `sessionStorage`, interpreta respuestas `204`, aplica timeout y convierte los errores al tipo `ApiError`. Los módulos de `src/api/services/` exponen los 27 endpoints del contrato sin mezclar HTTP con componentes.

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

Para trabajar sin el servidor, usar `VITE_API_MODE=mock` en `.env.local` y reiniciar Vite. El mock importa directamente `pruebas/fixtures/`; no mantiene una segunda copia. Implementa consultas GET, autenticación y, desde UI05, reemplazo del perfil propio. Las demás mutaciones devuelven `501 MOCK_NOT_IMPLEMENTED` hasta su tarea funcional, para que una simulación no oculte trabajo faltante.

Los endpoints protegidos se pueden revisar desde la consola del navegador con identidades sintéticas:

```js
sessionStorage.setItem('innovationHub.accessToken', 'mock-owner-token')
sessionStorage.setItem('innovationHub.accessToken', 'mock-applicant-token')
sessionStorage.setItem('innovationHub.accessToken', 'mock-expired-token')
```

Recargar después del cambio. El primer token representa al propietario de los fixtures; el segundo, a un solicitante; el tercero permite comprobar expiración y debe cerrar la sesión al consultar `/auth/me`. El modo mock no puede compilarse como build de producción: `VITE_API_MODE=mock npm run build` falla de forma deliberada.

Los formularios ocupan el 100 % del ancho disponible del contenedor de página, incluidos ingreso, registro, perfil, iniciativas y filtros. Se retiraron los límites locales de autenticación/directorio; la grilla interna conserva su distribución responsive.

## Autenticación y rutas protegidas

`AuthProvider` conserva únicamente el token opaco en `sessionStorage`; la identidad visible siempre proviene de la respuesta de login/registro o de `GET /auth/me`. Al recargar, una sesión válida se restaura. Una respuesta `401` elimina el token y dirige a ingreso con un aviso. Si `/auth/me` falla por red, el token se conserva y la página ofrece reintentar porque no se demostró que la sesión haya terminado. `sessionStorage` limita el token a la pestaña y lo elimina al cerrarla, pero sigue siendo accesible para JavaScript del mismo origen: evitar HTML no confiable y dependencias sin revisar continúa siendo obligatorio.

Registro solicita nombres, tipo de miembro, correo, contraseña, confirmación y términos. Carrera, biografía y competencias pertenecen al perfil de API04/UI05; enviarlos durante registro contradice el contrato y produce `400`. Ingreso restaura solo una ruta interna guardada por React Router. Perfil, directorio, solicitudes y acciones de iniciativas requieren sesión; catálogo, detalle público y proyectos accesibles siguen disponibles para visitantes.

Logout llama primero a la API. Solo después de `204`, o si la API confirma que el token ya no es válido, limpia el cliente. Un fallo de red mantiene la sesión local, informa que no se comprobó la revocación y permite reintentar.

## Perfiles y directorio

`/perfil` carga el perfil autenticado y el catálogo de competencias. Permite editar nombres, tipo de miembro, carrera o área, biografía, intereses, disponibilidad, portafolio y hasta 20 competencias con nivel. El correo se muestra como solo lectura y nunca forma parte del body de `PUT /users/me`. La actualización es completa: el cliente envía también arreglos vacíos y convierte los opcionales vacíos en `null`. Si la API responde `400`, los valores permanecen en el formulario.

`/usuarios` requiere sesión y consulta el servidor cada vez que se aplican filtros o cambia la página. La URL conserva búsqueda, carrera exacta, competencia, disponibilidad, tamaño y orden para permitir Atrás/Adelante. El cliente no descarga todo el directorio para filtrarlo. Seleccionar dos resultados por página permite comprobar paginación con los cuatro usuarios activos del seed.

`/usuarios/:id` presenta el perfil público sin controles de edición. El correo solo existe en la respuesta del perfil propio; las tarjetas del directorio tampoco lo muestran. Abrir el UUID propio desde el directorio redirige a `/perfil`.

En modo real, ejecutar el seed del servidor. Los usuarios de `pruebas/fixtures/users.json` usan `DEMO_USER_PASSWORD`; `diego.inactive@example.test` debe ser rechazado. En modo mock, esos mismos correos usan `DemoSegura2026` y las cuentas registradas duran hasta recargar la página.

Durante `npm run dev`, `/api-demo` consulta competencias y permite observar carga, éxito, vacío y error. Buscar una sola letra genera el `400` contractual; una cadena inexistente genera el estado vacío. En modo `real`, la ruta comprueba la conexión con el servidor configurado.

## Catálogo de iniciativas (UI06)

`/iniciativas` admite visitantes y consulta `GET /initiatives`. Búsqueda, tipo, categoría, competencia, estado, espacios estimados, propietario, tamaño y orden se aplican en el servidor. La URL conserva los criterios y la página para recarga y Atrás/Adelante. El tamaño inicial del cliente es 6 (la API usa 12 si no se envía tamaño). Aplicar o limpiar filtros vuelve a la página 1. Carga, fallo con reintento, colección vacía, búsqueda sin coincidencias y página fuera de rango tienen mensajes separados.

El filtro de propietario puede activarse desde una tarjeta. Con sesión también permite buscar personas y recorrer sus páginas, sin mostrar correos. El directorio exige autenticación; el catálogo visitante no lo consulta. Las competencias se cargan en páginas hasta completar sus opciones.

`/mis-iniciativas` exige sesión y consulta `GET /initiatives/mine`: representa propiedad, no pertenencia al equipo. Incluye privadas, archivadas y borradores del propietario, con orden y paginación; no admite los filtros del catálogo general. Cambiar de identidad desmonta los resultados anteriores para no conservar tarjetas privadas al cerrar sesión.

Las tarjetas ofrecen detalle solamente cuando `access.canViewDetails === true`. Una restringida ajena muestra únicamente resumen permitido y un aviso de acceso, sin enlace al detalle ni propietario. Los espacios se muestran como estimación y nunca negativos. El estado tiene una banda propia con etiqueta explícita: publicada verde, formando equipo azul, convertida violeta, borrador ámbar y archivada gris. La visibilidad se presenta aparte con una etiqueta de borde; privada usa rojo oscuro. Los textos permanecen legibles sin depender del color. El mock reproduce filtros, proyecciones y paginación; las pruebas contra Express verifican el modo real por separado.

El detalle ya es funcional desde UI07. UI08 agrega los formularios de publicación/edición. Solicitudes, equipo y conversión se completan en sus tareas posteriores.

Prueba opcional React → Express → MongoDB, con API exclusiva de pruebas en 3002 y base de test recién restaurada. No se ejecuta con la suite general cuando falta la variable de activación. En una terminal, desde `servidor/`, con `.env.test` y replica set nativo activos:

```bash
npm run db:reset:test
node --env-file-if-exists=.env.test scripts/seed.js
PORT=3002 node --env-file-if-exists=.env.test src/server.js
```

`db:reset:test` elimina exclusivamente la base de pruebas configurada y pierde sus datos; el script valida el nombre de la base. Desde `cliente/`, en otra terminal:

```bash
VITE_API_MODE=real VITE_API_BASE_URL=http://127.0.0.1:3002/api VITE_RUN_API_INTEGRATION=true npm run test:unit -- src/features/initiatives/CatalogPage.integration.test.jsx
```

Comprueba visitante con 3 públicas y búsqueda por servidor, Carla con 5 y resumen restringido sin enlaces, y Ana con 8 propias incluyendo borrador/archivada. Supone fixtures limpios y contraseña sintética `DemoSegura2026`; utiliza sesiones reales. Detener la API temporal con `Ctrl+C` al terminar.

## Detalle de iniciativas (UI07)

`/iniciativas/:id` consulta `GET /initiatives/:id`. Presenta tipo/visibilidad/estado con los mismos indicadores del catálogo, título/resumen, propietario, descripción, problema, beneficiarios, competencias, etiquetas, conteos activos, estimación/espacios y fechas. Las fechas se muestran en español y en la zona horaria del navegador. Una dirección con UUID inválido se rechaza antes del HTTP. Arrays vacíos y textos multilínea tienen presentación explícita.

El servidor protege las cuatro visibilidades. El cliente distingue `401` (ingreso con regreso al detalle), `403` (acceso no permitido) y `404` (recurso no disponible, sin confirmar si existe una privada). No muestra el contenido de respuestas sin `canViewDetails` ni mensajes de error que puedan contener datos del recurso. Cambiar de identidad o UUID desmonta el detalle anterior y cancela su consulta. Un fallo al restaurar sesión permite reintentar antes de consultar datos.

| Acción | Condición adicional a tener sesión |
| --- | --- |
| Editar iniciativa | `access.canEdit === true`; formulario de UI08 disponible. |
| Solicitar participación | `access.canRequest === true`; ruta de UI11 pendiente. Cero espacios no bloquea esta acción. |
| Convertir en proyecto | `access.canConvert === true`; conversión de API10/UI13 pendiente. |
| Revisar solicitudes recibidas | `access.canManageRequests === true`; gestión de API09/UI12 pendiente. |
| Eliminar iniciativa | `access.canDelete === true`; el servidor rechaza con `409` si existe historial, sin archivar. |
| Archivar iniciativa | `access.canArchive === true` y estado distinto de archivada; funciona con o sin historial. |

Eliminar y Archivar tienen botones y diálogos independientes. Eliminar llama exclusivamente DELETE y solo acepta `204`; si hay historial, `409 INITIATIVE_HAS_HISTORY` explica que se conserva sin cambios y permite consultar el detalle para elegir archivo. Archivar llama exclusivamente POST `/{id}/archive` y solo acepta `200` con `operation: archived`. Ambas vuelven a Mis iniciativas con un aviso enfocado. Una respuesta correspondiente a la acción contraria nunca se anuncia como éxito. Las archivadas no ofrecen volver a archivar ni editar, pero pueden eliminarse si realmente nunca tuvieron relaciones adicionales.

Cancelar, Escape y fondo cierran sin escribir y restauran foco; durante el envío se bloquean ambos botones y el cierre accidental, con protección adicional contra doble envío. Una respuesta desconocida, fallo de red o denegación retira el contenido y las capacidades anteriores. No se repite automáticamente una eliminación de resultado incierto: Consultar estado actual monta una lectura nueva. El modo mock permite leer detalle, pero la eliminación/archivo requiere API real; su mutación mock permanece en `501`.

Verificación adicional React → Express → MongoDB (solo API de test en puerto 3002 y base de pruebas limpia): ejecutar primero la suite de catálogo anterior y después la de detalle, porque esta última archiva un fixture. Con la API temporal de la sección anterior activa:

```bash
VITE_API_MODE=real VITE_API_BASE_URL=http://127.0.0.1:3002/api VITE_RUN_API_INTEGRATION=true npm run test:unit -- src/features/initiatives/InitiativeDetailPage.integration.test.jsx
```

Los nueve casos prueban lectura pública, denegaciones `401/403/404`, privada como dueña, acciones de miembro, cancelar sin escritura, borrado físico de un registro temporal, rechazo de borrado con historial sin modificación, archivo voluntario sin historial y archivo conservando el detalle. El diálogo se simula en jsdom para las pruebas de componentes; esto no constituye revisión visual en un navegador. Las sesiones creadas por la suite de detalle se revocan al terminar cada caso.

## Publicar y editar iniciativas (UI08)

`/iniciativas/nueva` y `/iniciativas/:id/editar` comparten `InitiativeEditor` y exigen sesión. En edición se comprueban UUID, propietario por ID y `access.canEdit` antes de habilitar campos. Una archivada o una iniciativa ajena no ofrece formulario, aunque se pegue directamente la dirección. Cambiar identidad o ID desmonta el formulario anterior y cancela su consulta.

El formulario controla los once campos editables:

| Campos | Representación y límites |
| --- | --- |
| Título, resumen, descripción, problema y beneficiarios | Texto con límites contractuales 5–100, 15–240, 20–2000, 10–500 y 3–150. |
| Tipo | Idea, Necesidad o Reto. |
| Categoría | Opción obtenida del catálogo activo. |
| Competencias | Selección por ID desde todas las páginas del catálogo; entre 1 y 10. |
| Estimación de integrantes | Entero entre 1 y 100; no es un cupo. Conservar un estimado superado es válido, reducirlo por debajo de activos no. |
| Visibilidad | Pública, Institucional, Restringida o Privada, con explicación visible. |
| Etiquetas | Opcionales, chips individuales; hasta 10 de 1–40 caracteres, sin duplicados. |

UI09 reemplaza las casillas por selección desde catálogo y lista de competencias por ID, con confirmación al quitar. Las etiquetas se agregan como chips con claves estables y conservan comas/texto interno. UI10 completa validación tras interacción, contadores de campos de texto y revisión final de destinos; la validación básica contractual ya funciona al enviar.

POST publica directamente como `published` y vuelve al catálogo con aviso de éxito enfocado. PUT envía el reemplazo completo y vuelve al detalle actualizado con aviso enfocado. No se envían propietario, estado, ID, fechas, conteos ni capacidades; la API los conserva o calcula. MongoDB es la persistencia: el formulario solo mantiene cambios temporales en memoria, sin guardarlos en localStorage/sessionStorage ni crear borradores.

Durante guardado se deshabilitan controles y envío, con protección por referencia contra doble confirmación. Fallos `400/409/red` no navegan ni limpian valores; errores de campos de la API se asocian a sus controles. Una pérdida de permiso retira el formulario. Un resultado incierto de publicación no se reenvía automáticamente: se recomienda revisar Mis iniciativas antes de repetir para evitar duplicados. Sin categoría o competencia disponible no se permite publicar; fallos de carga ofrecen reintento.

Cancelar sin cambios vuelve a catálogo o detalle según modo. Con cambios, Cancelar, otro enlace interno o Atrás abren la confirmación de descarte mediante React Router. Seguir editando conserva valores; Descartar y salir ejecuta la navegación pendiente sin guardar. Recargar/cerrar usa el aviso nativo del navegador, cuyo texto y aparición dependen del navegador. Durante un guardado no se permite descartar; al confirmar éxito prevalece el destino de guardado. Las rutas usan el router de datos de la aplicación, requerido por `useBlocker`.

Las mutaciones de iniciativas siguen requiriendo `VITE_API_MODE=real`; el mock permite lecturas pero devuelve `501` en creación/edición/archivo/borrado. Las pruebas de componentes simulan servicios para verificar errores deterministas; las de integración sí usan Express/MongoDB.

Para la integración real del formulario, con la API aislada de test en 3002 preparada como se indicó arriba, ejecutar esta suite después de catálogo/detalle:

```bash
VITE_API_MODE=real VITE_API_BASE_URL=http://127.0.0.1:3002/api VITE_RUN_API_INTEGRATION=true npm run test:unit -- src/features/initiatives/InitiativeFormPage.integration.test.jsx
```

Comprueba publicación única ante doble envío con campos completos, edición que conserva identidad/equipo/creación y persiste al montar otra vez, descarte sin PUT, bloqueo del ajeno y de la archivada. Sus sesiones se revocan al terminar. Las pruebas no reemplazan la revisión manual de diseño, foco y diálogo nativo.

## Competencias y etiquetas (UI09)

El formulario de creación/edición reutiliza `InitiativeSkillsEditor` e `InitiativeTagsEditor`. La selección de competencias solo admite IDs del catálogo cargado por la página; un fallo de catálogo conserva la pantalla de error/reintento y nunca habilita texto libre. Las competencias anteriores no disponibles mantienen su ID/nombre para que el usuario pueda quitarlas o reemplazarlas.

Agregar competencia valida inmediatamente selección, duplicados y máximo 10, sin modificar el arreglo ante error. Quitar abre un diálogo con el nombre y Cancelar/Quitar competencia: cancelar o Escape conserva la selección y restaura foco; confirmar quita únicamente el ID elegido y enfoca el control siguiente o el selector. Estos cambios se envían a MongoDB solo al guardar el formulario.

Las etiquetas se agregan con Enter o Agregar etiqueta. Cada chip conserva una etiqueta completa; las comas no separan elementos. Se recortan espacios exteriores y se comparan mayúsculas/tildes para rechazar duplicados, con límites de 10 etiquetas y 40 caracteres por etiqueta. Una entrada inválida permanece escrita y produce error inmediato al agregar; no se trunca silenciosamente. Enter durante composición de texto no agrega ni envía el formulario.

Cada chip tiene un botón con nombre accesible para quitar solo esa etiqueta. Al quitar una del medio, las otras conservan claves/textos y el foco pasa al siguiente botón o al campo. Escribir una etiqueta pendiente activa la protección de cambios sin guardar; si se intenta guardar sin agregarla, se bloquea el envío y se pide agregarla o limpiar el texto. `tagDraft` y las claves de chips son exclusivamente estado de interfaz y no forman parte del payload de la API.

La edición reconstruye lista y chips desde los IDs/arreglos del DTO. Durante guardado todos los controles quedan deshabilitados. La misma validación de duplicados existe en la API: manipular el cliente no permite persistir competencias o etiquetas repetidas. La suite real del formulario incluye guardar/volver a editar colecciones, defensas de API y etiqueta pendiente sin publicación accidental.

## Alcance actual

- Todas las rutas acordadas se resuelven mediante React Router.
- Las rutas de detalle leen `:id` desde la URL.
- La ruta comodín presenta un error 404 con regreso al inicio.
- La navegación interna utiliza `Link`/`NavLink` y no recarga todo el documento.
- Registro, login, restauración de sesión, rutas protegidas y logout revocable están implementados.
- Perfil propio, perfiles públicos y directorio filtrado/paginado están implementados.
- La infraestructura HTTP y sus estados de consulta están disponibles para las demás tareas funcionales.
- Catálogo, listado propio, detalle y eliminación/archivo de iniciativas implementados; formulario disponible en UI08 y competencias/chips en UI09; refinamientos de validación pendientes de UI10.
- Solicitudes y proyectos todavía dependen de sus tareas funcionales.

El contrato HTTP común está en [`../docs/api-contract.md`](../docs/api-contract.md). La guía general de ejecución se mantiene en el [`README.md` raíz](../README.md).
