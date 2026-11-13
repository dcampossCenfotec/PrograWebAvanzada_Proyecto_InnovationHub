# Innovation Hub — servidor .NET de Tarea 3, parte B

Estado de T3B-01: host y configuración; todavía sin entidades, migraciones ni rutas GET. El contexto vacío es temporal. Este proyecto no sustituye el servidor Express durante Tarea 3.

## Requisitos y restauración

Ejecutar dentro de `servidor-net`. Instalar el SDK **10.0.404**, fijado por `global.json` (no basta instalar el runtime). EF Core y la herramienta local `dotnet-ef` usan **10.0.15**. No hace falta instalar `dotnet-ef` globalmente.

```sh
dotnet --version
dotnet tool restore
dotnet restore --locked-mode
dotnet build --no-restore
dotnet ef --version
```

Esperado: SDK `10.0.404`, herramienta `10.0.15`, compilación sin errores. La restauración necesita acceso a NuGet la primera vez. `packages.lock.json` fija también las dependencias transitivas.

## Configuración local de SQL Server

La clave es **`ConnectionStrings:InnovationHub`**, dentro del almacén local de user-secrets del proyecto (`UserSecretsId` público: `innovation-hub-servidor-net-tarea3`). En Development, ASP.NET Core la carga automáticamente. Nunca agregar el valor a `appsettings.json`, `.env`, código, capturas, comandos documentados con credenciales reales ni archivos versionados.

Plantilla para configurar en la terminal local; sustituir el marcador en privado:

```sh
dotnet user-secrets set "ConnectionStrings:InnovationHub" "<CADENA_LOCAL_PARA_UNA_BASE_EXCLUSIVA_DE_TAREA3>"
```

No compartir la salida de `dotnet user-secrets list`. Usar una base exclusiva para esta tarea y otra para pruebas destructivas. Las migraciones y reconstrucción se documentarán al existir (T3B-02/03/05); en T3B-01 no se debe ejecutar `database drop` ni afirmar que existe un modelo SQL implementado.

## Ejecutar el incremento actual

```sh
dotnet run --no-build --launch-profile http
```

Escucha en `http://127.0.0.1:5080`. Por ahora toda URL, incluida `/api/categories`, responde **404**: aún no hay endpoints. Iniciar el host no abre SQL Server ni aplica migraciones. Detener con Ctrl+C.

## Organización y siguientes incrementos

- `Program.cs`: host, configuración e inyección del contexto.
- `Datos/InnovationHubContext.cs`: contexto; modelo y HasData pendientes.
- `.config/dotnet-tools.json`: herramienta EF local con versión fija.
- `Properties/launchSettings.json`: perfil de desarrollo, puerto y entorno; sin secretos.
- `global.json`, `.csproj`, `packages.lock.json`: SDK y dependencias reproducibles.
- Próximos directorios: `Modelos/`, `Migrations/`, `sql/`; archivo `requests.http`.

Responsables, checklist, criterios y pruebas de cada commit: [`../docs/tarea3-parte-b.md`](../docs/tarea3-parte-b.md). Las instrucciones manuales específicas se entregan también en la conversación antes de pedir aprobación de cada incremento.

Incorporación del compañero: [guía de Francisco — Tarea 3](../docs/handoff-francisco-tarea3.md).
