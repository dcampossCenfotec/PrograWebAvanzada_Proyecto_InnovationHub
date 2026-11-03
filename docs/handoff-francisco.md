# Handoff de Daniel a Francisco — Avance 2

**Corte:** 3 de noviembre de 2026. **Base de código publicada y aprobada:** `5e12be3954ec617f3442f981d65054f59c3f6160` (`5e12be3`, UI10). Este documento se prepara después de ese commit: no afirmar que ya está contenido en esa base. Revisar el hash más reciente al empezar. **Entrega acordada:** 8 de noviembre de 2026, hora de Costa Rica, por corrección de Daniel; no usar la fecha impresa del 25 de octubre. Sin estimaciones de horas.

Daniel terminó sus 19 tareas de implementación. Francisco tiene las 15 tareas enumeradas aquí, con Daniel como revisor. Francisco revisa además el código recibido de Daniel; la aprobación del autor no sustituye esa revisión. El producto completo todavía está incompleto: faltan solicitudes, equipos, proyectos/GitHub y las verificaciones/cierres finales.

## Índice

1. [Cómo usar este documento y ordenar las fuentes](#1-cómo-usar-este-documento-y-ordenar-las-fuentes)
2. [Estado real del sistema y evidencia recibida](#2-estado-real-del-sistema-y-evidencia-recibida)
3. [Arranque en otro equipo y diagnóstico](#3-arranque-en-otro-equipo-y-diagnóstico)
4. [Arquitectura y puntos de integración](#4-arquitectura-y-puntos-de-integración)
5. [Reglas que deben conservarse](#5-reglas-que-deben-conservarse)
6. [Cómo trabajar, probar y documentar cada commit](#6-cómo-trabajar-probar-y-documentar-cada-commit)
7. [Las 15 tareas de Francisco](#7-las-15-tareas-de-francisco)
8. [Prompts para comenzar, retomar, revisar y cerrar](#8-prompts-para-comenzar-retomar-revisar-y-cerrar)
9. [Recepción del handoff y condición de entrega](#9-recepción-del-handoff-y-condición-de-entrega)

## 1. Cómo usar este documento y ordenar las fuentes

Primera lectura: este handoff → alcance → contrato de las operaciones de la tarea → modelo → matriz de reglas → archivos concretos de implementación. Después consultar solo las secciones necesarias. Las fuentes ya están convertidas: no reconvertir PDF/DOCX/XLSX para cada tarea ni volver a auditar `avance1/` completo sin motivo.

| Documento/directorio | Qué contiene y cuándo leerlo | Cómo mantenerlo |
| --- | --- | --- |
| [README raíz](../README.md) | Entrada pública, ejecución general, alcance por avance e historial real. | Cada tarea agrega sus cambios relevantes; CO02 consolida y corrige la tabla final. |
| [alcance-avance2.md](alcance-avance2.md) | Qué entra, exclusiones y responsables. | Actualizar si el equipo cambia el alcance; no añadir extras por intuición. |
| [api-contract.md](api-contract.md) | Fuente principal del HTTP: DTO, rutas, verbos, permisos, validaciones y códigos. | Antes de entrega, cualquier aclaración debe concordar con API/cliente/tests/mocks/Postman; congelar en entrega-2. |
| [modelo-datos.md](modelo-datos.md) | Colecciones, referencias/embebidos, índices, invariantes y futura traducción relacional. | Mantener junto con el cambio real de esquema, índice o transacción. |
| [matriz-reglas.md](matriz-reglas.md) | Significado de reglas y equivalencias RN entre documentos. | Leer antes de tocar estados, visibilidad, solicitudes, equipos o conversión. |
| [matriz-pruebas.md](matriz-pruebas.md) | Requisito → endpoint/pantalla/fixture/casos/responsable. | Una fila es cobertura requerida, no una prueba aprobada. Registrar resultado en bitácora. |
| [bitacora-avance2.md](bitacora-avance2.md) | Evidencia cronológica: entorno, comando/recorrido, fallos, correcciones y resultado. | Agregar entradas; conservar fallos históricos y distinguir automatizado/manual. |
| [iniciativas-api.md](iniciativas-api.md) | Consumo y evidencia de API05–API07/UI06–UI10. | Reutilizar sus políticas en solicitudes y proyectos; no crear otra lógica de iniciativa. |
| [avance2-daniel.md](avance2-daniel.md) | Resumen entregado por Daniel: commits, pruebas, interfaces y límites. | Actualizar si Daniel corrige su módulo; no registrar como suyo trabajo futuro de Francisco. |
| [plan-avance2.md](plan-avance2.md) | Plan maestro portable de los 34 commits/tareas, incluyendo las 19 terminadas. | IDs de tarea estables. Este handoff ordena y concreta las 15 restantes; no renumerarlas. |
| [cliente/README.md](../cliente/README.md) | Vite, API real/mock, componentes, consultas y pruebas React/API. | Cambios del cliente y resultados esperados de comandos. |
| [servidor/README.md](../servidor/README.md) | Express/Mongo, variables, seed, sesiones, scripts y recuperación. | Cambios de configuración, nuevos módulos y pruebas servidor. |
| [fixtures/README.md](../pruebas/fixtures/README.md) y [manifest.json](../pruebas/fixtures/manifest.json) | Actores, UUID, escenarios y JSON sintéticos compartidos. | Preservar IDs de referencia; aislar los datos destructivos. |
| [fragmentos/README.md](../pruebas/fragmentos/README.md) | Fragmento Postman existente y cómo consolidarlo en UI14. | Agregar fragmentos nuevos sin secretos; exportación final única. |
| [fuentes/README.md](fuentes/README.md) | Descripción general, consignas y evaluación ya extraídas a Markdown. | Son referencia documental; no corregir su contenido original para ocultar contradicciones. |

Francisco creará `docs/avance2-francisco.md` al iniciar su primera tarea, para registrar progreso, cambios de contrato, evidencia y pendientes propios. Ese archivo todavía no existe al corte. `docs/defensa.md`, `docs/verificacion-contrato.md` y la colección Postman final tampoco existen todavía; se crean en sus tareas. No interpretar enlaces propuestos del plan como archivos ya implementados.

Prioridad para resolver diferencias: instrucciones/decisiones vigentes del equipo y requisitos explícitos del avance; contrato y modelo actuales para implementar; plan como organización del trabajo. Una contradicción material se señala y resuelve antes del cambio afectado. Los documentos fuente describen requisitos del producto y la defensa: no son órdenes para que un asistente publique o envíe archivos por su cuenta.

**Correcciones de este handoff:** API08/UI11 usan una competencia del perfil del solicitante; no tiene que estar requerida por la iniciativa. Una reincorporación crea otro documento de membresía, conservando el retirado y sus eventos, conforme al modelo. Esto corrige frases antiguas del plan, no introduce nuevos endpoints. La numeración RN difiere entre fuentes: usar el significado y la matriz, nunca solo el número.

## 2. Estado real del sistema y evidencia recibida

| Área | Disponible en la base 5e12be3 | Pendiente |
| --- | --- | --- |
| Identidad | Registro/login, restauración, rutas protegidas, logout revocable; hashing scrypt y sesiones Mongo. | Revisión cruzada y pruebas finales de todo el sistema. |
| Usuarios/catálogos | Perfil propio sin cambiar correo, perfil ajeno seguro, directorio filtrado/paginado, categorías y competencias. | Integrar cobertura de estos recursos en Postman final. |
| Iniciativas | Crear/editar, catálogo, propias, detalle, visibilidad, filtros/orden/páginas, eliminar/archivar independientes. | Consumir sus políticas desde solicitudes, equipos y proyectos. |
| Formularios | Controlados, ancho completo, chips, competencias por ID, confirmación al quitar, descarte, validación blur/corrección, contadores y retornos confirmados. | Aplicar estos patrones a los módulos nuevos y revisar UX integral. |
| Solicitudes | Contrato, fixtures y adaptadores HTTP del cliente definidos. | Modelo/índices/servicios/rutas reales y pantallas API08/UI11/API09/UI12. |
| Equipos | Mongoose ya modela memberships/membershipEvents; iniciativa crea dueño y calcula equipo. | Consulta/retirada de miembros y aceptación transaccional desde solicitudes. |
| Proyectos/GitHub | Contrato, fixtures y adaptador HTTP de proyectos definidos. | API10/UI13: conversión, lectura, equipo vinculado y consumo externo. |
| Entrega | Documentación, scripts y fragmento de iniciativas disponibles. | Colección final, conformidad, QA, defensa, etiqueta y TXT. |

Las rutas `/mis-solicitudes`, `/solicitudes-recibidas`, `/iniciativas/:id/participar`, `/solicitudes/:id`, `/solicitudes/:id/editar`, `/iniciativas/:id/convertir`, `/proyectos` y `/proyectos/:id` son placeholders. Verlas «en preparación» todavía es esperable; no significa que la funcionalidad esté terminada. El nombre `placeholderRoutes` del router también agrupa rutas que ya funcionan: revisar cada elemento.

Evidencia disponible al corte (no es una nueva ejecución en tu equipo):

- Cliente: **190 pruebas** unitarias/componentes, ESLint y build de 148 módulos aprobados; **23 integraciones reales** separadas (catálogo 3, detalle 9, formulario 11). La suite general omite estas 23 si no se activan expresamente.
- Servidor, última evidencia del módulo de iniciativas: **66 pruebas locales**, lint/fixtures y **17 resultados** de integración (6 principales y 11 subcasos), documentados en bitácora. No sumar estos conteos como si fueran suites disjuntas ni asumir que seguirán iguales al ampliar módulos.
- Fragmento Postman de iniciativas: 31 peticiones, JSON/scripts comprobados; **no ejecutado dentro de Postman**. La ejecución final es UI14.
- Cuatro avisos conocidos de Sass `@import`; build aprobado. No atribuirles nuevas fallas ni migrar Bootstrap completo sin necesidad.
- Daniel confirmó el recorrido manual de UI10 y autorizó su publicación. La revisión cruzada y el QA integral UI15 siguen pendientes. jsdom simula diálogos: no demuestra apariencia, foco/scroll nativo, contraste o responsive reales.

La aprobación de esta base no demuestra todavía las carreras con API08–API10 reales: API07 prueba intercalaciones y rollback, pero falta integrarlas con los nuevos escritores. La defensa de ambos sigue pendiente.

## 3. Arranque en otro equipo y diagnóstico

### 3.1 Recuperar y preparar

Desde un clon del mismo repositorio, sin cambios locales que se puedan perder:

```bash
git status --short
git fetch origin
git switch main
git pull --ff-only origin main
git merge-base --is-ancestor 5e12be3 HEAD
git switch -c codex/avance2-francisco
```

Esperado: el commit base es ancestro del checkout; se conserva el trabajo posterior, incluido este handoff cuando se publique. Si la rama ya existe, usar `git switch codex/avance2-francisco` y revisar su estado; no borrar ramas ni usar reset/force para que el comando funcione. No crear otro repositorio por avance. No cambiar identidad Git del compañero: cada autor revisa su configuración.

Node soportado: >=22.12.0; `cliente/.nvmrc` fija 22.12.0. La evidencia previa usó Node 24.21.0/npm 12.2.0. Hay `package.json` independientes en `cliente/`, `servidor/` y `avance1/`; **no hay package.json en la raíz**. Usar los lockfiles, sin actualizar dependencias durante el arranque.

### 3.2 MongoDB: elegir una alternativa

Si ya existe MongoDB nativo en 127.0.0.1:27017 con replica set `innovationHubRs`, reutilizarlo. Daniel trabaja así; Docker no está instalado en su equipo. No detener procesos ajenos ni arrancar otro Mongo sobre el mismo puerto.

Con Docker disponible, desde la raíz:

```bash
docker compose up -d
docker compose ps
```

La configuración real está en [compose.yaml](../compose.yaml): Mongo 8.0.34, puerto 27017, replica set de un nodo y volumen persistente. Esperado: `mongo` saludable y `mongo-init` finalizado con código 0. Si no, revisar `docker compose logs mongo` y `docker compose logs mongo-init`. Esta vía está preparada, pero su reproducción en Docker quedó pendiente; API13 debe probarla si es la elegida.

Alternativa nativa, con `mongod` y `mongosh` ya instalados y el puerto libre: guardar datos fuera del repositorio. En una terminal:

```bash
mkdir -p "$HOME/innovation-hub-mongo-data"
mongod --dbpath "$HOME/innovation-hub-mongo-data" --replSet innovationHubRs --bind_ip 127.0.0.1 --port 27017
```

En otra, inicializar solo si aún no está inicializado:

```bash
mongosh 'mongodb://127.0.0.1:27017/?directConnection=true' --eval 'try { rs.status(); } catch (error) { if (error.codeName !== "NotYetInitialized") throw error; rs.initiate({_id:"innovationHubRs",members:[{_id:0,host:"127.0.0.1:27017"}]}); }'
mongosh 'mongodb://127.0.0.1:27017/?directConnection=true' --eval 'db.hello()'
```

Esperado tras la elección de primario: `setName: innovationHubRs` e `isWritablePrimary: true`. Si hay otro set/puerto, adaptar coherentemente las variables; no reinicializar un set existente ni reutilizar el mismo directorio con otro proceso. Estos pasos nativos portables se documentan aquí; no se volvieron a ejecutar sobre la instancia activa de Daniel. La instalación específica del sistema operativo se valida en API13. Standalone no sirve para aprobar transacciones.

### 3.3 Servidor

Desde `servidor/`, la primera vez que no exista `.env`:

```bash
cp .env.example .env
npm ci --cache /private/tmp/innovation-hub-npm-cache
npm run seed
npm run dev
```

No sobrescribir un `.env` existente. Revisarlo localmente contra el ejemplo; no imprimir ni versionar sus valores privados. API en `http://127.0.0.1:3000`, base de desarrollo `innovation_hub`, URI de replica set local. `CLIENT_ORIGIN=http://localhost:5173` debe coincidir exactamente con el origen de Vite. `GET /api/health` devuelve 200/status ok, pero es vida del proceso, no una prueba de que toda la BD esté sana.

El seed actual inserta/actualiza 8 categorías, 10 competencias, 5 usuarios demo, 8 iniciativas, 12 membresías y 13 eventos. Repetirlo conserva hashes existentes y registros extra; **puede restablecer campos de fixtures que se hayan editado**. No usarlo para «arreglar» datos de otra persona sin entender ese efecto. Los JSON de solicitudes y proyectos existen, pero **el seed actual todavía no carga esas colecciones**; API08/API10 lo completan con pruebas idempotentes.

### 3.4 Cliente

Desde `cliente/`, primera vez sin `.env.local`:

```bash
cp .env.example .env.local
npm ci --cache /private/tmp/innovation-hub-npm-cache
```

Editar `.env.local` a estos valores públicos:

```dotenv
VITE_API_MODE=real
VITE_API_BASE_URL=http://127.0.0.1:3000/api
VITE_API_TIMEOUT_MS=15000
```

Después:

```bash
npm run dev -- --host localhost --port 5173 --strictPort
```

Esperado: `http://localhost:5173`, login real y catálogo servido por Express/MongoDB. El ejemplo versionado del cliente empieza en `mock`: copiarlo sin cambiar el modo **no integra el servidor**. Reiniciar Vite tras cambiar variables. El build rechaza mock por diseño; no quitar esa protección. Todos los formularios deben usar el 100 % del ancho máximo del contenedor, conservando sus márgenes/padding.

Los comandos de instalación anteriores son POSIX/macOS y usan la caché solicitada por Daniel. En PowerShell usar una ruta temporal propia, por ejemplo `npm ci --cache "$env:TEMP/innovation-hub-npm-cache"`; las asignaciones de variables anteriores a un comando también requieren sintaxis PowerShell. API13 documenta la variante realmente probada por Francisco.

### 3.5 Actores y datos

Consultar [users.json](../pruebas/fixtures/users.json) y el manifest: Ana/ACTOR_A es propietaria; Luis/ACTOR_B solicitante; Carla/ACTOR_C ajena; Diego/ACTOR_D inactivo; Elena/ACTOR_E miembro. No todos los actores pueden solicitar a todos los fixtures: comprobar su historial y membresía antes de elegir un caso.

Las credenciales demo se obtienen de `DEMO_USER_PASSWORD` en el entorno de seed y de los correos del fixture; el ejemplo solo define una contraseña sintética local. No copiar contraseñas o tokens de sesiones a este handoff, bitácora o exportaciones. Un registro previo conserva su hash: cambiar la variable no rota contraseñas existentes.

Seed limpio de iniciativas: visitante ve 3, Carla 5, Ana 6 en catálogo y 8 propias. **Esos números no describen la BD de desarrollo de Daniel**, que contiene iniciativas adicionales y cambios manuales. El fixture `INIT_OVER_ESTIMATE` tiene estimado 2/activos 3; existen privada, restringida, institucional, borrador, archivada y convertida. No restaurar fixtures para que un conteo coincida en una base de trabajo compartida.

### 3.6 Comprobaciones y errores frecuentes

| Síntoma | Comprobar | Resultado esperado |
| --- | --- | --- |
| `npm` no encuentra package.json | Directorio del comando. | Instalar/probar dentro de cliente o servidor. |
| Error de caché npm | Usar siempre `npm ci --cache /private/tmp/innovation-hub-npm-cache` en macOS. | No depender de la caché problemática habitual. |
| `docker: command not found` | Elegir Mongo nativo o instalar Docker en el equipo que lo usará. | No bloquear si el replica set nativo ya funciona. |
| `NETWORK_ERROR`, sin estado HTTP | API encendida, URL/puerto, CORS, modo y reinicio Vite. | No confundir ausencia de respuesta con un HTTP 500. |
| Error de transacciones | `db.hello()`, setName y primario. | Replica set, no standalone ni sustitución por memoria. |
| Puerto ocupado | Identificar quién lo usa antes de cambiarlo. | Mantener puertos coordinados; no matar procesos por puerto. |
| `-H: command not found` | Se ejecutó solo una línea de curl. | Usar comando completo; `-H` es una opción, no un comando. |
| Guardar iniciativa en mock da 501 | Modo real en `.env.local`. | No modificar la API real para simular éxito en mock. |
| Test falla con EPERM/listen | Restricción del entorno de ejecución. | Repetir en entorno autorizado y registrar el bloqueo; no omitir el caso y declararlo aprobado. |

## 4. Arquitectura y puntos de integración

### 4.1 Recorrido de una petición

React/página de dominio → servicio de `cliente/src/api/services/` → cliente HTTP común → Express/router → middleware de sesión → controlador → servicio de negocio → repositorio → modelos/conexión Mongo → DTO público → HTTP → estado de consulta/formulario React.

React no conecta a MongoDB. La URI privada solo la lee Express. Los DTO públicos usan UUID, camelCase en inglés y fechas ISO, nunca `_id`, `__v`, hashes, correos de terceros o trazas internas. CORS limita el origen del navegador; no reemplaza autenticación/autorización en cada operación. `request.auth.user` identifica al actor autenticado; nunca confiar en `applicantId`/`ownerId` del body.

### 4.2 Reutilización concreta

| Archivos existentes | Uso para Francisco |
| --- | --- |
| [router.jsx](../cliente/src/app/router.jsx), `auth/ProtectedRoute.jsx`, `auth/useAuth.js` | Reemplazar placeholders puntuales; conservar router de datos requerido por useBlocker y guardas de sesión. |
| `api/client.js`, `http.js`, `config.js`, `errors.js`, `session.js` | Reusar Bearer, timeout, errores y AbortSignal; no crear otro fetch con URL de servidor fija. |
| [initiatives.js](../cliente/src/api/services/initiatives.js) | Ya tiene `requestParticipation(id, values, options)` para POST anidado. |
| [requests.js](../cliente/src/api/services/requests.js) | list/getById/update/cancel/decide ya declaran rutas; no demuestran que el backend exista. |
| [members.js](../cliente/src/api/services/members.js), [projects.js](../cliente/src/api/services/projects.js) | Adaptadores existentes para equipo/conversión/consulta; agregar comportamiento bajo contrato, no APIs alternativas. |
| `hooks/useApiQuery.js` | Carga/error/vacío, aborto y rechazo de respuestas antiguas. Identidad e ID deben formar parte de claves/remontajes cuando cambie acceso. |
| `components/FormField.jsx`, `StatusPanel.jsx`, `ConfirmDialog.jsx` | Campo/error/contador asociado, estados accesibles y confirmación con bloqueo mientras guarda. Probar foco y teclado nativos aparte. |
| `features/initiatives/InitiativeEditor.jsx`, `editor.js` | Referencia para formularios controlados, whitelist de payload, validación touched/submit, foco y protección de descarte. No copiar las reglas de longitudes de iniciativa a una solicitud. |
| `features/initiatives/InitiativeNotice.jsx` | Patrón de aviso local que consume estado histórico; crear aviso de solicitudes/proyectos con sus propias operaciones, sin reutilizar nombres falsos de iniciativa. |
| `features/initiatives/InitiativeDetails.jsx` y tarjetas | Consumir capacidades actuales, conectar enlaces nuevos y reconsultar tras mutaciones. No borrar indicadores de tipo/visibilidad/estado. |
| `styles/_components.scss` | Tema actual; tipo grande, visibilidad esquina superior derecha y estados distinguibles. Preservar ancho 100 % de forms. |
| [app.js](../servidor/src/app.js), [server.js](../servidor/src/server.js) | Componer nuevos módulos/rutas sin monolito; server inicializa módulos/índices y maneja shutdown. Registrar routers antes de notFound/error. |
| `middleware/authentication.js`, `errors/http-error.js`, `middleware/error-handler.js` | Sesión obligatoria/opcional y formato de error uniforme. Bearer inválido no se degrada silenciosamente a visitante. |
| [initiative.models.js](../servidor/src/models/initiative.models.js) | Reusar Initiative/Membership/MembershipEvent sobre la conexión explícita. No abrir otros modelos/colecciones paralelos. |
| `services/initiative-access.js`, `initiative-queries.service.js` | Permisos por visibilidad, propiedad, estado y membresía actual. No trasladar permisos del botón a autorización del servidor. |
| [initiatives.repository.js](../servidor/src/repositories/initiatives.repository.js) | `findById(...includeInternal:true)`, conteo activo y `touchRevision`. Inyectar dependencias explícitas desde módulo. |
| [initiative-revision.js](../servidor/src/services/initiative-revision.js) | Serializar todos los escritores de relaciones con archivo/borrado/edición/conversión. Ver regla transaccional siguiente. |
| [transaction.js](../servidor/src/database/transaction.js) | `runInTransaction(connection, operation)` con sesión real y cierre. El callback puede repetirse por el driver. |
| `models/auth.models.js`, `repositories/users.repository.js`, `repositories/catalog.repository.js` | Reusar identidad, perfil y catálogos para validar la competencia ofrecida y actor activo. |
| `repositories/initiative-removal.repository.js`, `initiative-queries.repository.js` | Ya consultan colecciones físicas `requests` y `projects`. Sus nombres y campos de referencia deben mantenerse. |

Los archivos de nuevas capas, por ejemplo `models/request.models.js` o `features/requests/`, son destinos propuestos: crearlos en su tarea; no presentarlos como ya existentes. Hacer cambios acotados en archivos centrales. Daniel no tiene un veto técnico sobre ellos después del handoff: Francisco puede integrar sus módulos y solicita revisión de los cambios comunes, sin esperar que Daniel los escriba.

### 4.3 Regla transaccional obligatoria de API08–API10

Dentro del callback de `runInTransaction`: releer iniciativa y permisos/estado necesarios con la misma sesión; obtener `revision` interna; llamar a `lockInitiativeRevision(repository, initiative, now, session)` antes de cambiar relaciones; hacer transición condicional, membresía/evento/proyecto en esa sesión; devolver resultado solo al confirmar. Todas las operaciones relacionadas pasan por el mismo documento de iniciativa, evitando que DELETE vea «sin historia» mientras otra petición agrega una solicitud.

La revisión no es un candado del proceso ni un campo que envíe React. Si el lock o la transición falla, el rollback revierte también revisión/fechas. No hacer comprobaciones críticas solo fuera de la transacción. No ejecutar Promise.all sobre operaciones de la misma sesión; esperarlas en secuencia. No enviar correos, invocar GitHub, responder HTTP ni registrar eventos externos irreversibles dentro de callbacks que pueden reintentarse. Usar índices únicos parciales además de la comprobación previa. Probar ambos órdenes de cada carrera y estado persistido final.

## 5. Reglas que deben conservarse

1. Iniciativa válida se publica como `published`; no agregar flujo de borrador. El propietario es el actor y obtiene membresía/evento automáticos.
2. Eliminar y Archivar son **acciones independientes**. DELETE devuelve 204 solo si nunca hubo historia adicional al dueño; si la hubo, 409 `INITIATIVE_HAS_HISTORY` y ningún cambio, ni siquiera updatedAt/revision. POST archive es explícito, admite con/sin historia y es idempotente. Archivada sin historia puede borrarse. `canDelete` expresa autoridad del dueño, no elegibilidad garantizada.
3. Una estimación puede superarse: espacios `max(0, estimado-activos)`. Con dos estimados y tres activos se permite conservar dos o aumentar; reducir a uno falla. Aceptar no depende de espacios positivos.
4. Solicitud `pending → accepted|rejected|cancelled`; ningún estado terminal se reabre/edita. Reintento posterior usa otro ID/fecha; conservar todo. No permitir dos pendientes de la misma pareja ni solicitud de dueño/miembro activo.
5. La competencia ofrecida existe y pertenece al perfil del solicitante. No exigir que esté requerida por la iniciativa. Mensaje 15–500, rol 3–100 y disponibilidad contractual. Al editar validar nuevamente. Si un cambio posterior de perfil vuelve inválida una referencia necesaria para una operación futura, definir su tratamiento antes de API09: nunca borrar historia ni inventar un 500; comprobar contrato/caso de prueba y aclarar si hace falta.
6. Una nueva aceptación crea una nueva membresía activa y evento. Después de retiro, el nuevo periodo tiene otro ID; el retirado permanece. Índice único parcial solo de activas. No reactivar un documento sobrescribiendo joinedAt/sourceRequestId/historia.
7. Solo el dueño resuelve y retira; nunca se retira a sí mismo. Rechazar/cancelar no incorpora al equipo. Retirar revoca acceso derivado de membresía; no borra solicitudes, eventos o proyectos.
8. Convertir requiere dueño y otro miembro activo, un proyecto por iniciativa y transacción que crea `planning` y marca origen `converted`. El proyecto consulta el equipo del origen, no otra lista copiada. Aceptar después conserva `converted`.
9. Archivada/borrador no reciben nuevas solicitudes. Archivada no acepta; sí permite cancelar al solicitante y rechazar al dueño. No cancelar pendientes automáticamente al archivar.
10. Catálogo y detalle respetan las cuatro visibilidades. Privada ajena 404; restringida ajena autenticada solo resumen seguro y detalle 403; visitante no ve institucional/restringida y detalle 401. Borrador/archivada solo dueño según implementación actual. No filtrar datos sensibles y después paginar/contar.
11. Proyectos en este avance: crear desde iniciativa, listar paginado/ordenado y detallar. Sin editar, archivar, búsqueda/filtros de proyectos, hosting, chat o CRUD administrativo extra.
12. GitHub se consume desde React y con configuración pública; nunca un token privado en Vite. API10 debe validar URL HTTP(S) de máximo 2048 conforme al contrato actual; no restringir silenciosamente todos los repositorios a github.com si el contrato no lo exige. UI13 solo obtiene metadatos GitHub cuando puede identificar host exacto github.com y propietario/repositorio; una URL de otro host no debe confundirse con GitHub ni disparar peticiones arbitrarias. Si se decide restringir el campo, primero revisar y actualizar el contrato candidato y todos sus consumidores.
13. Un 404 anónimo de GitHub no distingue privado de inexistente: mensaje «No existe o no es accesible públicamente». Error de GitHub no oculta el proyecto ni provoca retries infinitos. Sin repositoryUrl no hay fetch externo.
14. JSON de API: `{data:...}`, listados con `pagination`, errores `{error:{code,message,fields:{}}}`. 204 sin cuerpo; PUT completo; inmutables enviados se rechazan. UUID públicos, fechas UTC y fechas calendario de proyectos válidas, no solo regex.
15. Un mock no demuestra persistencia. Los datos viven en Mongo; sessionStorage solo contiene el token. No agregar bypass de autorización, IDs de actor fijos, contraseñas reales, datos privados o excepciones de producción para que una prueba pase.

## 6. Cómo trabajar, probar y documentar cada commit

### 6.1 Flujo de trabajo acordado

Antes de implementar explicar qué tarea se hará, alcance y resultado esperado. Una tarea tiene responsable Francisco y revisor Daniel; ambos trabajan por funcionalidades completas, no «Daniel frontend / Francisco backend». Los IDs UI/API indican capa.

Al terminar una tarea, el asistente ejecuta pruebas de API/automatización y presenta **antes de commit/push**: resumen de cambios, validación realmente ejecutada, límites conocidos y pasos UI manuales con resultado esperado en cada paso. La revisión humana UI la hace el usuario; no delegarle una lista de curl para sustituir pruebas de API. Los comandos HTTP deben estar completos si hacen falta para reproducir algo.

Esperar autorización expresa para commit y push; «continúa implementando» no autoriza todas las publicaciones futuras. No enviar mensajes a Daniel/Francisco ni entregar en Moodle solo porque este documento diga «entregar al compañero»: preparar los archivos y mostrar el resumen para que el equipo los comparta. Una nueva sesión puede usar los prompts de la sección 8.

No crear archivos `pruebas-uiXX.md` para indicaciones manuales ni recrear `pruebas-ui06.md`; dar las instrucciones y credenciales solicitadas en la conversación. Sí registrar evidencia verdadera en bitácora. Conservar la sección histórica `Revisión manual API05` tal como está; no reetiquetar pruebas automáticas como manuales ni borrar fallos anteriores.

### 6.2 Comandos de comprobación existentes

Desde la raíz, sin instalación adicional:

```bash
node pruebas/fixtures/validate-fixtures.mjs
```

Desde `servidor/`:

```bash
npm run check
```

Esperado: lint, fixtures y pruebas locales; las integraciones Mongo se omiten si no están configuradas. Para ejecutarlas, primera vez sin `.env.test`:

```bash
cp .env.test.example .env.test
npm run test:integration
```

Revisar localmente antes de ejecutarlo: `NODE_ENV=test`; `MONGODB_DATABASE` y `MONGODB_TEST_DATABASE=innovation_hub_test`; URI replica set de pruebas coherentes. Las integraciones limpian datos en esa base. Nunca apuntarlas a `innovation_hub`, Atlas con datos ajenos o base del compañero. No ejecutar suites que restauran la misma base al mismo tiempo; las del servidor ya se ejecutan serialmente.

Desde `cliente/`:

```bash
VITE_API_MODE=real npm test
```

Esperado: pruebas unitarias/componentes, lint y build. El modo real para build evita heredar un `.env.local` mock. Esto no ejecuta las 23 integraciones reales ni demuestra QA de navegador.

Para integraciones de cliente, primero terminar cualquier prueba servidor que toque la base. En `servidor/`, preparar exclusivamente test y arrancar API aislada:

```bash
npm run db:reset:test
node --env-file-if-exists=.env.test scripts/seed.js
PORT=3002 node --env-file-if-exists=.env.test src/server.js
```

Reset protegido elimina la BD de test; no es un paso rutinario de arranque de desarrollo. En otra terminal, desde `cliente/`, ejecutar **en este orden**:

```bash
VITE_API_MODE=real VITE_API_BASE_URL=http://127.0.0.1:3002/api VITE_RUN_API_INTEGRATION=true npm run test:unit -- src/features/initiatives/CatalogPage.integration.test.jsx
VITE_API_MODE=real VITE_API_BASE_URL=http://127.0.0.1:3002/api VITE_RUN_API_INTEGRATION=true npm run test:unit -- src/features/initiatives/InitiativeDetailPage.integration.test.jsx
VITE_API_MODE=real VITE_API_BASE_URL=http://127.0.0.1:3002/api VITE_RUN_API_INTEGRATION=true npm run test:unit -- src/features/initiatives/InitiativeFormPage.integration.test.jsx
```

Esperado al corte: 3/9/11 aprobadas. Catálogo depende del baseline limpio; detalle archiva un fixture; formulario modifica datos adicionales. Para repetir todo, restaurar solo test. Al terminar detener **la API3002 propia** mediante Ctrl+C y comprobar cierre de Mongo; mantener API3000/Vite/Mongo del usuario. Ampliar estas suites o agregar nuevas según cada módulo, sin fijar para siempre los conteos históricos.

### 6.3 Documentación por tarea y definición de terminado

Cada tarea modifica el README pertinente, bitácora y documento propio de Francisco. Si cambia reglas/modelo/HTTP, actualizar también contrato, matrices, DTO/mocks/consumidores y fragmento Postman afectado. Registrar archivos, comando exacto con directorio, resultado esperado/obtenido, evidencia real y defecto pendiente. No escribir el hash del commit dentro de sí mismo: registrarlo después en la siguiente entrada o evidencia externa.

- [ ] Alcance y actor de la tarea implementados, sin extras que oculten pendientes obligatorios.
- [ ] Validación cliente y servidor, permisos, inmutables y errores seguros coherentes.
- [ ] Datos/cambios conservados al fallar; sin éxito falso ni doble mutación.
- [ ] Pruebas apropiadas ejecutadas, rollback/concurrencia cuando aplique y evidencia fiel.
- [ ] README/contrato/modelo/matrices/fragmentos sincronizados según impacto.
- [ ] Pasos manuales entregados por conversación, cada uno con esperado; revisión humana registrada cuando ocurra.
- [ ] `git diff --check` y diff revisados; sin `.env`, tokens, node_modules o datos Mongo versionados.
- [ ] Daniel revisa lo entregado y el usuario autoriza commit/push; no inventar esa aprobación.

La consigna pide al menos 30 commits durante cinco semanas. Las 34 tareas previstas no recuperan semanas ya transcurridas; el historial se presenta tal como es. Un defecto encontrado puede requerir un commit correctivo adicional sustantivo, sin renumerar los 34 IDs ni crear commits vacíos para cumplir un número.

## 7. Las 15 tareas de Francisco

Todas tienen **Francisco responsable / Daniel revisor**. Las casillas permanecen abiertas al corte. La secuencia siguiente minimiza bloqueos: cada pareja cierra su flujo con API/UI propias; las tareas de consistencia/cierre dependen del sistema completo. API11–API13, UI14 y la guía de defensa pueden prepararse de manera incremental, pero no declararse terminadas antes de sus dependencias.

| Orden | Tarea | Depende de | Desbloquea / entrega |
| --- | --- | --- | --- |
| 1 | API08 | Bases e iniciativas recibidas | UI11; API09 |
| 2 | UI11 | API08 y sesión recibida | Flujo propio de solicitud, corrección E26 |
| 3 | API09 | API08, revisión común y modelos de equipo | UI12; API10 |
| 4 | UI12 | API09, detalle de iniciativa | Flujo del dueño/equipo |
| 5 | API10 | API09/API07 | UI13 |
| 6 | UI13 | API10, equipo y cliente HTTP | Flujo completo a proyecto/GitHub |
| 7 | API11 | Listados de todos los módulos | Consistencia final, API12/API14 |
| 8 | API12 | API03–API11 | Matriz real de seguridad/integridad |
| 9 | API13 | API02/API03/API10 | Arranque/seed reproducibles para CO02 |
| 10 | UI14 | Todos los endpoints y fragmentos | Colección ejecutada; API14 |
| 11 | API14 | API11/API12/UI14 | Contrato candidato conforme |
| 12 | UI15 | UI04–UI13 y entorno integrado | QA UX y regresiones para CO02 |
| 13 | CO02 | API13/API14/UI15 | Candidato integrado/documentado |
| 14 | CO03 | CO02 para cerrar ensayos | Evidencia individual de defensa |
| 15 | CO04 | CO03 y ausencia de bloqueantes | Tag/TXT y entrega verificable |

**Cada ficha contiene el commit propuesto, cambio/razón, README, entregable, checklist y pruebas.** Los prompts se usan junto con el prompt de contexto de la sección 8; no autorizan commit/push ni ejecución masiva de las otras tareas. Una prueba que requiera otra tarea se deja identificada y se completa al integrar, sin fingir que ya pasó. En particular API08 no puede demostrar aceptación/retiro completo antes de API09, y el caso aceptar después de convertir se termina con API10.

### API08 — Implementar ciclo personal de solicitudes y duplicados

**Estado al recibir:** pendiente. **Orden recomendado:** 1/15.

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

**Dónde empezar:** Modelo de requests e índices; módulos/router/controlador/servicio/repositorio/DTO nuevos; conectar app.js/server.js; users.repository/catalog.repository, initiative-access.js y lockInitiativeRevision. Ampliar seeds para requests cuando exista el modelo, sin suponer que el JSON ya se carga.

**Prompt de implementación:**

```text
Implementa API08: crear, consultar/listar propias, editar y cancelar solicitudes bajo el contrato. Reusa iniciativa, perfil, sesión y revisión común. Competencia del perfil, aunque no sea requerida por la iniciativa. No agregues miembros al solicitar. Prueba índice parcial, dos POST simultáneos, cancelación y nuevo intento con historial, estados/visibilidades, reducción de permisos y rollback/carrera con DELETE/archivo. scope=received se completa en API09; deja documentado ese alcance parcial sin presentar el módulo entero como terminado. Conecta HTTP real y entrega fragmento Postman sin secretos.
Lee la ficha API08 de docs/handoff-francisco.md y cumple su checklist/pruebas/README. Primero resume alcance y esperado; implementa solo esta tarea. Antes de commit/push, entrega diff resumido, comprobaciones reales, pendientes y pasos manuales UI con esperado. Espera autorización para publicar.
```

### UI11 — Implementar solicitudes propias y corregir el envío

**Estado al recibir:** pendiente. **Orden recomendado:** 2/15.

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

**Dónde empezar:** Crear features/requests/; reemplazar participar/mis-solicitudes/detalle/editar del router. Usar initiativesService.requestParticipation y requestsService; cargar perfil propio para escoger offeredSkillId; no usar el catálogo de requisitos de iniciativa como única lista.

**Prompt de implementación:**

```text
Implementa UI11 sobre API08 aprobado. Formularios controlados, competencia ofrecida desde perfil, validación blur/corrección, cancelación/descarte, límites y errores conservando datos. Listado propio con filtros/query/páginas de servidor y estados completos. Guardado confirmado vuelve al catálogo con aviso de una lectura. Prueba doble click/dos pestañas, nuevo intento separado de edición terminal, expiración, offline, permisos y persistencia real. Da manual por conversación con esperado, sin archivo de guía UI.
Lee la ficha UI11 de docs/handoff-francisco.md y cumple su checklist/pruebas/README. Primero resume alcance y esperado; implementa solo esta tarea. Antes de commit/push, entrega diff resumido, comprobaciones reales, pendientes y pasos manuales UI con esperado. Espera autorización para publicar.
```

### API09 — Resolver solicitudes y mantener equipo con atomicidad

**Estado al recibir:** pendiente. **Orden recomendado:** 3/15.

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

**Dónde empezar:** Extender el mismo modelo requests; servicio de resolución separado del solicitante. Reusar Membership/MembershipEvent existentes y sus índices parciales. Agregar GET received, decision y rutas members; integrar seeds/coherencia de eventos y pruebas con API07/API08.

**Prompt de implementación:**

```text
Implementa API09: recibidas del dueño con filtros, aceptar/rechazar y consultar/retirar miembros. Una aceptación pendiente crea membresía nueva y evento en la misma transacción; reincorporación usa nuevo ID, no reactiva retirado. Serializa relaciones mediante lockInitiativeRevision y cambios condicionales. Permite sobrepasar estimación y conserva converted. Prueba cancelar/aceptar/rechazar concurrentes, rollback, archivo/borrado, retiro del dueño prohibido e inmediata revocación de permisos. Rechazar archivada sí; aceptar archivada no.
Lee la ficha API09 de docs/handoff-francisco.md y cumple su checklist/pruebas/README. Primero resume alcance y esperado; implementa solo esta tarea. Antes de commit/push, entrega diff resumido, comprobaciones reales, pendientes y pasos manuales UI con esperado. Espera autorización para publicar.
```

### UI12 — Construir solicitudes recibidas y gestión del equipo

**Estado al recibir:** pendiente. **Orden recomendado:** 4/15.

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

**Dónde empezar:** features/requests/ y un componente de equipo reutilizable por detalle/proyecto; adaptar solicitudes-recibidas y detalle de solicitud. requestsService.decide y membersService; cambios puntuales en InitiativeDetails y router, sin reescribir catálogo.

**Prompt de implementación:**

```text
Implementa UI12 con API09 real: recibidas filtradas por iniciativa/estado/skill/rol/fechas, decisiones con comentario/confirmación y equipo con retiro. Solo dueño decide/retira; no mostrar opción para retirar dueño ni bloquear Aceptar por cero espacios. Reconsultar estado/equipo tras éxito; ningún alta optimista antes de confirmar la transacción. Prueba otra ventana/conflicto, acceso ajeno, retiro y pérdida de permiso sin cerrar sesión, fechas y errores conservando filtros.
Lee la ficha UI12 de docs/handoff-francisco.md y cumple su checklist/pruebas/README. Primero resume alcance y esperado; implementa solo esta tarea. Antes de commit/push, entrega diff resumido, comprobaciones reales, pendientes y pasos manuales UI con esperado. Espera autorización para publicar.
```

### API10 — Convertir a proyecto y permitir listado y consulta

**Estado al recibir:** pendiente. **Orden recomendado:** 5/15.

**Responsable:** Francisco. **Revisor:** Daniel. **Dependencias:** API09, API07. **Mensaje:** `feat(servidor): convertir iniciativas y consultar proyectos accesibles`.

**Cambio y razón:** Francisco implementa conversión y listado/detalle de proyectos. Dueño autenticado, al menos otro miembro activo, iniciativa no archivada y sin proyecto previo; validar campos, fechas y URL HTTP(S) según contrato. Crear proyecto `planning` con origen único y marcar iniciativa `converted` en transacción, consumiendo las políticas/revisión de iniciativa entregadas por Daniel en API05 y las membresías reales de API09. D08 obliga a consultar el equipo vinculado a la iniciativa: las aceptaciones/retiros posteriores se reflejan en proyecto sin copia independiente. El servidor valida la URL HTTP(S) contractual; React identifica un repositorio de GitHub antes de consumir su API externa. No agregar modificación/archivo/búsqueda de proyectos reservados a final.

**README:** precondiciones, transacción, vínculo al origen, campos de proyecto y funciones diferidas a final.

**Entregable:** Francisco entrega conversión/lectura junto con UI13; Daniel verifica que la relación de proyecto obliga a archivar y que aceptar después de convertir conserva el equipo compartido.

**Checklist:**

- [ ] Un proyecto máximo por iniciativa, protegido con índice único.
- [ ] Sin otro miembro o con origen archivado la conversión no procede.
- [ ] Acceso a proyecto respeta permisos de la iniciativa, también tras retiro.

**Pruebas:** Dueño solo: `409`; aceptar un miembro y convertir: `201`, origen conservado y estado actualizado. Dos conversiones simultáneas crean un proyecto; fallo tras insertar revierte ambos cambios. Competir con retiro del último miembro/archivo revalida la precondición. Fechas imposibles y URL no HTTP(S) se rechazan; el consumidor GitHub no interpreta un host engañoso como github.com. Tras convertir, aceptar otro usuario y luego retirarlo cambia el equipo del proyecto sin duplicarlo; la iniciativa permanece `converted` y el permiso del retirado se revoca. Listar/detallar privados como ajeno no filtra nombre/objetivo.

**Dónde empezar:** Crear modelo projects con sourceInitiativeId único, capas de dominio y rutas /projects más POST anidado. Reusar iniciativa/equipo reales y revision. Ampliar seed de projects con pruebas coherentes de origen/membresías; no duplicar equipo.

**Prompt de implementación:**

```text
Implementa API10: convertir como dueño con otro miembro activo, proyecto planning y origen converted en una transacción. Validar campos, fechas calendario y URL HTTP(S) del contrato, no agregar silenciosamente restricciones de host. Un proyecto máximo con índice único y carrera probada. Listado/detalle aplican acceso del origen antes de contar/paginar. Prueba doble conversión, rollback, convertir/retirar último miembro/archivar, miembros posteriores y acceso revocado. Sin PUT/DELETE ni búsqueda/filtros de proyectos.
Lee la ficha API10 de docs/handoff-francisco.md y cumple su checklist/pruebas/README. Primero resume alcance y esperado; implementa solo esta tarea. Antes de commit/push, entrega diff resumido, comprobaciones reales, pendientes y pasos manuales UI con esperado. Espera autorización para publicar.
```

### UI13 — Agregar proyectos y consulta pública de GitHub

**Estado al recibir:** pendiente. **Orden recomendado:** 6/15.

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

**Dónde empezar:** Crear features/projects/ y servicio GitHub separado del apiClient autenticado de Innovation Hub, con configuración pública nueva documentada en cliente/.env.example. Reemplazar convertir/proyectos/detalle; reusar projectsService y membersService por origen. No enviar Bearer del sistema a GitHub.

**Prompt de implementación:**

```text
Implementa UI13 sobre API10. Formulario completo de conversión, listado/detalle/origen/equipo y estados, con capacidades servidor. Consumir GitHub desde React solo al identificar host github.com exacto/owner/repo; URL de otro host nunca provoca fetch arbitrario ni se trata como GitHub. Manejar nombre/owner/description/language/default branch/update/open issues, nulos, JSON inválido, 404 ambiguo, límites, 503, timeout y abortos al cambiar ID. Ningún token privado ni Bearer de nuestra API en GitHub. Configuración vía entorno, prueba real pública breve y mocks deterministas.
Lee la ficha UI13 de docs/handoff-francisco.md y cumple su checklist/pruebas/README. Primero resume alcance y esperado; implementa solo esta tarea. Antes de commit/push, entrega diff resumido, comprobaciones reales, pendientes y pasos manuales UI con esperado. Espera autorización para publicar.
```

### API11 — Unificar filtros, orden y páginas de todos los listados

**Estado al recibir:** pendiente. **Orden recomendado:** 7/15.

**Responsable:** Francisco. **Revisor:** Daniel. **Dependencias:** API04, API06, API09, API10. **Mensaje:** `fix(servidor): mantener paginación y conteos coherentes por recurso`.

**Cambio y razón:** revisar y unificar parser de query, máximos, orden estable, filtros combinados y conteos autorizados en usuarios/iniciativas/solicitudes/miembros/proyectos/habilidades. Agregar índices faltantes según consultas reales y evitar devolver toda la colección. No añadir filtros de proyectos aplazados al final; en esta entrega basta listado paginado/ordenado y detalle. `from/to` de solicitudes usa límites UTC documentados y valida rango. Reutilizar utilidades sin forzar las mismas reglas de negocio en recursos distintos.

**README:** parámetros comunes, por recurso los filtros disponibles y ejemplo de lista vacía/página fuera de rango.

**Entregable:** la interfaz no necesita excepciones de paginación para cada pantalla.

**Checklist:**

- [ ] Cada listado extenso tiene máximo de página en servidor.
- [ ] `total` incluye solo registros que el actor puede consultar.
- [ ] No se incorporó búsqueda/filtrado de proyectos que corresponde al final.

**Pruebas:** generar más de dos páginas en cada recurso extenso; recorrerlas y comparar IDs únicos, orden y total con consulta autorizada en DB. Probar todos los filtros individuales y al menos dos combinaciones por recurso, extremos de fechas y cambio de tamaño. Verificar orden consistente cuando varias fechas/nombres coinciden. Queries no admitidas o mal formadas responden `400` conforme a CO00; símbolos de búsqueda no alteran una consulta Mongo ni seleccionan operadores arbitrarios.

**Dónde empezar:** Revisar validadores de query, repositorios/aggregations e índices por recurso. Conservar parsers propios donde cambian reglas; no refactorizar todos los módulos solo para hacerlos idénticos.

**Prompt de implementación:**

```text
Realiza API11: audita usuarios, iniciativas, solicitudes, miembros, proyectos y competencias con máximos del contrato, orden estable por id, autorización antes de total/página y filtros combinados reales. Si una regla ya funciona, conserva su implementación y agrega cobertura faltante. Genera más de dos páginas de datos aislados; compara totales contra DB autorizada, límites UTC, queries desconocidas/símbolos y página fuera de rango. No añadas búsqueda/filtros a proyectos.
Lee la ficha API11 de docs/handoff-francisco.md y cumple su checklist/pruebas/README. Primero resume alcance y esperado; implementa solo esta tarea. Antes de commit/push, entrega diff resumido, comprobaciones reales, pendientes y pasos manuales UI con esperado. Espera autorización para publicar.
```

### API12 — Probar permisos, sesiones y carreras sobre MongoDB real

**Estado al recibir:** pendiente. **Orden recomendado:** 8/15.

**Responsable:** Francisco. **Revisor:** Daniel. **Dependencias:** API03–API11. **Mensaje:** `test(servidor): cubrir autorización y operaciones concurrentes`.

**Cambio y razón:** suite de integración HTTP con `node:test` y Supertest o cliente HTTP equivalente, base de test replica set y fixtures aislados. Matriz de actor/recurso/acción, autenticación revocada y pruebas concurrentes de API07–API10. Validar DTO sanitizado recursivamente para evitar exposición indirecta de campos sensibles mediante joins. Capturar fallos de DB con middleware uniforme y registrar requestId sin secretos. Agregar rate limit razonable al acceso si se incorpora, documentando código adicional y sin cambiar silenciosamente contrato.

**README:** comandos de suite, prerrequisito replica set, creación/limpieza de base test y límites de cobertura. Enlazar matriz de permisos.

**Entregable:** informe de resultados para Daniel, con fallo reproducible y colección HTTP equivalente cuando se pueda.

**Checklist:**

- [ ] La suite prueba base y servidor reales, además de unidades.
- [ ] Hay denegación por URL directa y payload manipulado.
- [ ] Ninguna carrera deja estados parciales, huérfanos o duplicados.

**Pruebas:** ejecutar matriz permisos completa; tokens sin sesión/vencidos/revocados; correos y solicitudes duplicados concurrentes; aceptar↔cancelar/rechazar; convertir↔retirar/archivar. Confirmar estado DB después de cada carrera y repetir únicamente pruebas concurrentes para detectar intercalaciones, sin repetir todas las suites sin motivo. Error DB intencional en entorno test devuelve `500` sin nombre de colección, cadena de conexión ni stack. No crear un endpoint público para provocar fallos de prueba.

**Dónde empezar:** servidor/test/integration/ y utilidades aisladas de fixtures/fallos; reusar límites de test existentes. Revisar sanitización recursiva y errores sin exponer secretos. No crear endpoint público de pruebas.

**Prompt de implementación:**

```text
Implementa API12 como verificación integral HTTP/MongoDB real. Matriz actor/recurso/acción, tokens ausentes/vencidos/revocados, DTO sin campos privados, payload manipulado y carreras API07–API10 en ambos órdenes. Comprueba invariantes persistidas, no solo códigos. Fallo DB inyectado en test devuelve 500 seguro y rollback. Corrige defectos encontrados en su capa con cobertura apropiada; no deshabilites transacciones ni sustituyas Mongo por memoria para aprobar.
Lee la ficha API12 de docs/handoff-francisco.md y cumple su checklist/pruebas/README. Primero resume alcance y esperado; implementa solo esta tarea. Antes de commit/push, entrega diff resumido, comprobaciones reales, pendientes y pasos manuales UI con esperado. Espera autorización para publicar.
```

### API13 — Hacer reproducible el arranque y la recuperación

**Estado al recibir:** pendiente. **Orden recomendado:** 9/15.

**Responsable:** Francisco. **Revisor:** Daniel. **Dependencias:** API02, API03, API10. **Mensaje:** `docs(servidor): verificar arranque limpio y datos de demostración`.

**Cambio y razón:** completar scripts reales, `.env.example`, guía de replica set/seed, orden de arranque, puertos, resolución de conflictos y recuperación de DB. Añadir comprobación de configuración al iniciar y cierre limpio. Verificar una instalación desde cero en carpeta temporal o clon limpio. Datos de demostración cubren el recorrido de defensa sin usar información privada. El reset destructivo solo acepta base de test o confirmación explícita sobre demo, nunca nombre arbitrario.

**README:** sección ejecutable en orden: Node/npm → variables → MongoDB → seed → servidor → cliente → pruebas. Diferenciar comandos POSIX/PowerShell cuando cambien. Ningún comando documentado debe depender de una instalación oculta del autor.

**Entregable:** Daniel levanta la API siguiendo únicamente la guía y reporta el primer paso que falle.

**Checklist:**

- [ ] Cada variable indica propósito, ejemplo no sensible y obligatoriedad.
- [ ] Se identifican base de desarrollo/test y versión de herramientas probada.
- [ ] Reiniciar no requiere borrar datos ni repetir seed destructivo.

**Pruebas:** `npm ci`, configurar entorno de ejemplo, iniciar MongoDB y replica set, seed, API y login desde una instalación limpia. Detener Mongo y API durante lectura, restablecer y reintentar sin corrupción. Reiniciar ambos y confirmar iniciativas/solicitudes/proyectos persistentes. Probar origen/puerto incorrectos y documentar diagnóstico. Ejecutar seed dos veces y comprobar invariantes. Realizar transferencia inversa: Daniel explica el arranque a Francisco sin ayuda del autor.

**Dónde empezar:** README raíz/servidor/cliente, compose.yaml y scripts existentes. Conservar validación de entorno/shutdown ya implementados; completar únicamente lo que falte. .env.example/.env.test.example y seed completos del sistema; no asumir Docker nativo disponible en todos.

**Prompt de implementación:**

```text
Realiza API13 desde clon/carpeta limpia: instala con npm ci y cache temporal, configura sin secretos, prueba Mongo replica set por la vía realmente disponible, seed idempotente del sistema completo, arranque/login/persistencia tras reinicio. Diferencia desarrollo/test y comandos por sistema operativo. Diagnostica Mongo caído, CORS/puerto equivocado y recuperación sin borrar desarrollo. No crear reset arbitrario ni sobreescribir entornos del usuario. Registra versiones y resultado real, incluso lo no reproducido.
Lee la ficha API13 de docs/handoff-francisco.md y cumple su checklist/pruebas/README. Primero resume alcance y esperado; implementa solo esta tarea. Antes de commit/push, entrega diff resumido, comprobaciones reales, pendientes y pasos manuales UI con esperado. Espera autorización para publicar.
```

### UI14 — Entregar colección Postman con aserciones y cobertura

**Estado al recibir:** pendiente. **Orden recomendado:** 10/15.

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

**Dónde empezar:** Consolidar pruebas/innovation-hub.postman_collection.json y ejemplo de entorno; tomar el fragmento real de iniciativas (31 requests), pruebas HTTP de auth/users/catálogos y fragmentos nuevos de Francisco. No afirmar que existen fragmentos de Daniel para solicitudes/equipo.

**Prompt de implementación:**

```text
Implementa UI14: colección importable completa, auth/users/catálogos/iniciativas/requests/members/projects, IDs/tokens capturados en ejecución y exportación sin secretos. Cubre correcto/inválido/inexistente/no autorizado por recurso, distinguiendo 401/403 y públicos legítimos. Aserciones de contenido/efectos/persistencia/204/409 y reporte real Postman. Incorpora auth/perfiles/catálogos desde pruebas existentes si no hay fragmento. No contar sintaxis JSON como ejecución; no simular un 500 con un endpoint inseguro. Si el cliente elegido no puede ejecutar un fallo de servidor aislado, documenta esa cobertura en API12 y explica la excepción.
Lee la ficha UI14 de docs/handoff-francisco.md y cumple su checklist/pruebas/README. Primero resume alcance y esperado; implementa solo esta tarea. Antes de commit/push, entrega diff resumido, comprobaciones reales, pendientes y pasos manuales UI con esperado. Espera autorización para publicar.
```

### API14 — Verificar contrato completo y compatibilidad futura

**Estado al recibir:** pendiente. **Orden recomendado:** 11/15.

**Responsable:** Francisco. **Revisor:** Daniel. **Dependencias:** API11, API12, UI14. **Mensaje:** `test(contrato): verificar rutas DTO y códigos antes de congelar`.

**Cambio y razón:** prueba de conformidad del HTTP real con `docs/api-contract.md` o OpenAPI elegido en CO00; comparación de ejemplos y mocks con respuestas reales. Revisar que la API no dependa de IDs/serialización Mongo y pueda implementarse en ASP.NET Core sin cambiar React. Crear `docs/verificacion-contrato.md` con decisiones finales, rutas cubiertas y excepciones resueltas. Corregir inconsistencias antes de `entrega-2`, coordinado con UI03/UI14; nunca cambiar un DTO solo en un lado.

**README:** versión candidata del contrato, política de congelación, cómo ejecutar verificaciones y qué URL cambiará en la entrega final.

**Entregable:** contrato candidato a congelar, listo para CO02 y CO04.

**Checklist:**

- [ ] Cada endpoint tiene ejemplo y caso ejecutable, y el error es uniforme.
- [ ] Fechas, nulabilidad, enums, campos opcionales y códigos coinciden.
- [ ] No hay rutas internas Mongo, requisitos de BSON ni rama condicional del cliente por backend.

**Pruebas:** ejecutar colección de UI14 y suites de conformidad; comparar muestras de éxito/error/archivo/`204` y lista paginada contra el documento. Comparar DTO de lecturas mock y Express sin adaptar componentes. Las mutaciones mock de iniciativas devuelven 501 deliberadamente; verificar sus flujos completos contra Express, sin declarar que el mock ya simula todas las escrituras. Esto verifica desacoplamiento, no demuestra todavía compatibilidad real con .NET. Daniel toma una ruta y explica cómo la reimplementaría con tablas; todo punto sin respuesta clara se corrige/documenta antes del cierre.

**Dónde empezar:** docs/api-contract.md, modelos/DTO, mocks y colección final; crear docs/verificacion-contrato.md. Reusar suites API12/UI14 y resolver contradicciones en ambos lados antes de congelar.

**Prompt de implementación:**

```text
Realiza API14: compara rutas, verbos, DTO, nulabilidad, límites, fechas, errores, permisos y 204 del HTTP real con contrato y colección. Sin ObjectId/BSON ni lógica React específica de Mongo. Documenta cobertura/decisiones. Lecturas mock deben ser conformes; mutaciones de iniciativa mock hoy devuelven 501 deliberadamente, por lo que no declares equivalencia completa de flujos. Verifica escrituras reales en Express; .NET aún no está implementado. Corrige diferencias antes de entrega-2 sin cambios silenciosos de un solo consumidor.
Lee la ficha API14 de docs/handoff-francisco.md y cumple su checklist/pruebas/README. Primero resume alcance y esperado; implementa solo esta tarea. Antes de commit/push, entrega diff resumido, comprobaciones reales, pendientes y pasos manuales UI con esperado. Espera autorización para publicar.
```

### UI15 — Verificar navegación real, accesibilidad y regresiones de UX

**Estado al recibir:** pendiente. **Orden recomendado:** 12/15.

**Responsable:** Francisco. **Revisor:** Daniel. **Dependencias:** UI04–UI13; entorno integrado. **Mensaje:** `test(cliente): verificar flujos accesibles y correcciones del avance 1`.

**Cambio y razón:** Francisco consolida pruebas de componentes/flujos relevantes con Vitest y Testing Library, y recorridos de navegador con Playwright o evidencia manual sistemática donde el navegador automatizado no esté disponible. Cubrir correcciones de E14–E26 y registrar capturas/resultados en `docs/qa-cliente.md`. No trasladar literalmente stubs DOM viejos como si probaran React real. Añadir pruebas donde prevengan regresión de permisos, acciones y estados, no para copiar la implementación.

**README:** comandos reales, navegador/versiones y resoluciones verificadas, resultados, defectos abiertos y enlace a QA. No mantener la frase «pendiente manual» si ya se comprobó, ni borrarla sin evidencia.

**Entregable:** Francisco consolida evidencia de UX de ambos bloques; cada autor corrige los defectos de sus módulos y el otro verifica el resultado.

**Checklist:**

- [ ] Todas las pantallas de consulta tienen carga/error/vacío y no solo catálogo.
- [ ] Teclado, foco real, contraste, zoom y responsive revisados.
- [ ] Mocks desactivados durante pruebas de integración final.

**Pruebas:** recorrido registro→perfil→buscar→crear→editar→solicitar con segundo usuario→aceptar→convertir→GitHub→logout. Repetir acciones críticas a 360/768/1440 px y zoom 200 %, sin scroll horizontal que impida operar. Tab/Shift+Tab, Enter/Espacio y Escape deben alcanzar todos los controles con foco visible, modales accesibles y avisos anunciables. Repetir cada hallazgo de evaluación antigua y adjuntar resultado; inspeccionar Network para confirmar backend real. Registrar cualquier fallo para un commit correctivo específico antes de CO04.

**Dónde empezar:** Recorrer cliente real con API/Mongo; features/auth/users/initiatives/requests/projects, componentes globales, estilos y router. Evidencia en bitácora/matriz, no en nuevas guías manuales UI.

**Prompt de implementación:**

```text
Realiza UI15: recorrido real registro→perfil→búsqueda→crear/editar→solicitar con otro usuario→aceptar→convertir→GitHub→logout y accesos indebidos de un tercero. Revisar cada hallazgo avance1, 360/768/1440 px, zoom200%, teclado/foco/modales/contraste, carga/error/vacío y persistencia al reiniciar. Confirmar Network real. jsdom no sustituye navegador; si no hay acceso visual, deja pendientes concretos y da pasos con esperado para revisión humana. No afirmar aprobado un caso sin evidencia.
Lee la ficha UI15 de docs/handoff-francisco.md y cumple su checklist/pruebas/README. Primero resume alcance y esperado; implementa solo esta tarea. Antes de commit/push, entrega diff resumido, comprobaciones reales, pendientes y pasos manuales UI con esperado. Espera autorización para publicar.
```

### CO02 — Integrar el sistema y consolidar el README verificable

**Estado al recibir:** pendiente. **Orden recomendado:** 13/15.

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

**Dónde empezar:** Consolidar trabajo de ambos y docs/avance2-francisco.md, README, matrices y evidencia; preservar historial. Generar mapa requisito→archivo/endpoint/prueba. Revisar la tabla final con seis columnas académicas, no conservar sin revisión la tabla operativa actual.

**Prompt de implementación:**

```text
Realiza CO02 después de UI15/API13/API14: integrar candidato preservando commits y resolviendo conflictos semánticos. README reproducible con arquitectura/config/arranque/tests/correcciones/limitaciones y tabla de seis columnas exigidas. Valida desde clon limpio con otro integrante, flujo real dos usuarios/tercero ajeno, persistencia y ausencia de secretos/dependencias versionadas. Errores de acceso/integridad o función obligatoria bloquean cierre; corrígelos con evidencia. No declares el sistema completo por terminar solo el bloque de Daniel.
Lee la ficha CO02 de docs/handoff-francisco.md y cumple su checklist/pruebas/README. Primero resume alcance y esperado; implementa solo esta tarea. Antes de commit/push, entrega diff resumido, comprobaciones reales, pendientes y pasos manuales UI con esperado. Espera autorización para publicar.
```

### CO03 — Preparar y registrar la defensa individual cruzada

**Estado al recibir:** pendiente. **Orden recomendado:** 14/15.

**Responsable:** Francisco. **Revisor:** Daniel. **Dependencias:** CO02. **Mensaje:** `docs: preparar defensa individual con recorridos y ejercicios`.

**Cambio y razón:** `docs/defensa.md` con índice criterio 1–20→archivos/funciones reales, decisiones y alternativas. Cada integrante explica módulos del otro y realiza cambios de práctica en rama desechable; documentar ejercicio y verificación sin fusionar cambios improvisados a la entrega. Preparar datos semilla y arranque en el equipo de cada uno. La defensa pesa tanto como el producto y puede reducir la nota del código que no sepan explicar.

**README:** preparación de defensa y comandos para arrancar demo; enlazar guía. Registrar que asistentes IA y autocompletado generativo deben estar desactivados durante la defensa según consigna, sin extender esa prohibición a la planificación/desarrollo autorizados.

**Entregable:** Francisco prepara guía y ejercicios; Daniel revisa su cobertura. Cada uno entrega su evidencia individual de explicación y modificación, sin atribuir práctica al otro por haber preparado el documento.

**Checklist:**

- [ ] Daniel explica transacciones, índices, permisos, hashing y CORS en código real.
- [ ] Francisco explica inmutabilidad, formularios, Router, efectos y errores GitHub.
- [ ] Ambos implementan un cambio pequeño y verifican su efecto sin romper contrato.

**Pruebas:** recorrer una petición React→Express→Mongo→respuesta y otra denegada por permisos; responder preguntas cruzadas sobre los 16 criterios; realizar dos cambios en rama de práctica, como añadir validación con `400` y un orden permitido previamente definido o corregir limpieza de efecto; revisar y repetir los puntos débiles. No modificar DTO/rutas congelados para resolver ejercicios. Cada estudiante hace su ensayo sin ayuda de IA y arranca todo en su propio equipo. La práctica no se declara aprobada por haber leído la guía.

**Dónde empezar:** Crear docs/defensa.md con criterios1–20 enlazados a funciones reales, decisiones/alternativas y ejercicios. Ensayos en ramas descartables con datos sintéticos; documentación del resultado individual, no del asistente.

**Prompt de implementación:**

```text
Prepara CO03: guía de defensa de toda la solución, índices1–20→código y recorrido React→Express→Mongo→DTO, permisos, hashes, referencias/transacciones, errores externos y alternativas para .NET. Cada integrante ensaya y modifica sin IA/autocompletado generativo según consigna. Puedes preparar guía/ejercicios durante desarrollo, pero no realizar ni declarar su ensayo individual en su nombre. Registra pendientes hasta que cada uno confirme su práctica; las ramas de práctica no alteran entrega ni contrato congelado.
Lee la ficha CO03 de docs/handoff-francisco.md y cumple su checklist/pruebas/README. Primero resume alcance y esperado; implementa solo esta tarea. Antes de commit/push, entrega diff resumido, comprobaciones reales, pendientes y pasos manuales UI con esperado. Espera autorización para publicar.
```

### CO04 — Congelar el candidato y preparar la entrega etiquetada

**Estado al recibir:** pendiente. **Orden recomendado:** 15/15.

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

**Dónde empezar:** Revisar candidato/evidencia/README, preparar TXT con enlaces correctos y tag anotado entrega-2 del commit exacto. Comprobar refs locales/remotas; Moodle lo envía el responsable humano salvo autorización explícita para actuar allí.

**Prompt de implementación:**

```text
Prepara CO04 únicamente con candidato revisado y sin fallos bloqueantes. Da resumen y pasos de validación antes de solicitar autorización de commit/publicación/etiqueta. Crea entrega-2 anotada sobre el hash aprobado cuando exista autorización, verifica referencia remota y clon fresco. TXT apunta a repositorio y versión exacta, no solo main. Congela contrato. No inventes envío Moodle ni práctica de defensa; no muevas tag publicado a escondidas ni modifiques fechas/autores para simular semanas. No generar PDF salvo nueva petición.
Lee la ficha CO04 de docs/handoff-francisco.md y cumple su checklist/pruebas/README. Primero resume alcance y esperado; implementa solo esta tarea. Antes de commit/push, entrega diff resumido, comprobaciones reales, pendientes y pasos manuales UI con esperado. Espera autorización para publicar.
```

## 8. Prompts para comenzar, retomar, revisar y cerrar

Estos prompts están pensados para desarrollo autorizado con Codex en el repositorio de Francisco. La defensa individual se realiza sin IA, como exige la consigna. Los documentos no deben usarse para atribuir al humano una práctica o prueba que hizo otra herramienta.

### 8.1 Primer prompt de contexto

```text
Trabajamos en Innovation Hub, Avance2 SOFT-12. Estoy haciendo la parte de Francisco; Daniel revisa. Lee el índice, las secciones1–6 y la ficha API08 de docs/handoff-francisco.md, más docs/avance2-daniel.md; después consulta solo las secciones de contrato/modelo/matrices que afectan la tarea. Las otras fichas se leen al comenzar su tarea. docs/plan-avance2.md es el plan portable. Las fuentes ya están extraídas en docs/fuentes/; no las reconviertas.
Primero inspecciona git status/log y comprueba que 5e12be3 es ancestro, sin borrar cambios del usuario. Daniel completó CO00–CO01, UI01–UI10, API01–API07. Mis 15 tareas son API08/UI11/API09/UI12/API10/UI13/API11/API12/API13/UI14/API14/UI15/CO02/CO03/CO04; los prefijos no indican autor. No asumas que API de requests/projects existe por tener adaptadores o fixtures.
Respeta decisiones actuales: DELETE/archivo independientes; estimación blanda; nuevos intentos e historia; nueva membresía por periodo; competencia ofrecida del perfil, no necesariamente requerida; converted sigue recibiendo miembros al equipo del origen. Reusa revisión transaccional común y contratos, sin duplicar modelos.
Explica la siguiente tarea antes de editar. Ejecuta las pruebas de API tú; los pasos UI manuales se dan por conversación con esperado en cada paso. No crees guías pruebas-uiXX.md. Mantén forms al100% del contenedor. Usa npm ci --cache /private/tmp/innovation-hub-npm-cache en macOS y ejecuta npm dentro de cliente/servidor, nunca raíz. No sobrescribas entornos ni toques BD/procesos de desarrollo del compañero.
Actualiza docs/avance2-francisco.md, bitácora/README y contrato/modelo/matrices/fragmento si aplica. Evidencia fiel: automatizado no es manual, jsdom no es revisión visual y sintaxis Postman no es ejecución. Conserva encabezado histórico Revisión manual API05.
Antes de commit/push presenta resumen, pruebas reales y recorrido UI con resultados esperados; espera autorización expresa. No modifiques autores/fechas ni publiques tags/envíes mensajes/Moodle sin autorización. Empieza únicamente API08 usando su ficha y prompt.
```

### 8.2 Retomar en otra sesión

```text
Retoma mi parte de Francisco en Innovation Hub. Lee el estado actual de docs/avance2-francisco.md, el handoff y las últimas entradas relevantes de bitácora; inspecciona git status/diff/log antes de editar. No reinicies ni reconviertas fuentes ni descartes cambios sin entenderlos. Identifica último commit aprobado, tarea en curso, evidencia pasada/fallida, decisión pendiente y siguiente paso seguro. Contrasta con el código: el handoff es un corte, no garantía de que todo siga igual. Continúa solo la tarea en curso; explica qué harás y su esperado. Respeta el flujo de revisión antes de commit/push.
```

### 8.3 Preparar revisión de un commit por Daniel

```text
Revisa la tarea [ID] sin publicar cambios. Contrasta su ficha y contrato con git diff y pruebas. Busca permisos por URL/body, datos expuestos, transiciones inválidas, carreras/rollback, errores de frontend, foco y duplicados. No valides el plan por defecto: señala contradicciones y casos límite. Ejecuta pruebas pertinentes y da hallazgos con archivo/ubicación, reproducción, esperado y resultado, distinguiendo confirmado de riesgo. Entrega pasos UI humanos por conversación; no declares revisión cruzada aprobada en nombre de Daniel.
```

### 8.4 Investigar un fallo

```text
Investiga este fallo: [pegar error y pasos, sin token/contraseña real]. Identifica entorno/modo/puertos, petición/código HTTP, actor y datos de prueba. Reproduce en base aislada o con mocks apropiados; no resetees desarrollo ni desactives permisos/transacciones. Corrige la causa en la capa adecuada, agrega cobertura útil y ejecuta las comprobaciones afectadas. Conserva valores del formulario y evita falso éxito/reintento incierto. Resume causa/cambio/pruebas y da manual con esperado antes de pedir autorización de commit.
```

### 8.5 Cerrar una tarea sin publicarla todavía

```text
Prepara el cierre de [ID]. Revisa diff/checklist, ejecuta las comprobaciones necesarias, sincroniza README/bitácora/documentación propia y contrato/modelo/matrices/fragmentos según impacto. Expón qué quedó implementado, comandos/directorios/resultados, qué no se pudo verificar y un paso a paso UI con esperado. Propón el mensaje de commit y describe la siguiente tarea/dependencias. No hagas commit ni push hasta que yo lo autorice.
```

### 8.6 Estado que Francisco debe dejar al terminar cada sesión

En `docs/avance2-francisco.md`, mantener una entrada vigente breve además de la historia:

```text
Fecha / base actual / último commit publicado:
Tarea en curso y responsable/revisor:
Implementado / archivos relevantes:
Pruebas ejecutadas y resultado (unidad, HTTP/Mongo, Postman, navegador):
Fallas y pendientes concretos; no verificado:
Cambios de contrato/regla y su motivo:
Datos de prueba tocados / procesos temporales que siguen activos:
Revisión humana y autorización de publicación recibida (si existe):
Siguiente paso y dependencias:
```

No copiar tokens, hashes de contraseña, env privado o dumps. Si cambia una distribución futura, actualizar alcance/plan/handoff/matriz y el estado vigente; no alterar entradas históricas para aparentar que siempre fue así.

## 9. Recepción del handoff y condición de entrega

### Recepción por Francisco (aún pendiente)

- [ ] Clonar/actualizar y ubicar código base 5e12be3 y documentación del handoff.
- [ ] Configurar entorno local real y replica set sin depender de archivos privados de Daniel.
- [ ] Arrancar y comprobar login, perfil/directorio, catálogo/detalle, crear/editar, archivar/eliminar independientes.
- [ ] Ejecutar comprobaciones acordadas y leer sus límites; no resetear la base ajena.
- [ ] Revisar revisión común, DTO, visibilidad, índice de membresías y plan de requests/projects antes de API08.
- [ ] Registrar dudas concretas y resultado de revisión cruzada; no marcar esta recepción por el mero hecho de recibir el archivo.
- [ ] Crear su registro propio y comenzar API08 con responsable único y revisión de Daniel.

### Pendientes conocidos que no deben perderse

1. Solo existe el fragmento Postman de iniciativas; cobertura final de los demás recursos e importación/ejecución reales están pendientes UI14.
2. Requests/projects tienen JSON de diseño, pero no seed/modelos/rutas completos. Completar al implementar, sin romper fixtures/idempotencia ni duplicar equipo.
3. Índices de `requests/projects` son necesarios antes de transacciones reales: una consulta previa no previene carreras. Crear índices explícitamente, ya que autoIndex está desactivado.
4. Mantener alineados campos que las consultas existentes ya usan: `requests.initiativeId/applicantId/state` y `projects.sourceInitiativeId`. Cambiarlos rompe capabilities e inspección de historia aunque la nueva pantalla parezca funcionar.
5. QA integral con navegador y reproducción Docker siguen pendientes. No convertir resultados de jsdom en evidencia visual. Avisos Sass conocidos permanecen registrados.
6. Antes de API10/UI13 aclarar cualquier formato de repositorio que no pueda identificarse en GitHub: el contrato candidato permite HTTP(S), mientras el proveedor externo es GitHub. Host extraño nunca equivale a GitHub; no enviar nuestro Bearer a otro proveedor.
7. README tiene una tabla operativa de seis columnas, pero CO02 debe comprobar las seis columnas exigidas por el plan académico (número, fecha, hash, mensaje, sección y cambio principal). El conteo de columnas por sí solo no cumple ese contenido.
8. El contrato sigue siendo candidato hasta entrega-2; después debe mantenerse en la reimplementación final. No agregar edición/archivo/filtros de proyectos ni backend .NET en este avance.
9. Terminar las 15 tareas no reemplaza ensayos individuales ni confirmación real de envío Moodle. No generar nueva planificación PDF sin que Daniel lo pida.

**Salida esperada:** Francisco entrega a Daniel cambios reproducibles, pruebas/evidencia y pendientes de cada tarea; Daniel revisa. CO02 consolida un candidato completo, CO03 registra práctica real de ambos y CO04 etiqueta el commit exacto revisado y prepara el TXT. El equipo conserva la confirmación humana de Moodle. Hasta entonces, ni el handoff ni la etiqueta prueban una entrega académica realizada.
