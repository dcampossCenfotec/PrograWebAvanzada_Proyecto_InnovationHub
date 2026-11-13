using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace InnovationHub.ServidorNet.Migrations
{
    /// <inheritdoc />
    public partial class InicialUsuariosIniciativas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<string>(type: "varchar(80)", unicode: false, maxLength: 80, nullable: false, collation: "Latin1_General_100_BIN2"),
                    Name = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    NameNormalized = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false, collation: "Latin1_General_100_BIN2"),
                    Active = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                    table.CheckConstraint("CK_Categories_Id", "DATALENGTH([Id]) BETWEEN 1 AND 80 AND [Id] NOT LIKE '%[^a-z0-9-]%' AND [Id] NOT LIKE '-%' AND [Id] NOT LIKE '%-' AND [Id] NOT LIKE '%--%'");
                    table.CheckConstraint("CK_Categories_Name", "DATALENGTH(LTRIM(RTRIM([Name])))/2 BETWEEN 2 AND 80");
                    table.CheckConstraint("CK_Categories_NameNormalized", "DATALENGTH(LTRIM(RTRIM([NameNormalized])))/2 BETWEEN 2 AND 80");
                });

            migrationBuilder.CreateTable(
                name: "Skills",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    NameNormalized = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false, collation: "Latin1_General_100_BIN2"),
                    Active = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Skills", x => x.Id);
                    table.CheckConstraint("CK_Skills_Name", "DATALENGTH(LTRIM(RTRIM([Name])))/2 BETWEEN 2 AND 80");
                    table.CheckConstraint("CK_Skills_NameNormalized", "DATALENGTH(LTRIM(RTRIM([NameNormalized])))/2 BETWEEN 2 AND 80");
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    MemberType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, collation: "Latin1_General_100_BIN2"),
                    Email = table.Column<string>(type: "nvarchar(254)", maxLength: 254, nullable: false),
                    EmailNormalized = table.Column<string>(type: "nvarchar(254)", maxLength: 254, nullable: false, collation: "Latin1_General_100_BIN2"),
                    PasswordHash = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: true),
                    Career = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    Bio = table.Column<string>(type: "nvarchar(600)", maxLength: 600, nullable: true),
                    PortfolioUrl = table.Column<string>(type: "nvarchar(2048)", maxLength: 2048, nullable: true),
                    Availability = table.Column<string>(type: "nvarchar(6)", maxLength: 6, nullable: false, collation: "Latin1_General_100_BIN2"),
                    Active = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.CheckConstraint("CK_Users_Availability", "[Availability] IN ('low','medium','high')");
                    table.CheckConstraint("CK_Users_Bio", "[Bio] IS NULL OR DATALENGTH(LTRIM(RTRIM([Bio])))/2 BETWEEN 1 AND 600");
                    table.CheckConstraint("CK_Users_Career", "[Career] IS NULL OR DATALENGTH(LTRIM(RTRIM([Career])))/2 BETWEEN 2 AND 120");
                    table.CheckConstraint("CK_Users_Dates", "[UpdatedAt] >= [CreatedAt] AND DATEPART(TZOFFSET, [CreatedAt]) = 0 AND DATEPART(TZOFFSET, [UpdatedAt]) = 0");
                    table.CheckConstraint("CK_Users_Email", "DATALENGTH(LTRIM(RTRIM([Email])))/2 BETWEEN 3 AND 254");
                    table.CheckConstraint("CK_Users_EmailNormalized", "[EmailNormalized] = LOWER(LTRIM(RTRIM([Email]))) COLLATE Latin1_General_100_BIN2");
                    table.CheckConstraint("CK_Users_FirstName", "DATALENGTH(LTRIM(RTRIM([FirstName])))/2 BETWEEN 2 AND 60");
                    table.CheckConstraint("CK_Users_LastName", "DATALENGTH(LTRIM(RTRIM([LastName])))/2 BETWEEN 2 AND 80");
                    table.CheckConstraint("CK_Users_MemberType", "[MemberType] IN ('student','professor','administrative','graduate','external')");
                    table.CheckConstraint("CK_Users_PortfolioUrl", "[PortfolioUrl] IS NULL OR DATALENGTH(LTRIM(RTRIM([PortfolioUrl])))/2 BETWEEN 1 AND 2048");
                });

            migrationBuilder.CreateTable(
                name: "Initiatives",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OwnerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(9)", maxLength: 9, nullable: false, collation: "Latin1_General_100_BIN2"),
                    Summary = table.Column<string>(type: "nvarchar(240)", maxLength: 240, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Problem = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Beneficiaries = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    CategoryId = table.Column<string>(type: "varchar(80)", unicode: false, maxLength: 80, nullable: false, collation: "Latin1_General_100_BIN2"),
                    EstimatedMembers = table.Column<int>(type: "int", nullable: false),
                    Visibility = table.Column<string>(type: "nvarchar(13)", maxLength: 13, nullable: false, collation: "Latin1_General_100_BIN2"),
                    State = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false, collation: "Latin1_General_100_BIN2"),
                    Revision = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Initiatives", x => x.Id);
                    table.CheckConstraint("CK_Initiatives_Beneficiaries", "DATALENGTH(LTRIM(RTRIM([Beneficiaries])))/2 BETWEEN 3 AND 150");
                    table.CheckConstraint("CK_Initiatives_Dates", "[UpdatedAt] >= [CreatedAt] AND DATEPART(TZOFFSET, [CreatedAt]) = 0 AND DATEPART(TZOFFSET, [UpdatedAt]) = 0");
                    table.CheckConstraint("CK_Initiatives_Description", "DATALENGTH(LTRIM(RTRIM([Description])))/2 BETWEEN 20 AND 2000");
                    table.CheckConstraint("CK_Initiatives_EstimatedMembers", "[EstimatedMembers] BETWEEN 1 AND 100");
                    table.CheckConstraint("CK_Initiatives_Problem", "DATALENGTH(LTRIM(RTRIM([Problem])))/2 BETWEEN 10 AND 500");
                    table.CheckConstraint("CK_Initiatives_Revision", "[Revision] >= 0");
                    table.CheckConstraint("CK_Initiatives_State", "[State] IN ('draft','published','forming_team','converted','archived')");
                    table.CheckConstraint("CK_Initiatives_Summary", "DATALENGTH(LTRIM(RTRIM([Summary])))/2 BETWEEN 15 AND 240");
                    table.CheckConstraint("CK_Initiatives_Title", "DATALENGTH(LTRIM(RTRIM([Title])))/2 BETWEEN 5 AND 100");
                    table.CheckConstraint("CK_Initiatives_Type", "[Type] IN ('idea','need','challenge')");
                    table.CheckConstraint("CK_Initiatives_Visibility", "[Visibility] IN ('public','institutional','restricted','private')");
                    table.ForeignKey(
                        name: "FK_Initiatives_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Initiatives_Users_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Sessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TokenHash = table.Column<string>(type: "varchar(64)", unicode: false, maxLength: 64, nullable: false, collation: "Latin1_General_100_BIN2"),
                    ExpiresAt = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false),
                    RevokedAt = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sessions", x => x.Id);
                    table.CheckConstraint("CK_Sessions_Dates", "[ExpiresAt] > [CreatedAt] AND ([RevokedAt] IS NULL OR [RevokedAt] >= [CreatedAt]) AND DATEPART(TZOFFSET, [CreatedAt]) = 0 AND DATEPART(TZOFFSET, [ExpiresAt]) = 0 AND ([RevokedAt] IS NULL OR DATEPART(TZOFFSET, [RevokedAt]) = 0)");
                    table.CheckConstraint("CK_Sessions_TokenHash", "DATALENGTH([TokenHash]) = 64 AND [TokenHash] NOT LIKE '%[^0-9a-f]%'");
                    table.ForeignKey(
                        name: "FK_Sessions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserInterests",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Position = table.Column<int>(type: "int", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    NormalizedValue = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false, collation: "Latin1_General_100_BIN2")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserInterests", x => new { x.UserId, x.Position });
                    table.CheckConstraint("CK_UserInterests_NormalizedValue", "DATALENGTH(LTRIM(RTRIM([NormalizedValue])))/2 BETWEEN 1 AND 40");
                    table.CheckConstraint("CK_UserInterests_Position", "[Position] BETWEEN 0 AND 14");
                    table.CheckConstraint("CK_UserInterests_Value", "DATALENGTH(LTRIM(RTRIM([Value])))/2 BETWEEN 1 AND 40");
                    table.ForeignKey(
                        name: "FK_UserInterests_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserSkills",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SkillId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Level = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false, collation: "Latin1_General_100_BIN2"),
                    Position = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserSkills", x => new { x.UserId, x.SkillId });
                    table.CheckConstraint("CK_UserSkills_Level", "[Level] IN ('basic','intermediate','advanced')");
                    table.CheckConstraint("CK_UserSkills_Position", "[Position] BETWEEN 0 AND 19");
                    table.ForeignKey(
                        name: "FK_UserSkills_Skills_SkillId",
                        column: x => x.SkillId,
                        principalTable: "Skills",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserSkills_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InitiativeSkills",
                columns: table => new
                {
                    InitiativeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SkillId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Position = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InitiativeSkills", x => new { x.InitiativeId, x.SkillId });
                    table.CheckConstraint("CK_InitiativeSkills_Position", "[Position] BETWEEN 0 AND 9");
                    table.ForeignKey(
                        name: "FK_InitiativeSkills_Initiatives_InitiativeId",
                        column: x => x.InitiativeId,
                        principalTable: "Initiatives",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InitiativeSkills_Skills_SkillId",
                        column: x => x.SkillId,
                        principalTable: "Skills",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "InitiativeTags",
                columns: table => new
                {
                    InitiativeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Position = table.Column<int>(type: "int", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    NormalizedValue = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false, collation: "Latin1_General_100_BIN2")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InitiativeTags", x => new { x.InitiativeId, x.Position });
                    table.CheckConstraint("CK_InitiativeTags_NormalizedValue", "DATALENGTH(LTRIM(RTRIM([NormalizedValue])))/2 BETWEEN 1 AND 40");
                    table.CheckConstraint("CK_InitiativeTags_Position", "[Position] BETWEEN 0 AND 9");
                    table.CheckConstraint("CK_InitiativeTags_Value", "DATALENGTH(LTRIM(RTRIM([Value])))/2 BETWEEN 1 AND 40");
                    table.ForeignKey(
                        name: "FK_InitiativeTags_Initiatives_InitiativeId",
                        column: x => x.InitiativeId,
                        principalTable: "Initiatives",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Active", "Name", "NameNormalized" },
                values: new object[,]
                {
                    { "business", true, "Negocios y emprendimiento", "negocios y emprendimiento" },
                    { "culture-creativity", true, "Cultura y creatividad", "cultura y creatividad" },
                    { "education", true, "Educación", "educacion" },
                    { "health", true, "Salud y bienestar", "salud y bienestar" },
                    { "other", true, "Otro", "otro" },
                    { "social-impact", true, "Impacto social", "impacto social" },
                    { "sustainability", true, "Sostenibilidad", "sostenibilidad" },
                    { "technology", true, "Tecnología", "tecnologia" }
                });

            migrationBuilder.InsertData(
                table: "Skills",
                columns: new[] { "Id", "Active", "Name", "NameNormalized" },
                values: new object[,]
                {
                    { new Guid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa10"), true, "Recursos humanos", "recursos humanos" },
                    { new Guid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1"), true, "Desarrollo web", "desarrollo web" },
                    { new Guid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2"), true, "Diseño", "diseno" },
                    { new Guid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3"), true, "Investigación", "investigacion" },
                    { new Guid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4"), true, "Comunicación", "comunicacion" },
                    { new Guid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5"), true, "Logística", "logistica" },
                    { new Guid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6"), true, "Facilitación", "facilitacion" },
                    { new Guid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa7"), true, "Datos", "datos" },
                    { new Guid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa8"), true, "Sostenibilidad", "sostenibilidad" },
                    { new Guid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa9"), true, "Organización", "organizacion" }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Active", "Availability", "Bio", "Career", "CreatedAt", "Email", "EmailNormalized", "FirstName", "LastName", "MemberType", "PasswordHash", "PortfolioUrl", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-4111-8111-111111111111"), true, "high", "Propietaria de iniciativas para pruebas compartidas.", "Ingeniería del Software", new DateTimeOffset(new DateTime(2026, 10, 10, 14, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "ana.owner@example.test", "ana.owner@example.test", "Ana", "Rojas", "student", null, null, new DateTimeOffset(new DateTime(2026, 10, 10, 14, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("22222222-2222-4222-8222-222222222222"), true, "medium", "Solicitante usado en escenarios de participación.", "Diseño de Experiencias Digitales", new DateTimeOffset(new DateTime(2026, 10, 11, 14, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "luis.applicant@example.test", "luis.applicant@example.test", "Luis", "Mora", "student", null, "https://example.test/luis", new DateTimeOffset(new DateTime(2026, 10, 11, 14, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("33333333-3333-4333-8333-333333333333"), true, "low", null, null, new DateTimeOffset(new DateTime(2026, 10, 12, 14, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "carla.outsider@example.test", "carla.outsider@example.test", "Carla", "Vega", "professor", null, null, new DateTimeOffset(new DateTime(2026, 10, 12, 14, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("44444444-4444-4444-8444-444444444444"), false, "low", null, "Administración", new DateTimeOffset(new DateTime(2026, 10, 13, 14, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "diego.inactive@example.test", "diego.inactive@example.test", "Diego", "Núñez", "graduate", null, null, new DateTimeOffset(new DateTime(2026, 10, 20, 14, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("55555555-5555-4555-8555-555555555555"), true, "high", "Miembro aceptado para escenarios de equipo.", null, new DateTimeOffset(new DateTime(2026, 10, 14, 14, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "elena.member@example.test", "elena.member@example.test", "Elena", "Solís", "administrative", null, null, new DateTimeOffset(new DateTime(2026, 10, 14, 14, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) }
                });

            migrationBuilder.InsertData(
                table: "Initiatives",
                columns: new[] { "Id", "Beneficiaries", "CategoryId", "CreatedAt", "Description", "EstimatedMembers", "OwnerId", "Problem", "Revision", "State", "Summary", "Title", "Type", "UpdatedAt", "Visibility" },
                values: new object[,]
                {
                    { new Guid("10000000-0000-4000-8000-000000000001"), "Estudiantes y docentes", "sustainability", new DateTimeOffset(new DateTime(2026, 10, 20, 14, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "Diseñar huertos piloto con docentes y estudiantes para aprender cultivo sostenible.", 5, new Guid("11111111-1111-4111-8111-111111111111"), "Existen pocos espacios prácticos para educación ambiental.", 0, "published", "Crear huertos educativos en escuelas públicas.", "Huertos escolares", "idea", new DateTimeOffset(new DateTime(2026, 10, 20, 14, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "public" },
                    { new Guid("10000000-0000-4000-8000-000000000002"), "Personas con movilidad reducida", "social-impact", new DateTimeOffset(new DateTime(2026, 10, 20, 15, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "Levantar información de aceras y entradas para construir un mapa colaborativo.", 4, new Guid("11111111-1111-4111-8111-111111111111"), "Falta información clara y verificable sobre rutas accesibles.", 0, "forming_team", "Identificar rutas accesibles para personas con movilidad reducida.", "Accesibilidad urbana", "need", new DateTimeOffset(new DateTime(2026, 10, 23, 15, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "public" },
                    { new Guid("10000000-0000-4000-8000-000000000003"), "Hogares de la comunidad", "sustainability", new DateTimeOffset(new DateTime(2026, 10, 20, 16, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "Diseñar una interfaz que explique cómo clasificar residuos comunes en el hogar.", 6, new Guid("11111111-1111-4111-8111-111111111111"), "La clasificación doméstica de residuos genera dudas frecuentes.", 0, "published", "Proponer un sistema para facilitar la separación de residuos.", "Reto de reciclaje inteligente", "challenge", new DateTimeOffset(new DateTime(2026, 10, 20, 16, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "restricted" },
                    { new Guid("10000000-0000-4000-8000-000000000004"), "Estudiantes de la institución", "education", new DateTimeOffset(new DateTime(2026, 10, 21, 14, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "Organizar sesiones breves para acompañar proyectos académicos y resolver bloqueos técnicos.", 3, new Guid("11111111-1111-4111-8111-111111111111"), "Faltan espacios de asesoría práctica para proyectos estudiantiles.", 0, "published", "Vincular estudiantes con mentores voluntarios de la institución.", "Mentorías tecnológicas", "idea", new DateTimeOffset(new DateTime(2026, 10, 25, 14, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "institutional" },
                    { new Guid("10000000-0000-4000-8000-000000000005"), "Familias en condición vulnerable", "social-impact", new DateTimeOffset(new DateTime(2026, 10, 21, 15, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "Registrar donantes, puntos de entrega y necesidades semanales de organizaciones comunitarias.", 8, new Guid("11111111-1111-4111-8111-111111111111"), "Las donaciones disponibles no siempre llegan a tiempo a quienes las necesitan.", 0, "archived", "Coordinar donaciones con organizaciones locales y familias.", "Banco de alimentos", "need", new DateTimeOffset(new DateTime(2026, 10, 27, 15, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "public" },
                    { new Guid("10000000-0000-4000-8000-000000000006"), "Habitantes, investigadores y docentes", "technology", new DateTimeOffset(new DateTime(2026, 10, 22, 14, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "Crear gráficos claros con mediciones simuladas de diferentes zonas de la ciudad.", 4, new Guid("11111111-1111-4111-8111-111111111111"), "Los datos ambientales disponibles son difíciles de interpretar.", 0, "published", "Visualizar lecturas ambientales en un tablero comprensible.", "Datos de calidad del aire", "challenge", new DateTimeOffset(new DateTime(2026, 10, 22, 14, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "private" },
                    { new Guid("10000000-0000-4000-8000-000000000007"), "Vecinos y estudiantes", "culture-creativity", new DateTimeOffset(new DateTime(2026, 10, 22, 15, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "Habilitar un registro de libros disponibles y jornadas presenciales de intercambio comunitario.", 5, new Guid("11111111-1111-4111-8111-111111111111"), "Existen libros sin uso y poca oferta de intercambio comunitario.", 0, "draft", "Organizar intercambio de libros entre vecinos y estudiantes.", "Lectura compartida", "idea", new DateTimeOffset(new DateTime(2026, 10, 22, 15, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "public" },
                    { new Guid("10000000-0000-4000-8000-000000000008"), "Personas en búsqueda de empleo", "education", new DateTimeOffset(new DateTime(2026, 10, 23, 14, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "Reunir guías y ofrecer espacios de práctica con voluntarios de recursos humanos.", 2, new Guid("11111111-1111-4111-8111-111111111111"), "Las personas sin experiencia requieren apoyo para preparar sus postulaciones.", 0, "converted", "Crear recursos y prácticas guiadas para entrevistas laborales.", "Orientación laboral", "need", new DateTimeOffset(new DateTime(2026, 10, 28, 14, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "public" }
                });

            migrationBuilder.InsertData(
                table: "UserInterests",
                columns: new[] { "Position", "UserId", "NormalizedValue", "Value" },
                values: new object[,]
                {
                    { 0, new Guid("11111111-1111-4111-8111-111111111111"), "educación", "educación" },
                    { 1, new Guid("11111111-1111-4111-8111-111111111111"), "sostenibilidad", "sostenibilidad" },
                    { 0, new Guid("22222222-2222-4222-8222-222222222222"), "accesibilidad", "accesibilidad" },
                    { 1, new Guid("22222222-2222-4222-8222-222222222222"), "comunidad", "comunidad" },
                    { 0, new Guid("33333333-3333-4333-8333-333333333333"), "investigación", "investigación" },
                    { 0, new Guid("55555555-5555-4555-8555-555555555555"), "logística", "logística" },
                    { 1, new Guid("55555555-5555-4555-8555-555555555555"), "impacto social", "impacto social" }
                });

            migrationBuilder.InsertData(
                table: "UserSkills",
                columns: new[] { "SkillId", "UserId", "Level", "Position" },
                values: new object[,]
                {
                    { new Guid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2"), new Guid("11111111-1111-4111-8111-111111111111"), "advanced", 0 },
                    { new Guid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6"), new Guid("11111111-1111-4111-8111-111111111111"), "intermediate", 1 },
                    { new Guid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3"), new Guid("22222222-2222-4222-8222-222222222222"), "intermediate", 0 },
                    { new Guid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4"), new Guid("22222222-2222-4222-8222-222222222222"), "advanced", 1 },
                    { new Guid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3"), new Guid("33333333-3333-4333-8333-333333333333"), "advanced", 0 },
                    { new Guid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5"), new Guid("55555555-5555-4555-8555-555555555555"), "advanced", 0 },
                    { new Guid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa9"), new Guid("55555555-5555-4555-8555-555555555555"), "advanced", 1 }
                });

            migrationBuilder.InsertData(
                table: "InitiativeSkills",
                columns: new[] { "InitiativeId", "SkillId", "Position" },
                values: new object[,]
                {
                    { new Guid("10000000-0000-4000-8000-000000000001"), new Guid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2"), 0 },
                    { new Guid("10000000-0000-4000-8000-000000000001"), new Guid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa8"), 1 },
                    { new Guid("10000000-0000-4000-8000-000000000002"), new Guid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1"), 0 },
                    { new Guid("10000000-0000-4000-8000-000000000002"), new Guid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3"), 1 },
                    { new Guid("10000000-0000-4000-8000-000000000003"), new Guid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1"), 0 },
                    { new Guid("10000000-0000-4000-8000-000000000003"), new Guid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2"), 1 },
                    { new Guid("10000000-0000-4000-8000-000000000004"), new Guid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1"), 0 },
                    { new Guid("10000000-0000-4000-8000-000000000004"), new Guid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6"), 1 },
                    { new Guid("10000000-0000-4000-8000-000000000005"), new Guid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4"), 0 },
                    { new Guid("10000000-0000-4000-8000-000000000005"), new Guid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5"), 1 },
                    { new Guid("10000000-0000-4000-8000-000000000006"), new Guid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2"), 0 },
                    { new Guid("10000000-0000-4000-8000-000000000006"), new Guid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa7"), 1 },
                    { new Guid("10000000-0000-4000-8000-000000000007"), new Guid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4"), 0 },
                    { new Guid("10000000-0000-4000-8000-000000000007"), new Guid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa9"), 1 },
                    { new Guid("10000000-0000-4000-8000-000000000008"), new Guid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa10"), 1 },
                    { new Guid("10000000-0000-4000-8000-000000000008"), new Guid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4"), 0 }
                });

            migrationBuilder.InsertData(
                table: "InitiativeTags",
                columns: new[] { "InitiativeId", "Position", "NormalizedValue", "Value" },
                values: new object[,]
                {
                    { new Guid("10000000-0000-4000-8000-000000000001"), 0, "sostenibilidad", "sostenibilidad" },
                    { new Guid("10000000-0000-4000-8000-000000000001"), 1, "escuelas", "escuelas" },
                    { new Guid("10000000-0000-4000-8000-000000000002"), 0, "accesibilidad", "accesibilidad" },
                    { new Guid("10000000-0000-4000-8000-000000000002"), 1, "mapa", "mapa" },
                    { new Guid("10000000-0000-4000-8000-000000000003"), 0, "reciclaje", "reciclaje" },
                    { new Guid("10000000-0000-4000-8000-000000000004"), 0, "mentoria", "mentoría" },
                    { new Guid("10000000-0000-4000-8000-000000000005"), 0, "alimentos", "alimentos" },
                    { new Guid("10000000-0000-4000-8000-000000000005"), 1, "donaciones", "donaciones" },
                    { new Guid("10000000-0000-4000-8000-000000000006"), 0, "datos", "datos" },
                    { new Guid("10000000-0000-4000-8000-000000000006"), 1, "ambiente", "ambiente" },
                    { new Guid("10000000-0000-4000-8000-000000000007"), 0, "lectura", "lectura" },
                    { new Guid("10000000-0000-4000-8000-000000000008"), 0, "empleo", "empleo" },
                    { new Guid("10000000-0000-4000-8000-000000000008"), 1, "entrevistas", "entrevistas" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Categories_NameNormalized",
                table: "Categories",
                column: "NameNormalized",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Initiatives_CategoryId_State_Id",
                table: "Initiatives",
                columns: new[] { "CategoryId", "State", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_Initiatives_OwnerId_State_UpdatedAt_Id",
                table: "Initiatives",
                columns: new[] { "OwnerId", "State", "UpdatedAt", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_Initiatives_State_Visibility_CreatedAt_Id",
                table: "Initiatives",
                columns: new[] { "State", "Visibility", "CreatedAt", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_InitiativeSkills_InitiativeId_Position",
                table: "InitiativeSkills",
                columns: new[] { "InitiativeId", "Position" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InitiativeSkills_SkillId_InitiativeId",
                table: "InitiativeSkills",
                columns: new[] { "SkillId", "InitiativeId" });

            migrationBuilder.CreateIndex(
                name: "IX_InitiativeTags_InitiativeId_NormalizedValue",
                table: "InitiativeTags",
                columns: new[] { "InitiativeId", "NormalizedValue" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Sessions_ExpiresAt",
                table: "Sessions",
                column: "ExpiresAt");

            migrationBuilder.CreateIndex(
                name: "IX_Sessions_TokenHash",
                table: "Sessions",
                column: "TokenHash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Sessions_UserId_CreatedAt",
                table: "Sessions",
                columns: new[] { "UserId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Skills_NameNormalized",
                table: "Skills",
                column: "NameNormalized",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserInterests_UserId_NormalizedValue",
                table: "UserInterests",
                columns: new[] { "UserId", "NormalizedValue" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Career_Availability_Id",
                table: "Users",
                columns: new[] { "Career", "Availability", "Id" });

            migrationBuilder.CreateIndex(
                name: "UX_Users_EmailNormalized",
                table: "Users",
                column: "EmailNormalized",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserSkills_SkillId_UserId",
                table: "UserSkills",
                columns: new[] { "SkillId", "UserId" });

            migrationBuilder.CreateIndex(
                name: "IX_UserSkills_UserId_Position",
                table: "UserSkills",
                columns: new[] { "UserId", "Position" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InitiativeSkills");

            migrationBuilder.DropTable(
                name: "InitiativeTags");

            migrationBuilder.DropTable(
                name: "Sessions");

            migrationBuilder.DropTable(
                name: "UserInterests");

            migrationBuilder.DropTable(
                name: "UserSkills");

            migrationBuilder.DropTable(
                name: "Initiatives");

            migrationBuilder.DropTable(
                name: "Skills");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
