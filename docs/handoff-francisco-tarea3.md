# Guía de Francisco — Tarea 3, parte B

## Leer primero: estado y alcance

Esta guía es específica de **Tarea 3**. El anterior `handoff-francisco.md` trata del Avance 2: sirve como historia, no como lista de tareas pendientes de esta entrega.

**Estado actualizado (13 de noviembre de 2026):** T3B-01/02/03/04 registrados como `3731609`, `08d6431`, `11c48f4` y `b317e31`. T3B-05 implementado y verificado en el equipo de Daniel, pendiente de revisión y commit. La ejecución completa terminó con OK T3B-05: reconstrucción de Test, siembra equivalente, update idempotente y 42 comparaciones HTTP; Dev quedó intacta. El modelo tiene 14 tablas/107 filas, dos migraciones y dos GET de visitante. Las tareas de implementación de Francisco empiezan después de recibir y verificar T3B-05; esta guía no declara su recepción aprobada. No ejecutar comandos de migraciones inexistentes ni presentar los resultados previstos como evidencia obtenida.

La consigna pide un modelo SQL del dominio completo, dos migraciones reales, HasData, cuatro consultas SQL, dos GET de lectura e investigación. No pide terminar toda la API .NET ni migrar React. La fecha es **22 de noviembre, 23:55**. Parte A es individual en otro repositorio: cada uno la termina y etiqueta por su cuenta.

Daniel implementa T3B-01 a 05. Tú eres responsable de **T3B-06, 07 y 08**, con revisión de Daniel. Debes crear tus propios commits, incluyendo cambios reales dentro de `servidor-net`, sin cambiar identidad ni fechas. Los diez commits mínimos de la consigna se refieren al repositorio personal de Parte A; no inventes diez commits en el proyecto para cumplir algo que no exige.

## Dónde está cada cosa

| Documento/carpeta | Para qué leerlo |
| --- | --- |
| `docs/tarea3-parte-b.md` | Plan maestro: reparto, dependencias, mensajes de commit, checklist y pruebas de las ocho tareas |
| `docs/fuentes/consigna-tarea3.md` | Extracción cacheada del PDF por páginas; no volver a convertirlo salvo discrepancia |
| `servidor-net/README.md` | Versiones, secreto por nombre, comandos y estado operativo de .NET |
| `docs/modelo-datos.md` | Modelo MongoDB y sección «Modelo relacional» ya completa: tablas, PK/FK, restricciones y borrados |
| `docs/api-contract.md` | JSON, campos y reglas de las rutas del Avance 2 |
| `servidor/src/dto/initiative.dto.js` y `services/initiative-access.js` | Referencia ejecutable de DTO y permisos; cuidado con la identidad por defecto del DTO |
| `servidor-net/Modelos`, `Datos`, `Migrations` | Entidades, configuración/seed y evolución SQL; modelo completo implementado en 02–03 |
| `servidor-net/requests.http` | 14 casos de los dos GET, ya implementados en 04 |
| `servidor-net/sql/consultas.sql` | Tu entrega de 06, todavía por escribir |
| `docs/investigacion-efcore.md` | Tu entrega de 07, todavía por escribir |
| `pruebas/fixtures/` | Datos sintéticos compartidos; verificar los IDs/totales finales contra HasData |
| `README.md` raíz | Visión general y enlaces; no debe contradecir el README de .NET |

Los documentos del Avance 2 conservan su historia. Actualiza solo lo necesario para Tarea 3; no declares completada esa entrega por la existencia de esta guía.

## Preparación de tu equipo

1. Recibe de Daniel el **hash del commit de T3B-05**, rama, resultados de pruebas, IDs/totales de seed y limitaciones pendientes. Comprueba `git status` antes de actualizar: conserva cambios tuyos; no uses reset destructivo.
2. Instala el SDK **10.0.404**. Dentro de `servidor-net`, `dotnet --version` debe devolver esa versión exacta; global.json no permite elegir silenciosamente otra. El runtime solo no basta.
3. Ejecuta:

```sh
dotnet tool restore
dotnet restore --locked-mode
dotnet build --no-restore
dotnet ef --version
```

Esperado: restauración y compilación sin errores; herramienta EF **10.0.15**. No actualices a EF 11 ni cambies el lockfile para resolver una instalación incompleta.

4. Prepara acceso a tu SQL Server. En el equipo de Daniel existe un contenedor llamado `sqlserver`, con puerto configurado `1433:1433`; estaba detenido el 11 y se inició el 12 para probar T3B-02. Eso no demuestra que en tu equipo exista el mismo contenedor. Si sí existe, `docker start sqlserver` lo inicia y `docker ps --filter name=sqlserver` permite comprobarlo; no crear otro contenedor con el mismo nombre. El destino local esperado es `127.0.0.1,1433` cuando ese mapeo esté activo. No extraigas credenciales con `docker inspect`.
5. Configura en privado **`ConnectionStrings:InnovationHub`** con user-secrets según el README .NET (en el entorno local de Daniel ya quedó configurado). Para el contenedor local con puerto 1433 también puedes usar `python3 scripts/configure-local-connection.py`: pide usuario y contraseña oculta sin guardarlos en argumentos. Usa una base exclusiva de la tarea y otra para pruebas destructivas. No pegues la cadena en chat, capturas, appsettings, código ni commits. No ejecutes `dotnet user-secrets list` para generar evidencia.
6. Después de T3B-05, aplica las migraciones con `dotnet ef database update` y revisa `dotnet ef migrations list`: deben aparecer al menos las dos etapas de Daniel. Inicia `dotnet run --no-build --launch-profile http`, escucha en `http://127.0.0.1:5080` y ejecuta `requests.http` contra el host real. Los dos GET exitosos deben responder 200 y el JSON contractual; los IDs exactos los entrega Daniel.
7. Si falla restauración, migración o GET, entrega a Daniel el comando, mensaje de error **redactado sin secretos** y estado de la base. No cambies nombres de tablas o resultados esperados para ocultar el fallo.

Si necesitas levantar el proyecto JavaScript para comparar, sigue su README; en cualquier instalación npm usa `npm ci --cache /private/tmp/innovation-hub-npm-cache`. No es necesario modificar React para tus experimentos.

## Esquema recibido: decisiones que debes respetar

- `ParticipationRequests` conserva intentos y permite una sola pending por pareja mediante índice filtrado.
- `Memberships` representa periodos: otra incorporación tiene otro ID. Solo una active por pareja; FK compuesta de SourceRequestId/InitiativeId/UserId asegura el origen correcto y una solicitud origina como máximo un periodo.
- `MembershipEvents` guarda MembershipId, ActorId y RequestId opcional; iniciativa/persona se obtienen del periodo. No existen columnas InitiativeId/UserId duplicadas en el evento.
- `Projects` tiene SourceInitiativeId único; **no tiene OwnerId ni una tabla de equipo copiada**. Dueño: Projects → Initiatives → Users. Equipo: Projects → Initiatives → Memberships → Users; contar solo State='active'.
- `ProjectTechnologies` conserva orden por Position y clave normalizada única. StartDate es date obligatorio, EstimatedEndDate nullable y no anterior al inicio, como Express.
- Las cuatro consultas SQL y el experimento de investigación siguen siendo tu responsabilidad: no están implementados por el verificador de Daniel.

Siembra actual: 5 usuarios, 8 categorías, 10 competencias, 8 iniciativas, 7 UserSkills, 7 UserInterests, 16 InitiativeSkills, 13 InitiativeTags, 0 sesiones, **5 solicitudes, 12 periodos, 13 eventos, 1 proyecto y 2 tecnologías**. Total107; miembros activos11/retirados1. El proyecto de Orientación laboral usa tres activos y estimado2 (espacios0); los retirados no se cuentan como actuales.

Antes de tus consultas, ejecuta `dotnet run --no-build --launch-profile http -- --verify-domain=true`; esperado: `OK T3B-03` tras 32 rechazos esperados y casos positivos con rollback. `--compare-databases=true` compara Dev incremental con Test de siembra limpia sin imprimir valores. Ambos destinos se configuraron en el equipo de Daniel, **no se transfieren tus secretos por Git**. `--use-test-database=true` apunta solo a InnovationHub_Tarea3_Test y no cambia el secreto; consulta el README antes de crearla en tu equipo.

## Datos y contrato de la entrega de Daniel

Rama de referencia: **main**. Último incremento registrado al preparar T3B-05: **b317e31**. El commit de 05 lo comunicará Daniel después de registrarlo; no inventar su hash ni confundir el de 04 con la entrega de 05. No crear todavía `tarea-3`.

Las migraciones son `20261113021734_InicialUsuariosIniciativas` y `20261113035919_AgregarSolicitudesEquiposProyectos`. El diccionario/ER y el comportamiento de **las 20 FK** están en `docs/modelo-datos.md`, sección Modelo relacional; las configuraciones ejecutables están en `Datos/Configuraciones/`. No hay migraciones ni cambios de seed nuevos en 05.

Tablas recibidas: Users, Sessions, Categories, Skills, UserSkills, UserInterests, Initiatives, InitiativeSkills, InitiativeTags, ParticipationRequests, Memberships, MembershipEvents, Projects y ProjectTechnologies; además `__EFMigrationsHistory`. Totales por tabla: README .NET; 107 filas de dominio, 14 PK, una clave alternativa de solicitudes, 20 FK, 60 CHECK y 31 índices secundarios (sin contar los índices que respaldan PK/clave alternativa).

Los usuarios sintéticos no tienen contraseña ni una sesión .NET: Ana `11111111-1111-4111-8111-111111111111`, Luis `22222222-2222-4222-8222-222222222222`, Carla `33333333-3333-4333-8333-333333333333`, Diego `44444444-4444-4444-8444-444444444444` y Elena `55555555-5555-4555-8555-555555555555`. No intentar iniciar sesión contra esta API parcial.

GET de categorías: `/api/categories` → 200, ocho categorías activas. Para el otro GET usar `/api/initiatives/{id}` **sin Authorization**:

| ID exacto | Iniciativa | Visibilidad/estado | HTTP visitante | Activos/espacios si hay detalle |
| --- | --- | --- | --- | --- |
| 10000000-0000-4000-8000-000000000001 | Huertos escolares | public/published | 200 | 1/4 |
| 10000000-0000-4000-8000-000000000002 | Accesibilidad urbana | public/forming_team | 200 | 2/2 |
| 10000000-0000-4000-8000-000000000003 | Reto de reciclaje inteligente | restricted/published | 401 | — |
| 10000000-0000-4000-8000-000000000004 | Mentorías tecnológicas | institutional/published | 401 | — |
| 10000000-0000-4000-8000-000000000005 | Banco de alimentos | public/archived | 404 | — |
| 10000000-0000-4000-8000-000000000006 | Datos de calidad del aire | private/published | 404 | — |
| 10000000-0000-4000-8000-000000000007 | Lectura compartida | public/draft | 404 | — |
| 10000000-0000-4000-8000-000000000008 | Orientación laboral | public/converted | 200 | 3/0 |

Proyecto `50000000-0000-4000-8000-000000000001` → iniciativa terminada en `008`, estado planning, tecnologías React y Node.js ordenadas. No existe GET de proyectos en esta fase. Las solicitudes `20000000-0000-4000-8000-000000000001` a `...005` tienen estados accepted, cancelled, rejected, pending y accepted, respectivamente. El intento rechazado y el pendiente son de Luis para Mentorías: no borrar el anterior. Las dos aceptadas originan las membresías de Elena/Accesibilidad y Carla/Orientación. El periodo retirado de Luis/Orientación es `30000000-0000-4000-8000-000000000012` y no cuenta como activo.

Restricciones útiles para preparar tus casos (consultar columnas exactas en el diccionario): `UX_Users_EmailNormalized`, `UX_Requests_Pending`, `UX_Memberships_Active`, `CK_UserSkills_Level`, `CK_Requests_State`, `CK_Requests_Decision`, `CK_Memberships_Retirement`, `CK_Projects_Calendar` y FK compuesta `FK_Memberships_ParticipationRequests_SourceRequestId_InitiativeId_UserId`. Estos nombres no son una quinta consulta de entrega: tú debes escribir, comentar y ejecutar tus cuatro bloques SQL.

## Recepción en tu equipo antes de T3B-06/07

El verificador de cierre y la entrega técnica están preparados; la ejecución completa en SQL Server fue aprobada en el equipo de Daniel el 13 de noviembre de 2026. La reproducción y aceptación en tu equipo siguen pendientes. Después de recibir el commit de 05, instala/configura tu entorno como arriba. Aplica ambas migraciones en Dev y Test usando únicamente bases exclusivas. Desde servidor-net ejecuta:

```sh
dotnet run --no-build --launch-profile http -- --check-sql-target=true
dotnet ef database update -- --environment Development
dotnet run --no-build --launch-profile http -- --check-sql-target=true --use-test-database=true
dotnet ef database update -- --environment Development --use-test-database=true
node scripts/verify-rebuild.mjs --confirm=InnovationHub_Tarea3_Test
```

Esperado: destino Dev/Test confirmado, dos migraciones aplicadas y **OK T3B-05**. El último comando **borra Test** después de comprobar su destino y su equivalencia con Dev; no ejecutarlo con datos propios ni con otros procesos usando esa base. Restaura/compila, comprueba las guardas, reconstruye Test, verifica update repetido, 32 rechazos con rollback y 42 comparaciones HTTP en dos arranques. El README .NET explica el procedimiento y recuperación si se interrumpe. Ninguna contraseña viaja con Git.

Checklist de recepción (lo completa Francisco con resultados propios):

- [ ] Tengo el hash real de 05 y un árbol de trabajo preservado antes de actualizar.
- [ ] SDK/herramienta/dependencias correctos y secreto local configurado en privado.
- [ ] Dev/Test exclusivas; ejecución completa termina con OK T3B-05 en mi equipo.
- [ ] Puedo explicar al menos un GET→Select→SQL y el vínculo del equipo del proyecto.
- [ ] Informé a Daniel el commit recibido, resultado y cualquier discrepancia sin secretos.

Si falla una guarda por diferencias de seed, no copiar o borrar filas para hacerla pasar; identificar si son datos de trabajo propios o un defecto reproducible y coordinar con Daniel. No afirmar recibido el handoff a partir de la evidencia del equipo de Daniel.

## Tu primer commit: T3B-06, consultas SQL

Mensaje: `test(servidor-net): comprobar relaciones y restricciones con consultas SQL`.

Lee el diccionario relacional y los HasData finales. Escribe `servidor-net/sql/consultas.sql` con cuatro bloques numerados: propietario–iniciativas (JOIN 1:N), usuario–competencia y nivel (M:N), conteo GROUP BY y una violación intencional. Indica en cada bloque columnas/filas o error esperado a partir de la siembra real, no de supuestos. Para la violación elige una restricción existente, usa datos que no violen antes otra regla y controla transacción/rollback con TRY/CATCH.

Ejecuta sobre SQL Server, compara cada resultado con lo esperado y repite el archivo completo: no debe alterar la semilla ni dejar una transacción abierta. Daniel debe poder reproducir al menos el JOIN y el rechazo. Actualiza el README con cómo ejecutar y reconocer cada resultado, sin credenciales. El checklist detallado de 06 está en el plan maestro.

**Entrega a Daniel antes de commit/push:** resumen, archivos cambiados, pasos con resultados esperados, resultados realmente obtenidos y pendientes. Después de revisión, realiza el commit con tu identidad. No combines la investigación en este commit.

Prompt para comenzar con tu asistente:

> Trabaja solo T3B-06 de docs/tarea3-parte-b.md. Lee docs/handoff-francisco-tarea3.md, la sección Modelo relacional de docs/modelo-datos.md y el HasData real. Primero comprueba que recibí T3B-05 y que compila. Implementa servidor-net/sql/consultas.sql con los cuatro casos requeridos y resultados esperados de la siembra. Ejecuta en una base exclusiva sin exponer secretos. Aísla y revierte la violación intencional. No modifiques el modelo para hacer pasar un resultado incorrecto. Dame resumen, pruebas ejecutadas y pasos con resultados esperados antes de commit/push. No hagas T3B-07 todavía.

## Tu segundo commit: T3B-07, investigación

Mensaje: `docs(efcore): comparar proyeccion relaciones y paginacion con evidencia`.

Añade un modo de experimento o herramienta en `servidor-net` que utilice el contexto existente sin incorporar una tercera ruta pública. Mantén los dos GET contractuales intactos. Ejecuta una misma consulta raíz con Select y con Include, observa el SQL y compara resultados equivalentes. Muestra qué cambia con AsNoTracking y evita afirmar que todas las proyecciones tienen el mismo comportamiento de tracking. Explica la entidad `UserSkill` y su nivel frente a una tabla intermedia sin datos propios. Ejecuta paginación con Skip/Take antes de materializar, con orden estable y desempate por ID; comprueba SQL y dos páginas sin solapamiento.

Escribe `docs/investigacion-efcore.md`, **máximo dos páginas**, con las tres respuestas, SQL propio, captura legible auténtica y fuentes oficiales por respuesta. No fabricar logs/capturas ni activar logging de valores sensibles. Usa SQL relevante legible y enlaza evidencia extensa solo como apoyo; el argumento de las tres respuestas debe caber en el documento. Verifica el límite con presentación/exportación a tamaño de página legible.

Fuentes oficiales de partida (consultarlas y citar las que apoyen la respuesta):

- https://learn.microsoft.com/ef/core/performance/efficient-querying
- https://learn.microsoft.com/ef/core/querying/related-data/eager
- https://learn.microsoft.com/ef/core/querying/tracking
- https://learn.microsoft.com/ef/core/modeling/relationships/many-to-many
- https://learn.microsoft.com/ef/core/querying/pagination

**Entrega a Daniel:** comando repetible del experimento, SQL/captura reales, documento, interpretación y resultados. Daniel ejecutará el experimento para revisar. Tu commit incluye código propio dentro de servidor-net, además del documento; no basta con editar documentación externa a esa carpeta.

Prompt:

> Implementa solo T3B-07 según el plan y handoff de Tarea 3. Usa el modelo existente para un experimento repetible de Select frente a Include/AsNoTracking, entidad M:N con nivel y Skip/Take en SQL. No añadas rutas públicas ni reescribas Express. Ejecuta las consultas reales y registra SQL/captura sin secretos. Redacta docs/investigacion-efcore.md con máximo dos páginas y citas oficiales learn.microsoft.com/ef/core por respuesta. Distingue observado de previsto. Antes de commit/push dame cambios, pruebas ejecutadas y pasos reproducibles con resultados esperados.

## Tu tercer commit: T3B-08, cierre

Mensaje: `chore(servidor-net): cerrar entrega reproducible de Tarea 3`.

Reproduce la instalación desde una carpeta/clon limpio, confirma secretos locales, migra, inicia y prueba los GET; ejecuta tus consultas y experimentos. Usa una **base de prueba exclusiva y confirmada** para `dotnet ef database drop --force` seguido de `dotnet ef database update`: debe reconstruir esquema y HasData completos. Nunca ejecutar drop sobre la base de desarrollo del compañero o un destino no confirmado. Verifica que la segunda actualización no duplique datos.

Cruza diccionario/ER/configuración/migraciones y ejecuta la comprobación de cambios pendientes del modelo. Revisa historial de ambos con `git log -- servidor-net`, archivos versionados y .gitignore. Actualiza README y casillas solo con evidencia real. Los cambios a la herramienta de verificación de cierre pertenecen a servidor-net; no crear modificaciones vacías para simular autoría.

Con revisión final de Daniel y autorización de publicación, crea la etiqueta anotada **tarea-3** sobre el commit completo y publica rama/etiqueta. Comprueba que el remoto tiene la misma etiqueta/commit. No etiquetes T3B-01 ni muevas una etiqueta de entrega existente sin acordarlo. Cada uno debe tener también la etiqueta en su repositorio personal de Parte A.

Prepara el texto para Moodle con los **dos enlaces**: proyecto + repositorio personal de quien entrega. No puedes declarar terminada la Parte A de Daniel ni subir archivos a Moodle por él sin autorización. Practiquen defensa individual en otra rama: una columna/CHECK y migración, cambio de proyección y explicación del SQL. Durante la defensa deben estar desactivados asistentes y autocompletado de IA.

Prompt:

> Revisa y completa T3B-08. No marques nada aprobado sin ejecutarlo. Usa exclusivamente una base de prueba confirmada para drop/update; verifica GET, SQL e investigación, ambos autores en servidor-net y ausencia de secretos/bin/obj/.env/node_modules. Actualiza README y estado del plan. Entrega resumen, evidencias reales y pasos con resultados esperados. Prepara commit y comandos de etiqueta tarea-3 sobre el resultado final; solicita la revisión y autorización de publicación antes de publicar. La Parte A y Moodle requieren confirmación independiente, no los declares completos.

## Verificación de los GET antes del handoff

En servidor-net, `node scripts/verify-read-contract.mjs` levanta/cierra Express y MongoDB temporales y el binario .NET contra SQL Server Test. Requiere build Debug, dependencias Express instaladas y las migraciones de Test ya aplicadas; no crea datos SQL ni usa Mongo de desarrollo. Ejecución de referencia: 21 comparaciones aprobadas (14 de requests.http +7 adicionales) y SQL sin columnas privadas ni N+1. No debes reimplementar ese verificador para cumplir tus cuatro consultas SQL: T3B-06 y 07 siguen siendo entregables propios.

Las dos rutas .NET son para **visitante**. No hay autenticación implementada: omitir Authorization al pedir detalle; categorías sigue siendo público. No apuntar todavía React a esta API parcial. Los comandos/esperados completos están en el README .NET.

## Si aparece un defecto o cambia el alcance

Un error de SQL o contrato no se soluciona debilitando la restricción o eliminando campos esperados. Informa el caso reproducible; Daniel corrige su bloque si afecta el handoff. Si ya se compartió una migración aplicada, añade una nueva migración real; no borres el historial para disimular el cambio. Conserva el equipo del proyecto enlazado a la iniciativa, historial por periodos y estimado flexible. Cualquier endpoint nuevo/CRUD/auth pertenece a la entrega final salvo requisito explícito nuevo.

Ambos deben comprender el trabajo del otro. La revisión no es solo aceptar un commit: deben poder explicar por qué la consulta corresponde al contrato, qué garantiza SQL, qué no puede garantizar un CHECK entre filas y cómo reproducir la entrega desde cero.
