# Modelo de datos — Innovation Hub

Estado: diseño compartido de CO01. API02 ya implementa la conexión, las transacciones base y los catálogos; los módulos de dominio posteriores completan sus esquemas e índices. El contrato público continúa en [`api-contract.md`](api-contract.md); este documento describe persistencia, relaciones e integridad. Si ambos documentos difieren, se corrige la diferencia antes de implementar, no se crea un tercer contrato en Mongoose.

## Principios

- Cada entidad expuesta usa un `id` UUID único e inmutable. MongoDB puede conservar `_id` como clave interna, pero repositorios y DTO nunca lo devuelven.
- Las referencias persistidas usan UUID públicos (`userId`, `initiativeId`, etc.) para que los fixtures, Postman y la futura API .NET compartan identidad.
- Fechas persistidas son instantes UTC. Fechas de proyecto sin hora (`startDate`, `estimatedEndDate`) se conservan como texto `YYYY-MM-DD` y se validan como fecha calendario.
- `memberCount`, `availableSpaces` y `access` se calculan. Guardarlos duplicaría estado y permitiría inconsistencias.
- Las transiciones se realizan mediante filtros condicionales y, cuando afectan varias colecciones, dentro de una transacción de MongoDB en replica set.
- Los nombres normalizados solo sirven para índices/comparaciones. La forma presentada al usuario se conserva en su campo original.
- Los fixtures de CO01 no contienen contraseñas, hashes de contraseña, tokens ni hashes de token. API03 incorporará credenciales sintéticas mediante el seed de autenticación.

## Colecciones

### `users`

Campos principales:

| Campo | Tipo | Regla |
| --- | --- | --- |
| `id` | UUID string | Único e inmutable. |
| `firstName`, `lastName` | string | Recortados; límites del contrato. |
| `memberType` | enum | `student`, `professor`, `administrative`, `graduate`, `external`. |
| `email` | string | Forma presentada; nunca se devuelve a terceros. |
| `emailNormalized` | string | Minúsculas para unicidad. |
| `passwordHash` | string | Se agrega en API03; nunca aparece en fixtures/DTO. |
| `career`, `bio`, `portfolioUrl` | string o `null` | Opcionales. |
| `interests` | string[] | Embebido; máximo 15. |
| `skills` | `{skillId, level}[]` | Embebido porque pertenece al perfil y se actualiza junto. |
| `availability` | enum | `low`, `medium`, `high`. |
| `active` | boolean | Usuario inactivo no inicia sesión ni crea operaciones nuevas. |
| `createdAt`, `updatedAt` | date | UTC, administradas por servidor. |

Índices:

- único `{ id: 1 }`;
- único `{ emailNormalized: 1 }`;
- multikey `{ "skills.skillId": 1, lastName: 1, firstName: 1, id: 1 }` para directorio;
- `{ career: 1, availability: 1, id: 1 }` para filtros frecuentes.

No se embeben sesiones, iniciativas ni solicitudes en el usuario: tienen ciclo de vida y consultas independientes.

### `sessions`

`id`, `userId`, `tokenHash`, `expiresAt`, `revokedAt`, `createdAt` y metadatos técnicos mínimos. Solo se persiste el hash del token opaco. Índices únicos en `id` y `tokenHash`; TTL en `expiresAt`. Revocar actualiza condicionalmente una sesión vigente. El TTL limpia almacenamiento, no sustituye la comprobación de expiración/revocación.

### `categories` y `skills`

Catálogos separados para validar referencias y mantener IDs estables. Categorías usan slug contractual (`technology`, `education`, etc.); competencias usan UUID. Ambos guardan `name`, `nameNormalized` y `active`. Índices únicos en `id` y en `nameNormalized`. Desactivar conserva referencias históricas; no se elimina un catálogo utilizado.

### `initiatives`

Campos: `id`, `ownerId`, `title`, `type`, `summary`, `description`, `problem`, `beneficiaries`, `categoryId`, `skillIds`, `estimatedMembers`, `visibility`, `state`, `tags`, `createdAt`, `updatedAt`.

- `ownerId`, `categoryId` y cada `skillId` son referencias validadas.
- `skillIds` y `tags` se embeben porque son listas pequeñas editadas con la iniciativa.
- El propietario también tiene una membresía activa creada en la misma transacción.
- `published` es el estado inicial de este avance. `draft` solo permanece para compatibilidad y pruebas de acceso.
- `memberCount` se obtiene contando membresías activas.
- `availableSpaces = max(0, estimatedMembers - memberCount)`.
- Las capacidades de `access` se calculan según actor, propiedad, membresía, visibilidad y estado.

Índices:

- único `{ id: 1 }`;
- `{ ownerId: 1, state: 1, updatedAt: -1, id: 1 }` para `/initiatives/mine`;
- `{ state: 1, visibility: 1, createdAt: -1, id: 1 }` para catálogo;
- `{ categoryId: 1, state: 1, id: 1 }` y multikey `{ skillIds: 1, state: 1, id: 1 }`;
- índice de búsqueda acordado en API05 sobre campos normalizados o texto. La elección debe probar búsqueda sin distinguir mayúsculas/tildes; un índice de texto sin esa verificación no basta.

### `requests`

Campos: `id`, `initiativeId`, `applicantId`, `message`, `offeredSkillId`, `role`, `availability`, `state`, `decisionComment`, `createdAt`, `updatedAt`, `decidedAt`.

La solicitud conserva el intento completo. Un rechazo, cancelación o retiro posterior permite crear otra fila/documento con otro `id`; nunca se reabre ni sobrescribe el intento terminal.

Índices:

- único `{ id: 1 }`;
- único parcial `{ initiativeId: 1, applicantId: 1 }` con filtro `{ state: "pending" }`;
- `{ applicantId: 1, createdAt: -1, id: 1 }` para `scope=mine`;
- `{ initiativeId: 1, state: 1, createdAt: -1, id: 1 }` para solicitudes recibidas;
- `{ offeredSkillId: 1, state: 1, id: 1 }` para filtros.

La unicidad parcial protege carreras; una consulta previa solo mejora el mensaje. La aceptación/cancelación usa filtro `state=pending`, por lo que una sola transición puede ganar.

### `memberships`

Campos: `id`, `initiativeId`, `userId`, `role`, `state` (`active|retired`), `joinedAt`, `retiredAt`, `sourceRequestId` opcional.

Se crea una membresía nueva por cada periodo de participación. Retirarla no la elimina. Una reincorporación posterior crea otro `id`; el índice único parcial `{ initiativeId, userId }` filtrado por `state=active` impide dos membresías activas simultáneas y permite historia.

Índices adicionales: `{ initiativeId: 1, state: 1, joinedAt: 1, id: 1 }` y `{ userId: 1, state: 1, id: 1 }`.

### `membershipEvents`

Registro append-only con `id`, `initiativeId`, `userId`, `membershipId`, `type` (`joined|retired`), `occurredAt`, `actorId` y `requestId` opcional. Permite demostrar historia sin reconstruirla desde el último estado. Índices `{ initiativeId: 1, occurredAt: 1, id: 1 }` y `{ userId: 1, occurredAt: 1, id: 1 }`.

### `projects`

Campos: `id`, `sourceInitiativeId`, `ownerId`, `name`, `description`, `objective`, `technologies`, `startDate`, `estimatedEndDate`, `state`, `repositoryUrl`, `createdAt`, `updatedAt`.

`sourceInitiativeId` tiene índice único: una iniciativa solo produce un proyecto. El proyecto no copia integrantes; consulta las membresías activas de su iniciativa, incluso las aceptadas después de convertir. `technologies` se embebe porque es una lista pequeña propia del proyecto.

## Operaciones atómicas

| Operación | Escrituras o comprobaciones dentro de la transacción |
| --- | --- |
| Crear iniciativa | Insertar iniciativa `published`, membresía activa del propietario y evento `joined`. |
| Aceptar solicitud | Actualizar condicionalmente solicitud pendiente, verificar iniciativa no archivada, insertar membresía activa y evento. Si la iniciativa ya está `converted`, conservar ese estado. |
| Rechazar solicitud | Actualizar condicionalmente la solicitud pendiente; no crear membresía. Puede cerrar una pendiente de iniciativa archivada. |
| Cancelar solicitud | Actualizar condicionalmente la solicitud pendiente; se permite aunque la iniciativa esté archivada. |
| Retirar miembro | Cambiar membresía activa a retirada y agregar evento; impedir retirar propietario. |
| Convertir | Verificar propietario, estado y otro miembro activo; insertar proyecto único y cambiar iniciativa a `converted`. |
| Borrar/archivar | Releer relaciones dentro de la transacción. Borrar iniciativa, membresía/evento automático del propietario solo si no hay historia adicional; en otro caso actualizar a `archived`. |

Las pruebas de estas operaciones requieren replica set. Ejecutarlas contra MongoDB standalone y omitir la transacción sería una falsa aprobación.

## Estados e invariantes

- Solicitud: `pending -> accepted | rejected | cancelled`; los estados terminales no cambian.
- Membresía: se crea `active` y puede pasar a `retired`; una reincorporación crea otro documento.
- Iniciativa: este avance crea `published`; puede pasar a `forming_team`, `converted` o `archived` según servicio. Aceptar después de convertir no revierte `converted`.
- Proyecto: nace `planning`; los demás estados se conservan en el dominio, pero este avance no implementa su edición.
- El propietario nunca solicita ni se retira de su propia iniciativa.
- Una iniciativa puede superar `estimatedMembers`; la disponibilidad nunca es negativa.
- Una iniciativa físicamente eliminable solo conserva la relación automática del propietario y nunca tuvo solicitudes, miembros adicionales, eventos adicionales ni proyecto.

## Equivalente relacional para la API .NET

| MongoDB | Equivalente relacional |
| --- | --- |
| `users` | `Users`; `UserSkills`; `UserInterests`. |
| `categories`, `skills` | `Categories`, `Skills`. |
| `initiatives` | `Initiatives`; `InitiativeSkills`; `InitiativeTags`. |
| `requests` | `ParticipationRequests`; índice filtrado único para pendientes. |
| `memberships` | `Memberships`; índice filtrado único para activas. |
| `membershipEvents` | `MembershipEvents` append-only. |
| `projects` | `Projects` con `SourceInitiativeId` único; `ProjectTechnologies`. |
| `sessions` | `Sessions` con token hash único y proceso de expiración. |

Los DTO públicos no cambian al migrar: repositorios traducen documentos o filas a las mismas formas del contrato.

## Migración y fixtures

`pruebas/fixtures/legacy-mapping.json` registra las ocho iniciativas del Avance 1 y su traducción. Las categorías `Ambiente` y `Comunidad` se revisan por contenido: ambiente pasa a Sostenibilidad; accesibilidad y banco de alimentos pasan a Impacto social. Las visibilidades `comunidad` y `equipo` pasan a `institutional` y `private`. Los estados de los fixtures se diversifican deliberadamente para cubrir permisos, archivo, conversión y borrador; no se presentan como una migración histórica exacta.

Los archivos JSON son datos compartidos de mocks/seed, no volcados de MongoDB. El validador `node pruebas/fixtures/validate-fixtures.mjs` comprueba UUID, referencias, estados, cuatro visibilidades, propietario activo, una sola solicitud pendiente por pareja y un solo proyecto por iniciativa.

## Revisión cruzada requerida después de API02

- Confirmar que los índices parciales se expresan igual en Mongoose y en la inicialización de la base.
- Confirmar que el seed puede ejecutarse varias veces por `id` sin duplicar y que solo limpia la base de prueba indicada.
- Confirmar que las sesiones y hashes quedan fuera de los fixtures de dominio.
- Revisar la prueba real de rollback de API02 antes de implementar aceptación, retiro o conversión.
- Mantener `id` UUID en repositorios/DTO y evitar que `_id` se filtre al cliente.

