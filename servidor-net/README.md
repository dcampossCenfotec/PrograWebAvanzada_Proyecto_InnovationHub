# Innovation Hub — servidor .NET de Tarea 3, parte B

Estado: **T3B-02, núcleo relacional y primera migración**. Implementa usuarios, sesiones, catálogos e iniciativas con sus relaciones y HasData. Solicitudes/equipos/proyectos se incorporarán en T3B-03 y los dos GET en T3B-04. Esta API parcial no sustituye Express ni cambia el cliente React. No incluye Swagger porque la consigna no lo exige.

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

## Aplicar y verificar la primera migración

Migración versionada: **InicialUsuariosIniciativas**. Crea el núcleo con FK, índices únicos, CHECK y HasData estático; no usa `EnsureCreated`. El arranque HTTP no aplica migraciones automáticamente.

Dentro de servidor-net, después de confirmar el destino exclusivo:

```sh
dotnet ef database update InicialUsuariosIniciativas -- --environment Development
dotnet ef migrations list -- --environment Development
dotnet ef migrations has-pending-model-changes -- --environment Development
```

Esperado: actualización finaliza con `Done.`, la lista muestra la primera migración aplicada (sin Pending) y no hay cambios de modelo pendientes. Repetir `database update` no duplica la siembra. El prefijo de fecha del archivo de migración lo genera EF en UTC; el nombre lógico es el mostrado arriba.

La base tiene nueve tablas de dominio más `__EFMigrationsHistory`:

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

Son **74 filas sintéticas** sin contraseñas ni sesiones. Las membresías/proyectos de las iniciativas aún no están implementados en este estado intermedio; se completan en 03 antes de los GET. La descripción de columnas, índices, CHECK, cardinalidades y borrado está en la [sección Modelo relacional](../docs/modelo-datos.md#modelo-relacional).

Verificación ejecutable, sin iniciar HTTP:

```sh
dotnet run --no-build --launch-profile http -- --verify-core=true
```

Esperado: comprobaciones PASS de totales, competencias M:N, nivel/orden, **15 rechazos SQL esperados** (duplicados, FK, enums, tamaños, posiciones, borrado y fechas), límite UTF-16 y Cascade en listas propias. Finaliza con `OK T3B-02`. Cada escritura se revierte y se comprueba que no queda alterada la siembra. Ejecutar solo sobre una base exclusiva sin datos añadidos: los totales exactos corresponden a seed limpio.

Esta prueba del núcleo no sustituye `sql/consultas.sql` de Francisco, la segunda migración, los dos GET ni la reconstrucción completa de T3B-05. La reconstrucción destructiva `database drop --force` se incorporará/verificará en 05, sobre base de prueba confirmada; no ejecutarla sobre bases existentes o compartidas.

## Ejecutar el host HTTP actual

```sh
dotnet run --no-build --launch-profile http
```

Esperado: escucha en **http://127.0.0.1:5080**. Por ahora todas las rutas, incluidas `/api/categories` y `/swagger`, devuelven **404**, porque los dos endpoints se incorporan en 04. No se abre la conexión ni se aplica una migración por arrancar el host. Detener con Ctrl+C.

## Organización

- `Program.cs`: host, DI y modos de terminal; todavía sin GET.
- `Modelos/`: nueve entidades; navegaciones y claves públicas.
- `Datos/Configuraciones/`: límites, índices, CHECK, M:N y delete behaviors explícitos.
- `Datos/CoreSeed.cs`: HasData fijo, independiente de JSON/rutas externas en ejecución.
- `Datos/InnovationHubContext.cs`: DbSet y aplicación de configuración/seed.
- `Migrations/`: migración inicial, metadatos y snapshot generados por EF.
- `Verificacion/CoreVerification.cs`: pruebas SQL del núcleo y comprobación de destino.
- `scripts/configure-local-connection.py`: configuración privada asistida de la conexión.
- `.config/dotnet-tools.json`, `global.json`, csproj y lockfile: versiones reproducibles.
- Próximos: segunda migración (03), `requests.http`/GET (04), `sql/consultas.sql` y experimentos de Francisco (06–07).

Plan/criterios/checklists: [Tarea 3, parte B](../docs/tarea3-parte-b.md). Incorporación del compañero: [guía de Francisco](../docs/handoff-francisco-tarea3.md). La fuente PDF ya está [extraída y cacheada](../docs/fuentes/consigna-tarea3.md); no reconvertirla para retomar.
