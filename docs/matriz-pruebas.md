# Matriz de pruebas — Avance 2

Esta matriz enlaza requisito, contrato, interfaz, fixture y evidencia. Describe pruebas que deberán ejecutarse; una fila no está aprobada hasta que la bitácora incluya comando o recorrido, resultado y hash real. Los IDs simbólicos se resuelven en `pruebas/fixtures/manifest.json`.

## Cobertura funcional y de contrato

| ID | Regla o riesgo | Endpoint/API | Pantalla React | Fixture principal | Casos mínimos | Evidencia esperada | Responsable |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T01 | Registro sin filtrar secretos | `POST /auth/register` | `/registro` | `ACTOR_B` | `201`; confirmación distinta `400`; correo repetido `409`; respuesta sin hash | Supertest + componente + Postman | Daniel |
| T02 | Sesión revocable | login, me, logout | `/ingresar`, navegación | API03 agrega sesión sintética | login `200`; token ausente/vencido/revocado `401`; logout `204` sin cuerpo | Supertest + Postman | Daniel |
| T03 | Perfil propio frente a tercero | `GET /users/{id}`, `PUT /users/me` | `/perfil`, `/usuarios/:id` | `ACTOR_A`, `ACTOR_B` | propio incluye email; tercero lo omite; campo inmutable/skill duplicada `400` | API + componente | Daniel |
| T04 | Directorio seguro y paginado | `GET /users` | `/usuarios` | actores A–E | filtros combinados; página vacía `200`; sin sesión `401`; total después de autorización | API + UI | Daniel |
| T05 | Catálogos estables | `GET /categories`, `GET /skills` | formularios/filtros | `catalogs.json` | 8 categorías; búsqueda skill; query inválida `400`; token ausente permitido | API + Postman | Daniel |
| T06 | Cuatro visibilidades | `GET /initiatives`, `GET /initiatives/{id}` | catálogo/detalle | `INIT_PUBLIC_DELETE`, `INIT_INSTITUTIONAL`, `INIT_RESTRICTED`, `INIT_PRIVATE` | visitante/ajeno/miembro/dueño según tabla; privada ajena `404`; restringida ajena `403` | matriz de actores API + URLs directas | Francisco |
| T07 | Estados fuera de catálogo | catálogo, mine, detalle | catálogo/mis iniciativas | `INIT_DRAFT`, `INIT_ARCHIVED` | no aparecen en catálogo; dueño las ve en mine; solicitud nueva bloqueada | API + UI | Francisco |
| T08 | Publicación directa | `POST /initiatives` | `/iniciativas/nueva` | catálogos | válida `201 published`; enviar `state` `400`; crea membresía/evento del dueño | integración transaccional + UI | Francisco |
| T09 | Validación y edición completa | `PUT /initiatives/{id}` | `/iniciativas/:id/editar` | `INIT_PUBLIC_DELETE` | límites exactos; ajeno `403`; campos inmutables `400`; fallo no navega | API + formulario | Francisco |
| T10 | Estimación no es cupo | PUT, lista, decisión | edición/detalle/recibidas | `INIT_OVER_ESTIMATE` | activos 3/estimado 2: conservar/subir funciona; bajar a 1 falla; espacios 0 | API + DTO + UI | Francisco |
| T11 | Borrar solo sin historia | `DELETE /initiatives/{id}` | detalle propio | `INIT_PUBLIC_DELETE` | dueño `204`; carrera que agrega relación obliga a archivar | transacción + Postman | Francisco |
| T12 | Archivar con historia | DELETE | detalle propio | `INIT_ARCHIVED` | relación histórica produce `200 archived`; repetir es idempotente; ajeno `403` | API + UI | Francisco |
| T13 | Solicitud válida y pendiente única | `POST /initiatives/{id}/requests` | participar | `INIT_INSTITUTIONAL`, `ACTOR_B` | `201`; doble envío/carrera `409`; dueño/miembro `409`; skill ajena `400` | índice parcial + UI | Daniel |
| T14 | Editar/cancelar solo pendiente | PUT y cancel | mis solicitudes | `REQUEST_PENDING` | editar conserva ID/fechas; cancelar `200`; repetir/terminal `409`; cancelar archivada permitido | API + UI + Postman | Daniel |
| T15 | Reintentos conservan historia | crear/listar solicitudes | mis solicitudes | `REQUEST_REJECTED`, `REQUEST_PENDING` | IDs/fechas distintos; intento previo terminal intacto; una pendiente actual | consulta DB + API | Daniel |
| T16 | Listados no filtran después de paginar | `GET /requests` | propias/recibidas | todas las solicitudes | `scope` requerido; filtros/fechas; totales reales; actor ajeno no obtiene datos | API + Postman | Daniel/Francisco |
| T17 | Decisión atómica | decision | solicitudes recibidas | `REQUEST_PENDING` | aceptar/rechazar; cancelar frente a aceptar tiene un ganador; archivada solo rechaza | réplica set + concurrencia | Francisco |
| T18 | Historial de equipo | members/delete member | equipo | membresías/eventos de `INIT_CONVERTED` | retirar crea evento; no borra entrada; dueño no se retira; retirado puede volver a solicitar | transacción + API + UI | Francisco |
| T19 | Aceptación tras convertir | decision, members, project | recibidas/proyecto | `INIT_CONVERTED`, `PROJECT_A` | nuevo aceptado aparece en mismo equipo/proyecto; iniciativa conserva `converted` | integración completa | Francisco |
| T20 | Conversión única | `POST /initiatives/{id}/project` | convertir | `INIT_TEAM` | dueño y otro miembro `201`; sin equipo `409`; repetición `409`; proyecto/iniciativa atómicos | transacción + UI | Daniel |
| T21 | Proyecto hereda visibilidad | GET projects/detail | proyectos/detalle | `PROJECT_A`, `INIT_CONVERTED` | actor permitido `200`; privado ajeno `404`; query extra `400`; sin editar/archivar | API + rutas | Daniel |
| T22 | GitHub tolera fallos | API pública GitHub desde React | detalle proyecto | URL de repo sintética | válido, lenguaje null, 404, 403/429, 503, offline, timeout; proyecto sigue visible | mocks + prueba real breve | Daniel |
| T23 | Errores uniformes | todos | paneles de estado | UUID desconocido estable | `400/401/403/404/409/500`; `fields={}`; sin stack; `204` vacío | Supertest + Postman | Ambos |
| T24 | CORS no autentica | preflight/API | arranque local | configuración futura | origen permitido/no permitido; curl sin Origin sigue requiriendo token | prueba HTTP | Francisco |
| T25 | Orden estable y páginas | listados | catálogos/listas | fixtures completos | lista blanca; `id` desempata; página fuera de rango vacía con total real | API + UI | Francisco |

## Regresiones del Avance 1

| ID | Hallazgo | Cambio que debe impedirlo | Verificación |
| --- | --- | --- | --- |
| E14–E15 | Foco, contraste y responsive sin evidencia real | UI15 y componentes compartidos | Teclado, foco visible, 360/768/1440 px y zoom 200 % registrados en bitácora. |
| E16/E20 | Detalle básico y enlace a contenido restringido | API06, UI06, UI07 | Proyección segura no muestra acción; URL directa devuelve código seguro; detalle tiene estados completos. |
| E21 | Competencias libres/duplicadas y etiquetas por comas | API04, UI09 | IDs de catálogo, duplicado rechazado, confirmación al quitar y chips accesibles. |
| E21/E23 | Límites visibles solo al enviar | UI10 | Contadores/errores tras interacción y servidor prueba límites exactos. |
| E21/E22 | Navegación incorrecta tras guardar | UI10 | Crear vuelve al catálogo; editar al detalle; fallo conserva formulario. |
| E26 | Solicitudes duplicadas y sin Cancelar explícito | API08, UI11 | Índice parcial/carrera y flujo de cancelación/retorno. |
| E27 | Historial, tabla y etiqueta incompletos | CO02, CO04 | Seis columnas con hashes reales; tag local/remoto verificado. |

## Conjuntos aislados

- `baseline`: carga completa para recorridos manuales; no se usa para pruebas destructivas concurrentes.
- `destructive-delete`: copia de `INIT_PUBLIC_DELETE` para borrar físicamente.
- `concurrent-request`: iniciativa y solicitante exclusivos para dos POST simultáneos.
- `concurrent-decision`: solicitud pendiente exclusiva para cancelar/aceptar simultáneamente.
- `conversion`: equipo exclusivo para dos conversiones simultáneas.

El seed futuro recibe el nombre de conjunto y el nombre explícito de una base de prueba. Debe rechazar una URI/base que no cumpla la convención de prueba; nunca vacía la base de desarrollo del compañero.

## Criterio de evidencia

Cada ejecución registrada en `docs/bitacora-avance2.md` incluye fecha, entorno, comando o recorrido exacto, resultado cuantificable y hash cuando exista. Un mock demuestra comportamiento del consumidor; solo API + MongoDB real demuestran integración. Una prueba documental de CO01 valida coherencia de fixtures, no demuestra todavía que Mongoose, Express o React funcionen.

