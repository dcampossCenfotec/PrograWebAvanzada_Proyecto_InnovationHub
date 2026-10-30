# Matriz de reglas y equivalencias documentales

La numeración RN no es estable entre la descripción general y las consignas. Para evitar implementar una regla equivocada, esta matriz usa el significado como identificador principal. “Decisión del equipo” indica una interpretación acordada y no una cita docente.

| Regla semántica | Fuente/antecedente | Decisión operativa | Contrato o prueba |
| --- | --- | --- | --- |
| Autenticación real | Consigna Avance 2 | Token Bearer opaco, sesión revocable; contraseña con scrypt. | `/auth/*`; token vencido/revocado `401`; logout real. |
| Perfil y correo | Consigna Avance 2 | El usuario edita su perfil, pero no el correo. | `PUT /users/me`; enviar `email` da `400`. |
| Competencias controladas | Descripción general + observación E21 | Relación por ID y nivel; no texto libre. | Skill inexistente/duplicado `400`. |
| Visibilidad | Descripción general (RN-20 en ese documento) | Pública, institucional, restringida y privada; servidor proyecta antes de paginar. | Tabla de acceso del contrato; URL directa no revela datos. |
| Solicitud propia | Descripción general (RN-10 en ese documento) | El propietario no solicita a su iniciativa. | `POST .../requests` produce `409`. |
| Solo una pendiente | Consigna + observación E26 | Índice/servicio impide dos pendientes por iniciativa/usuario. | Doble envío: uno `201`, otro `409`. |
| Reintento de solicitud | Decisión de Daniel | Permitido tras cancelar, rechazo o retiro; registro nuevo, historia intacta. | IDs distintos y ambos intentos consultables. |
| Estimación de integrantes | Decisión de Daniel + regla general de reducción | No es cupo. Espacios `max(0, estimado-activos)`. Solo se impide una reducción nueva por debajo de activos. | Estimado 2/activos 3: conservar 2 funciona, subir funciona, bajar a 1 falla. |
| Borrar o archivar | Descripción general + decisión de Daniel | Dueño solo no bloquea borrado; cualquier solicitud, miembro adicional histórico o proyecto obliga a archivar. | DELETE `204` o `200 operation=archived`; carrera revalida. |
| Publicación de iniciativa | Decisión de Daniel | Guardar válida crea `published`; sin UI de borrador. | POST responde `state=published`; enviar `state` da `400`. |
| Formación de equipo | Consigna Avance 2 | Aceptar crea/reactiva membresía y evento de forma atómica. | Request/membership/event consistentes; carrera con cancelar. |
| Retiro de miembro | Consigna Avance 2 | Solo propietario, nunca al dueño; historia se conserva. | DELETE miembro `204`; dueño `409`; ajeno `403`. |
| Conversión | Descripción general (RN-17 en ese documento) | Requiere otro miembro activo y un proyecto único por iniciativa. | Conversión sin equipo `409`; repetida `409`. |
| Solicitudes tras conversión | Decisión de Daniel | Continúan; aceptar modifica el mismo equipo y conserva `converted`. | Crear/aceptar sobre convertida; proyecto refleja miembro. |
| Proyecto en Avance 2 | Consigna Avance 2 | Crear, listar y detallar únicamente. | No existen PUT/DELETE ni filtros de búsqueda de proyecto. |
| GitHub | Consigna Avance 2 | Consulta pública desde cliente; errores controlados. | Éxito, 404/privado, límite/red y repo sin datos. |
| Historial Git | Consigna + evaluación E27 | Hash/fecha/autor reales; no recuperar artificialmente cinco semanas. | Comparar tabla README con `git log`. |

## Ambigüedades resueltas

1. La membresía automática del propietario no cuenta como “relación adicional” para impedir borrado. De contarla, ninguna iniciativa creada podría borrarse y la regla de borrado sería inalcanzable.
2. Una estimación menor al número actual no invalida ediciones de otros campos. Solo una reducción nueva que empeore esa relación se rechaza.
3. Archivar no cancela solicitudes pendientes automáticamente. Impide crear y aceptar; permite que el solicitante cancele y que el dueño rechace para cerrar el historial.
4. Una iniciativa convertida no se devuelve a `forming_team` al aceptar otra persona.
5. Un recurso privado ajeno devuelve `404` para no revelar existencia; uno restringido conocido por un usuario autenticado devuelve `403` en detalle.

## Control de cambios

Cualquier cambio a una regla antes de `entrega-2` debe modificar en un solo commit: esta matriz, `api-contract.md`, mocks, API, cliente afectado y casos Postman. Después de la etiqueta, un cambio incompatible requiere versión explícita; no se corrige silenciosamente para la migración .NET.
