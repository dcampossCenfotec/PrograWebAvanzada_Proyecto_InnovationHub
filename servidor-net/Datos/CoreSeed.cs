using System.Globalization;
using InnovationHub.ServidorNet.Modelos;
using Microsoft.EntityFrameworkCore;

namespace InnovationHub.ServidorNet.Datos;

// Datos sintéticos de pruebas/fixtures, copiados con IDs y fechas fijos.
// No contiene contraseñas, sesiones ni hashes; autenticación fuera de Tarea 3.
internal static class CoreSeed
{
    internal static void Configure(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Category>().HasData(
            new { Id = "technology", Name = "Tecnología", NameNormalized = "tecnologia", Active = true },
            new { Id = "education", Name = "Educación", NameNormalized = "educacion", Active = true },
            new { Id = "sustainability", Name = "Sostenibilidad", NameNormalized = "sostenibilidad", Active = true },
            new { Id = "social-impact", Name = "Impacto social", NameNormalized = "impacto social", Active = true },
            new { Id = "business", Name = "Negocios y emprendimiento", NameNormalized = "negocios y emprendimiento", Active = true },
            new { Id = "health", Name = "Salud y bienestar", NameNormalized = "salud y bienestar", Active = true },
            new { Id = "culture-creativity", Name = "Cultura y creatividad", NameNormalized = "cultura y creatividad", Active = true },
            new { Id = "other", Name = "Otro", NameNormalized = "otro", Active = true }
        );
        modelBuilder.Entity<Skill>().HasData(
            new { Id = Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1"), Name = "Desarrollo web", NameNormalized = "desarrollo web", Active = true },
            new { Id = Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2"), Name = "Diseño", NameNormalized = "diseno", Active = true },
            new { Id = Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3"), Name = "Investigación", NameNormalized = "investigacion", Active = true },
            new { Id = Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4"), Name = "Comunicación", NameNormalized = "comunicacion", Active = true },
            new { Id = Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5"), Name = "Logística", NameNormalized = "logistica", Active = true },
            new { Id = Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6"), Name = "Facilitación", NameNormalized = "facilitacion", Active = true },
            new { Id = Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa7"), Name = "Datos", NameNormalized = "datos", Active = true },
            new { Id = Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa8"), Name = "Sostenibilidad", NameNormalized = "sostenibilidad", Active = true },
            new { Id = Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa9"), Name = "Organización", NameNormalized = "organizacion", Active = true },
            new { Id = Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa10"), Name = "Recursos humanos", NameNormalized = "recursos humanos", Active = true }
        );
        modelBuilder.Entity<User>().HasData(
            new { Id = Guid.Parse("11111111-1111-4111-8111-111111111111"), FirstName = "Ana", LastName = "Rojas", MemberType = "student", Email = "ana.owner@example.test", EmailNormalized = "ana.owner@example.test", Career = "Ingeniería del Software", Bio = "Propietaria de iniciativas para pruebas compartidas.", Availability = "high", PortfolioUrl = (string?)null, Active = true, CreatedAt = DateTimeOffset.Parse("2026-10-10T14:00:00.000Z", CultureInfo.InvariantCulture), UpdatedAt = DateTimeOffset.Parse("2026-10-10T14:00:00.000Z", CultureInfo.InvariantCulture) },
            new { Id = Guid.Parse("22222222-2222-4222-8222-222222222222"), FirstName = "Luis", LastName = "Mora", MemberType = "student", Email = "luis.applicant@example.test", EmailNormalized = "luis.applicant@example.test", Career = "Diseño de Experiencias Digitales", Bio = "Solicitante usado en escenarios de participación.", Availability = "medium", PortfolioUrl = "https://example.test/luis", Active = true, CreatedAt = DateTimeOffset.Parse("2026-10-11T14:00:00.000Z", CultureInfo.InvariantCulture), UpdatedAt = DateTimeOffset.Parse("2026-10-11T14:00:00.000Z", CultureInfo.InvariantCulture) },
            new { Id = Guid.Parse("33333333-3333-4333-8333-333333333333"), FirstName = "Carla", LastName = "Vega", MemberType = "professor", Email = "carla.outsider@example.test", EmailNormalized = "carla.outsider@example.test", Career = (string?)null, Bio = (string?)null, Availability = "low", PortfolioUrl = (string?)null, Active = true, CreatedAt = DateTimeOffset.Parse("2026-10-12T14:00:00.000Z", CultureInfo.InvariantCulture), UpdatedAt = DateTimeOffset.Parse("2026-10-12T14:00:00.000Z", CultureInfo.InvariantCulture) },
            new { Id = Guid.Parse("44444444-4444-4444-8444-444444444444"), FirstName = "Diego", LastName = "Núñez", MemberType = "graduate", Email = "diego.inactive@example.test", EmailNormalized = "diego.inactive@example.test", Career = "Administración", Bio = (string?)null, Availability = "low", PortfolioUrl = (string?)null, Active = false, CreatedAt = DateTimeOffset.Parse("2026-10-13T14:00:00.000Z", CultureInfo.InvariantCulture), UpdatedAt = DateTimeOffset.Parse("2026-10-20T14:00:00.000Z", CultureInfo.InvariantCulture) },
            new { Id = Guid.Parse("55555555-5555-4555-8555-555555555555"), FirstName = "Elena", LastName = "Solís", MemberType = "administrative", Email = "elena.member@example.test", EmailNormalized = "elena.member@example.test", Career = (string?)null, Bio = "Miembro aceptado para escenarios de equipo.", Availability = "high", PortfolioUrl = (string?)null, Active = true, CreatedAt = DateTimeOffset.Parse("2026-10-14T14:00:00.000Z", CultureInfo.InvariantCulture), UpdatedAt = DateTimeOffset.Parse("2026-10-14T14:00:00.000Z", CultureInfo.InvariantCulture) }
        );
        modelBuilder.Entity<UserSkill>().HasData(
            new { UserId = Guid.Parse("11111111-1111-4111-8111-111111111111"), SkillId = Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2"), Level = "advanced", Position = 0 },
            new { UserId = Guid.Parse("11111111-1111-4111-8111-111111111111"), SkillId = Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6"), Level = "intermediate", Position = 1 },
            new { UserId = Guid.Parse("22222222-2222-4222-8222-222222222222"), SkillId = Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3"), Level = "intermediate", Position = 0 },
            new { UserId = Guid.Parse("22222222-2222-4222-8222-222222222222"), SkillId = Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4"), Level = "advanced", Position = 1 },
            new { UserId = Guid.Parse("33333333-3333-4333-8333-333333333333"), SkillId = Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3"), Level = "advanced", Position = 0 },
            new { UserId = Guid.Parse("55555555-5555-4555-8555-555555555555"), SkillId = Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5"), Level = "advanced", Position = 0 },
            new { UserId = Guid.Parse("55555555-5555-4555-8555-555555555555"), SkillId = Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa9"), Level = "advanced", Position = 1 }
        );
        modelBuilder.Entity<UserInterest>().HasData(
            new { UserId = Guid.Parse("11111111-1111-4111-8111-111111111111"), Position = 0, Value = "educación", NormalizedValue = "educación" },
            new { UserId = Guid.Parse("11111111-1111-4111-8111-111111111111"), Position = 1, Value = "sostenibilidad", NormalizedValue = "sostenibilidad" },
            new { UserId = Guid.Parse("22222222-2222-4222-8222-222222222222"), Position = 0, Value = "accesibilidad", NormalizedValue = "accesibilidad" },
            new { UserId = Guid.Parse("22222222-2222-4222-8222-222222222222"), Position = 1, Value = "comunidad", NormalizedValue = "comunidad" },
            new { UserId = Guid.Parse("33333333-3333-4333-8333-333333333333"), Position = 0, Value = "investigación", NormalizedValue = "investigación" },
            new { UserId = Guid.Parse("55555555-5555-4555-8555-555555555555"), Position = 0, Value = "logística", NormalizedValue = "logística" },
            new { UserId = Guid.Parse("55555555-5555-4555-8555-555555555555"), Position = 1, Value = "impacto social", NormalizedValue = "impacto social" }
        );
        modelBuilder.Entity<Initiative>().HasData(
            new { Id = Guid.Parse("10000000-0000-4000-8000-000000000001"), OwnerId = Guid.Parse("11111111-1111-4111-8111-111111111111"), Title = "Huertos escolares", Type = "idea", Summary = "Crear huertos educativos en escuelas públicas.", Description = "Diseñar huertos piloto con docentes y estudiantes para aprender cultivo sostenible.", Problem = "Existen pocos espacios prácticos para educación ambiental.", Beneficiaries = "Estudiantes y docentes", CategoryId = "sustainability", EstimatedMembers = 5, Visibility = "public", State = "published", CreatedAt = DateTimeOffset.Parse("2026-10-20T14:00:00.000Z", CultureInfo.InvariantCulture), UpdatedAt = DateTimeOffset.Parse("2026-10-20T14:00:00.000Z", CultureInfo.InvariantCulture), Revision = 0 },
            new { Id = Guid.Parse("10000000-0000-4000-8000-000000000002"), OwnerId = Guid.Parse("11111111-1111-4111-8111-111111111111"), Title = "Accesibilidad urbana", Type = "need", Summary = "Identificar rutas accesibles para personas con movilidad reducida.", Description = "Levantar información de aceras y entradas para construir un mapa colaborativo.", Problem = "Falta información clara y verificable sobre rutas accesibles.", Beneficiaries = "Personas con movilidad reducida", CategoryId = "social-impact", EstimatedMembers = 4, Visibility = "public", State = "forming_team", CreatedAt = DateTimeOffset.Parse("2026-10-20T15:00:00.000Z", CultureInfo.InvariantCulture), UpdatedAt = DateTimeOffset.Parse("2026-10-23T15:00:00.000Z", CultureInfo.InvariantCulture), Revision = 0 },
            new { Id = Guid.Parse("10000000-0000-4000-8000-000000000003"), OwnerId = Guid.Parse("11111111-1111-4111-8111-111111111111"), Title = "Reto de reciclaje inteligente", Type = "challenge", Summary = "Proponer un sistema para facilitar la separación de residuos.", Description = "Diseñar una interfaz que explique cómo clasificar residuos comunes en el hogar.", Problem = "La clasificación doméstica de residuos genera dudas frecuentes.", Beneficiaries = "Hogares de la comunidad", CategoryId = "sustainability", EstimatedMembers = 6, Visibility = "restricted", State = "published", CreatedAt = DateTimeOffset.Parse("2026-10-20T16:00:00.000Z", CultureInfo.InvariantCulture), UpdatedAt = DateTimeOffset.Parse("2026-10-20T16:00:00.000Z", CultureInfo.InvariantCulture), Revision = 0 },
            new { Id = Guid.Parse("10000000-0000-4000-8000-000000000004"), OwnerId = Guid.Parse("11111111-1111-4111-8111-111111111111"), Title = "Mentorías tecnológicas", Type = "idea", Summary = "Vincular estudiantes con mentores voluntarios de la institución.", Description = "Organizar sesiones breves para acompañar proyectos académicos y resolver bloqueos técnicos.", Problem = "Faltan espacios de asesoría práctica para proyectos estudiantiles.", Beneficiaries = "Estudiantes de la institución", CategoryId = "education", EstimatedMembers = 3, Visibility = "institutional", State = "published", CreatedAt = DateTimeOffset.Parse("2026-10-21T14:00:00.000Z", CultureInfo.InvariantCulture), UpdatedAt = DateTimeOffset.Parse("2026-10-25T14:00:00.000Z", CultureInfo.InvariantCulture), Revision = 0 },
            new { Id = Guid.Parse("10000000-0000-4000-8000-000000000005"), OwnerId = Guid.Parse("11111111-1111-4111-8111-111111111111"), Title = "Banco de alimentos", Type = "need", Summary = "Coordinar donaciones con organizaciones locales y familias.", Description = "Registrar donantes, puntos de entrega y necesidades semanales de organizaciones comunitarias.", Problem = "Las donaciones disponibles no siempre llegan a tiempo a quienes las necesitan.", Beneficiaries = "Familias en condición vulnerable", CategoryId = "social-impact", EstimatedMembers = 8, Visibility = "public", State = "archived", CreatedAt = DateTimeOffset.Parse("2026-10-21T15:00:00.000Z", CultureInfo.InvariantCulture), UpdatedAt = DateTimeOffset.Parse("2026-10-27T15:00:00.000Z", CultureInfo.InvariantCulture), Revision = 0 },
            new { Id = Guid.Parse("10000000-0000-4000-8000-000000000006"), OwnerId = Guid.Parse("11111111-1111-4111-8111-111111111111"), Title = "Datos de calidad del aire", Type = "challenge", Summary = "Visualizar lecturas ambientales en un tablero comprensible.", Description = "Crear gráficos claros con mediciones simuladas de diferentes zonas de la ciudad.", Problem = "Los datos ambientales disponibles son difíciles de interpretar.", Beneficiaries = "Habitantes, investigadores y docentes", CategoryId = "technology", EstimatedMembers = 4, Visibility = "private", State = "published", CreatedAt = DateTimeOffset.Parse("2026-10-22T14:00:00.000Z", CultureInfo.InvariantCulture), UpdatedAt = DateTimeOffset.Parse("2026-10-22T14:00:00.000Z", CultureInfo.InvariantCulture), Revision = 0 },
            new { Id = Guid.Parse("10000000-0000-4000-8000-000000000007"), OwnerId = Guid.Parse("11111111-1111-4111-8111-111111111111"), Title = "Lectura compartida", Type = "idea", Summary = "Organizar intercambio de libros entre vecinos y estudiantes.", Description = "Habilitar un registro de libros disponibles y jornadas presenciales de intercambio comunitario.", Problem = "Existen libros sin uso y poca oferta de intercambio comunitario.", Beneficiaries = "Vecinos y estudiantes", CategoryId = "culture-creativity", EstimatedMembers = 5, Visibility = "public", State = "draft", CreatedAt = DateTimeOffset.Parse("2026-10-22T15:00:00.000Z", CultureInfo.InvariantCulture), UpdatedAt = DateTimeOffset.Parse("2026-10-22T15:00:00.000Z", CultureInfo.InvariantCulture), Revision = 0 },
            new { Id = Guid.Parse("10000000-0000-4000-8000-000000000008"), OwnerId = Guid.Parse("11111111-1111-4111-8111-111111111111"), Title = "Orientación laboral", Type = "need", Summary = "Crear recursos y prácticas guiadas para entrevistas laborales.", Description = "Reunir guías y ofrecer espacios de práctica con voluntarios de recursos humanos.", Problem = "Las personas sin experiencia requieren apoyo para preparar sus postulaciones.", Beneficiaries = "Personas en búsqueda de empleo", CategoryId = "education", EstimatedMembers = 2, Visibility = "public", State = "converted", CreatedAt = DateTimeOffset.Parse("2026-10-23T14:00:00.000Z", CultureInfo.InvariantCulture), UpdatedAt = DateTimeOffset.Parse("2026-10-28T14:00:00.000Z", CultureInfo.InvariantCulture), Revision = 0 }
        );
        modelBuilder.Entity<InitiativeSkill>().HasData(
            new { InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000001"), SkillId = Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2"), Position = 0 },
            new { InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000001"), SkillId = Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa8"), Position = 1 },
            new { InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000002"), SkillId = Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1"), Position = 0 },
            new { InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000002"), SkillId = Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3"), Position = 1 },
            new { InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000003"), SkillId = Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1"), Position = 0 },
            new { InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000003"), SkillId = Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2"), Position = 1 },
            new { InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000004"), SkillId = Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1"), Position = 0 },
            new { InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000004"), SkillId = Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6"), Position = 1 },
            new { InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000005"), SkillId = Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4"), Position = 0 },
            new { InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000005"), SkillId = Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5"), Position = 1 },
            new { InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000006"), SkillId = Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2"), Position = 0 },
            new { InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000006"), SkillId = Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa7"), Position = 1 },
            new { InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000007"), SkillId = Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4"), Position = 0 },
            new { InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000007"), SkillId = Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa9"), Position = 1 },
            new { InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000008"), SkillId = Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4"), Position = 0 },
            new { InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000008"), SkillId = Guid.Parse("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa10"), Position = 1 }
        );
        modelBuilder.Entity<InitiativeTag>().HasData(
            new { InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000001"), Position = 0, Value = "sostenibilidad", NormalizedValue = "sostenibilidad" },
            new { InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000001"), Position = 1, Value = "escuelas", NormalizedValue = "escuelas" },
            new { InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000002"), Position = 0, Value = "accesibilidad", NormalizedValue = "accesibilidad" },
            new { InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000002"), Position = 1, Value = "mapa", NormalizedValue = "mapa" },
            new { InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000003"), Position = 0, Value = "reciclaje", NormalizedValue = "reciclaje" },
            new { InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000004"), Position = 0, Value = "mentoría", NormalizedValue = "mentoria" },
            new { InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000005"), Position = 0, Value = "alimentos", NormalizedValue = "alimentos" },
            new { InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000005"), Position = 1, Value = "donaciones", NormalizedValue = "donaciones" },
            new { InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000006"), Position = 0, Value = "datos", NormalizedValue = "datos" },
            new { InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000006"), Position = 1, Value = "ambiente", NormalizedValue = "ambiente" },
            new { InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000007"), Position = 0, Value = "lectura", NormalizedValue = "lectura" },
            new { InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000008"), Position = 0, Value = "empleo", NormalizedValue = "empleo" },
            new { InitiativeId = Guid.Parse("10000000-0000-4000-8000-000000000008"), Position = 1, Value = "entrevistas", NormalizedValue = "entrevistas" }
        );
    }
}
