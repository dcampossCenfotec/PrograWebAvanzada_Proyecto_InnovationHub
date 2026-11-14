using InnovationHub.ServidorNet.Datos;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace InnovationHub.ServidorNet.Verificacion;

// Guardas de terminal: nunca borran ni crean bases. El script invoca EF por separado.
internal static class RebuildVerification
{
    internal const string TestDatabase = "InnovationHub_Tarea3_Test";

    private static void RequireTest(InnovationHubContext context)
    {
        if (context.Database.GetDbConnection().Database != TestDatabase)
            throw new InvalidOperationException("La reconstrucción solo permite InnovationHub_Tarea3_Test; Dev se rechaza.");
    }

    internal static async Task CheckTargetAsync(InnovationHubContext context)
    {
        RequireTest(context);
        // Reutilizar la conexión de EF: al abrirla, SqlClient oculta la contraseña
        // en ConnectionString (Persist Security Info=false). Copiarla después pierde el secreto.
        await context.Database.OpenConnectionAsync();
        try
        {
            await RequireHistoryAsync(context);
            var connection = (SqlConnection)context.Database.GetDbConnection();
            // Detenerse si hay tablas u otros objetos de aplicación ajenos al modelo recibido.
            await using var command = new SqlCommand("""
                SELECT COUNT(*) FROM sys.objects o JOIN sys.schemas s ON s.schema_id=o.schema_id
                WHERE o.is_ms_shipped=0 AND
                  ((o.type='U' AND (s.name<>'dbo' OR o.name NOT IN
                    ('Users','Sessions','Categories','Skills','UserSkills','UserInterests',
                     'Initiatives','InitiativeSkills','InitiativeTags','ParticipationRequests',
                     'Memberships','MembershipEvents','Projects','ProjectTechnologies','__EFMigrationsHistory')))
                   OR o.type IN ('V','P','PC','FN','IF','TF','FS','FT','TR','TA','SN','SO'))
                """, connection);
            CoreVerification.Require(Convert.ToInt32(await command.ExecuteScalarAsync()) == 0,
                "Test no contiene objetos ajenos al modelo; si falla, no ejecutar drop.");
            Console.WriteLine($"REBUILD_TARGET {TestDatabase}");
        }
        finally
        {
            await context.Database.CloseConnectionAsync();
        }
    }

    internal static async Task FingerprintAsync(InnovationHubContext context)
    {
        CoreVerification.RequireTaskDatabase(context);
        await context.Database.OpenConnectionAsync();
        try
        {
            await RequireHistoryAsync(context);
            var connection = (SqlConnection)context.Database.GetDbConnection();
            var fingerprint = await MigrationComparison.FingerprintDatabaseAsync(connection);
            // Solo hash de esquema/filas/historial; no se imprimen valores de filas ni secretos.
            Console.WriteLine($"SNAPSHOT {connection.Database} {fingerprint}");
        }
        finally
        {
            await context.Database.CloseConnectionAsync();
        }
    }

    internal static async Task CheckAbsentAsync(InnovationHubContext context)
    {
        RequireTest(context);
        var builder = new SqlConnectionStringBuilder(context.Database.GetDbConnection().ConnectionString)
        { InitialCatalog = "master" };
        await using var connection = new SqlConnection(builder.ConnectionString);
        await connection.OpenAsync();
        await using var command = new SqlCommand("SELECT DB_ID(@database)", connection);
        command.Parameters.AddWithValue("@database", TestDatabase);
        CoreVerification.Require(await command.ExecuteScalarAsync() is DBNull,
            "Test no existe tras drop ni se crea por iniciar el host sin migraciones.");
        Console.WriteLine($"ABSENT {TestDatabase}");
    }

    private static async Task RequireHistoryAsync(InnovationHubContext context)
    {
        var expected = context.Database.GetMigrations().ToArray();
        var applied = (await context.Database.GetAppliedMigrationsAsync()).ToArray();
        CoreVerification.Require(expected.Length == 2 && expected.SequenceEqual(applied),
            "Las dos migraciones versionadas están aplicadas en orden, sin entradas adicionales.");
    }
}
