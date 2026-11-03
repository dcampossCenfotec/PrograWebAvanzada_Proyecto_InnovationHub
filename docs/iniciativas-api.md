# Iniciativas: API05–API07

API05 se publicó en `a5df168`, API06 en `f86fea6` y API07 en `f26bd1c`. UI06 (`fa471e8`) implementa catálogo/listado propio; UI07 agrega detalle y eliminación/archivo. Formularios siguen pendientes de UI08–UI10. Las reglas de `docs/api-contract.md` son la fuente del HTTP. Este documento describe el consumo del módulo y la evidencia disponible.

## Consultas y expectativas

| Ruta | Sesión | Resultado |
| --- | --- | --- |
| `GET /api/initiatives` | Opcional; cualquier Bearer enviado se valida | Resúmenes paginados permitidos por actor. |
| `GET /api/initiatives/mine` | Obligatoria | Solo iniciativas donde el actor es propietario, incluidos borrador/archivada. |
| `GET /api/initiatives/:id` | Según visibilidad | Detalle completo o error seguro `401/403/404`. |

Catálogo acepta `q` (2–100), `type`, `category` slug, `skill` UUID, `state=published|forming_team|converted`, `hasSpaces=true|false`, `ownerId` UUID, `page`, `size`, `sort=createdAt|updatedAt|title|memberCount`, `order=asc|desc`. `/mine` acepta únicamente `page/size/sort/order`, con `sort=createdAt|updatedAt|title|state`. Por defecto: página 1, tamaño 12, creación descendente. Cada orden agrega `id` como desempate. Parámetros desconocidos/repetidos/estructurados o inválidos producen `400 INVALID_QUERY`.

Una página fuera del rango devuelve `200`, `data: []` y los totales autorizados reales. La estimación puede superarse: `availableSpaces=max(0, estimatedMembers-memberCount)` y `hasSpaces=false` significa cero espacios, no una prohibición de solicitar o aceptar.

| Actor | Pública | Institucional | Restringida | Privada |
| --- | --- | --- | --- | --- |
| Visitante | Catálogo/detalle | No aparece; detalle `401` | No aparece; detalle `401` | No aparece; detalle `404` |
| Autenticado ajeno | Completa | Completa | Resumen seguro; detalle `403` | No aparece; detalle `404` |
| Dueño/miembro activo | Completa | Completa | Completa | Completa |

La excepción por estado prevalece: borradores/archivadas solo se consultan como propietario y quedan fuera del catálogo general. Un miembro retirado pierde el acceso que provenía de su membresía; puede conservar acceso público/institucional según visibilidad.

El resumen restringido omite propietario, etiquetas, descripción, problema, beneficiarios y fechas. `q` se evalúa solo contra título/resumen para ese actor; buscar una etiqueta oculta no produce coincidencia. El filtro `ownerId` tampoco incluye resúmenes donde el propietario está oculto. La categoría y las competencias sí son metadatos permitidos. Ningún DTO expone `_id`, campos de normalización, revisión, correos ni hashes.

## Consumo por Francisco

- `getInitiativeModels(connection)` reutiliza las colecciones `initiatives`, `memberships`, `membershipEvents`; no crear modelos o equipos paralelos.
- `createInitiativesRepository(models)` expone `findById(id, {session, includeInternal:true})`, `countActiveMemberships(id,{session})` y `touchRevision(id, revision, updatedAt, session)`. Toda creación de solicitud/aceptación/retiro/conversión posterior debe coordinar la revisión de la iniciativa en su transacción para serializarse con API07.
- `lockInitiativeRevision(repository, initiative, updatedAt, session)` realiza esa escritura condicional y devuelve la iniciativa con su nueva revisión. Llamar después de leer/validar estado y permisos dentro de la misma transacción, y antes de escribir solicitudes, membresías, eventos o proyectos. Si no coincide la revisión devuelve `409 CONCURRENT_MODIFICATION`; MongoDB puede reintentar la transacción completa ante un conflicto de escritura. No reutilizar una iniciativa leída fuera de la transacción.
- `requireInitiativeDetailsAccess(initiative, actorId, isMember)` valida lectura y produce errores seguros. `isMember` debe proceder de MongoDB dentro de la operación correspondiente, nunca del body de React.
- `initiativeCapabilities` calcula capacidades de interfaz con propiedad, membresía, estado y solicitud pendiente. Las mutaciones deben volver a validar sus precondiciones; una capacidad visible no autoriza una escritura.
- `canManageRequests` permite al dueño consultar/gestionar pendientes archivadas; aceptar seguirá bloqueado sobre archivadas en API09, mientras que rechazar está permitido según contrato.
- `canRequest` se desactiva para propietario, miembro activo o solicitante con una pendiente, pero no por falta de espacios. El lookup usa `requests` según CO01 y funciona aunque esa colección aún esté vacía.
- `initiativeSearchFields` mantiene las formas normalizadas al crear/editar. Una búsqueda usa texto literal escapado; no evalúa expresiones enviadas por el cliente.

## Seed y compatibilidad

Con MongoDB replica set ya activo: `cd servidor`, `npm run seed`, `npm run dev`. Si faltan dependencias: `npm ci --cache /private/tmp/innovation-hub-npm-cache`. Docker solo se usa cuando se decide iniciar MongoDB mediante Compose.

El seed carga 8 iniciativas, 12 membresías y 13 eventos junto con usuarios/catálogos. Lo repite por UUID sin borrar registros externos al fixture; puede restaurar los campos de los fixtures editados. Solicitudes/proyectos aún no se cargan. Las membresías conservan sus referencias sintéticas a futuras solicitudes según CO01. El seed completo del flujo se cierra en API13.

Sobre un seed limpio, visitante ve 3 iniciativas en catálogo; Carla, 5; Ana, 6. Ana tiene 8 en `/mine`. Estos totales aumentan si se crearon iniciativas adicionales. El arranque de API06 completa normalizaciones ausentes en iniciativas creadas con API05 y conserva ID/fechas/revisión.

## Evidencia

API06 se verificó con 54 pruebas locales y cinco integraciones seriales con MongoDB real, además de lint y fixtures. La evidencia actual con API07 se detalla al final. API06 cubre:

- [x] Matriz visitante/dueño/miembro/ajeno por las cuatro visibilidades y acceso por URL.
- [x] Borrador/archivada fuera del catálogo, propiedad en `/mine` y pérdida de acceso al retirarse.
- [x] DTO saneado y ausencia de coincidencias/conteos por campos ocultos.
- [x] Búsqueda con tildes/mayúsculas, filtros combinados, texto con símbolos y query inválida.
- [x] Más de 25 iniciativas: páginas 1/2/3 y página vacía, total coherente y desempate estable.
- [x] Estimados superados, conteos activos y capacidades ante solicitudes pendientes.
- [x] Seed repetido sin duplicados y normalización de documentos de API05.

UI06 consume las lecturas de catálogo y propiedad en `/iniciativas` y `/mis-iniciativas`. Los criterios y la página se reconstruyen desde la URL; los resúmenes restringidos no muestran propietario ni enlace a detalle. UI07 consume el detalle en `/iniciativas/:id` y dos comandos independientes con confirmación y permisos: DELETE para borrar y POST `/{id}/archive` para archivar. Creación/edición y las rutas de solicitudes/conversión continúan en preparación hasta sus tareas.

El fragmento importable de 31 peticiones se entrega en `pruebas/fragmentos/iniciativas.postman_collection.json`, con instrucciones y variables sin secretos en su README. Su ejecución en Postman se verifica al consolidar UI14; las integraciones HTTP anteriores sí se ejecutaron contra MongoDB real.

## API07: eliminación y archivo independientes (decisión actualizada en UI07)

Daniel eligió separar las acciones el 3 de noviembre. Esta decisión sustituye el archivo automático implementado originalmente en `f26bd1c`. El contrato vigente tiene 27 endpoints funcionales.

`DELETE /api/initiatives/:id` acepta solo al dueño, sin query ni cuerpo. Devuelve `204` sin JSON al eliminar atómicamente la iniciativa y su membresía/evento automáticos. Cualquier solicitud histórica, miembro adicional o evento/proyecto produce `409 INITIATIVE_HAS_HISTORY`, sin archivo ni cambio de fechas/revisión. Una archivada puede borrarse únicamente si nunca tuvo historia adicional.

`POST /api/initiatives/:id/archive` es independiente: devuelve `200` con `{data:{id,state:"archived",operation:"archived"}}`, conserva todas las relaciones y funciona incluso sin historia adicional. Repetirlo conserva fecha/revisión. El archivo no cancela solicitudes pendientes, mantiene consulta propia y excluye del catálogo.

Ambas operaciones validan actor y escriben la revisión común dentro de su transacción. Si una relación concurrente confirma primero, DELETE reintenta y rechaza sin archivar. Si el borrado gana, el escritor reintentado encuentra `404` antes de insertar. Los futuros escritores deben validar estado y llamar a `lockInitiativeRevision`; escrituras externas que omitan el protocolo carecen de esa protección.

`canDelete` representa autoridad, no garantía de ausencia de historia. `canArchive` permite archivo al dueño de una iniciativa no archivada. El mock conserva ambas capacidades de lectura; las mutaciones se verifican contra API real.

Evidencia actual del servidor: 66 pruebas locales, lint/fixtures y 17 resultados de integración real (seis pruebas principales y once subcasos de API07) aprobados. Incluye archivo sin historial, DELETE rechazado sin escrituras, permisos de ambos endpoints, archivo idempotente, rollback y carreras. Solicitudes/equipo/proyectos futuros se simulan transaccionalmente hasta que existan sus rutas.

## Consumo del detalle desde React (UI07)

La pantalla valida el UUID, espera la sesión y consulta el detalle según el actor. Separa encabezado e indicadores, información principal, competencias/etiquetas y resumen de equipo/fechas. Un `401` permite ir a ingreso conservando destino; `403` y `404` no exponen datos ni títulos de errores. Respuestas sin permiso tampoco renderizan el DTO. Cambiar identidad/ID retira y cancela el contenido anterior.

Editar, solicitar, convertir y revisar solicitudes dependen de las capacidades booleanas devueltas por la API y de una sesión activa; sus pantallas se completan en UI08/UI11–UI13. Eliminar usa DELETE; Archivar usa POST `/{id}/archive`. Cada botón tiene una confirmación propia y solo acepta la respuesta de su operación. Durante el envío se bloquean confirmaciones/cierre y se evita doble envío. Un rechazo por historial no archiva; explica que el recurso se conserva y permite consultar el detalle para elegir archivo. Tras éxito vuelve a `/mis-iniciativas` con aviso enfocado; ante fallo o resultado incierto retira capacidades antiguas y exige lectura nueva antes de repetir.

Evidencia UI07: 115 pruebas del cliente y 12 integraciones adicionales de React/Express/MongoDB (3 catálogo y 9 detalle), ESLint y build de 142 módulos aprobados. Las integraciones modificaron solo la base de pruebas; el recorrido visual/manual de Daniel está pendiente. El mock admite lectura; eliminación/archivo se verifica usando API real.
