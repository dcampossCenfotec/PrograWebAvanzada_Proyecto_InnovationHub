using InnovationHub.ServidorNet.Lecturas;
using Microsoft.Data.SqlClient;
using InnovationHub.ServidorNet.Datos;
using InnovationHub.ServidorNet.Verificacion;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
var verifyCore = builder.Configuration.GetValue<bool>("verify-core");
var verifyDomain = builder.Configuration.GetValue<bool>("verify-domain");
var compareDatabases = builder.Configuration.GetValue<bool>("compare-databases");
var checkTarget = builder.Configuration.GetValue<bool>("check-sql-target");
if (verifyCore || verifyDomain || compareDatabases || checkTarget)
    builder.Logging.AddFilter("Microsoft.EntityFrameworkCore.Database.Command", LogLevel.None);

// Development carga ConnectionStrings:InnovationHub desde user-secrets.
// El arranque HTTP no conecta ni aplica migraciones automáticamente.
var connectionString = builder.Configuration.GetConnectionString("InnovationHub");
// Para probar ambas migraciones desde cero sin cambiar el secreto ni tocar Dev.
if (builder.Configuration.GetValue<bool>("use-test-database"))
{
    if (!builder.Environment.IsDevelopment())
        throw new InvalidOperationException("La selección de base de prueba solo se permite en Development.");
    var testConnection = new SqlConnectionStringBuilder(connectionString);
    if (testConnection.InitialCatalog is not ("InnovationHub_Tarea3_Dev" or "InnovationHub_Tarea3_Test"))
        throw new InvalidOperationException("Configura primero una base exclusiva de Tarea 3 en user-secrets.");
    testConnection.InitialCatalog = "InnovationHub_Tarea3_Test";
    connectionString = testConnection.ConnectionString;
}
builder.Services.AddDbContext<InnovationHubContext>(options => options.UseSqlServer(connectionString));

var app = builder.Build();

// Modos de terminal de verificación; no añaden endpoints a la API.
if (verifyCore || verifyDomain || compareDatabases || checkTarget)
{
    await using var scope = app.Services.CreateAsyncScope();
    var context = scope.ServiceProvider.GetRequiredService<InnovationHubContext>();
    if (compareDatabases) await MigrationComparison.RunAsync(context);
    else if (verifyDomain) await DomainVerification.RunAsync(context);
    else if (verifyCore) await CoreVerification.RunAsync(context);
    else CoreVerification.RequireTaskDatabase(context);
    return;
}

app.MapPublicReads();
await app.RunAsync();
