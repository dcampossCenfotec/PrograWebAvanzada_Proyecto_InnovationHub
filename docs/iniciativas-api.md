# Iniciativas: API05 y API06

API05 se publicó en `a5df168`. API06 agrega consultas; la eliminación/archivo sigue pendiente de API07 y las pantallas de UI06–UI10. Las reglas de `docs/api-contract.md` son la fuente del HTTP. Este documento describe el consumo del módulo y la evidencia disponible.

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

`npm run check` aprueba 54 pruebas locales, lint y fixtures. `npm run test:integration` aprueba 5 integraciones seriales con MongoDB real. API06 cubre:

- [x] Matriz visitante/dueño/miembro/ajeno por las cuatro visibilidades y acceso por URL.
- [x] Borrador/archivada fuera del catálogo, propiedad en `/mine` y pérdida de acceso al retirarse.
- [x] DTO saneado y ausencia de coincidencias/conteos por campos ocultos.
- [x] Búsqueda con tildes/mayúsculas, filtros combinados, texto con símbolos y query inválida.
- [x] Más de 25 iniciativas: páginas 1/2/3 y página vacía, total coherente y desempate estable.
- [x] Estimados superados, conteos activos y capacidades ante solicitudes pendientes.
- [x] Seed repetido sin duplicados y normalización de documentos de API05.

Las rutas React `/iniciativas`, `/mis-iniciativas`, `/iniciativas/:id`, creación y edición siguen mostrando “Sección en preparación”. API06 entrega el servidor; la revisión de esas pantallas corresponde a sus tareas UI.

El fragmento importable de 18 peticiones se entrega en `pruebas/fragmentos/iniciativas.postman_collection.json`, con instrucciones y variables sin secretos en su README. Su ejecución en Postman se verifica al consolidar UI14; las integraciones HTTP anteriores sí se ejecutaron contra MongoDB real.
