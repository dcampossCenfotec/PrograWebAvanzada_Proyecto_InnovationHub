# Plan de entrega del segundo avance de Innovation Hub

Versión revisada el 3 de noviembre de 2026. Equipo: Daniel Campos Sánchez y Francisco José Torres Sandoval. Entrega: domingo 8 de noviembre de 2026, hora de Costa Rica. Plan maestro portable del repositorio; estado al cierre UI10. No generar otro PDF salvo petición de Daniel.

Este plan transforma el prototipo existente en la aplicación React–Express–MongoDB exigida, corrige la evaluación del avance 1 y organiza 34 commits implementables. Cada commit incluye verificación y documentación. El registro actual marca CO00, CO01, UI01–UI10 y API01–API07 como completados y publicados (UI10: `5e12be3`). Daniel cerró sus 19 tareas de implementación; las demás tareas corresponden a Francisco y permanecen pendientes.

**Estado de revisión:** incorporadas las ocho respuestas de Daniel: reparto por funcionalidades completas, responsable único y revisor, ejecución local y reglas de negocio resueltas. Las elecciones técnicas que la consigna no fija se justifican en este documento. Los identificadores UI/API señalan la capa del cambio, no al autor. Antes se llamaban A/B; CO reemplaza C para tareas de coordinación, todas con responsable individual.

## 1. Alcance confirmado y límites

Obligatorio: usuarios y perfiles reales; competencias relacionadas; iniciativas persistentes y con cuatro visibilidades; solicitudes completas; equipos; conversión y lectura de proyectos; API de GitHub desde React; filtros, orden y paginación en servidor; pruebas de API; documentación del contrato y modelo. Conservar el diseño Bootstrap/Sass y `avance1/`.

Fuera de esta etapa: modificar/archivar/buscar/filtrar proyectos, panel administrativo completo, CRUD del catálogo general de competencias como extra, chat, pagos, IA de emparejamiento y el backend .NET. No consumir semanas haciendo extras antes de cumplir los 16 criterios del producto.

El plan conserva la fecha de entrega del 8 de noviembre y organiza las tareas por dependencias, entregables y verificaciones. No incluye estimaciones de esfuerzo, dedicación ni duración.

**Riesgo de historial:** hay 21 commits locales en tres fechas de septiembre. La consigna 2 exige al menos 30 distribuidos durante cinco semanas. Se proponen 34 nuevos commits sustantivos y trabajo diario real; eso supera la cantidad, pero no recupera las semanas ya transcurridas. Registrar el incumplimiento temporal y consultar su tratamiento con el docente por cuenta del equipo. No alterar fechas, inventar trabajo previo ni dividir cambios vacíos para simular cumplimiento.

## 2. Punto de partida y correcciones trazables

HEAD auditado: `033361c27b76a673f32c3425ed81ce89f9170d52`. El repositorio estaba limpio. Las 31 pruebas de `avance1/tests/` pasaron. Ninguna prueba sustituye revisar el nuevo servidor, la base real o el navegador. No se verificaron etiquetas remotas; no hay etiquetas locales.

| Hallazgo del avance 1 | Referencia de evaluación | Corrección principal | Control para no repetirlo |
| --- | --- | --- | --- |
| Detalle visual demasiado básico | E16, E20 | UI07 | QA comparando catálogo, detalle y formularios a 360/768/1440 px |
| «Ver detalle» conduce a contenido restringido sin permiso | E20 | API06, UI06, UI07 | Matriz de permisos en API, tarjeta y URL directa |
| Competencias libres, duplicados tardíos y quitar sin confirmar | E21 | API04, UI09 | Catálogo por ID, error al agregar, modal y pruebas de cancelación |
| Etiquetas separadas solo por comas | E21 | UI09 | Chips individuales con quitar accesible y estado controlado |
| Límites y errores visibles solo al enviar | E21, E23 | UI10 | Validación por interacción y pruebas de límites exactos |
| Crear no vuelve al catálogo; editar deja aviso fuera de vista | E21, E22 | UI10 | Navegar solo tras éxito y anunciar confirmación en destino |
| Solicitudes duplicadas, sin retorno ni Cancelar explícito | E26 | API08, UI11 | Restricción en MongoDB y flujo E2E con doble envío |
| Tabla de commits incompleta, falta etiqueta e historial concentrado | E27 | CO00, CO02, CO04 | Seis columnas, revisión diaria y etiqueta comprobada local/remota |
| Revisión real de foco, contraste y responsive pendiente | E14, E15 | UI15 | Evidencia manual en navegador, no solo DOM simulado |
| Advertencias Sass | E17 | UI02 | Compilación reproducible y advertencias registradas; no migrar Bootstrap a ciegas |

También se corrigen divergencias que el README ya reconoce: visibilidades `comunidad/equipo` pasan a institucional/privada mediante mapeo revisado, categorías pasan a las ocho mínimas oficiales, estados dejan de ser «Abierta/En evaluación», y la identidad ficticia deja de autorizar operaciones. No modificar el prototipo histórico para luego volver a corregirlo en React: conservar `avance1/` y hacer las correcciones en `cliente/` y `servidor/`, con trazabilidad en README.

## 3. Reparto por funcionalidades completas

Cada persona implementa API, interfaz, validación y pruebas de sus funcionalidades. Un módulo no se entrega porque su pantalla funcione con un mock: se entrega cuando su API y su interfaz funcionan con MongoDB y pasan sus pruebas. Los commits se mantienen separados cuando el cambio resulta más claro así, pero pertenecen al mismo responsable funcional.

| Funcionalidad | Responsable | Revisor | Commits de cliente y servidor |
| --- | --- | --- | --- |
| Registro, inicio/cierre y sesión | Daniel | Francisco | API03, UI04 |
| Perfiles, competencias y directorio | Daniel | Francisco | API04, UI05 |
| Crear, consultar, modificar y cancelar solicitudes propias | Francisco | Daniel | API08, UI11 |
| Convertir a proyecto, listar/detallar proyectos y GitHub | Francisco | Daniel | API10, UI13 |
| Catálogo, detalle y visibilidad de iniciativas | Daniel | Francisco | API06, UI06, UI07 |
| Crear/editar iniciativas, competencias y etiquetas | Daniel | Francisco | API05, UI08, UI09 |
| Validación y retornos finales del formulario | Daniel | Francisco | UI10 |
| Borrar o archivar iniciativas | Daniel | Francisco | API07, UI07 |
| Solicitudes recibidas, aceptar/rechazar y equipos | Francisco | Daniel | API09, UI12 |

Daniel prepara las bases React/HTTP (UI01–UI03) y Express/MongoDB (API01–API02), y cierra API05–API07/UI06–UI10 antes de entregar el módulo completo de iniciativas. Estas tareas sirven a ambos y no lo convierten en responsable exclusivo de una tecnología. Francisco recibe ese handoff y continúa con solicitudes, equipos, proyectos, colección Postman, QA, contrato, integración, defensa y entrega. Cada autor aporta las pruebas de su propio módulo y corrige sus defectos.

### Titulares de las decisiones y cierres comunes

| Tarea | Responsable único | Revisor | Resultado |
| --- | --- | --- | --- |
| CO00 Contrato y alcance | Daniel | Francisco | Decisiones de esta sesión traducidas a rutas/DTO/códigos/pruebas |
| CO01 Modelo y fixtures | Daniel | Francisco | Modelo, índices, relaciones y escenarios comunes |
| CO02 Integración y README | Francisco | Daniel | Candidato completo y documentación reproducible |
| CO03 Preparación de defensa | Francisco | Daniel | Guía, ejercicios y registro de verificación individual |
| CO04 Etiqueta y TXT | Francisco | Daniel | Versión entregable verificada; la publicación se ejecutará al implementar |

El revisor comprueba contrato, casos límite y evidencia; no pasa a ser coautor obligatorio del cambio. Los dos realizan su propia práctica de defensa, aunque Francisco sea titular de preparar la guía.

### Archivos y límites para reducir conflictos

Ramas propuestas: `codex/avance2-daniel` y `codex/avance2-francisco`, desde la misma base. Integrar cambios pequeños y conservar los commits reales. No hacer squash de todo el bloque si se necesita demostrar historial progresivo.

En React: Daniel mantiene `features/auth/`, `features/users/` y todo `features/initiatives/`; Francisco mantiene solicitudes, equipos y proyectos. En Express, Daniel entrega modelo, escritura, lectura, visibilidad y archivo de iniciativas en API05–API07; Francisco consume esas políticas en solicitudes y proyectos. Una capa no pertenece por completo a una persona.

Para solicitudes, el esquema completo se acuerda en CO01 y Francisco implementa tanto las operaciones del solicitante como las de resolución en servicios separados sobre una sola colección y con estados/transiciones comunes. No crear dos colecciones de solicitudes. Daniel revisa contrato, permisos y carreras; si falta un campo, se hace un cambio acotado y revisado al modelo, no se duplica.

Daniel es titular de `src/app/router.jsx`, cliente HTTP, componentes globales, `docs/api-contract.md`, `docs/modelo-datos.md`, configuración Express, registro central de rutas, conexión MongoDB y módulo completo de iniciativas hasta el handoff. Francisco es titular de la colección Postman final, el QA integral del cliente, las utilidades compartidas de autorización posteriores y la consolidación README. Cada autor entrega las nuevas rutas con un fragmento preciso para el registro central; evitar que ambos reorganicen el mismo archivo a la vez. La implementación de sesión y su middleware es de Daniel. Después de UI10, Francisco consume API05–API07 sin abrir un segundo modelo de iniciativa.

Documentación de autor: `docs/avance2-daniel.md` y `docs/avance2-francisco.md`. Cada commit entrega su cambio de README y su evidencia; Francisco los consolida en CO02. Cada autor agrega sus casos Postman en un fragmento de colección de su módulo bajo `pruebas/fragmentos/`; Francisco integra esos fragmentos en UI14 para producir la colección final única importable. Los fragmentos deben tener formato documentado, IDs estables y cero secretos.

### Entregables y dependencias inevitables

| Proveedor → consumidor | Entregable concreto | Consumidor puede avanzar antes con | Condición de integración |
| --- | --- | --- | --- |
| Daniel → Francisco | Identidad autenticada, middleware y DTO User (API03/API04) | Contexto de usuario inyectado solo en tests y fixtures de contrato; sin bypass de producción | Las rutas reales usan sesión revocable y no un ID enviado por el cliente |
| Daniel → Francisco | Catálogo de competencias y perfiles seguros (API04) | Fixture con los mismos IDs/campos | Formularios y resolución validan competencias persistidas |
| Daniel → Francisco | Módulo de iniciativas: modelo, escritura, lectura, visibilidad y archivo (API05–API07) | Contrato, fixtures y pruebas MongoDB/HTTP | API08–API10 consumen una sola fuente de reglas y revisiones |
| Daniel → Francisco | Catálogo, detalle, formulario, competencias, etiquetas y validación (UI06–UI10) | Pruebas de componentes y recorrido manual | UI11–UI13 reutilizan capacidades y navegación sin reescribir iniciativas |
| Francisco → Daniel | Solicitudes propias/recibidas y equipo transaccional (API08/API09, UI11/UI12) | Fixtures y pruebas de carreras | Daniel revisa que cancelar/aceptar produzcan un solo resultado válido |
| Francisco → Daniel | Conversión, proyectos y GitHub (API10/UI13) | Fixture convertido y estados externos reproducibles | Daniel revisa equipo compartido, permisos y ausencia de secretos |
| Daniel → Francisco | Fragmentos Postman y evidencia de los módulos de Daniel | Casos diseñados desde CO00/CO01 | UI14 integra ambos conjuntos y ejecuta la colección contra API y MongoDB reales |
| Francisco → Daniel | Colección final, guía de importación y reporte de UI14 | Fragmentos propios y matriz de cobertura | Daniel revisa que la colección cubra contrato, seguridad y flujos de ambos autores |
| Daniel → Francisco | Documentación de sus módulos, comandos, evidencia y defectos conocidos | Se actualiza en cada commit de Daniel | CO02 integra README y candidato sin reconstruir ni adivinar el trabajo de Daniel |

Cada entrega contiene hash real, interfaz disponible, comando de prueba, fixture necesario y límites conocidos. Los mocks evitan esperar para construir; no prueban integración. No es posible eliminar dependencias de identidad, iniciativa y equipo sin duplicar reglas; se fijan sus interfaces al principio y se integran en cuanto existan.

## 4. Decisiones de contrato acordadas en CO00

Las reglas de negocio siguientes incorporan las respuestas de Daniel y las elecciones técnicas anteriores se adoptan bajo su autorización. El contrato está publicado: CO00 las convirtió en `docs/api-contract.md` con ejemplos de TODOS los endpoints, campos requeridos/opcionales, nulabilidad, tamaños, códigos, permiso y efectos. Los nuevos módulos consumen ese contrato y su modelo, con revisión de los cambios que resulten necesarios. Se permiten correcciones coordinadas hasta la entrega; después de `entrega-2` el contrato queda congelado para .NET.

### Elecciones técnicas dentro de la consigna

La consigna exige React con Vite, React Router, Node.js/Express, MongoDB, Bootstrap/Sass, validación en servidor, hashing, CORS, pruebas HTTP y contrato documentado. No exige JWT, bcrypt, Mongoose, Atlas ni despliegue público. Se adoptan estas elecciones para este plan, porque Daniel autorizó escoger herramientas adecuadas cuando la consigna no las fija:

- JavaScript/JSX y módulos ES, conservando continuidad con avance1; versiones compatibles fijadas en lockfiles y Node verificado.
- Mongoose para esquemas, validación persistida e integración transaccional, manteniendo repositorios/DTO para no filtrar el modelo Mongo a React ni al futuro contrato .NET. Las operaciones dentro de una misma transacción se esperan en secuencia. [Guía oficial de transacciones](https://mongoosejs.com/docs/transactions.html).
- Autenticación con token opaco Bearer y sesiones revocables en MongoDB; hashing de contraseña con `scrypt` asíncrono de Node y sal aleatoria. La elección prioriza invalidación real al cerrar sesión y evita añadir JWT sin un diseño de revocación. No se implementa un algoritmo criptográfico propio. [API de crypto de Node](https://nodejs.org/docs/latest-v22.x/api/crypto.html#cryptoscryptpassword-salt-keylen-options-callback).
- MongoDB local con replica set de desarrollo, preparado con Docker Compose e instrucciones de inicialización/seed. Docker es una decisión de reproducibilidad, no una exigencia docente. Si algún equipo no puede usarlo, documentar instalación nativa de MongoDB en replica set equivalente; no sustituir por standalone ni por datos en memoria.
- Postman como colección entregable, pruebas HTTP de integración con `node:test`/Supertest, Vitest/Testing Library para componentes y Playwright para recorridos críticos. Si una automatización de navegador no puede ejecutarse en un equipo, dejar ese caso verificado manualmente con evidencia, sin declararlo automatizado.
- `docs/api-contract.md` como contrato principal, con ejemplos JSON ejecutables en pruebas/colección. Campos API en `camelCase` inglés e interfaz española; UUID públicos y fechas ISO. No duplicar un segundo contrato divergente.

**Demostración local:** cliente, API y MongoDB deben arrancar en el equipo de cada estudiante con datos semilla. La consigna no pide publicar esta aplicación, por lo que no se agregan tareas de hosting. GitHub Pages es alojamiento estático y no ejecuta Express/MongoDB; publicar solo React allí no sustituiría el sistema completo. [Documentación de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages). La consulta real a GitHub sigue requiriendo Internet; los mocks sirven para probar fallos y no reemplazan esa integración.

### Convenciones

- URL base configurable, `/api`; JSON con nombres `camelCase` en inglés y textos de interfaz en español. Adaptar los nombres heredados en un solo mapeo, sin mezclar DTO de MongoDB y DTO público.
- IDs públicos UUID en texto, generados por servidor; fechas UTC ISO 8601. No exponer `ObjectId`, `_id`, `__v` ni errores BSON. Las llaves React usan esos IDs, nunca índices.
- Respuesta individual `{ "data": { ... } }`; listado `{ "data": [], "pagination": { "page": 1, "size": 12, "total": 0, "totalPages": 0 } }`.
- Error `{ "error": { "code": "VALIDATION_ERROR", "message": "...", "fields": { "title": "..." } } }`. `fields` siempre es objeto, vacío si no aplica. Cliente decide UX por código estable y campo, no por comparar mensajes.
- `200` consulta/actualización/archivado, `201` creación con `Location`, `204` eliminación física/logout/retiro sin cuerpo, `400` datos/ID mal formado/query inválida, `401` credenciales ausentes o inválidas en ruta protegida, `403` actor autenticado sin permiso, `404` inexistente o privado no visible, `409` correo/solicitud/proyecto duplicado o transición incompatible, `500` fallo inesperado sin traza. Las búsquedas vacías son `200` con lista vacía.
- Listados: `page` desde 1, `size` de 1 a 50, por defecto 12; orden permitido por lista blanca `sort` y `order=asc|desc`, con ID como desempate. Página fuera de rango devuelve lista vacía y totales coherentes. Filtrar permisos ANTES de contar, ordenar y paginar.
- Autenticación elegida: token opaco aleatorio, `Authorization: Bearer ...`, sesión con hash del token y expiración en MongoDB. `logout` revoca esa sesión; no basta borrar el token en React. Cliente conserva solo el token de acceso en `sessionStorage`, lo elimina ante logout/expiración y no guarda iniciativas, perfiles o solicitudes allí. Esto no elimina el riesgo de XSS: no interpretar HTML de usuario y no exponer secretos en el bundle. HTTPS al desplegar fuera del entorno local.
- Campos inmutables enviados en escrituras se rechazan con `400`: ID, propietario, usuario solicitante, fechas de servidor y estado cuando la transición tiene endpoint propio. `PUT` significa reemplazar todos los campos editables del recurso, no cambios parciales ambiguos.

### Recursos y puntos de acceso propuestos

| Recurso | Endpoints que CO00 debe especificar |
| --- | --- |
| Autenticación | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` |
| Usuarios | `GET /api/users?q=&skill=&career=&availability=&page=&size=&sort=&order=`, `GET /api/users/{id}`, `PUT /api/users/me` |
| Catálogos | `GET /api/categories`, `GET /api/skills?q=&page=&size=`; sin CRUD administrativo extra |
| Iniciativas | `GET /api/initiatives?type=&category=&skill=&q=&page=&size=&sort=&order=&state=&hasSpaces=&ownerId=`, `GET /api/initiatives/{id}`, `POST /api/initiatives`, `PUT /api/initiatives/{id}`, `DELETE /api/initiatives/{id}` |
| Mis iniciativas | `GET /api/initiatives/mine?page=&size=&sort=&order=` para incluir privadas propias y archivadas; registrar ruta literal antes de `/{id}` |
| Solicitudes | `POST /api/initiatives/{id}/requests`, `GET /api/requests?scope=mine|received&initiativeId=&state=&skill=&role=&from=&to=&page=&size=`, `GET /api/requests/{id}`, `PUT /api/requests/{id}`, `POST /api/requests/{id}/cancel`, `POST /api/requests/{id}/decision` |
| Miembros | `GET /api/initiatives/{id}/members?skill=&role=&page=&size=`, `DELETE /api/initiatives/{id}/members/{userId}` |
| Proyectos | `POST /api/initiatives/{id}/project`, `GET /api/projects?page=&size=&sort=&order=`, `GET /api/projects/{id}` |

Registrar `scope` obligatorio o su valor por defecto `mine`; `received` solo devuelve solicitudes de iniciativas propias. La decisión recibe `decision: accepted|rejected` y comentario opcional; devuelve solicitud actualizada y resultado de equipo definido. Cancelar conserva el registro. Proyectos no requieren endpoints de edición/archivo/búsqueda en esta etapa.

### DTO mínimos y valores controlados

- `User`: ID, nombres/apellidos, tipo de miembro, correo solo en perfil propio, carrera, descripción, intereses, disponibilidad, portafolio, competencias `{skillId,level}` y fechas. Contraseñas/confirmación solo entran al registro; nunca salen en ningún DTO. Correo del perfil es de solo lectura y un `PUT` que intenta cambiarlo falla.
- `Initiative`: ID, `title`, `type`, `summary`, `description`, `problem`, `beneficiaries`, `categoryId`, `skillIds`, `estimatedMembers`, `visibility`, `tags`, propietario resumido, `state`, `memberCount`, `availableSpaces`, fechas y `access` con capacidades. El DTO resumen omite descripción/problema/beneficiarios sensibles; `access` orienta la interfaz y el servidor vuelve a comprobar cada operación.
- `Request`: ID, iniciativa, solicitante resumido, mensaje, competencia ofrecida, rol, disponibilidad, estado, creación, decisión y respuesta opcional. IDs/fechas/relaciones no editables. Edición y cancelación solo mientras está pendiente.
- `Membership`: ID, iniciativa, usuario resumido, rol, ingreso, estado y retiro. Un documento por periodo de participación; tras retiro, reincorporar crea nuevo ID. Índice único parcial de membresía activa por iniciativa–usuario y eventos conservados en `membershipEvents`; nunca sobrescribir el periodo retirado. El propietario se agrega automáticamente.
- `Project`: ID, iniciativa de origen, propietario, nombre, descripción, objetivo, tecnologías, fecha de inicio, fecha estimada opcional, estado y repositorio opcional. Miembros se consultan desde la iniciativa de origen para evitar dos equipos divergentes.
- Tipos en API: `idea`, `need`, `challenge`. Visibilidad: `public`, `institutional`, `restricted`, `private`. Iniciativas: `draft`, `published`, `forming_team`, `converted`, `archived`. Solicitudes: `pending`, `accepted`, `rejected`, `cancelled`. Proyectos: `planning`, `in_development`, `paused`, `finished`, `archived`. La UI traduce etiquetas.
- Ocho categorías: Tecnología, Educación, Sostenibilidad, Impacto social, Negocios y emprendimiento, Salud y bienestar, Cultura y creatividad, Otro. Usar IDs estables, no el texto presentado como relación. Catálogo inicial de competencias suficiente para los ejemplos, con asociaciones por ID.
- Límites heredados propuestos, salvo ajuste justificado en CO00: título 5–100; resumen 15–240; descripción 20–2000; problema 10–500; beneficiarios 3–150; integrantes entero 1–100; etiquetas 1–40 cada una; solicitud 15–500. Son decisiones del prototipo, no todos mínimos oficiales del documento general. Definir qué campos siguen siendo obligatorios, máximos de arrays y portafolio HTTP(S), además de registro y proyecto. Duplicados se comparan normalizados; IDs de competencias prevalecen sobre sus nombres.

### Visibilidad y conflictos semánticos

| Actor | Pública | Institucional | Restringida | Privada |
| --- | --- | --- | --- | --- |
| Visitante | Catálogo y detalle | No detalle; `401` al solicitar acceso | No catálogo público ni detalle | No catálogo ni detalle; `404` |
| Autenticado ajeno | Completo | Completo | Catálogo con título/tipo/resumen/categoría/competencias; detalle completo `403` | No catálogo ni detalle; `404` |
| Propietario o miembro aceptado | Completo | Completo | Completo | Completo desde mis iniciativas/proyectos o acceso autorizado |

Los borradores y archivadas se excluyen del catálogo general, aunque su propietario puede consultarlos. El servidor calcula permisos y proyección segura. La tarjeta sin acceso completo no presenta «Ver detalle»; puede ofrecer «Solicitar participación» si las reglas lo permiten sin revelar detalles. Copiar la URL o manipular el DOM nunca concede acceso.

La evaluación antigua pedía ocultar casi todo lo restringido; el documento general define metadatos permitidos más amplios. Para la etapa real se sigue la descripción general y la consigna 2; se conserva la corrección de no navegar innecesariamente y de no filtrar contenido completo. La numeración RN también cambia entre documentos: documentar reglas por su significado y equivalencias, sin reutilizar ciegamente números.

Decisión D05 actualizada por Daniel el 3 de noviembre durante UI07: acciones independientes. DELETE solo elimina con `204` si nunca hubo relaciones adicionales al propietario; historial produce `409 INITIATIVE_HAS_HISTORY` sin modificación, incluso ante carreras. POST `/{id}/archive` devuelve `200 archived` con o sin historial y es idempotente. Una archivada sin historial adicional también puede borrarse. Los botones y diálogos son independientes; el servidor nunca convierte DELETE en archivo silencioso.

Decisión D06 confirmada: `estimatedMembers` es una estimación y se permite superarla. Calcular `availableSpaces = max(0, estimatedMembers - activeMemberCount)`; el valor cero no bloquea aceptar ni solicitar. La regla general impide reducir el estimado por debajo de miembros activos: comprobar `nuevo < anterior && nuevo < miembrosActivos`. Si ya hay más miembros que el estimado, guardar otros campos con el mismo estimado debe funcionar; tampoco se rechaza un aumento solo porque todavía quede por debajo de los activos.


Decisión D07 confirmada: se permite una nueva solicitud después de cancelación, rechazo o retiro del equipo efectuado por el propietario. Cada intento nuevo tiene su propio ID/fecha; se conserva la solicitud anterior. Una solicitud aceptada no se reabre ni se edita. Solo se prohíbe la nueva solicitud si ya existe una pendiente o el usuario sigue siendo miembro activo, además de las restricciones de propietario/visibilidad/estado aplicables. El retiro no añade una pantalla de salida voluntaria que la consigna no exige.

Decisión D08 confirmada: convertir no cierra las solicitudes. Una iniciativa `converted` sigue admitiendo nuevas solicitudes, modificación/cancelación de pendientes y resolución por el propietario; aceptar agrega al equipo de la iniciativa, que es el equipo consultado por el proyecto. No se copian equipos independientes ni se cambia el estado de iniciativa de `converted` a `forming_team` al aceptar. Si la iniciativa se archiva, no se crean ni aceptan nuevas solicitudes; no cancelar automáticamente las existentes. El solicitante conserva la posibilidad de cancelar una pendiente, pues esa operación solo requiere que siga pendiente y mantiene la trazabilidad.

Decisión D09 confirmada: una iniciativa válida se publica al guardarse; el servidor asigna `published`. No incluir botón Guardar borrador, página de borradores ni transición borrador→publicada. El enum `draft` se conserva como valor del dominio general y puede usarse en fixtures de acceso negativo, pero no se crea desde el flujo de este avance.

## 5. Modelo y consistencia

Colecciones propuestas: `users`, `skills`, `categories`, `initiatives`, `requests`, `memberships`, `membershipEvents`, `projects`, `sessions`. `membershipEvents` conserva cada ingreso/retiro, referenciado a la membresía, sin agrandar ni truncar un array de historial embebido. No requiere un módulo público adicional: sus eventos se escriben junto al cambio de equipo en la misma transacción. Competencias de perfil embebidas como `{skillId,level}`; intereses/etiquetas como arrays acotados. Usuarios, iniciativas, solicitudes, miembros y proyectos se referencian por UUID porque se consultan por separado, crecen y tendrán equivalentes relacionales. No guardar contraseñas/competencias replicadas en cada solicitud.

Índices: evento de membresía por membershipId/fecha; correo normalizado único; sesión por hash de token y expiración; solicitud única parcial por iniciativa–usuario cuando `pending`; membresía única por iniciativa–usuario; proyecto único por iniciativa de origen; índices que soporten visibilidad/estado/propietario y listados. Mapear violaciones de unicidad a `409`, no `500`.

Aceptar una solicitud debe modificar solicitud y miembro, además de registrar el evento de membresía, en una transacción. Retirar conserva el documento y agrega evento; reincorporar crea nueva membresía y evento, preservando periodos anteriores. Convertir crea proyecto y marca la iniciativa en otra transacción. Aceptar, retirar, convertir y archivar deben actualizar una revisión común de la iniciativa para que operaciones concurrentes incompatibles entren en conflicto y revaliden; comprobar solo antes de escribir deja carreras. Reintentos acotados y traducción estable de conflictos. MongoDB requiere replica set o cluster compatible para transacciones entre documentos: preparar un replica set local de desarrollo y probarlo antes de API09; un MongoDB standalone no basta. [Documentación oficial de MongoDB](https://www.mongodb.com/docs/v8.0/data-modeling/enforce-consistency/transactions/).

No se necesita una arquitectura de microservicios ni un ORM genérico de múltiples bases. Separar rutas/controladores → servicios de negocio → repositorios Mongo, DTO y políticas de autorización basta para este alcance.

## 6. Regla de cierre de cada commit

Aplicar a TODAS las tareas siguientes además de su checklist específico:

- [ ] Cambio acotado a su propósito; se puede explicar y ejecutar sin trabajo oculto.
- [ ] Casos de prueba de la tarea ejecutados y resultado real guardado en `docs/bitacora-avance2.md`, con comando, fecha, entorno y hash disponible. No marcar pruebas planeadas como aprobadas.
- [ ] Si afecta datos/permisos, verificar además el estado persistido, no solo el HTTP o el mensaje.
- [ ] README y documento del responsable actualizados; conservar instrucciones existentes que sigan siendo válidas.
- [ ] Contrato/mocks/consumidor consistentes; ningún secreto, `.env`, token, `node_modules` ni volcado real en Git.
- [ ] Revisión cruzada del propósito, riesgos y evidencia. La otra persona puede recorrer la funcionalidad.
- [ ] Registrar hash real en la tabla de historial después de crear el commit. No usar hashes inventados o fechas futuras como hechos.

Los mensajes de las tareas pendientes son propuestos. Las tareas marcadas como listas ya tienen un commit publicado.

## 7. Fundamentos de coordinación con responsable único

### CO00 — Acordar el contrato HTTP y el alcance de la entrega


**Responsable:** Daniel. **Revisor:** Francisco. **Dependencias:** ninguna. **Mensaje:** `docs: definir contrato HTTP y alcance del avance 2`.

**Cambio y razón:** crear `docs/api-contract.md`, `docs/alcance-avance2.md`, `docs/bitacora-avance2.md` y matriz de reglas equivalentes. Materializar todas las decisiones de la sección 4: ejemplos válidos/inválidos por endpoint, esquema de errores, tokens, permiso por actor, filtros, orden, páginas, DTO y comportamientos de borrar/archivar. Separar requisito docente de decisión técnica. Fijar contrato común evita que ambos inventen respuestas distintas y protege la migración .NET.

**README:** añadir alcance Avance 2, fecha corregida, responsables, estructura futura, enlace al contrato y tabla de historial de seis columnas. Explicar que Avance 1 se conserva y que la distribución de cinco semanas no puede recuperarse.

**Entregable:** Daniel entrega contrato y alcance con D01–D11 resueltas o derivadas explícitamente de la consigna; Francisco revisa ejemplos y compatibilidad del modelo. Los módulos de ambos pueden comenzar con fixtures del mismo contrato.

**Checklist:**

- [ ] Cada recurso tiene rutas, verbos, body/query, DTO, permisos y códigos.
- [ ] Los códigos requeridos aparecen con ejemplos y las respuestas `204` no llevan JSON.
- [ ] Las contradicciones RN y eliminación tienen decisión escrita, sin prometer aclaraciones inexistentes.
- [ ] No se incluyeron funciones de proyectos reservadas a la entrega final.

**Pruebas:** Daniel recorre cada respuesta del registro de decisiones y la transforma en endpoint, transición y prueba; Francisco contrasta requisitos y modelo. Simular creación publicada, borrar/archivar, reintento de solicitud, aceptación sobre estimados y después de conversión. Para cada recurso revisar éxito/invalidación/inexistente/no autorizado y que los dos puedan implementar cliente y servidor desde los mismos ejemplos. Esta revisión documenta diseño y no cuenta como API funcionando.

### CO01 — Definir modelo, fixtures compartidos y estrategia de pruebas


**Responsable:** Daniel. **Revisor:** Francisco. **Dependencias:** CO00. **Mensaje:** `docs: modelar MongoDB y acordar fixtures de integración`.

**Cambio y razón:** Daniel crea `docs/modelo-datos.md`, `pruebas/fixtures/` y `docs/matriz-pruebas.md`: colecciones/relaciones, embebido frente a referencias, índices únicos, transacciones, estados y migración de ocho iniciativas. Preparar IDs UUID estables de cuatro actores: propietario A, solicitante B, ajeno C e inactivo D; añadir visitante sin sesión. Escenarios: cuatro visibilidades, borrador, archivada, propietario solo, equipo formado, solicitudes en cuatro estados y proyecto existente. No guardar contraseñas reales ni tokens en fixtures. Francisco revisa el diseño antes de que Daniel lo implemente en Mongoose en API02; cualquier incompatibilidad se resuelve en CO01 antes de abrir modelos paralelos.

**README:** añadir resumen del modelo, datos de demostración y comandos que se implementarán, señalados como pendientes hasta existir. Enlazar la matriz de pruebas.

**Entregable:** Daniel entrega fixtures que alimentan mocks y seed real, y matriz con requisito → endpoint/pantalla → casos → evidencia. Francisco confirma por revisión que Daniel puede implementar API02 sin reinterpretar relaciones, índices ni estados.

**Checklist:**

- [ ] Toda relación está justificada y tiene equivalente relacional previsto.
- [ ] Fixtures incluyen datos de frontera y todos los actores/visibilidades.
- [ ] Nombres heredados se mapean explícitamente; Ambiente→Sostenibilidad y Comunidad→Impacto social se revisan por contenido, no solo por texto.
- [ ] La prueba de transacción se podrá ejecutar en replica set.

**Pruebas:** validar JSON y referencias entre IDs; comprobar que cada estado/visibilidad aparece y que ninguna solicitud apunta a un usuario inexistente. Recorrer fixtures con ambos: ¿quién debe ver qué?, ¿qué iniciativa puede convertirse?, ¿cuál debe archivarse? Reservar conjuntos aislados para pruebas concurrentes y datos destructivos; nadie debe borrar la base de la otra persona.

## 8. Commits base, identidad y flujos posteriores

### UI01 — Crear la aplicación React con Vite y rutas base


**Responsable:** Daniel. **Revisor:** Francisco. **Dependencias:** CO00. **Mensaje:** `feat(cliente): iniciar React con Vite y rutas del sistema`.

**Cambio y razón:** crear `cliente/` con JavaScript/JSX, React, Vite, React Router, ESLint y scripts `dev`, `build`, `preview`, `lint` y `test`. Fijar versiones compatibles en lockfile y versión Node en `.nvmrc`/`engines`; usar Node 22.12 o posterior compatible verificado, sin asumir que cualquier Node 22 sirve. La guía actual de [Vite](https://vite.dev/guide/) exige mínimos concretos. Agregar `src/app/router.jsx`, layout y páginas iniciales para `/`, `/iniciativas`, `/mis-iniciativas`, `/iniciativas/:id`, `/iniciativas/nueva`, `/iniciativas/:id/editar`, `/iniciativas/:id/participar`, `/iniciativas/:id/convertir`, `/perfil`, `/usuarios`, `/usuarios/:id`, `/mis-solicitudes`, `/solicitudes/:id`, `/solicitudes/:id/editar`, `/solicitudes-recibidas`, `/proyectos`, `/proyectos/:id`, `/ingresar`, `/registro` y ruta comodín. No copiar listeners imperativos del prototipo dentro de React.

**README:** instalación y comandos del cliente, versión Node probada, URL local y rutas; distinguir placeholders de funciones terminadas.

**Entregable:** cliente que compila y permite navegar, sin depender de API.

**Checklist:**

- [ ] `avance1/` permanece intacto y el nuevo proyecto está en `cliente/`.
- [ ] Links internos usan Router y el detalle lee el parámetro de ruta.
- [ ] Hay página 404 y scripts reproducibles con lockfile.

**Pruebas:** `npm ci`, `npm run lint`, `npm run build` desde `cliente/`. Abrir rutas con Link y con URL directa, usar Atrás/Adelante y cambiar el ID del detalle; la ruta desconocida muestra 404 accesible. Confirmar que no se recarga todo el documento al navegar. No escribir pruebas que solo comprueben el texto de placeholders; la revisión manual y el build bastan aquí.

### UI02 — Trasladar el tema Sass y la composición visual


**Responsable:** Daniel. **Revisor:** Francisco. **Dependencias:** UI01. **Mensaje:** `style(cliente): conservar Bootstrap y el tema Sass del prototipo`.

**Cambio y razón:** portar variables y parciales de `avance1/scss/` a `cliente/src/styles/`; separar variables, layout y componentes. Reutilizar Bootstrap en grilla, navbar, cards, formularios y modales. Extraer `AppLayout`, `Navbar`, `PageHeader`, `StatusPanel` y `ConfirmDialog` mediante props/children. Incluir salto al contenido, idioma español, foco visible y pie común. React controla apertura/cierre de componentes; evitar que scripts globales de Bootstrap y React intenten controlar el mismo nodo. No rediseñar el producto desde cero.

**README:** ubicación de Sass, cómo se compila en Vite, componentes reutilizables y advertencias concretas que queden. No prometer que cambiar `@import` por `@use` en Bootstrap es trivial.

**Entregable:** layout y componentes compartidos listos para todas las páginas.

**Checklist:**

- [ ] Se conserva identidad de colores, tipografía y espaciados con contraste revisable.
- [ ] La grilla y navegación funcionan en móvil/tablet/escritorio.
- [ ] No hay listeners Bootstrap duplicados ni CSS generado editado manualmente.

**Pruebas:** compilar Sass mediante `npm run build`; revisar consola y registrar deprecaciones. A 360, 768 y 1440 px, abrir/cerrar menú y modal con teclado, Escape y botón Cancelar; el foco vuelve a quien abrió el modal y no queda detrás del overlay. Comparar capturas con el prototipo para detectar pérdida de identidad; comprobar que zoom al 200 % mantiene acceso a acciones.

### UI03 — Implementar cliente HTTP, mocks y estados de consulta


**Responsable:** Daniel. **Revisor:** Francisco. **Dependencias:** UI01, CO00, CO01. **Mensaje:** `feat(cliente): centralizar HTTP y simular respuestas del contrato`.

**Cambio y razón:** crear `src/api/http.js`, servicios por dominio, `src/hooks/useApiQuery.js` y mocks de red basados en fixtures, activados solo en desarrollo/test con bandera explícita. Leer `VITE_API_BASE_URL`, adjuntar bearer, interpretar errores uniformes, no intentar leer JSON en `204` y manejar expiración `401`. Construir query mediante URLSearchParams. Las consultas cancelan o ignoran respuestas obsoletas al cambiar parámetros/desmontar; [React documenta esta limpieza](https://react.dev/reference/react/useEffect). No crear un almacén paralelo de iniciativas en localStorage.

**README:** variables públicas del cliente, modo simulado frente a real, cómo activar cada uno y sus límites.

**Entregable:** Francisco recibe mocks y ejemplos consumibles; las pantallas pueden construirse antes de tener todos los endpoints.

**Checklist:**

- [ ] API base centralizada y ningún secreto en `VITE_*`.
- [ ] `loading/error/empty/success` y reintento son explícitos.
- [ ] Mocks apagados en build/entrega e incapaces de disimular una API caída.

**Pruebas:** con red simulada, cubrir `200`, `201`, `204`, error de campos `400`, `401`, `403`, `404`, `409`, `500`, JSON inválido y fallo de red. Lanzar consulta A lenta y B rápida y comprobar que A no reemplaza B. Desmontar durante espera sin actualizar la pantalla retirada; probar StrictMode. Cambiar únicamente `VITE_API_BASE_URL` para demostrar que no hay URLs de servidor desperdigadas.

### API01 — Crear Express en capas y configuración segura


**Responsable:** Daniel. **Revisor:** Francisco. **Dependencias:** CO00. **Mensaje:** `feat(servidor): iniciar Express con capas y errores uniformes`.

**Cambio y razón:** `servidor/src/app.js`, `server.js`, `routes/`, `controllers/`, `services/`, `repositories/`, `middleware/`, `config/`, `dto/`. Separar app de escucha para probar HTTP sin arrancar un puerto fijo. Configurar JSON limitado, variables, CORS para `CLIENT_ORIGIN`, manejo central de errores y ruta no encontrada. `.env.example` sin secretos y `.gitignore` actualizado para ambos paquetes. Documentar un endpoint operativo de salud en CO00 antes de implementarlo. Escoger una versión Express mantenida y fijarla con lockfile; la [guía de errores](https://expressjs.com/en/guide/error-handling/) describe comportamiento según la versión.

**README:** instalación del servidor, Node verificado, variables `PORT`, `CLIENT_ORIGIN`, `MONGODB_URI`, nombre de base y comandos `dev/start/test`. No escribir una URI real.

**Entregable:** esqueleto HTTP utilizable por Postman sin depender del cliente.

**Checklist:**

- [ ] Rutas no contienen lógica Mongo ni toda la aplicación en un archivo.
- [ ] Error uniforme y ningún stack/error interno en producción.
- [ ] Origen permitido explícito y configuración ausente falla con mensaje útil.

**Pruebas:** arranque válido y con variable requerida ausente; ruta inexistente `404`; body JSON roto `400`; fallo simulado `500` con cuerpo sanitizado en un test. Hacer preflight desde origen permitido y distinto, comprobar headers y política documentada. Enviar la misma petición con curl sin Origin confirma que CORS no sustituye autenticación. `npm ci` y runner se ejecutan con lockfile.

### API02 — Persistir el modelo y cargar datos semilla


**Responsable:** Daniel. **Revisor:** Francisco. **Dependencias:** API01, CO01. **Mensaje:** `feat(servidor): modelar MongoDB e inicializar datos de prueba`.

**Cambio y razón:** Preparar conexión MongoDB, gestión de índices del modelo acordado, validación de configuración, apagado limpio y replica set local de desarrollo. Los esquemas de dominio se implementan por su titular en API03/API04/API05/API08/API09/API10, consumiendo la misma conexión y colección acordadas. Crear infraestructura de seed con fixtures separados por módulo: en este commit cargar catálogos y comprobar referencias estáticas; el seed de demostración completo se verifica en API13 cuando existan usuarios, hashing y módulos. No importar localStorage ni borrar bases ajenas. Mapear explícitamente datos heredados a IDs, categorías y estados oficiales.

**README:** cómo levantar MongoDB/replica set, URI de ejemplo, seed, reset limitado a base test y recuperación. Registrar versión exacta de MongoDB probada.

**Entregable:** Daniel entrega a Francisco la conexión transaccional, índices de contrato, fixtures y estructura de seed. Ambos pueden implementar sus modelos/servicios sin reconfigurar la base; la carga completa de demo se cierra en API13.

**Checklist:**

- [ ] Índices únicos realmente creados; no solo declarados en código.
- [ ] Seed no duplica registros y no borra colecciones ajenas.
- [ ] Transacción de dos escrituras funciona sobre el entorno documentado.

**Pruebas:** Inicializar replica set, ejecutar seed de catálogos dos veces y comparar conteos. Probar índices de unicidad con documentos aislados de test, no inventando usuarios de producción. Ejecutar transacción con fallo en la segunda escritura y comprobar rollback total. Reiniciar API/DB y releer datos. Validar referencias de fixtures estáticamente y dejar la carga del conjunto completo como requisito explícito de API13. Probar base inaccesible sin imprimir URI/secretos; no usar un mock como prueba de transacción.

### API03 — Implementar autenticación revocable y hashing


**Responsable:** Daniel. **Revisor:** Francisco. **Dependencias:** API01, API02. **Mensaje:** `feat(servidor): autenticar usuarios y revocar sesiones al salir`.

**Cambio y razón:** registro/login/logout/me y middleware de sesión. Normalizar correo, validarlo e imponer unicidad en DB. Validar confirmación, términos y campos de registro; generar ID/estado/fechas. Hash con `scrypt` asíncrono, sal aleatoria de al menos 16 bytes, parámetros guardados junto al hash y comparación segura; nunca cifrado reversible ni hash rápido directo de contraseña. Documentar parámetros y coste medido. Generar token opaco con aleatoriedad criptográfica y guardar solo su hash; validar expiración/revocación en cada petición, aunque el índice TTL aún no lo haya borrado. [Node documenta scrypt y sal](https://nodejs.org/api/crypto.html#cryptoscryptpassword-salt-keylen-options-callback).

**README:** protocolo de sesión, hashing, duración configurada, cierre real y ejemplos HTTP sin tokens reales. Separar contraseña de demo de secretos de producción.

**Entregable:** Daniel entrega autenticación real, middleware de sesión y contexto de actor estable para las rutas de ambos. Francisco verifica una ruta propia con sesión válida, ausente, expirada y revocada.

**Checklist:**

- [ ] Correo repetido normalizado devuelve `409`, incluso con solicitudes simultáneas.
- [ ] Respuestas y logs no incluyen contraseña, hash ni token de otros usuarios.
- [ ] Logout revoca el token usado y login de inactivo se rechaza.

**Pruebas:** registrar válido/invalidar confirmación/términos/formato; login correcto y erróneo; dos usuarios con misma contraseña tienen hashes distintos. Duplicar correo con mayúsculas/espacios y con dos POST concurrentes: una creación y un conflicto. Consultar sin token/con token corrupto/vencido y tras logout: `401`. Reutilizar un token guardado antes de salir también falla. Revisar DTO de TODOS los endpoints de usuario; confirmar ausencia de hashes, no solo en `/auth/me`.

### UI04 — Construir registro, inicio y cierre de sesión


**Responsable:** Daniel. **Revisor:** Francisco. **Dependencias:** UI02, UI03; API03 solo para integración real. **Mensaje:** `feat(cliente): agregar autenticación y navegación de sesión`.

**Cambio y razón:** formularios controlados de registro/login, contexto de sesión, carga de `/auth/me`, manejo de expiración y protección de rutas de escritura. Registro captura nombres, tipo de miembro, correo, contraseña/confirmación y términos; carrera se completa en API04/UI05 porque `/auth/register` rechaza campos opcionales del perfil. Cierre llama API y borra sesión del cliente al confirmarse; si la red impide revocación, informar y ofrecer reintentar, sin afirmar que la sesión del servidor ya terminó. Al ingresar restaurar una ruta interna segura, nunca redirigir a una URL externa arbitraria.

**README:** recorrido de acceso, caducidad y cierre de sesión, cuentas de prueba por rol y límites del almacenamiento del token.

**Entregable:** interfaz de sesión probada contra mocks y luego contra API03.

**Checklist:**

- [ ] Identidad visible proviene de API, no de `USUARIO_ACTUAL`.
- [ ] Errores específicos por campo y bloqueo de doble envío.
- [ ] Visitante puede explorar públicas; rutas privadas conducen a ingresar.

**Pruebas:** registrar correctamente; probar confirmación distinta, términos sin aceptar, correo inválido y correo duplicado `409`. Login válido/inválido y token vencido; refrescar página restaura la sesión permitida. Logout y volver con Atrás no devuelve acceso a rutas protegidas. Con servidor real, intentar una petición con el token cerrado: debe fallar, validación cuya responsabilidad final es API03/API12.

### API04 — Implementar perfiles, competencias y directorio


**Responsable:** Daniel. **Revisor:** Francisco. **Dependencias:** API02, API03. **Mensaje:** `feat(servidor): gestionar perfiles y buscar colaboradores`.

**Cambio y razón:** consultas de usuario, `PUT /users/me`, directorio protegido y catálogos controlados. Validar campos, URL de portafolio, asociaciones `skillId/level`, niveles permitidos y duplicados. Rechazar modificación de correo, ID o estado desde perfil; dueño se toma de sesión. Guardar `updatedAt`; directorio combina nombre/competencia/carrera/disponibilidad con proyección mínima, orden y paginación. Catálogos no permiten crear valores arbitrarios mediante payload de perfil/iniciativa.

**README:** permisos y campos editables, relación de competencias por ID, filtros y ejemplos de error.

**Entregable:** Daniel entrega perfil/catálogos y sus pantallas UI05; Francisco recibe IDs estables de habilidades y un DTO seguro para formularios de iniciativas y resolución de solicitudes.

**Checklist:**

- [ ] Nadie modifica perfil ajeno eligiendo un `userId` en body.
- [ ] Correo privado y datos de sesión no aparecen en directorio.
- [ ] Consulta de habilidades está paginada si crece; categorías acotadas son catálogo fijo.

**Pruebas:** consultar/modificar perfil propio y leerlo después del reinicio. Probar competencia inexistente, nivel inválido, misma habilidad dos veces, portafolio `javascript:` y correo/ID enviados como editables: `400`. Visitante al directorio `401`; usuario sin acceso a mutación ajena no modifica nada. Probar nombre con tildes, filtros combinados, páginas y orden; inspeccionar respuesta completa buscando información privada y hashes. Comparar total con conteo autorizado en DB.

### UI05 — Migrar perfil y crear directorio de usuarios


**Responsable:** Daniel. **Revisor:** Francisco. **Dependencias:** UI03, UI04; usa contrato API04. **Mensaje:** `feat(cliente): consultar perfiles y filtrar colaboradores`.

**Cambio y razón:** `features/users/` con perfil propio consultable/editable, competencias por catálogo y nivel, intereses, disponibilidad, portafolio y directorio. Correo visible solo en vista propia y no editable. Búsqueda por nombre y filtros competencia/carrera/disponibilidad se envían al servidor con página/orden; no descargar todos los usuarios para filtrar. Mostrar iniciativas/proyectos desde APIs, sin llamar «proyectos» a simples membresías del prototipo.

**README:** campos editables/inmutables, uso del directorio y datos que se muestran públicamente a usuarios autorizados.

**Entregable:** componentes de usuario y edición reutilizables para formularios y solicitudes.

**Checklist:**

- [ ] Múltiples competencias se asocian por ID y nivel, sin duplicados.
- [ ] Perfil ajeno no expone controles de editar ni correo privado.
- [ ] Lista, perfil y catálogo de competencias tienen carga/error/vacío.

**Pruebas:** guardar/recargar perfil, abrir perfil de otro usuario, simular error `400` desde servidor y confirmar conservación del formulario. Filtrar combinando nombre/carrera/competencia/disponibilidad; revisar query en Network y reinicio de página al cambiar criterio. Probar vacío, fallo y reintento. Enviar manualmente correo o ID modificado a API04 debe ser rechazado aunque la UI no lo ofrezca.

### API08 — Implementar ciclo personal de solicitudes y duplicados


**Responsable:** Francisco. **Revisor:** Daniel. **Dependencias:** API03, API05, API06. **Mensaje:** `feat(servidor): crear editar y cancelar solicitudes pendientes`.

**Cambio y razón:** Francisco implementa modelo completo de solicitud según CO01, POST, consulta/listado propio, PUT pendiente y cancelación. El solicitante proviene de sesión; validar visibilidad, iniciativa no archivada y competencia del perfil del solicitante; no exigir que sea requerida por la iniciativa. Admitir iniciativas `published`, `forming_team` y `converted` según D08. Impedir solicitud propia, miembro activo y dos pendientes simultáneas con índice único parcial. D07 permite un nuevo intento tras cancelación/rechazo/retiro: crear otro ID sin modificar solicitudes terminales. Conservar campos/fecha originales al editar, y cancelar por escritura condicional pendiente; la cancelación sigue disponible aunque se archive la iniciativa. Separar estas operaciones de la resolución de API09 aunque ambas sean responsabilidad de Francisco.

**README:** ciclo de estados, conflicto de duplicados, diferencias entre solicitud y membresía, ejemplos de error.

**Entregable:** UI11 recibe ciclo del solicitante y una prueba concurrente reproducible.

**Checklist:**

- [ ] Dos peticiones simultáneas no generan dos pendientes.
- [ ] Cancelación conserva registro y nuevas solicitudes siguen regla de CO00.
- [ ] Consultar/editar solicitud de otro nunca muestra su contenido.

- [ ] Reintentar genera otro ID; el estado terminal del intento previo no cambia.
- [ ] Una iniciativa converted permite nuevas solicitudes.

**Pruebas:** Crear válido, inválido, iniciativa inexistente y actor sin permiso; rechazar iniciativa propia, miembro activo y competencia inexistente o ajena al perfil; una competencia propia no requerida por la iniciativa sí es válida. Dos POST concurrentes producen un `201`, un `409` y una pendiente. Cancelar y volver a solicitar genera nuevo ID y conserva el cancelado; repetir tras rechazo y tras retiro de una membresía previamente aceptada. No reabrir ni editar la solicitud aceptada. Editar/cancelar pendiente conserva identidad/fecha; estados terminales dan `409`. Solicitar a iniciativa convertida funciona y a archivada falla; cancelar una pendiente de archivada sigue funcionando. Carreras con aceptar se verifican junto con API09.

### UI11 — Implementar solicitudes propias y corregir el envío


**Responsable:** Francisco. **Revisor:** Daniel. **Dependencias:** UI03, UI04; integración API08. **Mensaje:** `feat(cliente): gestionar solicitudes propias sin duplicados pendientes`.

**Cambio y razón:** Francisco entrega formulario y mis solicitudes con filtros/páginas, detalle, edición y cancelación de pendientes contra API08, de su misma responsabilidad. La competencia ofrecida se selecciona desde el perfil del solicitante, no desde las requeridas por la iniciativa. Tras enviar, volver al catálogo con aviso visible; Cancelar es una acción explícita y protege cambios sin guardar. Reflejar D07: permitir nuevo intento tras rechazo/cancelación/retiro, sin presentar como editable la solicitud anterior; impedir duplicado pendiente y miembro activo. D08 permite solicitar a una iniciativa convertida. Mostrar historial de intentos por su ID y manejar `409` desde la API sin borrar valores ni agregar miembros al solicitar.

**README:** ciclo de estados, diferencia entre enviar y ser aceptado, cancelación conservando historia y corrección E26.

**Entregable:** solicitante puede completar su ciclo sin ayuda del propietario en la UI.

**Checklist:**

- [ ] Doble click y petición repetida no muestran dos solicitudes pendientes.
- [ ] Aceptadas/rechazadas/canceladas no tienen edición ofrecida.
- [ ] Hay Cancelar, retorno al catálogo y aviso en destino.

- [ ] El historial distingue intentos nuevos de edición del intento anterior.

**Pruebas:** Enviar solicitud y confirmar pendiente sin membresía. Repetir en otra pestaña: `409`. Cancelar y volver a solicitar: dos registros distintos con estados correctos; repetir tras rechazo y tras retiro gestionados por el propietario. Una aceptada se consulta sin edición y el nuevo intento solo está disponible si ya no es miembro activo. Enviar a convertida funciona y a archivada no. Verificar retorno al catálogo/aviso, Cancelar, errores de campo, sesión vencida y listado vacío/error/carga con API real.

### API10 — Convertir a proyecto y permitir listado y consulta


**Responsable:** Francisco. **Revisor:** Daniel. **Dependencias:** API09, API07. **Mensaje:** `feat(servidor): convertir iniciativas y consultar proyectos accesibles`.

**Cambio y razón:** Francisco implementa conversión y listado/detalle de proyectos. Dueño autenticado, al menos otro miembro activo, iniciativa no archivada y sin proyecto previo; validar campos, fechas y URL HTTP(S) según contrato. Crear proyecto `planning` con origen único y marcar iniciativa `converted` en transacción, consumiendo las políticas/revisión de iniciativa entregadas por Daniel en API05 y las membresías reales de API09. D08 obliga a consultar el equipo vinculado a la iniciativa: las aceptaciones/retiros posteriores se reflejan en proyecto sin copia independiente. El servidor valida la URL HTTP(S) contractual; React identifica un repositorio de GitHub antes de consumir su API externa. No agregar modificación/archivo/búsqueda de proyectos reservados a final.

**README:** precondiciones, transacción, vínculo al origen, campos de proyecto y funciones diferidas a final.

**Entregable:** Francisco entrega conversión/lectura junto con UI13; Daniel verifica que la relación de proyecto obliga a archivar y que aceptar después de convertir conserva el equipo compartido.

**Checklist:**

- [ ] Un proyecto máximo por iniciativa, protegido con índice único.
- [ ] Sin otro miembro o con origen archivado la conversión no procede.
- [ ] Acceso a proyecto respeta permisos de la iniciativa, también tras retiro.

**Pruebas:** Dueño solo: `409`; aceptar un miembro y convertir: `201`, origen conservado y estado actualizado. Dos conversiones simultáneas crean un proyecto; fallo tras insertar revierte ambos cambios. Competir con retiro del último miembro/archivo revalida la precondición. Fechas imposibles y URL no HTTP(S) se rechazan; el consumidor GitHub no interpreta un host engañoso como github.com. Tras convertir, aceptar otro usuario y luego retirarlo cambia el equipo del proyecto sin duplicarlo; la iniciativa permanece `converted` y el permiso del retirado se revoca. Listar/detallar privados como ajeno no filtra nombre/objetivo.

### UI13 — Agregar proyectos y consulta pública de GitHub


**Responsable:** Francisco. **Revisor:** Daniel. **Dependencias:** UI03, UI07; integración API10. **Mensaje:** `feat(cliente): convertir iniciativas y mostrar repositorios de GitHub`.

**Cambio y razón:** formulario controlado de conversión, listado de proyectos accesibles y detalle. Capturar nombre, objetivo, descripción, tecnologías, inicio, fin opcional y repositorio opcional según contrato; mostrar origen, equipo y estado. Deshabilitar conversión sin permiso sin sustituir regla del servidor. Consumir GitHub directamente desde cliente con URL base/version pública configurables, sin token privado. Mostrar nombre, propietario, descripción, lenguaje, rama, actualización y asuntos abiertos; manejar nulos. Un 404 anónimo no permite distinguir inexistente de privado: mensaje «No existe o no es accesible públicamente», coherente con [GitHub](https://docs.github.com/en/rest/using-the-rest-api/troubleshooting-the-rest-api).

**README:** flujo de conversión y alcance de proyectos, variables públicas, límites de GitHub y semántica del mensaje 404.

**Entregable:** flujo principal completo hasta proyecto y repositorio; estados externos reproducibles mediante mocks.

**Checklist:**

- [ ] Se conserva iniciativa de origen y no se agregan pantallas de edición/archivo de proyecto.
- [ ] No hay secretos de GitHub en variables Vite, requests o bundle.
- [ ] Errores GitHub no impiden consultar el proyecto propio.

- [ ] Los miembros posteriores a conversión se consultan desde el equipo vinculado.

**Pruebas:** convertir con y sin otro miembro; repetir conversión debe mostrar conflicto. Proyecto sin repositorio no hace fetch externo. Simular respuesta válida, lenguaje nulo, JSON inválido, 404, 403/429 por límite, 503, offline y timeout. Respetar `Retry-After`/reset sin bucle de reintentos; probar cambio rápido de proyecto y abortar respuesta anterior. Usar un repositorio público real para una comprobación breve, sin agotar límites ni depender de red para toda la suite.

## 9. Commits de iniciativas, integración y cierre

### API05 — Crear y editar iniciativas con reglas en servidor


**Responsable:** Daniel. **Revisor:** Francisco. **Dependencias:** API02, API03, API04. **Mensaje:** `feat(servidor): crear y modificar iniciativas con validación propia`.

**Cambio y razón:** Daniel implementa POST/PUT y modelos de iniciativa con DTO y validación de textos, tipo/categoría/competencias, visibilidad, etiquetas e integrantes. Derivar propietario de sesión activa y crear su membresía automática sin duplicación, de forma consistente. Asignar siempre `published` al crear; D09 excluye borradores. PUT conserva identidad/creación, actualiza fecha y exige dueño. D06 permite superar estimados: rechazar únicamente una reducción que quede por debajo de miembros activos; no rechazar edición de otros campos con estimado sin cambios. No asignar libremente el body al documento Mongo. Exportar políticas y operaciones sobre revisión de iniciativa para que Francisco las consuma en API08–API10.

**README:** reglas de escritura, estado inicial y campos de servidor, con ejemplos POST/PUT del contrato.

**Entregable:** Daniel entrega API05, su evidencia y las políticas de iniciativa; UI08–UI10 pueden crear/editar realmente contra MongoDB y Francisco recibe una base única para las APIs posteriores.

**Checklist:**

- [ ] Único propietario activo y membresía automática creada una sola vez.
- [ ] Campos extra/inmutables no se aceptan por asignación masiva.
- [ ] Validación devuelve `fields` utilizables por React.

- [ ] El estado inicial es published y no existe flujo de borrador.
- [ ] La edición de otro campo no falla por haber superado el estimado sin cambiarlo.

**Pruebas:** Crear una iniciativa y leerla tras reinicio: estado `published`, dueño de sesión y membresía única. Probar fronteras de campos y relaciones, arrays duplicados, etiquetas vacías y claves inmutables/extra. Como otro usuario no se edita. Simular fallo de alta de miembro: no queda iniciativa parcial. Con estimado 2 y tres miembros activos, conservar 2 al cambiar título funciona, aumentar funciona y reducir a 1 falla; con tres miembros reducir de 5 a 3 funciona y de 5 a 2 falla. Repetir con Postman sin React.

### API06 — Consultar, filtrar y proteger iniciativas


**Responsable:** Daniel. **Revisor:** Francisco. **Dependencias:** API05. **Mensaje:** `feat(servidor): filtrar iniciativas y aplicar visibilidad por actor`.

**Cambio y razón:** catálogo, mis iniciativas y detalle con filtros texto/tipo/categoría/competencia/estado/espacios/propietario; búsqueda sobre título/resumen/etiquetas permitidos. Aplicar política de actor antes de proyección/conteo/página. DTO resumen restringido solo contiene metadatos permitidos; detalle privado/institucional/restringido cumple matriz. Calcular capacidades, conteos/espacios y evitar consultas repetidas por cada tarjeta. Validar query contra lista blanca y escapar entrada usada en regex o usar estrategia de texto normalizado que mantenga tildes/mayúsculas.

**README:** matriz de visibilidad, filtros reales y orden/páginas, diferencias respecto al prototipo y corrección E20.

**Entregable:** UI06/UI07 reciben listados y capacidades consistentes con tests HTTP.

**Checklist:**

- [ ] Privadas no aparecen ni inflan `total` de catálogo ajeno.
- [ ] Descripción/problema restringidos no llegan al cliente ajeno.
- [ ] Propietario/miembro aceptado sí leen contenido autorizado por URL.

**Pruebas:** matriz visitante/A dueño/B miembro/C ajeno × cuatro visibilidades para lista y detalle; repetir por IDs conocidos y filtros que coincidan solo con secretos. Verificar respuestas, totales y capacidades, no solo controles UI. Usar al menos 25 iniciativas para comprobar páginas 1/2/3, orden estable y búsqueda combinada. Probar `size=0`, negativo, mayor a 50, sort no permitido, fechas/IDs/boolean inválidos y texto con símbolos; `400` sin consulta inyectada. Confirmar que se evita descargar toda la base para después filtrar en memoria del servidor.

### UI06 — Migrar catálogo con búsqueda y paginación de servidor


**Responsable:** Daniel. **Revisor:** Francisco. **Dependencias:** UI02, UI03; integración API06. **Mensaje:** `feat(cliente): consumir catálogo paginado y mostrar permisos de acceso`.

**Cambio y razón:** `features/initiatives/CatalogPage`, tarjeta, barra de filtros y paginador. Mantener explicación del sistema y navegación del inicio. Texto/tipo/categoría/competencia/estado/espacios/propietario y orden se representan en URL; aplicar solo filtros del contrato. Conservar búsquedas sin tildes/mayúsculas en el servidor. Tarjeta usa `access.canViewDetails` para omitir enlace de detalle cuando no corresponde y comunica la restricción antes de navegar. Opciones controladas vienen de catálogos, no de descargar toda la colección.

**README:** filtros disponibles, comportamiento de URL/páginas, limitaciones de visibilidad y corrección E20.

**Entregable:** Daniel entrega el catálogo junto con API06 como una funcionalidad completa; Francisco recibe el DTO de iniciativa y sus capacidades para usarlo en solicitudes y proyectos.

**Checklist:**

- [ ] Filtrar cambia petición HTTP y no usa `array.filter` sobre la colección completa.
- [ ] Cambiar filtro vuelve a página 1; limpiar restaura todos los criterios.
- [ ] Tarjetas restringidas no contienen descripción/problema ni enlaces sin permiso.

**Pruebas:** combinar cuatro filtros y texto con tildes; comprobar en Network `page/size` y resultados de la API. Probar catálogo vacío, cero coincidencias, página final y orden estable. Volver con Atrás conserva criterios. Con actor ajeno, restringida muestra metadatos permitidos y aviso, sin navegación al detalle; propietario autorizado sí accede. Cambiar rápido filtros no muestra respuestas antiguas. Inspeccionar DOM y respuesta HTTP buscando un texto sensible de fixture.

### UI07 — Mejorar detalle y aplicar permisos antes de las acciones


**Responsable:** Daniel. **Revisor:** Francisco. **Dependencias:** UI02, UI03, UI06; integración API07 para eliminar/archivar. **Mensaje:** `feat(iniciativas): detallar y separar eliminación y archivo`.

**Cambio y razón:** detalle basado en `:id` con encabezado, badges tipo/estado/visibilidad, cards de descripción/problema/beneficiarios, competencias, integrantes, espacios y fechas; grilla adaptable y acciones coherentes. Se corrigen E16/E20 sin perder contenido requerido. Mostrar Editar, Eliminar y Archivar como acciones independientes, Solicitar y Convertir únicamente según capacidades, y manejar denegación de la API al pegar URL directamente. Cada confirmación expresa título y acción concreta. Eliminar solo acepta borrado; historial se rechaza sin cambios y permite elegir Archivar por separado.

**README:** composición del detalle y matriz de acciones; describir visibilidad como protección de servidor, no ocultación CSS.

**Entregable:** detalle final y diálogo destructivo reutilizable.

**Checklist:**

- [ ] Todos los campos permitidos tienen ubicación clara; no se vuelve a una lista plana sin jerarquía.
- [ ] No se renderizan datos ocultos en atributos, nodos invisibles ni mensajes de error.
- [ ] El diálogo Cancelar no escribe y confirmar actualiza catálogo/destino.

**Pruebas:** comparar diseño en 360/768/1440 px con textos largos y arrays vacíos. Probar ID mal formado/inexistente, `401/403/404`, error de red y reintento. Abrir como propietario, miembro y ajeno; intentar URL privada como visitante. Cancelar/confirmar borrar o archivar y verificar operación y aviso coherentes. Guardar captura y resultado del flujo como evidencia de corrección visual, sin darlo por probado solo con snapshots automáticos.

### UI08 — Migrar formulario de iniciativa a estado controlado


**Responsable:** Daniel. **Revisor:** Francisco. **Dependencias:** UI03, UI04; integración API05. **Mensaje:** `feat(cliente): crear y editar iniciativas con formularios controlados`.

**Cambio y razón:** Daniel migra formulario compartido de creación/edición a estado controlado, conectado con su API05. Catálogos, datos de edición y campos completos viajan según contrato; ID/propietario/fechas son de servidor. Crear publica directamente según D09: no botón ni pantalla de borrador. Distinguir carga/guardado/error y bloquear doble envío conservando lo escrito al fallar. Cancelar vuelve al catálogo o detalle según modo y confirma descarte si hay cambios. UI09 completa chips y Daniel completa validación/retornos en UI10 antes del handoff.

**README:** campos y payload, permisos de edición, cancelación y manejo de errores. Aclarar que MongoDB, no localStorage, conserva los cambios.

**Entregable:** formulario integrado, listo para los controles dinámicos y UX de UI09/UI10.

**Checklist:**

- [ ] Todos los campos de RF-I-INI-01 viajan en forma prevista.
- [ ] Crear y editar comparten lógica sin duplicar una pantalla completa.
- [ ] No se autoriza por nombre de propietario ni se envía un dueño elegido por cliente.

**Pruebas:** crear/editar con mocks y con API; abrir en otra sesión para confirmar persistencia real. En edición se conservan ID, propietario y creación; campos faltantes/solo espacios producen mensaje. Simular red caída y `409`, comprobar que no hay falso éxito ni borrado del formulario. Cancelar sin cambios sale; con cambios permite continuar editando o descartar, sin POST/PUT. Forzar doble click produce una sola creación visible y control de envío.

### UI09 — Agregar competencias controladas y etiquetas individuales


**Estado:** implementada y verificada (165 pruebas cliente, 20 integraciones reales, lint/build); publicación autorizada por Daniel. Revisión cruzada pendiente.

**Responsable:** Daniel. **Revisor:** Francisco. **Dependencias:** UI08, catálogo CO01/API04. **Mensaje:** `fix(cliente): controlar competencias y representar etiquetas como chips`.

**Cambio y razón:** selector de competencias desde catálogo, asociaciones por `skillId`, aviso inmediato de duplicado al agregar y lista con IDs estables. Antes de quitar una competencia, modal accesible con nombre y botones Cancelar/Quitar. Etiquetas como chips individuales agregables con Enter o botón y removibles de forma independiente, normalización para evitar repetidas y límites por etiqueta/array. Edición reconstruye competencias/etiquetas sin pérdida ni índices usados como key. Corrige las observaciones centrales de E21.

**README:** catálogo de competencias, reglas de duplicados y confirmación, interacción con chips y límites.

**Entregable:** Daniel entrega controles reutilizables para completar UI10 y para el handoff posterior, sin acoplar validaciones de dominios distintos.

**Checklist:**

- [x] No se acepta competencia inventada como texto libre.
- [x] La repetida se rechaza al agregar; el servidor también la rechaza.
- [x] Quitar competencia pide confirmación; chips tienen nombre accesible individual.

**Pruebas:** agregar dos competencias, repetir la primera y verificar que el array no crece. Quitar/cancelar con teclado y comprobar foco devuelto al control lógico. Agregar etiquetas con espacios, mayúsculas y duplicadas normalizadas; probar vacía, máxima y demasiado larga; eliminar la del medio sin borrar otras. Editar/guardar/recargar conserva IDs y chips. Desactivar red del catálogo muestra error y reintento, sin volver a texto libre silenciosamente.

### UI10 — Corregir validación y retornos tras guardar


**Estado:** completada y publicada en `5e12be3` tras confirmación de Daniel. 190 pruebas cliente, 23 integraciones reales, lint/build aprobados. Revisión cruzada de Francisco pendiente.

**Responsable:** Daniel. **Revisor:** Francisco. **Dependencias:** UI08, UI09, UI06, UI07. **Mensaje:** `fix(cliente): validar al corregir y confirmar guardados en su destino`.

**Cambio y razón:** reglas de campo compartidas, estado touched/submit intentado, validación al salir y mientras se corrige, contadores de caracteres requeridos/restantes y limpieza individual de errores. No mover foco en cada tecla; al enviar, enfocarlo al primer campo inválido. Tras POST exitoso volver al catálogo y anunciar «Iniciativa creada»; tras PUT ir al detalle y anunciar «Cambios guardados». Mensaje de una sola lectura, visible y `aria-live`, también si el usuario estaba al final del formulario. Revalidar listado/detalle antes de mostrar resultado. No redirigir ante fallo.

**README:** tabla de validaciones y evidencia de correcciones E21/E22/E23; flujo exacto de éxito/fallo.

**Entregable:** experiencia de creación/edición completa, sin necesidad de un enlace manual para finalizar.

**Checklist:**

- [x] Mensajes cambian al corregir sin borrar errores de otros campos.
- [x] Contadores y validación usan el mismo criterio de normalización/longitud.
- [x] Aviso se ve en destino y no reaparece como éxito nuevo al navegar Atrás.

**Pruebas:** para cada campo limitado usar vacío, mínimo−1, mínimo, máximo y máximo+1, incluyendo pegado y espacios. Enviar inválido, corregir solo un campo y verificar sus mensajes y los demás. Guardar desde scroll inferior: crear vuelve al catálogo con aviso, editar al detalle con datos nuevos. Forzar `400` de servidor/`500`/fallo de red deja valores y muestra error cercano a la acción. Ningún mensaje de éxito debe aparecer si el servidor no confirmó.


**Caso D06 adicional:** editar el título de una iniciativa con estimado 2 y tres miembros activos conserva 2 y guarda correctamente; no fijar un mínimo HTML igual al equipo que bloquee una edición sin reducción. Probar también aumento y reducción inválida en cliente y servidor.

### API07 — Distinguir eliminación física y archivado


**Responsable:** Daniel. **Revisor:** Francisco. **Dependencias:** API05, API06. **Mensaje:** `feat(servidor): archivar iniciativas con historial relacionado`.

**Cambio y razón:** Aplicar D05: DELETE exclusivo del propietario borra físicamente solo cuando nunca existieron solicitudes, miembros adicionales ni proyecto; la membresía automática del propietario se elimina junto con la iniciativa y no bloquea ese caso. Cualquier solicitud histórica, antiguo miembro adicional o proyecto impide eliminar con `409` sin cambios; el archivo es explícito y funciona con o sin historia. Revalidar relaciones al escribir, serializar con creación de solicitudes/conversión/aceptación y conservar vínculos. Archivo excluye del catálogo y bloquea creación/aceptación de solicitudes y cambios de iniciativa; no cancela automáticamente el historial pendiente. DELETE solo responde `204` o error; POST `/{id}/archive` devuelve `200` y es idempotente.

**README:** operaciones independientes DELETE/POST archive, interpretación del propietario automático, efectos y respuestas `204/409/200`.

**Entregable:** UI07 dispone de operación destructiva coherente sin borrar datos relacionados.

**Checklist:**

- [ ] No se borra una iniciativa con solicitudes canceladas/rechazadas solo porque no estén pendientes.
- [ ] El archivo conserva origen de proyecto y trazabilidad del equipo.
- [ ] `204` realmente no tiene cuerpo y `200` informa archivo.

- [ ] D05 se verifica con ausencia total de relaciones históricas, no solo relaciones activas.

**Pruebas:** casos propietario solo, solicitud pendiente, cancelada, rechazada, antiguo miembro retirado y proyecto asociado. Verificar DB e historial tras cada operación. Intentar como ajeno y sin sesión; no altera datos. Simular aparición concurrente de solicitud: DELETE devuelve conflicto sin archivar ni crear huérfanos. Archivar aun sin historia conserva datos y permite DELETE posterior si sigue sin historia. Repetir POST archive es idempotente; repetir DELETE de borrada devuelve `404`.

### API09 — Resolver solicitudes y mantener equipo con atomicidad


**Responsable:** Francisco. **Revisor:** Daniel. **Dependencias:** API02 con transacciones comprobadas, API08. **Mensaje:** `feat(servidor): aceptar solicitudes y sincronizar el equipo en transacción`.

**Cambio y razón:** Francisco implementa listado recibido, filtros, decisión exclusiva del propietario y equipo. Aceptar modifica pendiente→aceptada y crea una membresía nueva para ese periodo en una transacción; rechazo no crea miembro. D06 permite aceptar aunque los espacios sean cero. D08 conserva `converted` al aceptar después de conversión y el proyecto consulta ese mismo equipo. Retirar por el propietario conserva historial/fecha en membershipEvents, nunca permite retirar al propio dueño y habilita un nuevo intento D07; no agregar salida voluntaria como extra. Reutilizar el modelo de solicitud de API08 sin duplicarlo, con escritura condicional y la revisión común de iniciativa entregada por Daniel para serializar con cancelación/archivo/conversión. Mantener reintentos acotados.

**README:** transacción, índices y por qué un par de escrituras consecutivas no basta; permiso de dueño y consecuencias del retiro sobre visibilidad.

**Entregable:** Francisco entrega el flujo del propietario junto con UI12 y reutiliza la lectura transaccional de miembros y los efectos de aceptación/retiro en API10/UI13; Daniel revisa la coherencia del flujo completo.

**Checklist:**

- [ ] Aceptación y membresía se confirman juntas o ninguna.
- [ ] Propietario no se incorpora dos veces ni se elimina.
- [ ] El retiro revoca de inmediato acceso derivado de membresía.

- [ ] Aceptar por encima del estimado funciona y availableSpaces nunca es negativo.
- [ ] Aceptar tras conversión conserva converted y actualiza el equipo visible en proyecto.

**Pruebas:** Aceptar/rechazar con actor permitido y ajeno; fallo entre estado y miembro hace rollback total. Doble aceptación crea una membresía; aceptar frente a cancelar/rechazar da un solo resultado terminal. Aceptar con miembros por encima del estimado funciona y espacios siguen cero. Aceptar nueva solicitud tras convertir actualiza miembros de proyecto y conserva estado `converted`; no crea un segundo proyecto. Retirar propietario falla; retirar miembro conserva historia y revoca acceso privado/restringido. Aceptar un nuevo intento de retirado crea otra membresía con nuevo ID, conservando retirada, intentos y eventos anteriores. Listados recibidos no cruzan propietarios.

### UI12 — Construir solicitudes recibidas y gestión del equipo


**Responsable:** Francisco. **Revisor:** Daniel. **Dependencias:** UI03, UI07; integración API09. **Mensaje:** `feat(cliente): resolver solicitudes y consultar el equipo`.

**Cambio y razón:** `/solicitudes-recibidas` con filtro por iniciativa/estado/competencia/rol/fecha, orden y páginas; detalle de solicitud con perfil/competencias permitidas. Aceptar/rechazar con comentario opcional y confirmación; retirar miembro con confirmación sin ofrecer retirar al propietario. Reconsultar solicitud/equipo al confirmar; no agregar miembros de manera optimista antes de la transacción del servidor. Mostrar conflictos por otra decisión simultánea y permitir actualizar vista.

**README:** permisos del propietario, efecto real de aceptar/rechazar/retirar y tratamiento de conflictos.

**Entregable:** Francisco entrega el flujo completo del propietario junto con API09; Daniel revisa el enlace con las solicitudes propias que implementó en API08/UI11.

**Checklist:**

- [ ] Solo propietario recibe solicitudes propias, sin listas de otras iniciativas.
- [ ] Aceptar actualiza estado y equipo juntos en la experiencia final.
- [ ] Rechazar/cancelar no aumenta miembros; dueño no se retira.

- [ ] No se deshabilita Aceptar únicamente porque los espacios estimados sean cero.

**Pruebas:** aceptar a B y verificar una sola fila de miembro; repetir desde dos ventanas y manejar éxito/conflicto según contrato. Rechazar a C no incorpora miembro. Retirar B conserva historia y actualiza acceso a privada/restringida; sin refrescar, una consulta posterior ya debe ser denegada. Intentar la misma acción como B/C y comprobar `403/404`. Probar filtros combinados, fechas inválidas, lista vacía y error sin perder filtros.

### API11 — Unificar filtros, orden y páginas de todos los listados


**Responsable:** Francisco. **Revisor:** Daniel. **Dependencias:** API04, API06, API09, API10. **Mensaje:** `fix(servidor): mantener paginación y conteos coherentes por recurso`.

**Cambio y razón:** revisar y unificar parser de query, máximos, orden estable, filtros combinados y conteos autorizados en usuarios/iniciativas/solicitudes/miembros/proyectos/habilidades. Agregar índices faltantes según consultas reales y evitar devolver toda la colección. No añadir filtros de proyectos aplazados al final; en esta entrega basta listado paginado/ordenado y detalle. `from/to` de solicitudes usa límites UTC documentados y valida rango. Reutilizar utilidades sin forzar las mismas reglas de negocio en recursos distintos.

**README:** parámetros comunes, por recurso los filtros disponibles y ejemplo de lista vacía/página fuera de rango.

**Entregable:** la interfaz no necesita excepciones de paginación para cada pantalla.

**Checklist:**

- [ ] Cada listado extenso tiene máximo de página en servidor.
- [ ] `total` incluye solo registros que el actor puede consultar.
- [ ] No se incorporó búsqueda/filtrado de proyectos que corresponde al final.

**Pruebas:** generar más de dos páginas en cada recurso extenso; recorrerlas y comparar IDs únicos, orden y total con consulta autorizada en DB. Probar todos los filtros individuales y al menos dos combinaciones por recurso, extremos de fechas y cambio de tamaño. Verificar orden consistente cuando varias fechas/nombres coinciden. Queries no admitidas o mal formadas responden `400` conforme a CO00; símbolos de búsqueda no alteran una consulta Mongo ni seleccionan operadores arbitrarios.

### API12 — Probar permisos, sesiones y carreras sobre MongoDB real


**Responsable:** Francisco. **Revisor:** Daniel. **Dependencias:** API03–API11. **Mensaje:** `test(servidor): cubrir autorización y operaciones concurrentes`.

**Cambio y razón:** suite de integración HTTP con `node:test` y Supertest o cliente HTTP equivalente, base de test replica set y fixtures aislados. Matriz de actor/recurso/acción, autenticación revocada y pruebas concurrentes de API07–API10. Validar DTO sanitizado recursivamente para evitar exposición indirecta de campos sensibles mediante joins. Capturar fallos de DB con middleware uniforme y registrar requestId sin secretos. Agregar rate limit razonable al acceso si se incorpora, documentando código adicional y sin cambiar silenciosamente contrato.

**README:** comandos de suite, prerrequisito replica set, creación/limpieza de base test y límites de cobertura. Enlazar matriz de permisos.

**Entregable:** informe de resultados para Daniel, con fallo reproducible y colección HTTP equivalente cuando se pueda.

**Checklist:**

- [ ] La suite prueba base y servidor reales, además de unidades.
- [ ] Hay denegación por URL directa y payload manipulado.
- [ ] Ninguna carrera deja estados parciales, huérfanos o duplicados.

**Pruebas:** ejecutar matriz permisos completa; tokens sin sesión/vencidos/revocados; correos y solicitudes duplicados concurrentes; aceptar↔cancelar/rechazar; convertir↔retirar/archivar. Confirmar estado DB después de cada carrera y repetir únicamente pruebas concurrentes para detectar intercalaciones, sin repetir todas las suites sin motivo. Error DB intencional en entorno test devuelve `500` sin nombre de colección, cadena de conexión ni stack. No crear un endpoint público para provocar fallos de prueba.

### API13 — Hacer reproducible el arranque y la recuperación


**Responsable:** Francisco. **Revisor:** Daniel. **Dependencias:** API02, API03, API10. **Mensaje:** `docs(servidor): verificar arranque limpio y datos de demostración`.

**Cambio y razón:** completar scripts reales, `.env.example`, guía de replica set/seed, orden de arranque, puertos, resolución de conflictos y recuperación de DB. Añadir comprobación de configuración al iniciar y cierre limpio. Verificar una instalación desde cero en carpeta temporal o clon limpio. Datos de demostración cubren el recorrido de defensa sin usar información privada. El reset destructivo solo acepta base de test o confirmación explícita sobre demo, nunca nombre arbitrario.

**README:** sección ejecutable en orden: Node/npm → variables → MongoDB → seed → servidor → cliente → pruebas. Diferenciar comandos POSIX/PowerShell cuando cambien. Ningún comando documentado debe depender de una instalación oculta del autor.

**Entregable:** Daniel levanta la API siguiendo únicamente la guía y reporta el primer paso que falle.

**Checklist:**

- [ ] Cada variable indica propósito, ejemplo no sensible y obligatoriedad.
- [ ] Se identifican base de desarrollo/test y versión de herramientas probada.
- [ ] Reiniciar no requiere borrar datos ni repetir seed destructivo.

**Pruebas:** `npm ci`, configurar entorno de ejemplo, iniciar MongoDB y replica set, seed, API y login desde una instalación limpia. Detener Mongo y API durante lectura, restablecer y reintentar sin corrupción. Reiniciar ambos y confirmar iniciativas/solicitudes/proyectos persistentes. Probar origen/puerto incorrectos y documentar diagnóstico. Ejecutar seed dos veces y comprobar invariantes. Realizar transferencia inversa: Daniel explica el arranque a Francisco sin ayuda del autor.

### API14 — Verificar contrato completo y compatibilidad futura


**Responsable:** Francisco. **Revisor:** Daniel. **Dependencias:** API11, API12, UI14. **Mensaje:** `test(contrato): verificar rutas DTO y códigos antes de congelar`.

**Cambio y razón:** prueba de conformidad del HTTP real con `docs/api-contract.md` o OpenAPI elegido en CO00; comparación de ejemplos y mocks con respuestas reales. Revisar que la API no dependa de IDs/serialización Mongo y pueda implementarse en ASP.NET Core sin cambiar React. Crear `docs/verificacion-contrato.md` con decisiones finales, rutas cubiertas y excepciones resueltas. Corregir inconsistencias antes de `entrega-2`, coordinado con UI03/UI14; nunca cambiar un DTO solo en un lado.

**README:** versión candidata del contrato, política de congelación, cómo ejecutar verificaciones y qué URL cambiará en la entrega final.

**Entregable:** contrato candidato a congelar, listo para CO02 y CO04.

**Checklist:**

- [ ] Cada endpoint tiene ejemplo y caso ejecutable, y el error es uniforme.
- [ ] Fechas, nulabilidad, enums, campos opcionales y códigos coinciden.
- [ ] No hay rutas internas Mongo, requisitos de BSON ni rama condicional del cliente por backend.

**Pruebas:** ejecutar colección de UI14 y suites de conformidad; comparar muestras de éxito/error/archivo/`204` y lista paginada contra el documento. Comparar DTO de lecturas mock y Express sin adaptar componentes. Las mutaciones mock de iniciativas devuelven 501 deliberadamente; verificar sus flujos completos contra Express, sin declarar que el mock ya simula todas las escrituras. Esto verifica desacoplamiento, no demuestra todavía compatibilidad real con .NET. Daniel toma una ruta y explica cómo la reimplementaría con tablas; todo punto sin respuesta clara se corrige/documenta antes del cierre.

### UI14 — Entregar colección Postman con aserciones y cobertura


**Responsable:** Francisco. **Revisor:** Daniel. **Dependencias:** CO00/CO01; se redacta desde UI03 y se termina con API03–API10. **Mensaje:** `test(api): cubrir recursos y errores con colección Postman`.

**Cambio y razón:** Francisco consolida `pruebas/innovation-hub.postman_collection.json`, el entorno de ejemplo sin secretos y la guía a partir de los fragmentos entregados por ambos. Encadenar registro/login, capturar IDs/tokens en variables temporales y verificar estados, esquemas, campos sensibles ausentes y efectos posteriores. Cubrir por recurso una correcta, inválida, inexistente y no autorizada; añadir casos distintos para autenticación ausente `401` y actor autenticado sin permiso `403`. Endpoints públicos se prueban como públicos; no inventar una obligación de login para completar la matriz. Para catálogos públicos, documentar que ausencia de token es legítima y probar token inválido cuando se envía, según CO00.

**README:** importar/ejecutar colección, variables requeridas, orden, reset aislado y cobertura por recurso.

**Entregable:** Francisco entrega a Daniel una prueba HTTP independiente de React y un reporte de ejecución; cada fallo debe poder reproducirse con payload e IDs. Daniel aporta el fragmento existente de iniciativas y la evidencia de auth/perfiles/catálogos. Francisco completa su cobertura en la colección y aporta solicitudes/equipos/proyectos; después Daniel revisa la colección integrada.

**Checklist:**

- [ ] Auth, users, catálogos, iniciativas, solicitudes, miembros y proyectos están representados.
- [ ] Hay aserciones del contenido y persistencia posterior; no solo códigos.
- [ ] La colección exportada no contiene tokens/contraseñas reales ni requiere IDs pegados a mano.
- [ ] Los fragmentos de ambos tienen cobertura trazable y no existen carpetas duplicadas con aserciones contradictorias.

**Pruebas:** ejecutar colección completa sobre base de test con seed limpio; volver a ejecutarla con datos nuevos o reset documentado y obtener el mismo resultado. Incluir `204` sin cuerpo, `409`, `500` controlado en entorno test, conteos paginados y seguridad. Revisar cuatro clases por recurso en matriz; anotar excepciones legítimas de endpoints públicos. Daniel importa la exportación en una instalación o espacio de trabajo limpio, sin variables locales ocultas, y confirma que el reporte coincide. Concurrencia intensa queda en API12, no se presume demostrada por secuencias Postman.

### UI15 — Verificar navegación real, accesibilidad y regresiones de UX


**Responsable:** Francisco. **Revisor:** Daniel. **Dependencias:** UI04–UI13; entorno integrado. **Mensaje:** `test(cliente): verificar flujos accesibles y correcciones del avance 1`.

**Cambio y razón:** Francisco consolida pruebas de componentes/flujos relevantes con Vitest y Testing Library, y recorridos de navegador con Playwright o evidencia manual sistemática donde el navegador automatizado no esté disponible. Cubrir correcciones de E14–E26 y registrar capturas/resultados en `docs/qa-cliente.md`. No trasladar literalmente stubs DOM viejos como si probaran React real. Añadir pruebas donde prevengan regresión de permisos, acciones y estados, no para copiar la implementación.

**README:** comandos reales, navegador/versiones y resoluciones verificadas, resultados, defectos abiertos y enlace a QA. No mantener la frase «pendiente manual» si ya se comprobó, ni borrarla sin evidencia.

**Entregable:** Francisco consolida evidencia de UX de ambos bloques; cada autor corrige los defectos de sus módulos y el otro verifica el resultado.

**Checklist:**

- [ ] Todas las pantallas de consulta tienen carga/error/vacío y no solo catálogo.
- [ ] Teclado, foco real, contraste, zoom y responsive revisados.
- [ ] Mocks desactivados durante pruebas de integración final.

**Pruebas:** recorrido registro→perfil→buscar→crear→editar→solicitar con segundo usuario→aceptar→convertir→GitHub→logout. Repetir acciones críticas a 360/768/1440 px y zoom 200 %, sin scroll horizontal que impida operar. Tab/Shift+Tab, Enter/Espacio y Escape deben alcanzar todos los controles con foco visible, modales accesibles y avisos anunciables. Repetir cada hallazgo de evaluación antigua y adjuntar resultado; inspeccionar Network para confirmar backend real. Registrar cualquier fallo para un commit correctivo específico antes de CO04.

## 10. Integración defensa y entrega con titular individual

### CO02 — Integrar el sistema y consolidar el README verificable


**Responsable:** Francisco. **Revisor:** Daniel. **Dependencias:** UI15, API13, API14. **Mensaje:** `docs: integrar ejecución pruebas y correcciones del avance 2`.

**Cambio y razón:** integrar ramas preservando historial; resolver conflictos semánticamente, no escoger automáticamente una versión. Consolidar README, tabla de seis columnas, estructura real, instalación, variables, MongoDB, seed, arranque, tests, correcciones del avance 1, decisiones, límites y defensa. Completar matriz requisito→implementación→evidencia y quitar afirmaciones que ya no correspondan al prototipo. Listar defectos conocidos por impacto; cualquier fallo de acceso, integridad o función obligatoria bloquea entrega y requiere un commit correctivo adicional.

**README:** orden final recomendado: identificación y entrega; alcance por avance; requisitos/versiones; configuración; MongoDB y seed; ejecución; recorrido de demo; arquitectura; contrato/modelo; pruebas; correcciones del avance 1; decisiones/limitaciones; historial. Cada comando tiene directorio y resultado esperado. Conservar cómo ejecutar `avance1/` como archivo histórico.

**Entregable:** Francisco entrega un candidato integrado que Daniel puede arrancar siguiendo solo el README; ambos validan contenido. Daniel debe haber entregado antes comandos, evidencia, fragmentos Postman y defectos conocidos de todos sus módulos.

**Checklist:**

- [ ] Cliente usa API real y MongoDB; modo mock apagado.
- [ ] Cuatro visibilidades y flujo hasta proyecto funcionan con usuarios separados.
- [ ] Tabla tiene número, fecha, hash corto, mensaje, sección del sistema y cambio principal.
- [ ] Correcciones visuales/de flujo y limitaciones históricas están explicadas con evidencia.

**Pruebas:** instalación limpia siguiendo README por el integrante que no escribió cada sección; ejecutar tests API, colección Postman, build/lint/QA del cliente y pruebas históricas de avance1 si no cambió. Recorrido completo con dos usuarios y luego un tercero que intenta acceso indebido. Reiniciar API/Mongo y comprobar persistencia. Auditar `.gitignore` y archivos versionados: sin `.env`, tokens, cadenas reales, `node_modules` ni bases de datos. Un fallo encontrado se corrige y se repite solo la cobertura afectada antes de cerrar CO02.

### CO03 — Preparar y registrar la defensa individual cruzada


**Responsable:** Francisco. **Revisor:** Daniel. **Dependencias:** CO02. **Mensaje:** `docs: preparar defensa individual con recorridos y ejercicios`.

**Cambio y razón:** `docs/defensa.md` con índice criterio 1–20→archivos/funciones reales, decisiones y alternativas. Cada integrante explica módulos del otro y realiza cambios de práctica en rama desechable; documentar ejercicio y verificación sin fusionar cambios improvisados a la entrega. Preparar datos semilla y arranque en el equipo de cada uno. La defensa pesa tanto como el producto y puede reducir la nota del código que no sepan explicar.

**README:** preparación de defensa y comandos para arrancar demo; enlazar guía. Registrar que asistentes IA y autocompletado generativo deben estar desactivados durante la defensa según consigna, sin extender esa prohibición a la planificación/desarrollo autorizados.

**Entregable:** Francisco prepara guía y ejercicios; Daniel revisa su cobertura. Cada uno entrega su evidencia individual de explicación y modificación, sin atribuir práctica al otro por haber preparado el documento.

**Checklist:**

- [ ] Daniel explica transacciones, índices, permisos, hashing y CORS en código real.
- [ ] Francisco explica inmutabilidad, formularios, Router, efectos y errores GitHub.
- [ ] Ambos implementan un cambio pequeño y verifican su efecto sin romper contrato.

**Pruebas:** recorrer una petición React→Express→Mongo→respuesta y otra denegada por permisos; responder preguntas cruzadas sobre los 16 criterios; realizar dos cambios en rama de práctica, como añadir validación con `400` y un orden permitido previamente definido o corregir limpieza de efecto; revisar y repetir los puntos débiles. No modificar DTO/rutas congelados para resolver ejercicios. Cada estudiante hace su ensayo sin ayuda de IA y arranca todo en su propio equipo. La práctica no se declara aprobada por haber leído la guía.

### CO04 — Congelar el candidato y preparar la entrega etiquetada


**Responsable:** Francisco. **Revisor:** Daniel. **Dependencias:** CO03 y ausencia de fallos bloqueantes. **Mensaje:** `chore: cerrar documentación y preparar entrega 2`.

**Cambio y razón:** revisión final de documentación y paquete de entrega, sin introducir funciones nuevas. Commit final acotado con estado de checks y referencia a evidencias; después de ese commit crear etiqueta anotada `entrega-2` sobre el hash exacto revisado y publicar rama/etiqueta en la implementación futura autorizada. Preparar TXT para Moodle con enlace al repositorio y enlace a la etiqueta; no depender de `main` si sigue recibiendo cambios. Congelar contrato en ese commit. Este plan no ejecuta esas operaciones.

**README:** fecha real, estado de entrega y instrucciones para recuperar la versión etiquetada. La tabla puede listar hasta CO03 y declarar su corte; el hash de un commit no puede incluirse dentro de sí mismo sin cambiarlo. El hash final se obtiene por Git después de crearlo y se coloca en el TXT externo de entrega o en la evidencia del release, sin cadena infinita de amend.

**Entregable:** candidato etiquetado, TXT verificable y confirmación de Moodle conservada por quien haga el envío. El PDF de planificación se genera solo cuando Daniel lo pida y no es requisito académico de esta consigna.

**Checklist:**

- [ ] Árbol limpio; HEAD, etiqueta local y etiqueta remota resuelven al mismo commit aprobado.
- [ ] Clon fresco de `entrega-2` arranca cliente/API/DB con seed documentado.
- [ ] Contrato sin pendientes y colección exportada sin credenciales reales.
- [ ] TXT abre repositorio correcto y apunta a la versión entregada.
- [ ] El equipo verifica envío en Moodle antes de la hora límite, con margen.

**Pruebas:** antes de crear etiqueta, comprobar `git status --short`, historial y pruebas del candidato ya integrado; si no cambió código desde CO02, no repetir suites enteras sin causa. Después, `git rev-parse HEAD`, `git rev-parse entrega-2^{commit}` y referencia remota `refs/tags/entrega-2^{}` deben coincidir para etiqueta anotada; revisar también permisos de lectura del repositorio desde una sesión pública. Clonar la etiqueta en directorio temporal para un smoke test de arranque/login/catálogo, sin tocar datos reales. Si es necesario cambiar algo tras etiquetar, generar un nuevo candidato revisado y acordar el manejo de la etiqueta; no mover una entrega publicada a escondidas.

## 11. Secuencia de integración y checklist global

No se estiman horas ni se asigna una dedicación diaria. La entrega sigue siendo el 8 de noviembre. Esta secuencia indica dependencias de producto: cada funcionalidad se cierra con interfaz, API, persistencia y pruebas del mismo responsable.

| Etapa | Daniel | Francisco | Puerta de salida |
| --- | --- | --- | --- |
| Contrato y modelo | CO00–CO01 | Revisar CO00–CO01 | Reglas respondidas, DTO/estados/IDs y fixtures compatibles |
| Bases reutilizables | UI01–UI03 y API01–API02 | Consumir/revisar las bases | Cliente HTTP, tema, servidor y Mongo transaccional ejecutables |
| Identidad e iniciativas | API03/UI04, API04/UI05, API05–API07 y UI06–UI10 | Revisar y recibir el módulo | Sesión revocable y flujo real de creación/listado/edición/archivo |
| Solicitudes y equipo | Revisar API08/API09/UI11/UI12 | API08/API09 y UI11/UI12 | Solicitar/cancelar/rechazar/aceptar/retirar coherentes, sin carreras |
| Proyectos y consistencia | Revisar API10/UI13 | API10/UI13 y API11/API12 | Conversión y crecimiento del equipo después de convertir |
| Verificación y arranque | UI14/UI15 | API13/API14; revisar UI14 | Colección, UX, contrato y demostración local completos |
| Cierre | Revisar CO02–CO04 y entregar evidencia de sus módulos | CO02–CO04 | README, defensa individual, etiqueta/TXT y entrega verificados |

La UI y la API de una funcionalidad pueden desarrollarse contra fixtures mientras falta un proveedor, pero la puerta de integración real no se marca aprobada hasta disponer de todos sus servicios. Corregir bloqueos de integridad/permisos antes de extras o acabado no obligatorio.

### Registro de los 34 commits planeados

El responsable es también quien prepara el commit. El revisor verifica y deja evidencia de su revisión, sin inventar coautoría. Marcar solo cuando existan hash y pruebas reales.

| Listo | ID | Responsable | Revisor | Mensaje propuesto |
| --- | --- | --- | --- | --- |
| [x] | CO00 | Daniel | Francisco | `docs: definir contrato HTTP y alcance del avance 2` |
| [x] | CO01 | Daniel | Francisco | `docs: modelar MongoDB y acordar fixtures de integración` |
| [x] | UI01 | Daniel | Francisco | `feat(cliente): iniciar React con Vite y rutas del sistema` |
| [x] | UI02 | Daniel | Francisco | `style(cliente): conservar Bootstrap y el tema Sass del prototipo` |
| [x] | UI03 | Daniel | Francisco | `feat(cliente): centralizar HTTP y simular respuestas del contrato` |
| [x] | API01 | Daniel | Francisco | `feat(servidor): iniciar Express con capas y errores uniformes` |
| [x] | API02 | Daniel | Francisco | `feat(servidor): modelar MongoDB e inicializar datos de prueba` |
| [x] | API03 | Daniel | Francisco | `feat(servidor): autenticar usuarios y revocar sesiones al salir` |
| [x] | UI04 | Daniel | Francisco | `feat(cliente): agregar autenticación y navegación de sesión` |
| [x] | API04 | Daniel | Francisco | `feat(servidor): gestionar perfiles y buscar colaboradores` |
| [x] | UI05 | Daniel | Francisco | `feat(cliente): consultar perfiles y filtrar colaboradores` |
| [x] | API05 | Daniel | Francisco | `feat(servidor): crear y modificar iniciativas con validación propia` |
| [x] | API06 | Daniel | Francisco | `feat(servidor): filtrar iniciativas y aplicar visibilidad por actor` |
| [x] | API07 | Daniel | Francisco | `feat(servidor): archivar iniciativas con historial relacionado` |
| [x] | UI06 | Daniel | Francisco | `feat(cliente): consumir catálogo paginado y mostrar permisos de acceso` |
| [x] | UI07 | Daniel | Francisco | `feat(iniciativas): detallar y separar eliminación y archivo` |
| [x] | UI08 | Daniel | Francisco | `feat(cliente): crear y editar iniciativas con formularios controlados` |
| [x] | UI09 | Daniel | Francisco | `fix(cliente): controlar competencias y representar etiquetas como chips` |
| [x] | UI10 | Daniel | Francisco | `fix(cliente): validar al corregir y confirmar guardados en su destino` |
| [ ] | API08 | Francisco | Daniel | `feat(servidor): crear editar y cancelar solicitudes pendientes` |
| [ ] | UI11 | Francisco | Daniel | `feat(cliente): gestionar solicitudes propias sin duplicados pendientes` |
| [ ] | API10 | Francisco | Daniel | `feat(servidor): convertir iniciativas y consultar proyectos accesibles` |
| [ ] | UI13 | Francisco | Daniel | `feat(cliente): convertir iniciativas y mostrar repositorios de GitHub` |
| [ ] | API09 | Francisco | Daniel | `feat(servidor): aceptar solicitudes y sincronizar el equipo en transacción` |
| [ ] | UI12 | Francisco | Daniel | `feat(cliente): resolver solicitudes y consultar el equipo` |
| [ ] | API11 | Francisco | Daniel | `fix(servidor): mantener paginación y conteos coherentes por recurso` |
| [ ] | API12 | Francisco | Daniel | `test(servidor): cubrir autorización y operaciones concurrentes` |
| [ ] | API13 | Francisco | Daniel | `docs(servidor): verificar arranque limpio y datos de demostración` |
| [ ] | API14 | Francisco | Daniel | `test(contrato): verificar rutas DTO y códigos antes de congelar` |
| [ ] | UI14 | Francisco | Daniel | `test(api): cubrir recursos y errores con colección Postman` |
| [ ] | UI15 | Francisco | Daniel | `test(cliente): verificar flujos accesibles y correcciones del avance 1` |
| [ ] | CO02 | Francisco | Daniel | `docs: integrar ejecución pruebas y correcciones del avance 2` |
| [ ] | CO03 | Francisco | Daniel | `docs: preparar defensa individual con recorridos y ejercicios` |
| [ ] | CO04 | Francisco | Daniel | `chore: cerrar documentación y preparar entrega 2` |

La lista conserva 34 cambios con contenido. La cantidad puede aumentar si una corrección real lo requiere; no dividir artificialmente tareas para contar commits.

## 12. Cobertura de la rúbrica y pruebas finales

| Criterio | Commits principales | Evidencia que debe existir |
| --- | --- | --- |
| 1 Componentes y composición | UI01, UI02, UI05–UI13 | Carpetas por dominio, props/children y responsabilidades claras |
| 2 Estado y formularios | UI04, UI08–UI12 | Formularios controlados, actualizaciones inmutables, keys estables y validación |
| 3 API y estados UI | UI03, UI05–UI15 | Carga/error/vacío por pantalla, reintento y limpieza de efectos |
| 4 React Router | UI01, UI06, UI07, UI11–UI13 | Rutas requeridas, parámetros dinámicos y página 404 |
| 5 Contrato | CO00, API14, CO04 | Rutas/verbos/DTO/códigos completos y contrato congelado |
| 6 Express | API01, API03–API10 | Capas, middleware y respuestas HTTP correctas |
| 7 MongoDB | CO01, API02, API09, API10 | Justificación embebido/referencia, índices y transacciones |
| 8 Iniciativas persistentes | API05–API07, UI06–UI10 | CRUD/archivo reales, propietario y relaciones respetados |
| 9 Solicitudes y equipos | API08, API09, UI11, UI12 | Estados completos, aceptación atómica y equipo sin duplicados |
| 10 Conversión a proyecto | API10, UI13 | Otro miembro requerido, origen preservado, lista/detalle |
| 11 Filtros y paginación | API04, API06, API09–API11, UI05, UI06 | Consultas en servidor, orden estable, máximos y conteos autorizados |
| 12 Autenticación | API03, UI04, API12 | Hash seguro, login real y revocación demostrada |
| 13 Autorización y validación | API03–API12, UI06, UI07 | Matriz HTTP por actor y manipulación de payload/URL |
| 14 GitHub | UI13 | Datos reales y errores simulado/real documentados, configuración pública |
| 15 Pruebas API | UI14, API12, API14 | Colección exportada, cuatro clases por recurso y aserciones |
| 16 Repositorio/documentación | CO00, API13, CO02, CO04 | README reproducible, historial honesto y etiqueta verificable |
| 17 Explicación de código | CO03 y revisiones diarias | Ambos recorren código propio y del compañero |
| 18 Dominio técnico | CO03 | Preguntas sobre criterios 1–16 respondidas en su implementación |
| 19 Decisiones | CO00, CO01, API14, CO03 | Alternativas, límites y migración relacional/.NET explicables |
| 20 Cambios en caliente | CO03 | Ejercicios sin IA en rama separada con prueba de resultado |

### Matriz mínima de pruebas por recurso

Los casos son adicionales a fronteras/concurrencia ya descritas. Autorización implica tanto sesión como permiso; probar ambas. Las rutas públicas conservan acceso de visitante y sus excepciones se explican, no se convierten artificialmente en privadas.

| Recurso | Correcta | Datos inválidos | Inexistente | No autorizado |
| --- | --- | --- | --- | --- |
| Auth/sesión | Registro/login/me/logout | Email, confirmación o credenciales incorrectas | Ruta de auth inexistente `404`; usuario desconocido en login se trata como credencial inválida, no se revela existencia | Token ausente/vencido/revocado en `/auth/me` |
| Usuarios/perfil | Consultar y guardar perfil propio | Correo/ID intentado, habilidad o nivel inválidos | UUID válido sin usuario | Visitante al directorio/perfil protegido; mutación ajena |
| Catálogos | Leer categorías/habilidades | Query/paginación inválida | Ruta de catálogo inexistente; ID de habilidad inexistente en asociación | Token inválido enviado según política CO00; sin token es válido en catálogos públicos |
| Iniciativas | Crear, editar, consultar, borrar/archivar | Tipo/visibilidad/competencia/longitud/query inválidos | UUID válido sin iniciativa | Ajeno al PUT/DELETE, visitante/ajeno a detalle no permitido |
| Solicitudes | Crear/editar/cancelar y resolver | Competencia no requerida, transición/campos inválidos | UUID válido sin solicitud o iniciativa | Solicitud ajena, decisión por quien no es dueño |
| Miembros | Consultar equipo/aceptar/retirar | Retirar dueño o query inválida | Usuario/miembro inexistente | Retiro por no propietario y consulta restringida ajena |
| Proyectos | Convertir con equipo y listar/detallar | Sin otro miembro, fechas/URL inválidas | UUID válido sin proyecto | Conversión por no dueño y lectura de privado ajeno |

Para códigos de conflicto (`409`) distinguirlos de validación de campos (`400`) en las aserciones. El caso 500 se induce con dependencia controlada o mock de fallo interno en test, no rompiendo la base de demostración ni exponiendo un interruptor de fallo al público.

## 13. Prevención de regresiones y riesgos pendientes

1. **Contrato primero y cambios coordinados.** Toda variación de ruta/DTO/código antes de la entrega actualiza documento, mock, API, consumidor y colección en el mismo cambio revisado. Al entregar se congela. No usar diciembre para corregir un diseño incompatible sin reconocer que viola la regla central.
2. **Permisos en servidor.** Proyección de salida, filtros y totales se autorizan tanto como las escrituras. El UI nunca recibe detalles para luego ocultarlos con CSS. Al retirar miembro, las consultas siguientes dejan de conceder permiso.
3. **Duplicados y carreras en DB.** Consulta previa mejora mensaje, índice y transacción protegen integridad. Logout revoca en servidor; aceptar/convertir no usan dos escrituras independientes.
4. **Prueba visible de cada corrección.** E14–E27 se mantienen como IDs de regresión en `docs/matriz-pruebas.md`. No cerrar una observación por cambiar una clase CSS o agregar un aviso sin recorrer el flujo real.
5. **Historia honesta.** Nunca retocar fechas ni atribuir commits al compañero. La tabla de README se genera/contrasta con Git. Si se regulariza tarde `entrega-1`, primero verificar el hash realmente entregado y documentar que la etiqueta es tardía; eso no repara los seis días incumplidos. No crear ni mover etiquetas antiguas basándose solo en una suposición.
6. **Base, red y GitHub.** Preparar replica set temprano y guardar la guía. Simular errores GitHub para no depender del límite público; un 404 puede significar privado o inexistente. Sin secretos en variables públicas de Vite ni exports de Postman.
7. **Ambigüedades documentales.** CO00 registra equivalencias RN, hora de entrega heredada, visibilidad y decisiones D05–D09 confirmadas por Daniel. Las respuestas del usuario no se presentan como citas del docente; cualquier contradicción con un requisito obligatorio debe señalarse antes de implementar.
8. **Estado remoto no auditado.** Antes de implementar, revisar rama/HEAD/estado y novedades remotas autorizadas: la auditoría de esta planificación es local. Si alguien ya avanzó en otro clon o rama, ajustar el plan en vez de sobrescribir su trabajo.

### Checklist individual de cierre

**Daniel**
- [ ] Sus 19 commits tienen hash real, evidencia y revisión de Francisco.
- [ ] Autenticación/perfiles y el módulo completo de iniciativas funcionan tanto en React como en Express/MongoDB.
- [ ] Sus pruebas cubren sesiones revocadas, privacidad de perfiles, persistencia, visibilidad, filtros, archivo, competencias y etiquetas.
- [ ] Base Express/MongoDB, modelo/fixtures, contrato y API05–API07/UI06–UI10 consolidados; entrega a Francisco comandos, fragmentos Postman, evidencia y defectos conocidos antes de que continúen los flujos dependientes y antes de CO02.
- [ ] Puede explicar y modificar solicitudes, equipos, proyectos y transacciones que implementó Francisco.

**Francisco**
- [ ] Sus 15 commits tienen hash real, evidencia y revisión de Daniel.
- [ ] Solicitudes, equipos y proyectos funcionan tanto en React como en Express/MongoDB sobre el módulo de iniciativas recibido.
- [ ] Borrar/archivar, aceptar sin cupo máximo y conservar converted están probados con historial/concurrencia.
- [ ] Integra los fragmentos Postman de ambos con aserciones trazables y sin estado local oculto.
- [ ] Daniel arranca API/replica set/seed siguiendo la guía reproducible.
- [ ] Integración, README, guía de defensa, etiqueta y TXT se cierran solo con los entregables de ambos y revisión de Daniel.
- [ ] Puede explicar y modificar auth, perfiles y el módulo completo de iniciativas que implementó Daniel.

**Ambos, con titular de cada tarea de cierre**
- [ ] CO00–CO04 y funcionalidades completas verificados; ninguna tarea tiene responsabilidad difusa.
- [ ] Contrato, modelo, README y pruebas incorporan las ocho respuestas del usuario.
- [ ] Cada integrante puede arrancar todo localmente y ensayar defensa sin asistencia generativa.
- [ ] Tag/TXT/repositorio y envío Moodle verificados durante implementación; esta planificación no los ejecuta.
- [ ] No afirmar que se recuperaron cinco semanas de historial ni que un mock prueba integración real.

## 14. Fuentes y memoria reutilizable

Usar las extracciones en vez de reconvertir archivos en cada sesión. El contenido fuente y este plan cumplen funciones distintas: los documentos docentes especifican el proyecto; el usuario define el trabajo autorizado y la fecha corregida.

- [Consigna correcta del avance 2 extraída](fuentes/consigna_avance2.md): páginas 4–7, requisitos/entrega; 8, defensa; 9–13, rúbrica.
- [Descripción general extraída](fuentes/descripcion_general.md): dominio, RN, RF, RNF y contrato inmutable.
- [Consigna del avance 1 extraída](fuentes/consigna_avance1.md): continuidad, requisitos previos, documentación e historial.
- [Evaluación del avance 1 extraída](fuentes/evaluacion_avance1.md): hoja Evaluación, E14:E27; observaciones utilizadas para las correcciones.
- [Índice de fuentes conservadas](fuentes/README.md), [entregables reales de Daniel](avance2-daniel.md) y [memoria operativa/handoff](handoff-francisco.md). El historial real se consulta en Git y README; no depende de manifiestos con rutas locales de Daniel.
- Los originales binarios y manifiestos de la extracción permanecen en el archivo local de planificación de Daniel. Este repositorio entrega las extracciones reutilizables; el código histórico está en `avance1/`.

Este archivo es el plan maestro portable. No regenerar PDF salvo nueva petición de Daniel; conservar checklists y pruebas en futuras revisiones.
