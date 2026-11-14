# Innovation Hub — servidor .NET de Tarea 3, parte B

Estado: **T3B-04, modelo completo y dos GET públicos compatibles con Express**. Implementa el modelo relacional, dos migraciones/HasData y las lecturas de categorías y detalle de iniciativa para visitantes. La verificación de cierre/handoff corresponde a T3B-05. Esta API parcial no sustituye Express ni cambia el cliente React. No incluye Swagger porque la consigna no lo exige.

## Versiones y compilación

Ejecutar dentro de `servidor-net`. Instalar el SDK **10.0.404**, fijado por `global.json` (el runtime solo no basta). Paquetes EF Core y herramienta local `dotnet-ef`: **10.0.15**. No instalar/actualizar EF globalmente ni cambiar a EF 11.

```sh
dotnet --version
dotnet tool restore
dotnet restore --locked-mode
dotnet build --no-restore --warnaserror
dotnet ef --version
```

Esperado: SDK 10.0.404, herramienta 10.0.15, restauración y compilación sin errores/advertencias. NuGet requiere conexión la primera vez; `packages.lock.json` fija también las dependencias transitivas.

## Configurar SQL Server local y user-secrets

La clave es **`ConnectionStrings:InnovationHub`**. El proyecto tiene el identificador público `UserSecretsId=innovation-hub-servidor-net-tarea3`; ASP.NET Core carga el almacén local automáticamente en **Development**. El valor no pertenece a appsettings, código, .env ni Git.

En el equipo de Daniel existe el contenedor Docker **sqlserver** con puerto `1433:1433`. Antes de conectar:

```sh
docker start sqlserver
docker ps --filter name=sqlserver
```

Esperado: el contenedor aparece en ejecución, con el puerto publicado. No crear otro ni borrar volúmenes para levantarlo. En otro equipo se necesita una instancia propia accesible; el nombre del contenedor no garantiza que exista.

Opción asistida (Python 3, terminal interactiva):

```sh
python3 scripts/configure-local-connection.py
```

Pide usuario (Enter usa `sa`) y contraseña oculta, y guarda la conexión a `127.0.0.1,1433`, base **InnovationHub_Tarea3_Dev**, en user-secrets mediante JSON por stdin. No deja la contraseña en argumentos ni historial de la terminal y no crea/modifica la base. `TrustServerCertificate=True` corresponde solo a esta configuración local de desarrollo.

Si ya tienes una cadena configurada en privado, también puedes usar `dotnet user-secrets set "ConnectionStrings:InnovationHub" "<CADENA_LOCAL>"`. Debe apuntar a una base exclusiva de Tarea 3; no pegar su valor en documentación, capturas ni conversación. Para verla localmente existe `dotnet user-secrets list`, que muestra la contraseña: no compartir esa salida.

Antes de ejecutar migraciones, comprobar el destino sin abrir la conexión:

```sh
dotnet run --no-build --launch-profile http -- --check-sql-target=true
```

Esperado: `Destino permitido: InnovationHub_Tarea3_Dev. No se ha ejecutado ninguna consulta.` También se permite `InnovationHub_Tarea3_Test` para pruebas. Cualquier otro destino se rechaza en este modo; no continuar con una migración si falla. Los comandos EF estándar no incorporan esa protección: comprobar siempre primero el destino.

## Aplicar y verificar las dos migraciones

Migraciones versionadas: **InicialUsuariosIniciativas** (núcleo) y **AgregarSolicitudesEquiposProyectos** (solicitudes, equipos, historia y proyectos). Añaden FK, índices únicos/filtrados, CHECK y HasData estático, sin `EnsureCreated`. La segunda agrega cinco tablas y no modifica ni elimina las filas del núcleo. El arranque HTTP no aplica migraciones automáticamente.

Dentro de servidor-net, después de confirmar el destino exclusivo:

```sh
dotnet ef database update -- --environment Development
dotnet ef migrations list -- --environment Development
dotnet ef migrations has-pending-model-changes -- --environment Development
```

Esperado: actualización finaliza con `Done.`, la lista muestra las dos migraciones aplicadas (sin Pending) y no hay cambios de modelo pendientes. Repetir `database update` no duplica la siembra. El prefijo de fecha del archivo de migración lo genera EF en UTC; el nombre lógico es el mostrado arriba.

La base tiene **14 tablas de dominio**, más `__EFMigrationsHistory`:

| Tabla | Filas HasData |
| --- | ---: |
| Users | 5 |
| Categories | 8 |
| Skills | 10 |
| Initiatives | 8 |
| UserSkills | 7 |
| UserInterests | 7 |
| InitiativeSkills | 16 |
| InitiativeTags | 13 |
| Sessions | 0 |
| ParticipationRequests | 5 |
| Memberships | 12 |
| MembershipEvents | 13 |
| Projects | 1 |
| ProjectTechnologies | 2 |

Son **107 filas sintéticas** sin contraseñas ni sesiones. El núcleo aporta 74 y la segunda etapa 33. Hay 11 membresías activas y una retirada; el proyecto conserva tres activos, un periodo retirado y estimado 2 (espacios calculados cero). El equipo y dueño del proyecto se obtienen de su iniciativa, sin duplicarlos. La descripción de columnas, índices, CHECK, cardinalidades y borrado está en la [sección Modelo relacional](../docs/modelo-datos.md#modelo-relacional).

Verificación del núcleo, sin iniciar HTTP:

```sh
dotnet run --no-build --launch-profile http -- --verify-core=true
```

Esperado: comprobaciones PASS de totales, competencias M:N, nivel/orden, **15 rechazos SQL esperados** (duplicados, FK, enums, tamaños, posiciones, borrado y fechas), límite UTF-16 y Cascade en listas propias. Finaliza con `OK T3B-02`. Cada escritura se revierte y se comprueba que no queda alterada la siembra. Ejecutar solo sobre una base exclusiva sin datos añadidos: los totales exactos corresponden a seed limpio.

Esta prueba del núcleo sigue cubriendo las nueve tablas originales (74 filas). Para el modelo completo, ejecutar además:

```sh
dotnet run --no-build --launch-profile http -- --verify-domain=true
```

Esperado: pasa primero el núcleo y después el dominio completo (107 filas), **17 rechazos adicionales**, intentos históricos permitidos y reincorporación con otro ID tras conversión. Finaliza con `OK T3B-03`. Cada escritura se revierte. La prueba demuestra el modelo SQL; no significa que existan ya endpoints .NET para aceptar solicitudes o convertir proyectos.

Estas pruebas no sustituyen `sql/consultas.sql` de Francisco, los dos GET ni la reconstrucción completa de T3B-05. La reconstrucción destructiva `database drop --force` se incorporará/verificará en 05, sobre base de prueba confirmada; no ejecutarla sobre bases existentes o compartidas.

## Comparar actualización incremental y construcción desde cero

La base Dev contiene la evolución desde el núcleo. Para aplicar ambas migraciones a una base de prueba independiente sin cambiar el secreto, se permite el argumento **`--use-test-database=true`** solo en Development. Cambia únicamente el nombre a **InnovationHub_Tarea3_Test**, conservando el servidor/autenticación privados. Confirmar el destino antes de migrar:

```sh
dotnet run --no-build --launch-profile http -- --check-sql-target=true --use-test-database=true
dotnet ef database update -- --environment Development --use-test-database=true
dotnet run --no-build --launch-profile http -- --verify-domain=true --use-test-database=true
dotnet run --no-build --launch-profile http -- --compare-databases=true
```

Esperado por paso: destino Test permitido; migraciones aplicadas y siembra cargada; `OK T3B-03` sobre Test; comparación con columnas/tipos/nullabilidad, FK/borrado, CHECK, índices, **todos los valores de las 14 tablas y el historial** iguales entre Dev/Test. La comparación es de lectura y no imprime datos ni cadenas. Debe ejecutarse desde la configuración Dev, sin el argumento use-test-database.

Si Test ya existe, update solo aplica lo pendiente: eso **no demuestra por sí solo** que se creó desde cero. No borrar su contenido para forzar una evidencia; comprobar primero su uso. Para comparar la siembra, ambas bases deben estar sin datos añadidos por el usuario. La prueba de reconstrucción destructiva queda para T3B-05 en una base de prueba confirmada.

## Ejecutar el host HTTP actual

```sh
dotnet run --no-build --launch-profile http
```

Esperado: escucha en **http://127.0.0.1:5080**. Los dos GET siguientes responden según contrato. No se aplica una migración por arrancar el host; cada GET consulta SQL Server. Swagger no está implementado. Detener con Ctrl+C.

## Dos GET del contrato (T3B-04)

| Ruta | Resultado |
| --- | --- |
| GET `/api/categories` | 200, `{data:[{id,name}]}`, categorías activas ordenadas por NameNormalized/Id, sin paginación. |
| GET `/api/initiatives/{id}` | 200 para iniciativa pública visible; incluye competencias M:N ordenadas, dueño seguro, etiquetas, fechas UTC, capacidades de visitante, miembros activos y espacios calculados ≥0. |

Para el detalle, institucional/restringida anónima devuelve **401**; privada/borrador/archivada/inexistente **404**; UUID inválido o query no admitida **400**. El mínimo de validación/errores está acotado a estas dos rutas: no se ha construido el middleware ni la capa de validación de la API final.

Consumir el detalle **sin Authorization**: todavía no hay autenticación .NET y cualquier encabezado de ese tipo devuelve 401. No se simula un dueño ni se validan tokens del servidor Express. El catálogo de categorías es público y no intenta autenticar ese encabezado, como Express. Esta fase no sustituye Express ni cambia el cliente React/CORS.

Abrir `requests.http` con un cliente HTTP compatible, o ejecutar la comparación automática que lo usa como fuente de casos. Con HasData limpio se esperan: Huertos (`...001`) 1 miembro/4 espacios; Accesibilidad (`...002`) 2/2; Orientación laboral convertida (`...008`) 3/0, excluyendo al periodo retirado. Cada uno devuelve dos competencias en el orden original; capacidades de edición, borrado, solicitud y conversión en false para visitante.

`Select` limita las columnas; `AsNoTracking` evita rastreo de lecturas y `AsSingleQuery` resuelve las dos listas pequeñas acotadas en una consulta, sin N+1. Las fechas se formatean a milisegundos UTC con Z; System.Text.Json representa Guid como texto canónico. La consulta exitosa filtra visibilidad/estado en SQL. Si no hay resultado, otra proyección mínima de visibilidad/estado decide 401/404 sin cargar contenido privado. Referencias: [proyección eficiente](https://learn.microsoft.com/ef/core/performance/efficient-querying), [consultas asíncronas](https://learn.microsoft.com/ef/core/querying/async).

## Verificación automática del contrato HTTP

Requiere Docker activo, Node compatible con `servidor/package.json`, dependencias Express instaladas, binario .NET compilado y las dos migraciones aplicadas en **InnovationHub_Tarea3_Test**. El secreto local sigue siendo el mismo; el script selecciona Test en memoria. Si faltan dependencias JS, desde servidor-net:

```sh
cd ../servidor
npm ci --cache /private/tmp/innovation-hub-npm-cache
cd ../servidor-net
```

Preparación de .NET y de la base exclusiva (comprobar el nombre antes de update):

```sh
dotnet build --no-restore --warnaserror
dotnet run --no-build --launch-profile http -- --check-sql-target=true --use-test-database=true
dotnet ef database update -- --environment Development --use-test-database=true
node scripts/verify-read-contract.mjs
```

El script levanta MongoDB **8.0.34-noble** temporal, sin volumen y publicado solo en loopback con puerto libre; Express y el binario .NET usan también puertos locales libres. Inserta fixtures sin contraseña para lecturas en una base Mongo temporal (no prueba logins), crea los módulos/controladores/servicios/repositorios reales de Express y consulta .NET contra SQL Server Test. No usa mocks ni cambia bases Mongo de desarrollo.

Ejecuta los **14 casos de requests.http** y siete adicionales: UUID versión/variante incorrecta, UUID con letras mayúsculas inexistente, query repetida/no admitida, precedencia de errores y encabezados de autenticación inválidos. Compara status y JSON completo; comprueba campos privados, fechas, flags, orden, miembros y espacios. Inspecciona las trazas reales del host: una consulta por lectura exitosa, sin columnas privadas ni N+1; los fallos de acceso pueden usar una segunda consulta mínima.

Esperado: **21 comparaciones aprobadas** y `OK T3B-04`. Cierra .NET, Express, conexión Mongo y su propio contenedor mediante finally. No modifica la siembra SQL ni escribe secretos. La primera ejecución puede descargar la imagen Mongo; no requiere ejecutar el compose de desarrollo. El script usa binario Debug `bin/Debug/net10.0/InnovationHub.ServidorNet.dll`, por lo que hay que compilar después de cambiar el código.

## Organización

- `Program.cs`: host, DI, modos de terminal y registro de las dos lecturas públicas.
- `Modelos/`: nueve entidades; navegaciones y claves públicas.
- `Datos/Configuraciones/`: límites, índices, CHECK, M:N y delete behaviors explícitos.
- `Datos/CoreSeed.cs` y `DomainSeed.cs`: HasData fijo, independiente de JSON/rutas externas en ejecución.
- `Datos/InnovationHubContext.cs`: DbSet y aplicación de configuración/seed.
- `Migrations/`: dos migraciones evolutivas reales, metadatos y snapshot generados por EF.
- `Verificacion/`: pruebas SQL del núcleo/dominio, comprobación de destino y comparación incremental/limpia.
- `scripts/configure-local-connection.py`: configuración privada asistida de la conexión.
- `.config/dotnet-tools.json`, `global.json`, csproj y lockfile: versiones reproducibles.
- `Lecturas/PublicReadEndpoints.cs`: Select asíncrono, proyección contractual y controles mínimos de acceso anónimo.
- `requests.http`: 14 casos ejecutables contra el host.
- `scripts/verify-read-contract.mjs`: comparación HTTP/JSON real con Express+MongoDB temporal y .NET+SQL Server Test; controla su limpieza.
- Próximos: cierre/handoff de Daniel (05), `sql/consultas.sql` y experimentos de Francisco (06–07).

Plan/criterios/checklists: [Tarea 3, parte B](../docs/tarea3-parte-b.md). Incorporación del compañero: [guía de Francisco](../docs/handoff-francisco-tarea3.md). La fuente PDF ya está [extraída y cacheada](../docs/fuentes/consigna-tarea3.md); no reconvertirla para retomar.
