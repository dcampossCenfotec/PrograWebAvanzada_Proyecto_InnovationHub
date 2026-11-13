using System.Globalization;
using InnovationHub.ServidorNet.Modelos;
using Microsoft.EntityFrameworkCore;

namespace InnovationHub.ServidorNet.Datos;

// IDs y fechas deterministas de fixtures; sin credenciales ni lectura JSON en ejecución.
internal static class DomainSeed
{
    internal static void Configure(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ParticipationRequest>().HasData(
            new
            {
                Id = Guid.Parse("20000000-0000-4000-8000-000000000001"),
                InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000002"),
                ApplicantId = Guid.Parse("55555555-5555-4555-8555-555555555555"),
                Message = "Puedo coordinar los levantamientos y organizar las visitas semanales.",
                OfferedSkillId = Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5"),
                Role = "Coordinación logística",
                Availability = "high",
                State = "accepted",
                DecisionComment = "Bienvenida al equipo de accesibilidad.",
                CreatedAt = DateTimeOffset.Parse("2026-10-21T10:00:00.000Z", CultureInfo.InvariantCulture),
                UpdatedAt = DateTimeOffset.Parse("2026-10-22T10:00:00.000Z", CultureInfo.InvariantCulture),
                DecidedAt = DateTimeOffset.Parse("2026-10-22T10:00:00.000Z", CultureInfo.InvariantCulture),
            },
            new
            {
                Id = Guid.Parse("20000000-0000-4000-8000-000000000002"),
                InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000005"),
                ApplicantId = Guid.Parse("22222222-2222-4222-8222-222222222222"),
                Message = "Puedo apoyar la comunicación con organizaciones y posibles donantes.",
                OfferedSkillId = Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4"),
                Role = "Comunicación con donantes",
                Availability = "medium",
                State = "cancelled",
                DecisionComment = (string?)null,
                CreatedAt = DateTimeOffset.Parse("2026-10-22T10:00:00.000Z", CultureInfo.InvariantCulture),
                UpdatedAt = DateTimeOffset.Parse("2026-10-23T10:00:00.000Z", CultureInfo.InvariantCulture),
                DecidedAt = (DateTimeOffset?)null,
            },
            new
            {
                Id = Guid.Parse("20000000-0000-4000-8000-000000000003"),
                InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000004"),
                ApplicantId = Guid.Parse("22222222-2222-4222-8222-222222222222"),
                Message = "Quiero preparar materiales para las sesiones de mentoría tecnológica.",
                OfferedSkillId = Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4"),
                Role = "Preparación de materiales",
                Availability = "medium",
                State = "rejected",
                DecisionComment = "El primer ciclo ya tenía cubierta esta función.",
                CreatedAt = DateTimeOffset.Parse("2026-10-23T10:00:00.000Z", CultureInfo.InvariantCulture),
                UpdatedAt = DateTimeOffset.Parse("2026-10-24T10:00:00.000Z", CultureInfo.InvariantCulture),
                DecidedAt = DateTimeOffset.Parse("2026-10-24T10:00:00.000Z", CultureInfo.InvariantCulture),
            },
            new
            {
                Id = Guid.Parse("20000000-0000-4000-8000-000000000004"),
                InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000004"),
                ApplicantId = Guid.Parse("22222222-2222-4222-8222-222222222222"),
                Message = "Ahora puedo apoyar la investigación y seguimiento de cada mentoría.",
                OfferedSkillId = Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3"),
                Role = "Seguimiento de mentorías",
                Availability = "medium",
                State = "pending",
                DecisionComment = (string?)null,
                CreatedAt = DateTimeOffset.Parse("2026-10-26T10:00:00.000Z", CultureInfo.InvariantCulture),
                UpdatedAt = DateTimeOffset.Parse("2026-10-26T10:00:00.000Z", CultureInfo.InvariantCulture),
                DecidedAt = (DateTimeOffset?)null,
            },
            new
            {
                Id = Guid.Parse("20000000-0000-4000-8000-000000000005"),
                InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000008"),
                ApplicantId = Guid.Parse("33333333-3333-4333-8333-333333333333"),
                Message = "Puedo revisar materiales y realizar entrevistas de práctica con participantes.",
                OfferedSkillId = Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3"),
                Role = "Mentoría de entrevistas",
                Availability = "low",
                State = "accepted",
                DecisionComment = (string?)null,
                CreatedAt = DateTimeOffset.Parse("2026-10-25T11:00:00.000Z", CultureInfo.InvariantCulture),
                UpdatedAt = DateTimeOffset.Parse("2026-10-26T11:00:00.000Z", CultureInfo.InvariantCulture),
                DecidedAt = DateTimeOffset.Parse("2026-10-26T11:00:00.000Z", CultureInfo.InvariantCulture),
            }
        );
        modelBuilder.Entity<Membership>().HasData(
            new
            {
                Id = Guid.Parse("30000000-0000-4000-8000-000000000001"),
                InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000001"),
                UserId = Guid.Parse("11111111-1111-4111-8111-111111111111"),
                Role = "Propietaria",
                State = "active",
                JoinedAt = DateTimeOffset.Parse("2026-10-20T14:00:00.000Z", CultureInfo.InvariantCulture),
                RetiredAt = (DateTimeOffset?)null,
                SourceRequestId = (Guid?)null,
            },
            new
            {
                Id = Guid.Parse("30000000-0000-4000-8000-000000000002"),
                InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000002"),
                UserId = Guid.Parse("11111111-1111-4111-8111-111111111111"),
                Role = "Propietaria",
                State = "active",
                JoinedAt = DateTimeOffset.Parse("2026-10-20T15:00:00.000Z", CultureInfo.InvariantCulture),
                RetiredAt = (DateTimeOffset?)null,
                SourceRequestId = (Guid?)null,
            },
            new
            {
                Id = Guid.Parse("30000000-0000-4000-8000-000000000003"),
                InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000003"),
                UserId = Guid.Parse("11111111-1111-4111-8111-111111111111"),
                Role = "Propietaria",
                State = "active",
                JoinedAt = DateTimeOffset.Parse("2026-10-20T16:00:00.000Z", CultureInfo.InvariantCulture),
                RetiredAt = (DateTimeOffset?)null,
                SourceRequestId = (Guid?)null,
            },
            new
            {
                Id = Guid.Parse("30000000-0000-4000-8000-000000000004"),
                InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000004"),
                UserId = Guid.Parse("11111111-1111-4111-8111-111111111111"),
                Role = "Propietaria",
                State = "active",
                JoinedAt = DateTimeOffset.Parse("2026-10-21T14:00:00.000Z", CultureInfo.InvariantCulture),
                RetiredAt = (DateTimeOffset?)null,
                SourceRequestId = (Guid?)null,
            },
            new
            {
                Id = Guid.Parse("30000000-0000-4000-8000-000000000005"),
                InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000005"),
                UserId = Guid.Parse("11111111-1111-4111-8111-111111111111"),
                Role = "Propietaria",
                State = "active",
                JoinedAt = DateTimeOffset.Parse("2026-10-21T15:00:00.000Z", CultureInfo.InvariantCulture),
                RetiredAt = (DateTimeOffset?)null,
                SourceRequestId = (Guid?)null,
            },
            new
            {
                Id = Guid.Parse("30000000-0000-4000-8000-000000000006"),
                InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000006"),
                UserId = Guid.Parse("11111111-1111-4111-8111-111111111111"),
                Role = "Propietaria",
                State = "active",
                JoinedAt = DateTimeOffset.Parse("2026-10-22T14:00:00.000Z", CultureInfo.InvariantCulture),
                RetiredAt = (DateTimeOffset?)null,
                SourceRequestId = (Guid?)null,
            },
            new
            {
                Id = Guid.Parse("30000000-0000-4000-8000-000000000007"),
                InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000007"),
                UserId = Guid.Parse("11111111-1111-4111-8111-111111111111"),
                Role = "Propietaria",
                State = "active",
                JoinedAt = DateTimeOffset.Parse("2026-10-22T15:00:00.000Z", CultureInfo.InvariantCulture),
                RetiredAt = (DateTimeOffset?)null,
                SourceRequestId = (Guid?)null,
            },
            new
            {
                Id = Guid.Parse("30000000-0000-4000-8000-000000000008"),
                InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000008"),
                UserId = Guid.Parse("11111111-1111-4111-8111-111111111111"),
                Role = "Propietaria",
                State = "active",
                JoinedAt = DateTimeOffset.Parse("2026-10-23T14:00:00.000Z", CultureInfo.InvariantCulture),
                RetiredAt = (DateTimeOffset?)null,
                SourceRequestId = (Guid?)null,
            },
            new
            {
                Id = Guid.Parse("30000000-0000-4000-8000-000000000009"),
                InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000002"),
                UserId = Guid.Parse("55555555-5555-4555-8555-555555555555"),
                Role = "Coordinación logística",
                State = "active",
                JoinedAt = DateTimeOffset.Parse("2026-10-22T10:00:00.000Z", CultureInfo.InvariantCulture),
                RetiredAt = (DateTimeOffset?)null,
                SourceRequestId = Guid.Parse("20000000-0000-4000-8000-000000000001"),
            },
            new
            {
                Id = Guid.Parse("30000000-0000-4000-8000-000000000010"),
                InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000008"),
                UserId = Guid.Parse("55555555-5555-4555-8555-555555555555"),
                Role = "Coordinación de talleres",
                State = "active",
                JoinedAt = DateTimeOffset.Parse("2026-10-24T10:00:00.000Z", CultureInfo.InvariantCulture),
                RetiredAt = (DateTimeOffset?)null,
                SourceRequestId = (Guid?)null,
            },
            new
            {
                Id = Guid.Parse("30000000-0000-4000-8000-000000000011"),
                InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000008"),
                UserId = Guid.Parse("33333333-3333-4333-8333-333333333333"),
                Role = "Mentoría de entrevistas",
                State = "active",
                JoinedAt = DateTimeOffset.Parse("2026-10-26T11:00:00.000Z", CultureInfo.InvariantCulture),
                RetiredAt = (DateTimeOffset?)null,
                SourceRequestId = Guid.Parse("20000000-0000-4000-8000-000000000005"),
            },
            new
            {
                Id = Guid.Parse("30000000-0000-4000-8000-000000000012"),
                InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000008"),
                UserId = Guid.Parse("22222222-2222-4222-8222-222222222222"),
                Role = "Investigación laboral",
                State = "retired",
                JoinedAt = DateTimeOffset.Parse("2026-10-24T12:00:00.000Z", CultureInfo.InvariantCulture),
                RetiredAt = DateTimeOffset.Parse("2026-10-27T12:00:00.000Z", CultureInfo.InvariantCulture),
                SourceRequestId = (Guid?)null,
            }
        );
        modelBuilder.Entity<MembershipEvent>().HasData(
            new
            {
                Id = Guid.Parse("40000000-0000-4000-8000-000000000001"),
                MembershipId = Guid.Parse("30000000-0000-4000-8000-000000000001"),
                Type = "joined",
                OccurredAt = DateTimeOffset.Parse("2026-10-20T14:00:00.000Z", CultureInfo.InvariantCulture),
                ActorId = Guid.Parse("11111111-1111-4111-8111-111111111111"),
                RequestId = (Guid?)null,
            },
            new
            {
                Id = Guid.Parse("40000000-0000-4000-8000-000000000002"),
                MembershipId = Guid.Parse("30000000-0000-4000-8000-000000000002"),
                Type = "joined",
                OccurredAt = DateTimeOffset.Parse("2026-10-20T15:00:00.000Z", CultureInfo.InvariantCulture),
                ActorId = Guid.Parse("11111111-1111-4111-8111-111111111111"),
                RequestId = (Guid?)null,
            },
            new
            {
                Id = Guid.Parse("40000000-0000-4000-8000-000000000003"),
                MembershipId = Guid.Parse("30000000-0000-4000-8000-000000000003"),
                Type = "joined",
                OccurredAt = DateTimeOffset.Parse("2026-10-20T16:00:00.000Z", CultureInfo.InvariantCulture),
                ActorId = Guid.Parse("11111111-1111-4111-8111-111111111111"),
                RequestId = (Guid?)null,
            },
            new
            {
                Id = Guid.Parse("40000000-0000-4000-8000-000000000004"),
                MembershipId = Guid.Parse("30000000-0000-4000-8000-000000000004"),
                Type = "joined",
                OccurredAt = DateTimeOffset.Parse("2026-10-21T14:00:00.000Z", CultureInfo.InvariantCulture),
                ActorId = Guid.Parse("11111111-1111-4111-8111-111111111111"),
                RequestId = (Guid?)null,
            },
            new
            {
                Id = Guid.Parse("40000000-0000-4000-8000-000000000005"),
                MembershipId = Guid.Parse("30000000-0000-4000-8000-000000000005"),
                Type = "joined",
                OccurredAt = DateTimeOffset.Parse("2026-10-21T15:00:00.000Z", CultureInfo.InvariantCulture),
                ActorId = Guid.Parse("11111111-1111-4111-8111-111111111111"),
                RequestId = (Guid?)null,
            },
            new
            {
                Id = Guid.Parse("40000000-0000-4000-8000-000000000006"),
                MembershipId = Guid.Parse("30000000-0000-4000-8000-000000000006"),
                Type = "joined",
                OccurredAt = DateTimeOffset.Parse("2026-10-22T14:00:00.000Z", CultureInfo.InvariantCulture),
                ActorId = Guid.Parse("11111111-1111-4111-8111-111111111111"),
                RequestId = (Guid?)null,
            },
            new
            {
                Id = Guid.Parse("40000000-0000-4000-8000-000000000007"),
                MembershipId = Guid.Parse("30000000-0000-4000-8000-000000000007"),
                Type = "joined",
                OccurredAt = DateTimeOffset.Parse("2026-10-22T15:00:00.000Z", CultureInfo.InvariantCulture),
                ActorId = Guid.Parse("11111111-1111-4111-8111-111111111111"),
                RequestId = (Guid?)null,
            },
            new
            {
                Id = Guid.Parse("40000000-0000-4000-8000-000000000008"),
                MembershipId = Guid.Parse("30000000-0000-4000-8000-000000000008"),
                Type = "joined",
                OccurredAt = DateTimeOffset.Parse("2026-10-23T14:00:00.000Z", CultureInfo.InvariantCulture),
                ActorId = Guid.Parse("11111111-1111-4111-8111-111111111111"),
                RequestId = (Guid?)null,
            },
            new
            {
                Id = Guid.Parse("40000000-0000-4000-8000-000000000009"),
                MembershipId = Guid.Parse("30000000-0000-4000-8000-000000000009"),
                Type = "joined",
                OccurredAt = DateTimeOffset.Parse("2026-10-22T10:00:00.000Z", CultureInfo.InvariantCulture),
                ActorId = Guid.Parse("11111111-1111-4111-8111-111111111111"),
                RequestId = Guid.Parse("20000000-0000-4000-8000-000000000001"),
            },
            new
            {
                Id = Guid.Parse("40000000-0000-4000-8000-000000000010"),
                MembershipId = Guid.Parse("30000000-0000-4000-8000-000000000010"),
                Type = "joined",
                OccurredAt = DateTimeOffset.Parse("2026-10-24T10:00:00.000Z", CultureInfo.InvariantCulture),
                ActorId = Guid.Parse("11111111-1111-4111-8111-111111111111"),
                RequestId = (Guid?)null,
            },
            new
            {
                Id = Guid.Parse("40000000-0000-4000-8000-000000000011"),
                MembershipId = Guid.Parse("30000000-0000-4000-8000-000000000011"),
                Type = "joined",
                OccurredAt = DateTimeOffset.Parse("2026-10-26T11:00:00.000Z", CultureInfo.InvariantCulture),
                ActorId = Guid.Parse("11111111-1111-4111-8111-111111111111"),
                RequestId = Guid.Parse("20000000-0000-4000-8000-000000000005"),
            },
            new
            {
                Id = Guid.Parse("40000000-0000-4000-8000-000000000012"),
                MembershipId = Guid.Parse("30000000-0000-4000-8000-000000000012"),
                Type = "joined",
                OccurredAt = DateTimeOffset.Parse("2026-10-24T12:00:00.000Z", CultureInfo.InvariantCulture),
                ActorId = Guid.Parse("11111111-1111-4111-8111-111111111111"),
                RequestId = (Guid?)null,
            },
            new
            {
                Id = Guid.Parse("40000000-0000-4000-8000-000000000013"),
                MembershipId = Guid.Parse("30000000-0000-4000-8000-000000000012"),
                Type = "retired",
                OccurredAt = DateTimeOffset.Parse("2026-10-27T12:00:00.000Z", CultureInfo.InvariantCulture),
                ActorId = Guid.Parse("11111111-1111-4111-8111-111111111111"),
                RequestId = (Guid?)null,
            }
        );
        modelBuilder.Entity<Project>().HasData(
            new
            {
                Id = Guid.Parse("50000000-0000-4000-8000-000000000001"),
                SourceInitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000008"),
                Name = "Programa de orientación laboral",
                Description = "Implementación de talleres y recursos para preparar postulaciones y entrevistas.",
                Objective = "Acompañar a participantes durante la preparación de su búsqueda laboral.",
                StartDate = DateOnly.ParseExact("2026-11-01", "yyyy-MM-dd", CultureInfo.InvariantCulture),
                EstimatedEndDate = DateOnly.ParseExact("2027-02-28", "yyyy-MM-dd", CultureInfo.InvariantCulture),
                State = "planning",
                RepositoryUrl = (string?)null,
                CreatedAt = DateTimeOffset.Parse("2026-10-25T16:00:00.000Z", CultureInfo.InvariantCulture),
                UpdatedAt = DateTimeOffset.Parse("2026-10-25T16:00:00.000Z", CultureInfo.InvariantCulture),
            }
        );
        modelBuilder.Entity<ProjectTechnology>().HasData(
            new { ProjectId = Guid.Parse("50000000-0000-4000-8000-000000000001"), Position = 0, Value = "React", NormalizedValue = "react" },
            new { ProjectId = Guid.Parse("50000000-0000-4000-8000-000000000001"), Position = 1, Value = "Node.js", NormalizedValue = "node.js" }
        );
    }
}
