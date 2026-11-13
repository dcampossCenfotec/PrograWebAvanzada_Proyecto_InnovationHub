using InnovationHub.ServidorNet.Datos;
using InnovationHub.ServidorNet.Verificacion;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
var verifyCore = builder.Configuration.GetValue<bool>("verify-core");
var checkTarget = builder.Configuration.GetValue<bool>("check-sql-target");
if (verifyCore || checkTarget)
    builder.Logging.AddFilter("Microsoft.EntityFrameworkCore.Database.Command", LogLevel.None);

// Development carga ConnectionStrings:InnovationHub desde user-secrets.
// El arranque HTTP no conecta ni aplica migraciones automáticamente.
builder.Services.AddDbContext<InnovationHubContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("InnovationHub")));

var app = builder.Build();

// Modos de terminal de verificación; no añaden endpoints a la API.
if (verifyCore || checkTarget)
{
    await using var scope = app.Services.CreateAsyncScope();
    var context = scope.ServiceProvider.GetRequiredService<InnovationHubContext>();
    if (verifyCore) await CoreVerification.RunAsync(context);
    else CoreVerification.RequireTaskDatabase(context);
    return;
}

// T3B-04 incorporará las dos rutas de lectura del contrato del Avance 2.
await app.RunAsync();
