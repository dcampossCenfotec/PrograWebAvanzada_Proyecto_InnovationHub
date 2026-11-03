# Alcance del Avance 2

## Objetivo

Evolucionar el prototipo del Avance 1 a una aplicación completa con cliente React, API Node.js/Express y persistencia MongoDB. La demostración se ejecutará localmente en el equipo de cada integrante. La fecha de entrega usada por el equipo es el **8 de noviembre de 2026**, corregida por Daniel respecto al documento recibido.

El directorio `avance1/` se conserva como evidencia histórica. Las correcciones de la evaluación anterior se aplican en `cliente/` y `servidor/`; no se reescribe el prototipo para después migrarlo otra vez.

## Funciones incluidas

- Registro, inicio/cierre de sesión real y consulta de la sesión actual.
- Perfil propio editable sin cambio de correo, competencias relacionadas y directorio de usuarios con filtros.
- Catálogos controlados de ocho categorías y competencias.
- Iniciativas: crear, editar, eliminar sin historial o archivar explícitamente, listar, detallar, buscar, filtrar, ordenar y paginar.
- Visibilidad pública, institucional, restringida y privada aplicada en el servidor.
- Solicitudes: crear, editar mientras estén pendientes, cancelar, listar propias/recibidas y aceptar/rechazar.
- Equipo: ingreso automático al aceptar, consulta y retiro por el propietario, con historia conservada.
- Conversión de iniciativa a proyecto con al menos otra persona, listado y detalle de proyectos.
- Consulta a la API pública de GitHub desde el cliente, con estados de carga/error/vacío y pruebas con mocks.
- Contrato HTTP, modelo de datos, colección Postman, pruebas automatizadas y guía reproducible de ejecución local.

## Exclusiones de esta entrega

- Edición, archivado, búsqueda o filtrado de proyectos.
- Administración CRUD de categorías o competencias.
- Chat, pagos, notificaciones en tiempo real y administración global.
- Guardado de iniciativas como borrador desde la interfaz.
- Salida voluntaria de un equipo; el retiro lo realiza el propietario.
- Despliegue público. GitHub Pages no ejecuta Express ni MongoDB y no satisface la demostración del sistema completo.

## Responsabilidad por funcionalidad

| Titular | Implementación completa | Revisión |
| --- | --- | --- |
| Daniel Campos Sánchez | Bases React/HTTP y Express/MongoDB; autenticación; perfiles, competencias y directorio; creación, consulta, edición y archivo de iniciativas; catálogo, detalle, formulario, competencias, etiquetas y validación; CO00–CO01; modelo y fixtures. | Francisco revisa cada tarea. |
| Francisco José Torres Sandoval | Solicitudes propias y recibidas; equipos; proyectos y GitHub; consistencia API; colección Postman; QA integral del cliente; CO02–CO04; integración/README/defensa/entrega. | Daniel revisa cada tarea. |

Tras la reasignación del 3 de noviembre, el plan completo asigna 19 tareas a Daniel y 15 a Francisco. CO00, CO01, UI01–UI10 y API01–API07 completan las 19 tareas de implementación de Daniel, quien aprobó UI10 y autorizó su publicación. Francisco conserva las 15 tareas restantes. Daniel entrega comandos, evidencia, fragmentos Postman y defectos conocidos del módulo completo de iniciativas en un handoff explícito antes de que Francisco continúe los flujos dependientes y antes de CO02; cambiar el titular no transfiere la obligación de probar y explicar el trabajo ya realizado.

Cada tarea tiene un responsable único. El revisor no comparte autoría del cambio: comprueba contrato, casos límite y reproducibilidad.

## Estructura objetivo

```text
README.md
avance1/                    # Entrega histórica, se conserva
cliente/                    # React + Vite + Router + Bootstrap/Sass
servidor/                   # Node.js + Express + Mongoose
docs/
├── alcance-avance2.md
├── api-contract.md
├── bitacora-avance2.md
├── matriz-reglas.md
└── modelo-datos.md         # Se agrega en CO01
pruebas/
├── fragmentos/             # Casos por módulo durante el desarrollo
├── fixtures/               # Se agregan en CO01
└── innovation-hub.postman_collection.json
```

Los directorios de código se crean en sus tareas correspondientes. Esta estructura describe el destino; no se marca como implementada antes de existir.

## Decisiones de negocio confirmadas

1. Una iniciativa solo se borra físicamente si nunca tuvo relaciones adicionales a la membresía automática del dueño. Cualquier solicitud histórica, miembro adicional o proyecto impide eliminar (`409` sin cambios). Archivar es una acción independiente disponible con o sin historial; una archivada sin historial adicional también puede eliminarse.
2. `estimatedMembers` es una estimación. Puede superarse y `availableSpaces` nunca baja de cero ni bloquea solicitudes/aceptaciones.
3. Se permite volver a solicitar después de cancelación, rechazo o retiro; cada intento tiene ID/fecha nuevos y se conserva todo el historial.
4. Una iniciativa convertida continúa recibiendo y resolviendo solicitudes. Los aceptados se integran al equipo vinculado al proyecto y el estado sigue `converted`.
5. Una iniciativa válida se publica al guardarse; este avance no tiene flujo de borradores.

## Decisiones técnicas del equipo

La consigna fija React/Vite/Router, Node/Express, MongoDB, Bootstrap/Sass, validación, hashing, CORS y pruebas HTTP. Donde no prescribe una herramienta, el equipo adopta:

- JavaScript/JSX con módulos ES.
- Mongoose detrás de repositorios y DTO públicos.
- Contraseñas con `scrypt` asíncrono y sal aleatoria.
- Tokens Bearer opacos y sesiones revocables almacenadas por hash en MongoDB.
- MongoDB local en replica set para transacciones; Docker Compose como opción reproducible y configuración nativa equivalente como alternativa.
- `node:test`/Supertest, Vitest/Testing Library, Playwright y Postman según la capa.
- UUID públicos y fechas ISO UTC; la persistencia interna no se filtra al cliente.

Estas elecciones pertenecen al equipo y no se presentan como exigencias del docente.

## Correcciones heredadas del Avance 1

| Hallazgo | Corrección en Avance 2 | Verificación esperada |
| --- | --- | --- |
| Detalle visual básico | Vista React de detalle completa, estados y acciones según capacidades. | Recorrido móvil/escritorio y acceso por teclado. |
| Enlace a detalle restringido antes del permiso | La proyección segura no presenta acción de detalle; servidor devuelve `403`. | Manipular URL/DOM no revela contenido. |
| Competencias libres y duplicados tardíos | Catálogo por ID, validación inmediata y error de servidor. | Duplicado/ID inexistente no persiste. |
| Eliminación de competencia sin confirmación | Confirmación accesible antes de remover. | Cancelar preserva el dato. |
| Etiquetas solo como texto con comas | Chips controlados, individuales y removibles. | Teclado, duplicados y límites. |
| Límites visibles solo al enviar | Contadores y validación tras interacción, más validación de servidor. | Probar exactos mínimo/máximo. |
| Navegación incorrecta tras crear/editar | Crear vuelve al catálogo; editar vuelve al detalle con mensaje enfocado. | Fallo conserva formulario; éxito navega una vez. |
| Solicitudes duplicadas y sin cancelación clara | Índice/servicio impide una pendiente duplicada; acción Cancelar explícita. | Doble envío y carrera controlados. |
| Historial/etiquetas incompletos | Tabla de seis columnas, hashes reales y etiquetas verificadas. | Contrastar con Git, sin inventar fechas. |
| QA visual pendiente | Pruebas manuales reales de foco, contraste y responsive. | Evidencia en bitácora, no solo DOM simulado. |

## Restricciones y riesgos

- Empezar tarde no permite reconstruir cinco semanas de historial. No se alterarán fechas ni autores para aparentarlo.
- Las transacciones requieren replica set; MongoDB standalone no sirve para aceptación, retiro y conversión atómicos.
- Los mocks de GitHub cubren fallos deterministas, pero no sustituyen la integración real con Internet.
- Los permisos deben filtrar datos y totales en el servidor. Ocultar contenido con CSS no protege información.
- La defensa es individual. Cada integrante debe poder explicar y modificar su código sin asistencia generativa.

## Criterio de cierre

Una tarea solo se considera terminada si su código/documento, README, evidencia, pruebas, revisión cruzada y hash real están registrados. Una prueba planeada no se marca como aprobada. No se crean commits ni etiquetas hasta que el autor recorra manualmente el cambio y el revisor pueda reproducirlo.


## Handoff al cerrar UI10

Daniel entrega el [handoff operativo a Francisco](handoff-francisco.md), [su registro de entregables](avance2-daniel.md), el [plan portable](plan-avance2.md) y [fuentes ya extraídas](fuentes/README.md). Base de código aprobada/publicada `5e12be3`. La recepción/revisión cruzada de Francisco permanece pendiente; entregar documentación no implica que él ya la haya validado.

Francisco conserva API08–API14, UI11–UI15 y CO02–CO04 (15 tareas). La secuencia recomendada y cada commit/checklist/prueba/prompt están en el handoff. La colección final es UI14: solo se entrega un fragmento existente de iniciativas, más la evidencia de los otros módulos de Daniel; Francisco completa su cobertura y la de sus módulos al consolidarla.
