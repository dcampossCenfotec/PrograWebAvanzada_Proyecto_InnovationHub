using InnovationHub.ServidorNet.Datos;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace InnovationHub.ServidorNet.Verificacion;

// Pruebas reales sobre una base exclusiva. Cada escritura se revierte.
internal static class CoreVerification
{
    internal static void RequireTaskDatabase(InnovationHubContext context)
    {
        var name = context.Database.GetDbConnection().Database;
        if (name is not ("InnovationHub_Tarea3_Dev" or "InnovationHub_Tarea3_Test"))
            throw new InvalidOperationException("Configura una base exclusiva InnovationHub_Tarea3_Dev o InnovationHub_Tarea3_Test en user-secrets.");
        Console.WriteLine($"Destino permitido: {name}. No se ha ejecutado ninguna consulta.");
    }

    internal static async Task RunAsync(InnovationHubContext context)
    {
        RequireTaskDatabase(context);
        var counts = new[]
        {
            ("Users", await context.Users.CountAsync(), 5),
            ("Categories", await context.Categories.CountAsync(), 8),
            ("Skills", await context.Skills.CountAsync(), 10),
            ("Initiatives", await context.Initiatives.CountAsync(), 8),
            ("UserSkills", await context.UserSkills.CountAsync(), 7),
            ("UserInterests", await context.UserInterests.CountAsync(), 7),
            ("InitiativeSkills", await context.InitiativeSkills.CountAsync(), 16),
            ("InitiativeTags", await context.InitiativeTags.CountAsync(), 13),
            ("Sessions", await context.Sessions.CountAsync(), 0),
        };
        foreach (var (name, actual, expected) in counts)
            Require(actual == expected, $"Siembra {name}: esperado {expected}, obtenido {actual}.");
        Console.WriteLine("PASS: siembra completa del núcleo (74 filas, 9 tablas).");

        var garden = Guid.Parse("10000000-0000-4000-8000-000000000001");
        var skillIds = await context.InitiativeSkills.AsNoTracking()
            .Where(x => x.InitiativeId == garden).OrderBy(x => x.Position)
            .Select(x => x.SkillId).ToListAsync();
        Require(skillIds.SequenceEqual(new[]
        {
            Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2"),
            Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa8"),
        }), "Orden de competencias de Huertos escolares.");
        var skills = await context.Initiatives.AsNoTracking().Where(x => x.Id == garden)
            .Select(x => x.Skills.Count).SingleAsync();
        Require(skills == 2, "Navegación M:N real de iniciativa a competencias.");
        var levels = await context.UserSkills.AsNoTracking()
            .Where(x => x.UserId == Guid.Parse("11111111-1111-4111-8111-111111111111"))
            .OrderBy(x => x.Position).Select(x => x.Level).ToListAsync();
        Require(levels.SequenceEqual(new[] { "advanced", "intermediate" }), "Nivel y orden del perfil de Ana.");
        Console.WriteLine("PASS: competencias M:N, nivel y orden persistidos.");

        await RejectAsync(context, "correo duplicado", """
            UPDATE Users SET Email=N'ana.owner@example.test', EmailNormalized=N'ana.owner@example.test'
            WHERE Id='22222222-2222-4222-8222-222222222222'
            """, [2601, 2627], "UX_Users_EmailNormalized");
        await RejectAsync(context, "referencia a propietario inexistente", """
            UPDATE Initiatives SET OwnerId='ffffffff-ffff-4fff-8fff-ffffffffffff'
            WHERE Id='10000000-0000-4000-8000-000000000001'
            """, [547], "FK_Initiatives_Users_OwnerId");
        await RejectAsync(context, "nivel inválido", """
            UPDATE UserSkills SET Level=N'expert'
            WHERE UserId='11111111-1111-4111-8111-111111111111'
            """, [547], "CK_UserSkills_Level");
        await RejectAsync(context, "visibilidad inválida", """
            UPDATE Initiatives SET Visibility=N'unknown'
            WHERE Id='10000000-0000-4000-8000-000000000001'
            """, [547], "CK_Initiatives_Visibility");
        await RejectAsync(context, "enum distingue mayúsculas", """
            UPDATE Initiatives SET Visibility=N'PUBLIC'
            WHERE Id='10000000-0000-4000-8000-000000000001'
            """, [547], "CK_Initiatives_Visibility");
        await RejectAsync(context, "título demasiado largo", """
            UPDATE Initiatives SET Title=REPLICATE(N'x',101)
            WHERE Id='10000000-0000-4000-8000-000000000001'
            """, [2628, 8152]);
        await RejectAsync(context, "título demasiado corto", """
            UPDATE Initiatives SET Title=N'abcd'
            WHERE Id='10000000-0000-4000-8000-000000000001'
            """, [547], "CK_Initiatives_Title");
        await RejectAsync(context, "estimado fuera de rango", """
            UPDATE Initiatives SET EstimatedMembers=0
            WHERE Id='10000000-0000-4000-8000-000000000001'
            """, [547], "CK_Initiatives_EstimatedMembers");
        await RejectAsync(context, "misma competencia duplicada", """
            INSERT UserSkills (UserId, SkillId, Level, Position)
            VALUES ('11111111-1111-4111-8111-111111111111','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',N'basic',2)
            """, [2601, 2627], "PK_UserSkills");
        await RejectAsync(context, "posición repetida", """
            INSERT UserSkills (UserId, SkillId, Level, Position)
            VALUES ('11111111-1111-4111-8111-111111111111','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',N'basic',0)
            """, [2601, 2627], "IX_UserSkills_UserId_Position");
        await RejectAsync(context, "máximo de competencias por posiciones", """
            INSERT UserSkills (UserId, SkillId, Level, Position)
            VALUES ('11111111-1111-4111-8111-111111111111','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',N'basic',20)
            """, [547], "CK_UserSkills_Position");
        await RejectAsync(context, "nombre normalizado de catálogo duplicado", """
            UPDATE Categories SET NameNormalized=N'tecnologia' WHERE Id='education'
            """, [2601, 2627], "IX_Categories_NameNormalized");
        await RejectAsync(context, "interés duplicado por clave normalizada", """
            INSERT UserInterests (UserId, Position, Value, NormalizedValue)
            VALUES ('11111111-1111-4111-8111-111111111111',2,N'EDUCACIÓN',N'educación')
            """, [2601, 2627], "IX_UserInterests_UserId_NormalizedValue");
        await RejectAsync(context, "catálogo referenciado protegido al borrar", """
            DELETE Categories WHERE Id='education'
            """, [547], "FK_Initiatives_Categories_CategoryId");
        await RejectAsync(context, "fechas de sesión incoherentes", """
            INSERT Sessions (Id, UserId, TokenHash, CreatedAt, ExpiresAt)
            VALUES ('ffffffff-ffff-4fff-8fff-ffffffffffff','11111111-1111-4111-8111-111111111111',
                    REPLICATE('a',64),'2026-11-12T12:00:00+00:00','2026-11-11T12:00:00+00:00')
            """, [547], "CK_Sessions_Dates");

        // Un carácter fuera del BMP ocupa dos unidades UTF-16; este título tiene cinco.
        await using (var transaction = await context.Database.BeginTransactionAsync())
        {
            await context.Database.ExecuteSqlRawAsync("""
                UPDATE Initiatives SET Title=N'😀abc'
                WHERE Id='10000000-0000-4000-8000-000000000001'
                """);
            await transaction.RollbackAsync();
        }
        Console.WriteLine("PASS: límite mínimo UTF-16 aceptado sin perder Unicode.");

        await using (var transaction = await context.Database.BeginTransactionAsync())
        {
            var temporary = Guid.NewGuid();
            var email = $"{temporary:N}@example.test";
            await context.Database.ExecuteSqlInterpolatedAsync($"""
                INSERT Users (Id,FirstName,LastName,MemberType,Email,EmailNormalized,Availability,Active,CreatedAt,UpdatedAt)
                VALUES ({temporary},N'Prueba',N'Temporal',N'student',{email},{email},N'low',1,
                        '2026-11-12T12:00:00+00:00','2026-11-12T12:00:00+00:00');
                INSERT UserInterests (UserId,Position,Value,NormalizedValue) VALUES ({temporary},0,N'prueba',N'prueba');
                INSERT UserSkills (UserId,SkillId,Level,Position)
                VALUES ({temporary},'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',N'basic',0);
                DELETE Users WHERE Id={temporary};
                """);
            Require(!await context.UserInterests.AnyAsync(x => x.UserId == temporary)
                && !await context.UserSkills.AnyAsync(x => x.UserId == temporary), "Cascade solo en listas propias.");
            await transaction.RollbackAsync();
        }
        Console.WriteLine("PASS: Cascade elimina listas propias del usuario temporal sin eliminar competencias.");
        Require(await context.Users.CountAsync() == 5 && await context.Skills.CountAsync() == 10
            && await context.Initiatives.Where(x => x.Id == garden).Select(x => x.Title).SingleAsync() == "Huertos escolares",
            "Datos originales conservados tras rollback.");
        Console.WriteLine("OK T3B-02: siembra, M:N, 15 rechazos esperados, Unicode y borrado; cambios revertidos.");
    }

    private static async Task RejectAsync(InnovationHubContext context, string label, string sql,
        int[] numbers, string? constraint = null)
    {
        await using var transaction = await context.Database.BeginTransactionAsync();
        try
        {
            await context.Database.ExecuteSqlRawAsync(sql);
            throw new InvalidOperationException($"No se rechazó: {label}.");
        }
        catch (SqlException error) when (numbers.Contains(error.Number)
            && (constraint is null || error.Message.Contains(constraint, StringComparison.Ordinal)))
        {
            Console.WriteLine($"PASS: {label} rechazado por SQL Server ({error.Number}).");
        }
        finally
        {
            await transaction.RollbackAsync();
        }
    }

    private static void Require(bool condition, string message)
    {
        if (!condition) throw new InvalidOperationException(message);
    }
}
