using InnovationHub.ServidorNet.Datos;
using Microsoft.EntityFrameworkCore;
using static InnovationHub.ServidorNet.Verificacion.CoreVerification;

namespace InnovationHub.ServidorNet.Verificacion;

internal static class DomainVerification
{
    internal static async Task RunAsync(InnovationHubContext context)
    {
        await CoreVerification.RunAsync(context);
        Require(await context.ParticipationRequests.CountAsync() == 5, "Cinco solicitudes sembradas.");
        Require(await context.Memberships.CountAsync() == 12, "Doce periodos de membresía.");
        Require(await context.MembershipEvents.CountAsync() == 13, "Trece eventos históricos.");
        Require(await context.Projects.CountAsync() == 1, "Un proyecto sembrado.");
        Require(await context.ProjectTechnologies.CountAsync() == 2, "Dos tecnologías sembradas.");
        Require(!await context.ParticipationRequests.Where(x => x.State == "pending")
            .GroupBy(x => new { x.InitiativeId, x.ApplicantId }).AnyAsync(x => x.Count() > 1), "Sin pendientes duplicadas.");
        Require(!await context.Memberships.Where(x => x.State == "active")
            .GroupBy(x => new { x.InitiativeId, x.UserId }).AnyAsync(x => x.Count() > 1), "Sin membresías activas duplicadas.");
        Require(!await context.Memberships.AnyAsync(m => !context.Users.Any(u => u.Id == m.UserId)
            || !context.Initiatives.Any(i => i.Id == m.InitiativeId)), "Sin membresías huérfanas.");
        Require(!await context.MembershipEvents.AnyAsync(e => !context.Memberships.Any(m => m.Id == e.MembershipId)), "Sin eventos huérfanos.");
        var project = await context.Projects.AsNoTracking().Select(p => new
        {
            p.Id, p.SourceInitiativeId, p.SourceInitiative.OwnerId,
            p.SourceInitiative.EstimatedMembers,
            State = p.SourceInitiative.State,
            ActiveCount = p.SourceInitiative.Memberships.Count(m => m.State == "active"),
            RetiredCount = p.SourceInitiative.Memberships.Count(m => m.State == "retired"),
        }).SingleAsync();
        Require(project.ActiveCount == 3 && project.RetiredCount == 1
            && project.EstimatedMembers == 2 && project.State == "converted"
            && Math.Max(0, project.EstimatedMembers - project.ActiveCount) == 0,
            "Proyecto comparte tres activos y un periodo retirado; estimación flexible y espacios cero.");
        var tech = await context.ProjectTechnologies.OrderBy(x => x.Position).Select(x => x.Value).ToListAsync();
        Require(tech.SequenceEqual(new[] { "React", "Node.js" }), "Tecnologías ordenadas.");
        // Logística pertenece a Elena pero no a las competencias requeridas por Accesibilidad.
        var accepted = await context.ParticipationRequests.AsNoTracking()
            .Where(x => x.Id == Guid.Parse("20000000-0000-4000-8000-000000000001"))
            .Select(x => new { InProfile = x.Applicant.UserSkills.Any(s => s.SkillId == x.OfferedSkillId),
                Required = x.Initiative.InitiativeSkills.Any(s => s.SkillId == x.OfferedSkillId) }).SingleAsync();
        Require(accepted.InProfile && !accepted.Required, "Oferta no limitada a competencias requeridas.");
        Console.WriteLine("PASS: dominio completo, 107 filas; proyecto comparte equipo, estimación flexible e historial.");

        await RejectAsync(context, "dos solicitudes pendientes", """
            INSERT ParticipationRequests (Id,InitiativeId,ApplicantId,OfferedSkillId,Message,Role,Availability,State,CreatedAt,UpdatedAt)
            SELECT 'ffffffff-ffff-4fff-8fff-fffffffffff1',InitiativeId,ApplicantId,OfferedSkillId,Message,Role,Availability,State,CreatedAt,UpdatedAt
            FROM ParticipationRequests WHERE Id='20000000-0000-4000-8000-000000000004'
            """, [2601, 2627], "UX_Requests_Pending");
        await RejectAsync(context, "dos periodos activos simultáneos", """
            INSERT Memberships (Id,InitiativeId,UserId,Role,State,JoinedAt)
            SELECT 'ffffffff-ffff-4fff-8fff-fffffffffff1',InitiativeId,UserId,Role,State,JoinedAt
            FROM Memberships WHERE Id='30000000-0000-4000-8000-000000000008'
            """, [2601, 2627], "UX_Memberships_Active");
        await RejectAsync(context, "estado de solicitud inválido", """
            UPDATE ParticipationRequests SET State=N'invalid'
            WHERE Id='20000000-0000-4000-8000-000000000004'
            """, [547], "CK_Requests_State", "CK_Requests_Decision");
        await RejectAsync(context, "aceptación sin fecha de decisión", """
            UPDATE ParticipationRequests SET State=N'accepted'
            WHERE Id='20000000-0000-4000-8000-000000000004'
            """, [547], "CK_Requests_Decision");
        await RejectAsync(context, "retiro sin fecha", """
            UPDATE Memberships SET State=N'retired'
            WHERE Id='30000000-0000-4000-8000-000000000008'
            """, [547], "CK_Memberships_Retirement");
        await RejectAsync(context, "solicitud de origen de otra persona o iniciativa", """
            UPDATE Memberships SET SourceRequestId='20000000-0000-4000-8000-000000000005'
            WHERE Id='30000000-0000-4000-8000-000000000009'
            """, [547], "FK_Memberships_ParticipationRequests_SourceRequestId_InitiativeId_UserId");
        await RejectAsync(context, "una solicitud aceptada no crea dos periodos", """
            INSERT Memberships (Id,InitiativeId,UserId,SourceRequestId,Role,State,JoinedAt,RetiredAt)
            SELECT 'ffffffff-ffff-4fff-8fff-fffffffffff1',InitiativeId,UserId,SourceRequestId,Role,N'retired',JoinedAt,'2026-11-12T12:00:00+00:00'
            FROM Memberships WHERE Id='30000000-0000-4000-8000-000000000009'
            """, [2601, 2627], "IX_Memberships_SourceRequestId_InitiativeId_UserId");
        await RejectAsync(context, "tipo de evento inválido", """
            UPDATE MembershipEvents SET Type=N'deleted'
            WHERE Id='40000000-0000-4000-8000-000000000001'
            """, [547], "CK_MembershipEvents_Type");
        await RejectAsync(context, "actor de evento inexistente", """
            UPDATE MembershipEvents SET ActorId='ffffffff-ffff-4fff-8fff-fffffffffff1'
            WHERE Id='40000000-0000-4000-8000-000000000001'
            """, [547], "FK_MembershipEvents_Users_ActorId");
        await RejectAsync(context, "iniciativa con historia protegida", """
            DELETE Initiatives WHERE Id='10000000-0000-4000-8000-000000000001'
            """, [547], "FK_Memberships_Initiatives_InitiativeId");
        await RejectAsync(context, "periodo con eventos protegido", """
            DELETE Memberships WHERE Id='30000000-0000-4000-8000-000000000012'
            """, [547], "FK_MembershipEvents_Memberships_MembershipId");
        await RejectAsync(context, "segundo proyecto para la misma iniciativa", """
            INSERT Projects (Id,SourceInitiativeId,Name,Description,Objective,State,StartDate,EstimatedEndDate,CreatedAt,UpdatedAt)
            SELECT 'ffffffff-ffff-4fff-8fff-fffffffffff1',SourceInitiativeId,Name,Description,Objective,State,StartDate,EstimatedEndDate,CreatedAt,UpdatedAt
            FROM Projects
            """, [2601, 2627], "IX_Projects_SourceInitiativeId");
        await RejectAsync(context, "estado de proyecto inválido", """
            UPDATE Projects SET State=N'invalid'
            """, [547], "CK_Projects_State");
        await RejectAsync(context, "fecha final anterior al inicio", """
            UPDATE Projects SET EstimatedEndDate='2026-10-31'
            """, [547], "CK_Projects_Calendar");
        await RejectAsync(context, "fecha calendario inexistente", """
            UPDATE Projects SET StartDate='2026-02-30'
            """, [241, 242]);
        await RejectAsync(context, "tecnología repetida por clave normalizada", """
            INSERT ProjectTechnologies (ProjectId,Position,Value,NormalizedValue)
            SELECT Id,2,N'REACT',N'react' FROM Projects
            """, [2601, 2627], "IX_ProjectTechnologies_ProjectId_NormalizedValue");
        await RejectAsync(context, "posición de tecnología fuera del máximo", """
            INSERT ProjectTechnologies (ProjectId,Position,Value,NormalizedValue)
            SELECT Id,20,N'SQL Server',N'sql server' FROM Projects
            """, [547], "CK_ProjectTechnologies_Position");

        await using (var transaction = await context.Database.BeginTransactionAsync())
        {
            await context.Database.ExecuteSqlRawAsync("""
                INSERT ParticipationRequests (Id,InitiativeId,ApplicantId,OfferedSkillId,Message,Role,Availability,State,CreatedAt,UpdatedAt)
                SELECT 'ffffffff-ffff-4fff-8fff-fffffffffff1',InitiativeId,ApplicantId,OfferedSkillId,Message,Role,Availability,N'cancelled',CreatedAt,UpdatedAt
                FROM ParticipationRequests WHERE Id='20000000-0000-4000-8000-000000000004'
                """);
            Require(await context.ParticipationRequests.CountAsync(x => x.InitiativeId == Guid.Parse("10000000-0000-4000-8000-000000000004")
                && x.ApplicantId == Guid.Parse("22222222-2222-4222-8222-222222222222")) == 3,
                "Solicitud anterior rechazada, pendiente y otro intento cancelado coexisten.");
            await transaction.RollbackAsync();
        }
        Console.WriteLine("PASS: solicitudes históricas repetidas permitidas sin perder intentos previos.");

        await using (var transaction = await context.Database.BeginTransactionAsync())
        {
            await context.Database.ExecuteSqlRawAsync("""
                INSERT ParticipationRequests (Id,InitiativeId,ApplicantId,OfferedSkillId,Message,Role,Availability,State,CreatedAt,UpdatedAt,DecidedAt)
                VALUES ('ffffffff-ffff-4fff-8fff-fffffffffff1','10000000-0000-4000-8000-000000000008',
                    '22222222-2222-4222-8222-222222222222','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
                    N'Reincorporación para investigar oportunidades laborales.',N'Investigación laboral',N'medium',N'accepted',
                    '2026-11-12T12:00:00+00:00','2026-11-12T13:00:00+00:00','2026-11-12T13:00:00+00:00');
                INSERT Memberships (Id,InitiativeId,UserId,SourceRequestId,Role,State,JoinedAt)
                VALUES ('ffffffff-ffff-4fff-8fff-fffffffffff2','10000000-0000-4000-8000-000000000008',
                    '22222222-2222-4222-8222-222222222222','ffffffff-ffff-4fff-8fff-fffffffffff1',
                    N'Investigación laboral',N'active','2026-11-12T13:00:00+00:00');
                INSERT MembershipEvents (Id,MembershipId,ActorId,RequestId,Type,OccurredAt)
                VALUES ('ffffffff-ffff-4fff-8fff-fffffffffff3','ffffffff-ffff-4fff-8fff-fffffffffff2',
                    '11111111-1111-4111-8111-111111111111','ffffffff-ffff-4fff-8fff-fffffffffff1',N'joined','2026-11-12T13:00:00+00:00');
                """);
            var updated = await context.Projects.Where(p => p.Id == project.Id).Select(p => new
            {
                State = p.SourceInitiative.State,
                Active = p.SourceInitiative.Memberships.Count(m => m.State == "active"),
            }).SingleAsync();
            Require(updated.Active == 4 && updated.State == "converted", "El proyecto ve la reincorporación sin copiar equipo ni revertir converted.");
            Require(await context.Memberships.AnyAsync(x => x.Id == Guid.Parse("30000000-0000-4000-8000-000000000012")
                && x.State == "retired" && x.RetiredAt != null), "El periodo retirado no fue reactivado ni sobrescrito.");
            Require(await context.MembershipEvents.CountAsync(x => x.MembershipId == Guid.Parse("30000000-0000-4000-8000-000000000012")) == 2,
                "La historia anterior de Luis conserva ingreso y retiro.");
            await transaction.RollbackAsync();
        }
        Console.WriteLine("PASS: reincorporación con otro ID tras conversión; equipo vinculado crece y conserva historia.");
        Require(await context.ParticipationRequests.CountAsync() == 5 && await context.Memberships.CountAsync() == 12
            && await context.MembershipEvents.CountAsync() == 13, "Siembra preservada tras rollback.");
        Console.WriteLine("OK T3B-03: 14 tablas, 107 filas, 17 rechazos adicionales y reincorporación verificada; sin cambios persistentes.");
    }
}
