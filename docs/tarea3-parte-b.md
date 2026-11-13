# Tarea 3 — parte B: especificación y plan por commits

Fecha de planificación: 11 de noviembre de 2026. Entrega: **domingo 22 de noviembre de 2026, 23:55**. Fuente extraída una sola vez: [`fuentes/consigna-tarea3.md`](fuentes/consigna-tarea3.md), páginas 3–6 y rúbrica 2–8. El PDF original prevalece. Este plan incorpora la decisión del equipo de que Daniel empiece y Francisco trabaje sobre su entrega; no cambia los requisitos del docente.

## Alcance y decisiones

- Parte B en este repositorio, bajo `servidor-net/`. Parte A es individual, en otro repositorio; no se implementa aquí ni se afirma completada.
- .NET 10, EF Core 10, SQL Server, modelo completo del dominio, dos migraciones evolutivas reales, HasData, cuatro consultas SQL, dos GET públicos y una investigación de hasta dos páginas.
- No migrar todo Express, conectar React a esta API parcial ni añadir autenticación/CRUD completo. La implementación final de esos módulos corresponde a la entrega final.
- Daniel dispone del contenedor Docker `sqlserver`, puerto `1433:1433`. Se inició el 12 de noviembre para las pruebas y la conexión quedó configurada privadamente en user-secrets hacia `InnovationHub_Tarea3_Dev`. No se versionaron credenciales ni se modificó otra base.
- SDK `10.0.404`, paquetes EF y herramienta local `10.0.15`; dependencias transitivas en lockfile. Son versiones comprobadas al iniciar este trabajo. Ambos usarán las mismas versiones.
- Secreto `ConnectionStrings:InnovationHub` en user-secrets. Base exclusiva para Tarea 3 y base de prueba independiente para reconstrucciones destructivas. Nunca publicar el valor ni volcar los secretos en evidencias.
- GET elegidos: `/api/categories` y `/api/initiatives/{id}` para visitantes. El detalle público incluye competencias (M:N), propietario, etiquetas, conteo activo y capacidades de visitante; se cotejará con Express. Visibilidad privada/borrador/archivada no se expone. No se implementa una identidad simulada para permitir lecturas privadas.
- Reutilizar IDs y datos sintéticos existentes cuando respeten el modelo; GUID como `uniqueidentifier` en SQL y texto en JSON, categoría como slug. Fechas UTC con formato contractual, fechas calendario sin hora. No devolver columnas internas.
- Mantener las reglas actuales: estimado flexible y espacios no negativos; historial de solicitudes/membresías; una pendiente y una membresía activa por usuario/iniciativa; proyecto enlazado a la iniciativa y su equipo, sin copiar una segunda lista de miembros. No reinterpretar estas reglas para facilitar SQL.
- Cada tarea tiene un autor responsable y el otro revisa. Francisco hará cambios reales en `servidor-net`, con su propia identidad Git. La etiqueta final se crea después de integrar ambos bloques. No se inventan autores, fechas ni evidencia.

## Reparto y orden

| Orden | Tarea/commit | Autor | Revisor | Depende de | Resultado |
| --- | --- | --- | --- | --- | --- |
| 1 | T3B-01 Base y especificación | Daniel | Francisco | — | Proyecto compilable y plan |
| 2 | T3B-02 Núcleo relacional | Daniel | Francisco | 01 | Modelo inicial, HasData y migración 1 |
| 3 | T3B-03 Historia, equipos y proyectos | Daniel | Francisco | 02 | Modelo completo y migración 2 |
| 4 | T3B-04 Dos lecturas compatibles | Daniel | Francisco | 03 | GET, proyecciones y requests.http |
| 5 | T3B-05 Verificación y handoff | Daniel | Francisco | 04, SQL Server real | Reconstrucción probada, contrato verificado y entrega técnica |
| 6 | T3B-06 Consultas SQL | Francisco | Daniel | Handoff 05 aceptado | Cuatro casos SQL ejecutados y resultados esperados |
| 7 | T3B-07 Investigación EF Core | Francisco | Daniel | 05; puede avanzar junto a 06 | Experimentos, SQL real, captura y documento ≤2 páginas |
| 8 | T3B-08 Cierre reproducible | Francisco | Daniel | 06 y 07 | Revisión completa, README final y entrega etiquetable |

Daniel: **5 tareas**. Francisco: **3 tareas**. Son paquetes de trabajo, no una equivalencia de esfuerzo. Francisco no debe esperar a la entrega para instalar SDK/configurar su SQL; ambos deben saber explicar el modelo y las consultas para la defensa individual. No se estiman horas. No comprimir todo en un commit ni fabricar migraciones vacías para completar el número.

## Criterios y trazabilidad

| Rúbrica | Evidencia requerida | Tareas |
| --- | --- | --- |
| 2 Modelo documentado | ER, todas las columnas/PK/FK, cardinalidades, índices, CHECK, borrado, «Del documento a la tabla» | 02–03 |
| 3 Entidades/relaciones | DbContext y clases completos, M:N propia, restricciones aplicadas | 02–03, prueba 05 |
| 4 Migraciones/siembra | Dos etapas reales, HasData suficiente y reconstrucción desde cero | 02–03, 05, revisión 08 |
| 5 Configuración | SDK/EF fijos, user-secrets, instrucciones sin valor del secreto | 01, 05, 08 |
| 6 SQL y GET | Cuatro casos SQL; dos GET idénticos a Express, uno M:N, Select async | 04–06 |
| 7 Investigación | SQL propio, captura, Select/Include/AsNoTracking, M:N con datos, Skip/Take y fuentes oficiales | 07 |
| 8 Historial y entrega | Autores reales en servidor-net, commits progresivos, README, sin artefactos/secretos, tarea-3 en ambos repositorios | Todos, cierre 08 |

La parte B solo aporta su evidencia a la rúbrica 8; la parte A y su etiqueta siguen siendo responsabilidad individual. La defensa (criterios 9–11) exige comprender también lo escrito por el compañero, seguir GET→EF→SQL y practicar cambios en otra rama. El uso de IA está prohibido durante la defensa, según página 6; no confundir esa condición con una prohibición de desarrollo asistido.

## T3B-01 — Base .NET y especificación

Mensaje propuesto: `chore(servidor-net): fijar base .NET 10 y plan de Tarea 3`

Cambios y motivo: crear csproj `net10.0`, global.json, herramienta EF local, lockfile, Program y contexto inicial; configurar DI con SQL Server sin una cadena embebida; perfil Development en puerto 5080. Ignorar bin/obj y artefactos. Conservar la fuente extraída para no reconvertirla. Es una base compilable, todavía sin modelo ni endpoints.

README: enlazar este plan desde la raíz; explicar SDK, restore/build, secreto por nombre y estado real del incremento en `servidor-net/README.md`.

Checklist y pruebas:

- [x] `dotnet --version` dentro de servidor-net devuelve 10.0.404.
- [x] `dotnet tool restore` y `dotnet ef --version` recuperan la versión 10.0.15 local.
- [x] `dotnet restore --locked-mode` y `dotnet build --no-restore` terminan sin errores.
- [x] `dotnet run --no-build --launch-profile http` escucha en 127.0.0.1:5080; una petición GET devuelve 404 porque no hay rutas aún, no se presenta como API terminada.
- [x] El host inicia sin SQL configurado y no crea/modifica bases al arrancar.
- [x] `git diff --check`; bin/obj ignorados; ningún valor de conexión en cambios.

Entregable: infraestructura reproducible para 02. Revisión del compañero: versiones, aislamiento y claridad de estado; no exigir endpoints que pertenecen a 04.

## T3B-02 — Núcleo relacional y primera migración

Mensaje propuesto: `feat(servidor-net): modelar usuarios e iniciativas con primera migracion`

Cambios: entidades/configuraciones para usuarios, sesiones, categorías, competencias e iniciativas; tablas de usuario–competencia con nivel, intereses, iniciativa–competencia y etiquetas. Elegir y documentar tipos SQL, PK/FK, nulabilidad, normalización, orden de listas y reglas de borrado. No guardar arrays como JSON para evitar modelar relaciones. Semilla determinista con HasData; no generar fechas/IDs aleatorios durante la construcción del modelo. Crear y versionar migración **InicialUsuariosIniciativas**, cuando este núcleo sea realmente el estado implementado.

Documentación: iniciar sección «Modelo relacional» en `docs/modelo-datos.md`, con diagrama y diccionario del núcleo. Explicar qué falta de colecciones posteriores y no marcar completo hasta 03. README: comando para aplicar esta primera migración y requisitos de SQL.

Checklist y pruebas:

- [x] ER y entidades/configuración coinciden; nivel y visibilidad tienen CHECK; nombres/correos normalizados tienen unicidad.
- [x] Generar migración con EF, revisar Up/Down y SQL; comprobar ausencia de cadenas/secretos.
- [x] Aplicar **solo migración 1** a una base exclusiva vacía; verificar tablas, PK, FK e índices en SQL Server real.
- [x] Leer HasData: al menos 3 usuarios, 5 competencias, 3 iniciativas de distintas visibilidades y vínculos M:N presentes.
- [x] Intentar en transacciones revertidas: correo duplicado, FK inexistente, nivel/visibilidad inválidos y longitud fuera de límite; esperar rechazo sin alterar la siembra.
- [x] Comprobar orden estable de listas y que colecciones no se duplican en columnas de texto.
- [x] Restaurar/compilar, revisar diff y ausencia de cambios pendientes de modelo después de la migración.

Entregable: primer esquema aplicable de forma independiente, documentado y comprobado. La siguiente migración añadirá funcionalidad real, no renombrados artificiales.

## T3B-03 — Solicitudes, historia, equipos y proyectos

Mensaje propuesto: `feat(servidor-net): incorporar equipos y proyectos con segunda migracion`

Cambios: solicitudes, membresías por periodo, eventos de membresía, proyectos y tecnologías. FK al dueño/solicitante/actor y competencia ofrecida; vínculo único proyecto–iniciativa; equipo del proyecto obtenido a través de su iniciativa, sin duplicar miembros. Índices filtrados para pendiente y miembro activo. CHECK de estados/fechas/estimado; no imponer cupo duro. HasData completa con ≥2 solicitudes y ≥1 proyecto, historial coherente y sin contraseñas. Crear migración **AgregarSolicitudesEquiposProyectos** después de implementar esta etapa.

Documentación: completar ER con todas las tablas, PK/FK, tipos/nulabilidad/índices/CHECK por tabla; cardinalidades requeridas; tabla «Del documento a la tabla» para cada colección y array de Avance 2; comportamiento justificado de **cada FK**. Documentar que TTL de MongoDB no se convierte en TTL SQL y qué reglas entre filas requieren lógica transaccional futura en vez de CHECK imposibles. README: orden de migraciones y totales reales de siembra.

Checklist y pruebas:

- [ ] Aplicar segunda migración sobre la base de 02; los datos anteriores se conservan y aparece el nuevo esquema/seed.
- [ ] En otra base vacía aplicar ambas desde cero y comparar esquema y siembra con la actualización incremental.
- [ ] Detectar con SQL duplicados activos/pendientes y referencias huérfanas: cero resultados.
- [ ] En transacciones revertidas probar duplicado pendiente, duplicado activo, solicitud histórica repetida permitida, estado inválido y FK/borrado protegido.
- [ ] Iniciativa convertida y proyecto comparten el equipo; historial retirado no se cuenta como activo; estimado superado no provoca CHECK de cupo.
- [ ] El diccionario y mapa cubren users, sessions, categories, skills, initiatives, requests, memberships, membershipEvents, projects y todos sus arrays.
- [ ] `dotnet ef migrations list` presenta las dos etapas; `dotnet ef migrations has-pending-model-changes` no detecta diferencias; compila.

Entregable: esquema y datos definitivos de la parte B, con las dos migraciones reales en el historial.

## T3B-04 — Dos GET del contrato

Mensaje propuesto: `feat(servidor-net): proyectar catalogo y detalle publico compatibles con Express`

Cambios: GET `/api/categories` y `/api/initiatives/{id}` con consultas EF asíncronas, cancelación y Select de campos contractuales. Detalle incluye competencias mediante tabla M:N y orden establecido; conteo de miembros activos, availableSpaces ≥0, propietario, etiquetas y flags de visitante. No cargar hashes/correos/sesiones ni serializar entidades/navegaciones completas. Fechas e IDs con representación de Express. requests.http con IDs de la siembra, casos exitosos y negativos de privacidad. Pruebas de contrato con datos equivalentes; no convertir la tarea en construcción del middleware y autenticación final.

README: rutas soportadas, URL/puerto, cómo ejecutar requests.http y límites del acceso anónimo. No apuntar React a la API parcial.

Checklist y pruebas:

- [ ] Catálogo responde 200 y `{data:[...]}` con IDs/nombres y orden idénticos a Express bajo el mismo conjunto de datos.
- [ ] Detalle público responde 200; comparar JSON estructural completo con Express (incluidas listas, nulls, texto de IDs, fechas y capacidades), sin depender del orden de propiedades de un objeto JSON.
- [ ] Skills muestra ≥2 vínculos M:N de la siembra; memberCount ignora retirados y availableSpaces nunca es negativo.
- [ ] ID inexistente/privada/borrador/archivada no expone detalles; institucional/restringida anónima exige sesión como Express. ID inválido se maneja sin provocar 500.
- [ ] No se devuelve ningún dato sensible; sin ciclos JSON y sin asumir que visitante equivale al propietario.
- [ ] Inspeccionar SQL/log: operaciones async, filtros y proyección en SQL; no `ToList` antes de filtrar/paginar ni N+1 por cada competencia.
- [ ] requests.http funciona contra el host real; pruebas de contrato y build aprobados.

Entregable: las únicas dos rutas de negocio de esta fase, reproducibles sin sesión.

## T3B-05 — Reconstrucción, compatibilidad y handoff de Daniel

Mensaje propuesto: `test(servidor-net): verificar reconstruccion y preparar handoff de Tarea 3`

Cambios: verificación reproducible bajo `servidor-net/` (scripts o pruebas de integración apropiadas), validación de reconstrucción y estado del modelo; entregar a Francisco IDs/totales de seed, comandos, rutas, esquema estable y resultados reales. Actualizar el estado de este plan y README, sin atribuir pruebas no ejecutadas a una revisión manual. No incorporar credenciales ni salidas privadas a evidencias.

Checklist y pruebas:

- [ ] Confirmar nombre de base **de prueba exclusiva** antes del procedimiento destructivo; no usar bases de Avance 2 ni bases compartidas.
- [ ] Ejecutar `dotnet ef database drop --force` y `dotnet ef database update` con ese destino; comprobar las dos filas de historial, tablas, restricciones y HasData.
- [ ] Repetir `database update`: no duplica seed. Reiniciar host: GET conserva resultados y no ejecuta migraciones automáticamente.
- [ ] Verificación HTTP completa de 04 con SQL Server real; comparar con Express usando fixtures equivalentes, sin resetear su base de desarrollo.
- [ ] Restauración con lockfile, build y prueba de modelo aprobados; registrar comandos/resultados y limitaciones reales.
- [ ] Handoff enumera rutas/IDs, nombres de tablas/restricciones, datos esperados, qué no tocar, pendientes exactos de Francisco y protocolo para cualquier corrección.
- [ ] Francisco puede reconstruir en su equipo antes de aceptar el handoff; si falla, reportar el fallo concreto y corregir la base antes de iniciar SQL/investigación.

Entregable: bloque Daniel terminado y base verificable para 06/07. No crear todavía la etiqueta final.

## T3B-06 — Cuatro consultas SQL (Francisco)

Mensaje propuesto: `test(servidor-net): comprobar relaciones y restricciones con consultas SQL`

Cambios: escribir `servidor-net/sql/consultas.sql` contra el esquema recibido: JOIN 1:N (propietario–iniciativas), recorrido M:N (usuario–competencia con nivel), GROUP BY con conteos y violación intencional de una restricción concreta. Cada bloque incluye propósito, datos de seed afectados y resultado esperado exacto. Aislar la violación en transacción con TRY/CATCH y rollback para no dejar cambios ni impedir ejecutar los demás bloques; comprobar que falla por la restricción elegida y no por una FK/PK accidental.

README: cómo abrir/ejecutar el archivo contra la base exclusiva y reconocer el rechazo esperado; no mostrar credenciales.

Checklist y pruebas:

- [ ] Ejecutar los cuatro bloques en SQL Server real tras reconstrucción limpia; documentar filas/conteos/error obtenidos.
- [ ] JOIN 1:N devuelve el dueño correcto; M:N muestra nombres y nivel sin duplicar competencias ni perder asociaciones.
- [ ] GROUP BY cuenta la población definida (si son miembros, excluir retirados explícitamente) y maneja iniciativas sin filas relacionadas cuando aplique.
- [ ] El intento inválido se rechaza por la restricción objetivo; rollback conserva totales y datos.
- [ ] Reejecutar archivo completo: mismos resultados y sin transacción abierta; verificar con una segunda consulta que la siembra no cambió.
- [ ] Daniel revisa consultas/resultados y reproduce al menos el JOIN y el rechazo.

Entregable a Daniel: archivo SQL, resultado real verificable y commit propio de Francisco dentro de servidor-net. Si descubre un defecto del modelo, no ajustar el resultado esperado para ocultarlo: corregir con migración adicional real y documentar por qué.

## T3B-07 — Investigación con evidencia propia (Francisco)

Mensaje propuesto: `docs(efcore): comparar proyeccion relaciones y paginacion con evidencia`

Cambios: implementar en `servidor-net/` un modo de experimento o herramienta ejecutable que no añada rutas públicas a la API. Para una misma consulta del proyecto comparar Select e Include, ejecutar y capturar SQL real; explicar AsNoTracking y medir/inspeccionar entidades rastreadas cuando corresponda. Mostrar UserSkill con nivel (entidad intermedia con datos propios) y contrastar con asociación sin datos. Ejecutar Skip/Take con orden estable y desempate por ID; registrar SQL que pagina en SQL Server. Escribir `docs/investigacion-efcore.md`, máximo dos páginas, con SQL relevante, captura auténtica y fuentes oficiales EF Core por respuesta.

README: comando del experimento, base utilizada y ubicación de captura sin secretos. No habilitar logging de datos sensibles. Evidencia voluminosa puede adjuntarse como log/captura enlazada; las tres respuestas deben caber en el documento sin esconderlas fuera para eludir el límite.

Checklist y pruebas:

- [ ] Select e Include consultan las mismas entidades raíz y se comparan resultados equivalentes; el SQL mostrado procede de la ejecución propia, no de una predicción.
- [ ] Explicar qué columnas evita Select, cuándo Include sirve para trabajar con entidades y cuándo AsNoTracking reduce trabajo de lecturas; no afirmar que toda proyección rastrea o que nunca rastrea.
- [ ] M:N con nivel usa la entidad intermedia existente; explicar por qué no almacenar un array/duplicar usuarios.
- [ ] SQL de Skip/Take contiene paginación en servidor; dos páginas ordenadas no se solapan bajo seed estable. No paginar tras materializar con ToList/AsEnumerable.
- [ ] Captura legible de terminal/SQL propio, sin credenciales; fuentes `learn.microsoft.com/ef/core` apoyan cada respuesta.
- [ ] Verificar extensión de dos páginas con presentación/exportación legible; no reducir fuente hasta hacer ilegible la evidencia.
- [ ] Daniel ejecuta el experimento y puede explicar conclusiones; commit contiene el código real de experimentación de Francisco en servidor-net.

Entregable: investigación, evidencia y experimento repetible; no inventar capturas o afirmar manual lo ejecutado automáticamente.

## T3B-08 — Cierre y entrega (Francisco)

Mensaje propuesto: `chore(servidor-net): cerrar entrega reproducible de Tarea 3`

Cambios: revisar instrucciones desde clon limpio, completar README y estado/checklists con resultados reales; corregir el verificador de entrega en `servidor-net/` si corresponde. Revisar contrato/modelo/investigación juntos, historial y artefactos. Preparar contenido del .txt para Moodle con el enlace del proyecto y el enlace del repositorio personal de cada integrante (cada uno entrega su propia Parte A).

Checklist y pruebas:

- [ ] Desde clon/carpeta limpia: SDK exacto, herramienta local, restore locked, build, secreto local, migraciones y GET; sin depender de un binario o archivo privado previo.
- [ ] Repetir en base exclusiva el proceso de reconstrucción; ejecutar consultas SQL y experimento de investigación; registrar resultados reales.
- [ ] Verificar todas las tablas/arrays, cardinalidades, constraints y FK entre documentación y modelo final; ninguna diferencia pendiente del modelo.
- [ ] Revisar `git status`, `git diff --check`, archivos versionados y `.gitignore`: sin bin/obj, .env, node_modules, secretos ni capturas que los expongan.
- [ ] `git log -- servidor-net` muestra contribuciones reales de Daniel y Francisco; no cambiar identidades ni fechas para simular cumplimiento.
- [ ] Revisión final de Daniel aprobada. Crear etiqueta anotada **tarea-3** sobre el commit completo entregado y publicar commit/etiqueta tras autorización de publicación; comprobar que el remoto apunta al mismo commit. No mover una etiqueta ya entregada sin acordarlo.
- [ ] Cada integrante confirma etiqueta tarea-3 en su repositorio personal y enlaces del .txt. No afirmar completa la Parte A desde este repositorio.
- [ ] Practicar defensa: GET→proyección→SQL→respuesta; PK/FK/CHECK/M:N; una migración nueva en rama aparte, sin alterar etiqueta de entrega. Desactivar asistentes durante defensa.

Entregable final: repositorio del proyecto etiquetado, texto de enlaces preparado y procedimiento reproducible. La subida a Moodle no se realiza automáticamente.

## Guía de incorporación de Francisco

La [guía de Francisco para Tarea 3](handoff-francisco-tarea3.md) explica el entorno, organización documental, recepción de T3B-05, sus tres commits, pruebas, resultados esperados, prompts y cierre. La guía se crea ahora; no implica que Daniel haya completado el handoff técnico.

## Estado real y protocolo de continuación

T3B-01 registrado como `3731609`, sin push. **T3B-02 implementado y verificado contra SQL Server real el 12 de noviembre de 2026; pendiente de revisión de Daniel y commit/push**. T3B-03–08 pendientes. Existe una migración aplicada con el núcleo; todavía no hay GET, equipos/proyectos ni segunda migración. Las casillas se marcan solo tras comprobar cada resultado. Las notas de T3B-01 siguientes son evidencia histórica de ese incremento, no el estado operativo de T3B-02.

Verificación ejecutada de T3B-01:

- SDK: 10.0.404; herramienta local EF: 10.0.15.
- `dotnet tool restore`, restauración inicial y `dotnet restore --locked-mode`: aprobados. Lockfile: 47 dependencias, referencias EF directas 10.0.15.
- `dotnet build --no-restore --warnaserror`: aprobado, 0 errores y 0 advertencias.
- Host temporal en Development, puerto 5080: inició sin configurar una conexión SQL en este incremento; GET `/api/categories` devolvió HTTP 404; host detenido limpiamente al terminar. No se ejecutaron migraciones ni comandos sobre bases de datos.
- Enlaces locales revisados; `git diff --check` aprobado; bin/obj ignorados. No se añadieron valores de conexión ni secretos a los cambios.
- Inspección limitada de Docker: contenedor `sqlserver` detenido, puerto configurado 1433:1433. No se consultaron variables de entorno/credenciales.

Verificación ejecutada de T3B-02 (12 de noviembre, hora de Costa Rica):

- Build estricto aprobado con 0 errores/advertencias. Durante el desarrollo el analizador señaló SQL interpolado y nombres de tupla inconsistentes en el verificador; se sustituyeron por conteos LINQ y tuplas uniformes, sin desactivar analizadores.
- Primera migración generada por EF: `20261113021734_InicialUsuariosIniciativas` (prefijo UTC); Up/Down/snapshot revisados. Contiene 9 tablas, 9 FK, 37 CHECK y 16 índices secundarios, además de sus PK.
- Destino exclusivo confirmado mediante `--check-sql-target=true`; EF creó `InnovationHub_Tarea3_Dev` y aplicó la migración con HasData: 74 filas sintéticas; sin contraseñas/sesiones sembradas. No se usó EnsureCreated ni se ejecutó drop.
- `--verify-core=true`: seed exacto, competencias M:N, nivel/orden, 15 rechazos SQL esperados, título con carácter fuera del BMP y cascada limitada aprobados. Todas las escrituras revertidas; datos originales conservados.
- `migrations has-pending-model-changes`: sin cambios pendientes. Actualización repetida sin migraciones pendientes; historial consultado. Restore locked y verificador repetidos después: siguen las 74 filas, sin duplicados ni cambios persistentes.
- Arranque HTTP probado después de incorporar los modos de terminal: escucha en 5080 y `/api/categories` responde 404 esperado; host temporal detenido. Base SQL y contenedor quedan disponibles para la revisión local.
- Se actualizó la sección Modelo relacional con ER, columnas, unicidad/CHECK, las nueve FK con borrado y mapa documental. Tablas restantes explícitamente pendientes de 03. Guía de Francisco y README enlazados al estado real.

Antes de cada commit/push: resumir cambios, indicar pasos de prueba con **resultado esperado en cada paso** y distinguir pruebas ejecutadas de pendientes. El mensaje de commit se ajustará al cambio final. No continuar acumulando otros incrementos sin el punto de revisión acordado con Daniel. Para retomar: leer este documento, el README de servidor-net y el estado Git; usar la extracción cacheada, sin reconvertir el PDF.
