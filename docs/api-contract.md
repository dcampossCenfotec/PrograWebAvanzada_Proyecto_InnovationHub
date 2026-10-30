# Contrato HTTP — Innovation Hub

Estado: **contrato de trabajo del Avance 2**. Se puede corregir de forma coordinada antes de la etiqueta `entrega-2`; a partir de esa etiqueta debe mantenerse compatible con el cliente React y con la futura API en ASP.NET Core.

Este documento define la interfaz pública. Los nombres de colecciones, esquemas de Mongoose y detalles de persistencia no forman parte del contrato.

## 1. Convenciones generales

- URL base configurable: `http://localhost:3000/api` en desarrollo.
- Formato: JSON UTF-8 y propiedades en `camelCase` inglés. La interfaz traduce etiquetas al español.
- Identificadores públicos: UUID en texto. Nunca se exponen `_id`, `ObjectId`, `__v`, hashes, sales ni trazas.
- Fechas: UTC en ISO 8601, por ejemplo `2026-11-01T18:30:00.000Z`.
- Cuerpo individual: `{ "data": { ... } }`.
- Listado: `{ "data": [], "pagination": { "page": 1, "size": 12, "total": 0, "totalPages": 0 } }`.
- `Content-Type: application/json` es obligatorio cuando hay cuerpo JSON.
- `PUT` reemplaza todos los campos editables. Enviar campos inmutables produce `400`.
- Las cadenas se recortan antes de validar. Correo y comparaciones de duplicados se normalizan a minúsculas; se conserva el texto de presentación cuando corresponde.
- Arrays sin duplicados. Para competencias prevalece `skillId`, no el nombre mostrado.

### 1.1 Autenticación

Las rutas protegidas reciben un token opaco:

```http
Authorization: Bearer <accessToken>
```

El servidor guarda únicamente el hash del token en una sesión con expiración y revocación. El cliente conserva el token en `sessionStorage`. Un token ausente, malformado, vencido o revocado produce `401`. `POST /auth/logout` revoca la sesión en el servidor.

### 1.2 Paginación, búsqueda y orden

- `page`: entero desde 1; valor por defecto 1.
- `size`: entero entre 1 y 50; valor por defecto 12.
- `order`: `asc` o `desc`.
- Cada listado declara su lista blanca de `sort`. Se agrega `id` como desempate estable.
- Una página posterior a `totalPages` responde `200`, `data: []` y totales reales.
- Una consulta sin coincidencias responde `200`, nunca `404`.
- Autorización y proyección se aplican antes de contar, ordenar y paginar.
- Parámetros desconocidos, repetidos cuando se espera un valor, o con enum/formato inválido producen `400 INVALID_QUERY`.

### 1.3 Códigos y errores

| HTTP | Uso |
| --- | --- |
| `200` | Consulta, actualización, transición con representación o archivado. |
| `201` | Creación. Incluye encabezado `Location`. |
| `204` | Logout, retiro o eliminación física. No contiene cuerpo. |
| `400` | JSON, UUID, query o campo inválido; intento de escribir un campo inmutable. |
| `401` | Credenciales ausentes o inválidas en una operación protegida. |
| `403` | Actor autenticado sin permiso sobre un recurso que puede conocer. |
| `404` | Recurso inexistente o recurso privado que no debe revelarse. |
| `409` | Duplicado, estado incompatible o carrera detectada. |
| `500` | Fallo inesperado, sin detalles internos. |

Formato estable:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Hay datos que requieren corrección.",
    "fields": {
      "title": "Debe contener entre 5 y 100 caracteres."
    }
  }
}
```

`fields` siempre existe y es un objeto. Códigos usados: `VALIDATION_ERROR`, `INVALID_JSON`, `INVALID_QUERY`, `AUTHENTICATION_REQUIRED`, `INVALID_CREDENTIALS`, `SESSION_EXPIRED`, `FORBIDDEN`, `NOT_FOUND`, `EMAIL_ALREADY_EXISTS`, `PENDING_REQUEST_EXISTS`, `ACTIVE_MEMBER_EXISTS`, `STATE_CONFLICT`, `CONCURRENT_MODIFICATION`, `PROJECT_ALREADY_EXISTS` e `INTERNAL_ERROR`.

Ejemplos sin datos internos:

```json
{ "error": { "code": "AUTHENTICATION_REQUIRED", "message": "Debe iniciar sesión.", "fields": {} } }
```

```json
{ "error": { "code": "FORBIDDEN", "message": "No tiene permiso para realizar esta acción.", "fields": {} } }
```

```json
{ "error": { "code": "NOT_FOUND", "message": "No se encontró el recurso solicitado.", "fields": {} } }
```

```json
{ "error": { "code": "STATE_CONFLICT", "message": "El recurso cambió y la operación ya no es válida.", "fields": {} } }
```

```json
{ "error": { "code": "INTERNAL_ERROR", "message": "No fue posible completar la operación.", "fields": {} } }
```

### 1.4 Valores controlados

- Miembro: `student`, `professor`, `administrative`, `graduate`, `external`.
- Nivel de competencia: `basic`, `intermediate`, `advanced`.
- Disponibilidad: `low`, `medium`, `high`.
- Iniciativa `type`: `idea`, `need`, `challenge`.
- Iniciativa `visibility`: `public`, `institutional`, `restricted`, `private`.
- Iniciativa `state`: `draft`, `published`, `forming_team`, `converted`, `archived`.
- Solicitud `state`: `pending`, `accepted`, `rejected`, `cancelled`.
- Proyecto `state`: `planning`, `in_development`, `paused`, `finished`, `archived`.

El flujo de este avance crea iniciativas directamente como `published`; `draft` se conserva para compatibilidad de dominio y pruebas negativas.

### 1.5 Estado operativo

`GET /health` es una comprobación pública de vida del proceso, relativa a la URL base `/api`. No consulta MongoDB ni declara que sus dependencias estén disponibles; API02 agregará una verificación de preparación separada si resulta necesaria.

Respuesta `200`:

```json
{
  "data": {
    "status": "ok",
    "service": "innovation-hub-api"
  }
}
```

La respuesta incluye `X-Request-Id`. CORS aplica igual que al resto de la API. Este endpoint operativo no se cuenta entre los 26 endpoints funcionales del dominio.

## 2. DTO compartidos

### 2.1 UserSummary y User

```json
{
  "id": "2b57bff1-d1f6-4f11-88a2-0d955f7120e1",
  "firstName": "Daniel",
  "lastName": "Campos Sánchez",
  "memberType": "student",
  "career": "Ingeniería del Software",
  "avatarUrl": null
}
```

`User` agrega `bio`, `interests`, `availability`, `portfolioUrl`, `skills`, `createdAt` y `updatedAt`. Solo `/auth/me` y el perfil propio incluyen `email`. Nunca se devuelve contraseña, confirmación, hash, sal ni sesiones.

`skills` contiene objetos `{ "skillId": "uuid", "level": "intermediate" }`. Máximo 20 competencias y 15 intereses; cada interés tiene de 1 a 40 caracteres.

### 2.2 InitiativeSummary e Initiative

```json
{
  "id": "5d48f23c-6e69-4b17-b1fe-38aee96a3d65",
  "title": "Tutorías colaborativas",
  "type": "idea",
  "summary": "Red universitaria para intercambiar tutorías entre carreras.",
  "category": { "id": "education", "name": "Educación" },
  "skills": [{ "id": "facilitation", "name": "Facilitación" }],
  "estimatedMembers": 4,
  "memberCount": 3,
  "availableSpaces": 1,
  "visibility": "public",
  "state": "published",
  "owner": { "id": "uuid", "firstName": "Ana", "lastName": "Rojas" },
  "tags": ["tutorías", "comunidad"],
  "createdAt": "2026-10-30T14:00:00.000Z",
  "updatedAt": "2026-10-30T14:00:00.000Z",
  "access": {
    "canViewDetails": true,
    "canEdit": false,
    "canDelete": false,
    "canRequest": true,
    "canManageRequests": false,
    "canViewTeam": true,
    "canConvert": false
  }
}
```

`Initiative` agrega `description`, `problem` y `beneficiaries`. Una proyección restringida conserva solo título, tipo, resumen, categoría, competencias, conteos, visibilidad, estado y capacidades seguras; omite propietario, etiquetas y campos de detalle cuando no correspondan.

`availableSpaces = max(0, estimatedMembers - memberCount)`. Es informativo y no bloquea solicitudes ni aceptaciones.

### 2.3 Request

```json
{
  "id": "b084767d-752b-43d4-bf11-1317c9a1fc46",
  "initiative": { "id": "uuid", "title": "Tutorías colaborativas" },
  "applicant": { "id": "uuid", "firstName": "Luis", "lastName": "Mora" },
  "message": "Puedo apoyar la coordinación de las sesiones semanales.",
  "offeredSkill": { "id": "facilitation", "name": "Facilitación" },
  "role": "Coordinación de sesiones",
  "availability": "medium",
  "state": "pending",
  "decisionComment": null,
  "createdAt": "2026-10-31T10:00:00.000Z",
  "updatedAt": "2026-10-31T10:00:00.000Z",
  "decidedAt": null
}
```

### 2.4 Membership

```json
{
  "id": "6476a6ad-8b12-45d3-ad48-3ddba8482092",
  "initiativeId": "uuid",
  "user": { "id": "uuid", "firstName": "Luis", "lastName": "Mora" },
  "role": "Coordinación de sesiones",
  "state": "active",
  "joinedAt": "2026-10-31T12:00:00.000Z",
  "retiredAt": null
}
```

La historia de ingreso/retiro se conserva internamente en `membershipEvents`; reactivar nunca sobrescribe eventos anteriores.

### 2.5 Project

```json
{
  "id": "a2298d79-fb97-4052-b1de-f9b551984de0",
  "sourceInitiative": { "id": "uuid", "title": "Tutorías colaborativas" },
  "owner": { "id": "uuid", "firstName": "Ana", "lastName": "Rojas" },
  "name": "Red de Tutorías CENFOTEC",
  "description": "Implementación de la red de apoyo académico entre carreras.",
  "objective": "Coordinar tutorías y medir su alcance durante el cuatrimestre.",
  "technologies": ["React", "Node.js"],
  "startDate": "2026-11-01",
  "estimatedEndDate": "2027-02-28",
  "state": "planning",
  "repositoryUrl": null,
  "memberCount": 3,
  "createdAt": "2026-11-01T16:00:00.000Z",
  "updatedAt": "2026-11-01T16:00:00.000Z"
}
```

Los miembros se consultan desde la iniciativa de origen; no se copia un segundo equipo.

## 3. Autenticación

### POST `/auth/register` — público

Campos obligatorios: `firstName` 2–60, `lastName` 2–80, `memberType`, `email` válido máximo 254, `password` 10–128 y `passwordConfirmation`. La contraseña debe incluir al menos una letra y un número. Campos opcionales del perfil no se aceptan aquí.

```json
{
  "firstName": "Daniel",
  "lastName": "Campos Sánchez",
  "memberType": "student",
  "email": "daniel@example.com",
  "password": "ClaveSegura2026",
  "passwordConfirmation": "ClaveSegura2026"
}
```

Respuesta `201`, `Location: /api/users/{id}`:

```json
{ "data": { "user": { "id": "uuid", "firstName": "Daniel", "lastName": "Campos Sánchez", "memberType": "student", "email": "daniel@example.com" }, "accessToken": "token-opaco", "expiresAt": "2026-11-01T22:00:00.000Z" } }
```

Errores: `400` por campos/confirmación, `409 EMAIL_ALREADY_EXISTS`. Un campo como `id` o `createdAt` produce `400`.

### POST `/auth/login` — público

Body: `email`, `password`. Respuesta `200` con la misma forma `user`, `accessToken`, `expiresAt`. Credenciales incorrectas y correo desconocido producen el mismo `401 INVALID_CREDENTIALS`, sin revelar si el usuario existe.

### POST `/auth/logout` — autenticado

Sin body. Revoca solo la sesión actual y devuelve `204` sin JSON. Repetir con el token ya revocado produce `401`, porque ya no existe sesión válida.

### GET `/auth/me` — autenticado

Devuelve `200` con `User` propio e incluye correo. `401` para token ausente, vencido o revocado.

## 4. Usuarios y catálogos

### GET `/users` — autenticado

Query: `q` (2–100), `skill` UUID, `career` (2–100), `availability`, `page`, `size`, `sort=firstName|lastName|career|createdAt`, `order`. Devuelve perfiles seguros sin correo. `skill` inexistente pero bien formado produce lista vacía; UUID malformado produce `400`.

### GET `/users/{id}` — autenticado

Devuelve perfil seguro. El propio incluye `email`; un tercero no. UUID malformado `400`, desconocido `404`, sin sesión `401`.

### PUT `/users/me` — autenticado

Body completo editable:

```json
{
  "firstName": "Daniel",
  "lastName": "Campos Sánchez",
  "memberType": "student",
  "career": "Ingeniería del Software",
  "bio": "Estudiante interesado en aplicaciones web y colaboración.",
  "interests": ["educación", "tecnología"],
  "availability": "medium",
  "portfolioUrl": "https://example.com/daniel",
  "skills": [{ "skillId": "uuid", "level": "intermediate" }]
}
```

`career`, `bio` y `portfolioUrl` aceptan `null`; arrays aceptan `[]`. `portfolioUrl` debe ser HTTP(S), máximo 2048. `bio` máximo 600. `email`, `id`, fechas o contraseña producen `400`. Competencia inexistente o duplicada produce `400`. Respuesta `200` con `User` propio actualizado.

### GET `/categories` — público

Devuelve `{ "data": [{ "id": "technology", "name": "Tecnología" }] }`, sin paginación y con IDs estables para: Tecnología, Educación, Sostenibilidad, Impacto social, Negocios y emprendimiento, Salud y bienestar, Cultura y creatividad y Otro.

### GET `/skills` — público

Query: `q` (opcional, 2–100), `page`, `size`. Orden alfabético estable. Respuesta paginada con `{id,name}`. Los catálogos no tienen CRUD administrativo en este avance.

## 5. Iniciativas

### Reglas de visibilidad

| Actor | Pública | Institucional | Restringida | Privada |
| --- | --- | --- | --- | --- |
| Visitante | Catálogo y detalle | No aparece; detalle `401` | No aparece; detalle `401` | No aparece; detalle `404` |
| Autenticado ajeno | Completa | Completa | Resumen seguro; detalle `403` | No aparece; detalle `404` |
| Propietario o miembro activo | Completa | Completa | Completa | Completa desde rutas autorizadas |

`draft` y `archived` no aparecen en el catálogo general. El propietario puede consultarlas mediante `/initiatives/mine` y su detalle.

### GET `/initiatives` — público con proyección por actor

Query: `type`, `category` ID, `skill` UUID, `q` 2–100, `state=published|forming_team|converted`, `hasSpaces=true|false`, `ownerId` UUID, `page`, `size`, `sort=createdAt|updatedAt|title|memberCount`, `order`.

`hasSpaces=true` filtra `availableSpaces > 0`; no implica cupo ni impide solicitar. Un visitante no puede forzar estados o visibilidades fuera de su proyección. Filtros válidos sin coincidencias devuelven listado vacío.

### GET `/initiatives/mine` — autenticado

Debe registrarse antes de `/{id}`. Query: `page`, `size`, `sort=createdAt|updatedAt|title|state`, `order`. Incluye iniciativas propias privadas, borrador y archivadas. No significa “iniciativas donde soy miembro”.

### GET `/initiatives/{id}` — acceso según tabla

Devuelve `Initiative` completo o el código seguro correspondiente. `restricted` para ajeno autenticado devuelve `403`; `private` ajena devuelve `404`.

### POST `/initiatives` — autenticado

Body obligatorio:

```json
{
  "title": "Tutorías colaborativas",
  "type": "idea",
  "summary": "Red universitaria para intercambiar tutorías entre carreras.",
  "description": "La iniciativa coordina sesiones y seguimiento entre estudiantes.",
  "problem": "El apoyo académico informal es difícil de localizar.",
  "beneficiaries": "Estudiantes de todas las carreras",
  "categoryId": "education",
  "skillIds": ["uuid"],
  "estimatedMembers": 4,
  "visibility": "public",
  "tags": ["tutorías", "comunidad"]
}
```

Límites: título 5–100, resumen 15–240, descripción 20–2000, problema 10–500, beneficiarios 3–150, `estimatedMembers` entero 1–100, de 1 a 10 competencias, de 0 a 10 etiquetas y cada etiqueta 1–40. Categoría y competencias deben existir. El servidor fija propietario, `state=published`, fechas y membresía activa del propietario. Responde `201` y `Location`.

### PUT `/initiatives/{id}` — propietario

Mismo body completo del POST. No acepta propietario, estado, conteos, capacidades, IDs ni fechas. Si el actor no es dueño: `403`; inexistente: `404`.

Solo se rechaza un cambio de estimación cuando `newEstimatedMembers < previousEstimatedMembers` y a la vez `newEstimatedMembers < activeMemberCount`. Si ya hay 3 miembros con estimación 2, conservar 2 o aumentarla funciona; reducirla a 1 falla.

### DELETE `/initiatives/{id}` — propietario

Sin body. El servidor decide de manera atómica:

- `204` sin cuerpo si nunca hubo solicitud, miembro adicional/evento de miembro adicional ni proyecto. La membresía automática del propietario no impide borrar.
- `200` con `{ "data": { "id": "uuid", "state": "archived", "operation": "archived" } }` si existe cualquiera de esas relaciones.

Repetir sobre archivada devuelve el mismo `200`. Una relación creada entre la confirmación del cliente y la operación obliga a archivar. Archivada no acepta nuevas solicitudes, aceptación ni conversión; una solicitud pendiente existente sí puede ser cancelada por su solicitante.

## 6. Solicitudes

### Reglas de transición

```text
pending -> accepted | rejected | cancelled
```

Estados terminales no se editan ni reabren. Después de cancelar, ser rechazado o ser retirado del equipo, se permite crear otro intento con otro ID/fecha y se conserva el anterior. Se bloquea si existe otra pendiente o membresía activa. El propietario no puede solicitar a su propia iniciativa.

`published`, `forming_team` y `converted` admiten solicitudes. `converted` conserva ese estado cuando se acepta a alguien. `archived` y `draft` no admiten nuevas solicitudes.

### POST `/initiatives/{id}/requests` — autenticado

```json
{
  "message": "Puedo apoyar la coordinación de las sesiones semanales.",
  "offeredSkillId": "uuid",
  "role": "Coordinación de sesiones",
  "availability": "medium"
}
```

Mensaje 15–500, rol 3–100. La competencia debe existir y pertenecer al perfil del solicitante; no necesita estar requerida por la iniciativa. Responde `201` y `Location`. Errores: acceso/estado `403` o `409`, pendiente duplicada `409 PENDING_REQUEST_EXISTS`, miembro activo `409 ACTIVE_MEMBER_EXISTS`, dueño `409 STATE_CONFLICT`.

### GET `/requests` — autenticado

Query: `scope=mine|received` obligatorio, `initiativeId`, `state`, `skill`, `role` (2–100), `from`, `to`, `page`, `size`, `sort=createdAt|updatedAt|state`, `order`.

- `mine`: solicitudes del actor.
- `received`: solicitudes dirigidas a iniciativas de las que el actor es propietario.

Fechas son ISO y `from <= to`. No se filtra después de paginar. Un actor nunca obtiene solicitudes ajenas.

### GET `/requests/{id}` — autenticado y relacionado

Visible para solicitante o propietario de la iniciativa. Otro autenticado recibe `403`; UUID inexistente `404`.

### PUT `/requests/{id}` — solicitante, solo pendiente

Body completo con los mismos cuatro campos del POST. IDs, iniciativa, solicitante, estado y fechas son inmutables. Estado terminal produce `409 STATE_CONFLICT`.

### POST `/requests/{id}/cancel` — solicitante, solo pendiente

Sin body. Devuelve `200` con la solicitud en `cancelled`. Se permite aun si la iniciativa fue archivada. Repetir produce `409`.

### POST `/requests/{id}/decision` — propietario, solo pendiente

```json
{ "decision": "accepted", "comment": "Bienvenido al equipo." }
```

`decision`: `accepted|rejected`; comentario opcional `null` o 1–500. La aceptación cambia solicitud, membresía y evento de membresía en una transacción. No existe límite duro por `estimatedMembers`. Respuesta:

```json
{ "data": { "request": { "id": "uuid", "state": "accepted" }, "membership": { "id": "uuid", "state": "active" } } }
```

Para rechazo, `membership` es `null`. Archivada no puede aceptar (`409`), aunque puede rechazar para cerrar una pendiente. Carreras cancelar/decidir tienen un solo ganador; la segunda operación obtiene `409 CONCURRENT_MODIFICATION` o `STATE_CONFLICT`.

## 7. Miembros

### GET `/initiatives/{id}/members` — acceso completo a iniciativa

Query: `skill`, `role` (2–100), `page`, `size`, `sort=joinedAt|firstName|lastName|role`, `order`. Devuelve membresías activas. Dueño y miembros aceptados ven privadas; un ajeno respeta la visibilidad de la iniciativa.

### DELETE `/initiatives/{id}/members/{userId}` — propietario

Sin body. Retira un miembro distinto del propietario, marca `retiredAt` y agrega un evento en transacción. Devuelve `204`. Retirar al dueño es `409`; no miembro `404`; actor ajeno `403`. Una persona retirada puede solicitar nuevamente y sus eventos previos permanecen.

## 8. Proyectos

En este avance no existen rutas para editar, archivar, buscar o filtrar proyectos. Esas funciones pertenecen a la entrega final.

### POST `/initiatives/{id}/project` — propietario

Requiere al menos un miembro activo distinto del propietario. Body:

```json
{
  "name": "Red de Tutorías CENFOTEC",
  "description": "Implementación de la red de apoyo académico entre carreras.",
  "objective": "Coordinar tutorías y medir su alcance durante el cuatrimestre.",
  "technologies": ["React", "Node.js"],
  "startDate": "2026-11-01",
  "estimatedEndDate": "2027-02-28",
  "repositoryUrl": null
}
```

Nombre 5–120, descripción 20–2000, objetivo 10–500, 1–20 tecnologías de 1–50, fechas `YYYY-MM-DD`, fin opcional no anterior al inicio, repositorio opcional HTTP(S) máximo 2048. Crea proyecto `planning` y cambia iniciativa a `converted` en transacción. Responde `201` y `Location`. Proyecto ya existente `409 PROJECT_ALREADY_EXISTS`; equipo insuficiente o estado inválido `409 STATE_CONFLICT`.

### GET `/projects` — proyección por actor

Query: `page`, `size`, `sort=createdAt|updatedAt|name|startDate`, `order`. No admite búsqueda/filtros adicionales en este avance. La visibilidad se deriva de la iniciativa de origen y se aplica antes de paginar.

### GET `/projects/{id}` — proyección por actor

Devuelve `Project` y capacidades seguras. El cliente consulta el equipo mediante la iniciativa de origen. Privado ajeno `404`; acceso restringido insuficiente `403`; UUID malformado `400`.

## 9. Matriz mínima de escenarios HTTP

| Recurso | Correcto | Inválido | Inexistente | Sin permiso/sesión |
| --- | --- | --- | --- | --- |
| Auth | registrar, login, me, logout | correo/confirmación/credenciales | ruta auth inexistente; login no revela usuario | me con token ausente/vencido/revocado |
| Usuarios | consultar y guardar perfil | correo inmutable, habilidad o nivel | UUID válido sin usuario | directorio sin sesión; mutación ajena |
| Catálogos | leer categorías/competencias | query/página inválida | habilidad inexistente al asociar | token inválido enviado; sin token sí es válido |
| Iniciativas | crear, editar, consultar, borrar/archivar | enum, longitud, query | UUID válido sin iniciativa | ajeno en PUT/DELETE; detalle no permitido |
| Solicitudes | crear, editar, cancelar, decidir | transición/campo/skill inválido | UUID válido sin recurso | solicitud ajena; decisión por no dueño |
| Miembros | listar y retirar | retirar dueño | miembro inexistente | retiro por no propietario |
| Proyectos | convertir, listar y detallar | fechas/URL/equipo insuficiente | UUID válido sin proyecto | conversión por no dueño; privado ajeno |

Los casos `500` se inducen en pruebas mediante una dependencia controlada; no se incorpora una ruta pública para provocar fallos.

## 10. CORS y compatibilidad

En desarrollo, CORS permite únicamente el origen configurable del cliente, métodos usados por este contrato y encabezados `Content-Type`/`Authorization`. No se usa `*` junto con credenciales. Este contrato no depende de cookies.

La API futura en .NET debe conservar rutas, DTO, códigos, paginación y errores para que React cambie únicamente la URL base. Una modificación de contrato antes de `entrega-2` debe actualizar en el mismo cambio: este documento, mocks, servidor, consumidor y colección Postman.

## 11. Inventario ejecutable de ejemplos por endpoint

Los UUID abreviados de esta tabla representan UUID válidos completos en fixtures/Postman. “Inválido” identifica el caso mínimo que cada carpeta de la colección debe incluir, además de éxito, inexistente y autorización cuando apliquen.

| Endpoint | Ejemplo válido | Ejemplo inválido y resultado |
| --- | --- | --- |
| `POST /auth/register` | Body de registro de §3 -> `201` | `passwordConfirmation` distinta -> `400 VALIDATION_ERROR` |
| `POST /auth/login` | Correo/clave de fixture -> `200` | Clave incorrecta -> `401 INVALID_CREDENTIALS` |
| `POST /auth/logout` | Bearer vigente, sin body -> `204` | Bearer revocado -> `401` |
| `GET /auth/me` | Bearer vigente -> `200` | Sin Bearer -> `401` |
| `GET /users` | `?skill=<uuid>&page=1&size=12` -> `200` | `?page=0` -> `400 INVALID_QUERY` |
| `GET /users/{id}` | Usuario conocido -> `200` | `id=no-uuid` -> `400`; UUID desconocido -> `404` |
| `PUT /users/me` | Body completo de §4 -> `200` | Incluye `email` o skill duplicada -> `400` |
| `GET /categories` | Sin query -> `200` | `?page=1` desconocido -> `400 INVALID_QUERY` |
| `GET /skills` | `?q=react&page=1` -> `200` | `?size=51` -> `400` |
| `GET /initiatives` | `?type=idea&sort=title&order=asc` -> `200` | `?type=otro` -> `400` |
| `GET /initiatives/mine` | Bearer, `?page=1` -> `200` | Sin Bearer -> `401` |
| `GET /initiatives/{id}` | Pública conocida -> `200` | Privada ajena -> `404`; restringida ajena autenticada -> `403` |
| `POST /initiatives` | Body de §5 -> `201` y `published` | Incluye `state=draft` o título de 4 -> `400` |
| `PUT /initiatives/{id}` | Dueño y body completo -> `200` | Ajeno -> `403`; nueva estimación inválida -> `400` |
| `DELETE /initiatives/{id}` | Dueño -> `204` o `200 archived` | Ajeno -> `403`; UUID desconocido -> `404` |
| `POST /initiatives/{id}/requests` | Solicitante elegible -> `201` | Pendiente existente -> `409 PENDING_REQUEST_EXISTS` |
| `GET /requests` | `?scope=mine&state=pending` -> `200` | Sin `scope` -> `400` |
| `GET /requests/{id}` | Solicitante o dueño -> `200` | Otro autenticado -> `403`; desconocida -> `404` |
| `PUT /requests/{id}` | Solicitante, pendiente, body completo -> `200` | Solicitud terminal -> `409 STATE_CONFLICT` |
| `POST /requests/{id}/cancel` | Solicitante y pendiente -> `200` | Repetir cancelación -> `409` |
| `POST /requests/{id}/decision` | Dueño, `accepted|rejected` -> `200` | `decision=maybe` -> `400`; actor ajeno -> `403` |
| `GET /initiatives/{id}/members` | Actor con acceso, `?page=1` -> `200` | `?sort=email` -> `400` |
| `DELETE /initiatives/{id}/members/{userId}` | Dueño retira miembro -> `204` | Retirar dueño -> `409`; ajeno -> `403` |
| `POST /initiatives/{id}/project` | Dueño, equipo válido, body de §8 -> `201` | Sin otro miembro o repetido -> `409` |
| `GET /projects` | `?sort=startDate&order=asc` -> `200` | `?q=tutorias` no permitido -> `400` |
| `GET /projects/{id}` | Proyecto visible -> `200` | Privado ajeno -> `404`; UUID malformado -> `400` |

Ejemplo HTTP válido:

```http
GET /api/requests?scope=mine&state=pending&page=1&size=12 HTTP/1.1
Host: localhost:3000
Authorization: Bearer token-opaco
Accept: application/json
```

Ejemplo HTTP inválido:

```http
GET /api/requests?scope=mine&page=0 HTTP/1.1
Host: localhost:3000
Authorization: Bearer token-opaco
Accept: application/json
```

```json
{ "error": { "code": "INVALID_QUERY", "message": "La consulta no es válida.", "fields": { "page": "Debe ser un entero desde 1." } } }
```
