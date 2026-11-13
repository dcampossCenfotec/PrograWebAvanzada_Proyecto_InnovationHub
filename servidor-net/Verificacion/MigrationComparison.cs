using System.Security.Cryptography;
using System.Text;
using InnovationHub.ServidorNet.Datos;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace InnovationHub.ServidorNet.Verificacion;

// Compara actualización incremental (Dev) con aplicación desde cero (Test).
// Solo lectura; no crea, elimina ni vacía bases y no imprime datos ni secretos.
internal static class MigrationComparison
{
    private static readonly string[] Tables =
    [
        "Categories", "Skills", "Users", "Sessions", "UserSkills", "UserInterests",
        "Initiatives", "InitiativeSkills", "InitiativeTags", "ParticipationRequests",
        "Memberships", "MembershipEvents", "Projects", "ProjectTechnologies", "__EFMigrationsHistory",
    ];

    private static readonly string[] SchemaQueries =
    [
        """
        SELECT t.name AS [Table],c.name AS [Column],c.column_id,ty.name AS [Type],
               c.max_length,c.precision,c.scale,c.is_nullable,c.is_identity,c.is_computed,c.collation_name,
               dc.definition AS [Default]
        FROM sys.tables t JOIN sys.columns c ON c.object_id=t.object_id
        JOIN sys.types ty ON ty.user_type_id=c.user_type_id
        LEFT JOIN sys.default_constraints dc ON dc.object_id=c.default_object_id
        WHERE t.is_ms_shipped=0 ORDER BY t.name,c.column_id
        FOR JSON PATH,INCLUDE_NULL_VALUES
        """,
        """
        SELECT t.name AS [Table],f.name,c.name AS [Column],rt.name AS [Principal],rc.name AS [Reference],
               fc.constraint_column_id,f.delete_referential_action_desc,f.update_referential_action_desc,f.is_disabled,f.is_not_trusted
        FROM sys.foreign_keys f JOIN sys.tables t ON t.object_id=f.parent_object_id
        JOIN sys.tables rt ON rt.object_id=f.referenced_object_id
        JOIN sys.foreign_key_columns fc ON fc.constraint_object_id=f.object_id
        JOIN sys.columns c ON c.object_id=t.object_id AND c.column_id=fc.parent_column_id
        JOIN sys.columns rc ON rc.object_id=rt.object_id AND rc.column_id=fc.referenced_column_id
        ORDER BY t.name,f.name,fc.constraint_column_id FOR JSON PATH,INCLUDE_NULL_VALUES
        """,
        """
        SELECT t.name AS [Table],ch.name,ch.definition,ch.is_disabled,ch.is_not_trusted
        FROM sys.check_constraints ch JOIN sys.tables t ON t.object_id=ch.parent_object_id
        ORDER BY t.name,ch.name FOR JSON PATH,INCLUDE_NULL_VALUES
        """,
        """
        SELECT t.name AS [Table],i.name,i.is_unique,i.is_primary_key,i.is_unique_constraint,
               i.filter_definition,c.name AS [Column],ic.key_ordinal,ic.is_descending_key,ic.is_included_column
        FROM sys.indexes i JOIN sys.tables t ON t.object_id=i.object_id
        JOIN sys.index_columns ic ON ic.object_id=t.object_id AND ic.index_id=i.index_id
        JOIN sys.columns c ON c.object_id=t.object_id AND c.column_id=ic.column_id
        WHERE t.is_ms_shipped=0 AND i.name IS NOT NULL
        ORDER BY t.name,i.name,ic.index_column_id FOR JSON PATH,INCLUDE_NULL_VALUES
        """,
    ];

    internal static async Task RunAsync(InnovationHubContext context)
    {
        CoreVerification.RequireTaskDatabase(context);
        var builder = new SqlConnectionStringBuilder(context.Database.GetDbConnection().ConnectionString);
        if (builder.InitialCatalog != "InnovationHub_Tarea3_Dev")
            throw new InvalidOperationException("Ejecuta la comparación desde la configuración Dev, sin --use-test-database.");
        await using var incremental = new SqlConnection(builder.ConnectionString);
        builder.InitialCatalog = "InnovationHub_Tarea3_Test";
        await using var clean = new SqlConnection(builder.ConnectionString);
        await incremental.OpenAsync();
        await clean.OpenAsync();
        foreach (var sql in SchemaQueries)
            CoreVerification.Require(await FingerprintAsync(incremental, sql) == await FingerprintAsync(clean, sql),
                "El esquema incremental y el esquema limpio difieren.");
        Console.WriteLine("PASS: columnas, tipos, nulabilidad, FK/borrado, CHECK e índices idénticos en Dev y Test.");
        foreach (var table in Tables)
        {
            // Identificadores procedentes exclusivamente de esta lista cerrada.
            var order = table switch
            {
                "UserSkills" => "[UserId],[SkillId]",
                "UserInterests" => "[UserId],[Position]",
                "InitiativeSkills" => "[InitiativeId],[SkillId]",
                "InitiativeTags" => "[InitiativeId],[Position]",
                "ProjectTechnologies" => "[ProjectId],[Position]",
                "__EFMigrationsHistory" => "[MigrationId]",
                _ => "[Id]",
            };
            var sql = $"SELECT * FROM [dbo].[{table}] ORDER BY {order} FOR JSON PATH,INCLUDE_NULL_VALUES";
            CoreVerification.Require(await FingerprintAsync(incremental, sql) == await FingerprintAsync(clean, sql),
                $"Diferencias de datos en {table}; usa siembra limpia sin datos adicionales.");
        }
        Console.WriteLine("OK T3B-03: siembra completa e historial de migraciones idénticos tras ambas rutas de construcción.");
    }

    private static async Task<string> FingerprintAsync(SqlConnection connection, string sql)
    {
        await using var command = new SqlCommand(sql, connection);
        await using var reader = await command.ExecuteReaderAsync();
        var content = new StringBuilder();
        // SQL Server puede dividir FOR JSON en varias filas; compararlas todas.
        while (await reader.ReadAsync()) content.Append(reader.GetString(0));
        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(content.ToString())));
    }
}
