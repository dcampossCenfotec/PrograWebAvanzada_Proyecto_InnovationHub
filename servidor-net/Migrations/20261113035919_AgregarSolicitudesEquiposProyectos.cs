using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace InnovationHub.ServidorNet.Migrations
{
    /// <inheritdoc />
    public partial class AgregarSolicitudesEquiposProyectos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ParticipationRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InitiativeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ApplicantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OfferedSkillId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Role = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Availability = table.Column<string>(type: "nvarchar(6)", maxLength: 6, nullable: false, collation: "Latin1_General_100_BIN2"),
                    State = table.Column<string>(type: "nvarchar(9)", maxLength: 9, nullable: false, collation: "Latin1_General_100_BIN2"),
                    DecisionComment = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false),
                    DecidedAt = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ParticipationRequests", x => x.Id);
                    table.UniqueConstraint("AK_Requests_Id_Initiative_Applicant", x => new { x.Id, x.InitiativeId, x.ApplicantId });
                    table.CheckConstraint("CK_Requests_Availability", "[Availability] IN ('low','medium','high')");
                    table.CheckConstraint("CK_Requests_Dates", "[UpdatedAt] >= [CreatedAt] AND DATEPART(TZOFFSET, [CreatedAt]) = 0 AND DATEPART(TZOFFSET, [UpdatedAt]) = 0 AND ([DecidedAt] IS NULL OR ([DecidedAt] BETWEEN [CreatedAt] AND [UpdatedAt] AND DATEPART(TZOFFSET, [DecidedAt]) = 0))");
                    table.CheckConstraint("CK_Requests_Decision", "([State] IN ('accepted','rejected') AND [DecidedAt] IS NOT NULL) OR ([State] IN ('pending','cancelled') AND [DecidedAt] IS NULL)");
                    table.CheckConstraint("CK_Requests_DecisionComment", "[DecisionComment] IS NULL OR DATALENGTH(LTRIM(RTRIM([DecisionComment])))/2 BETWEEN 1 AND 500");
                    table.CheckConstraint("CK_Requests_Message", "DATALENGTH(LTRIM(RTRIM([Message])))/2 BETWEEN 15 AND 500");
                    table.CheckConstraint("CK_Requests_Role", "DATALENGTH(LTRIM(RTRIM([Role])))/2 BETWEEN 3 AND 100");
                    table.CheckConstraint("CK_Requests_State", "[State] IN ('pending','accepted','rejected','cancelled')");
                    table.ForeignKey(
                        name: "FK_ParticipationRequests_Initiatives_InitiativeId",
                        column: x => x.InitiativeId,
                        principalTable: "Initiatives",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ParticipationRequests_Skills_OfferedSkillId",
                        column: x => x.OfferedSkillId,
                        principalTable: "Skills",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ParticipationRequests_Users_ApplicantId",
                        column: x => x.ApplicantId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Projects",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SourceInitiativeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Objective = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    State = table.Column<string>(type: "nvarchar(14)", maxLength: 14, nullable: false, collation: "Latin1_General_100_BIN2"),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EstimatedEndDate = table.Column<DateOnly>(type: "date", nullable: true),
                    RepositoryUrl = table.Column<string>(type: "nvarchar(2048)", maxLength: 2048, nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Projects", x => x.Id);
                    table.CheckConstraint("CK_Projects_Calendar", "[EstimatedEndDate] IS NULL OR [EstimatedEndDate] >= [StartDate]");
                    table.CheckConstraint("CK_Projects_Dates", "[UpdatedAt] >= [CreatedAt] AND DATEPART(TZOFFSET, [CreatedAt]) = 0 AND DATEPART(TZOFFSET, [UpdatedAt]) = 0");
                    table.CheckConstraint("CK_Projects_Description", "DATALENGTH(LTRIM(RTRIM([Description])))/2 BETWEEN 20 AND 2000");
                    table.CheckConstraint("CK_Projects_Name", "DATALENGTH(LTRIM(RTRIM([Name])))/2 BETWEEN 5 AND 120");
                    table.CheckConstraint("CK_Projects_Objective", "DATALENGTH(LTRIM(RTRIM([Objective])))/2 BETWEEN 10 AND 500");
                    table.CheckConstraint("CK_Projects_RepositoryUrl", "[RepositoryUrl] IS NULL OR DATALENGTH(LTRIM(RTRIM([RepositoryUrl])))/2 BETWEEN 1 AND 2048");
                    table.CheckConstraint("CK_Projects_State", "[State] IN ('planning','in_development','paused','finished','archived')");
                    table.ForeignKey(
                        name: "FK_Projects_Initiatives_SourceInitiativeId",
                        column: x => x.SourceInitiativeId,
                        principalTable: "Initiatives",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Memberships",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InitiativeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SourceRequestId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Role = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    State = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false, collation: "Latin1_General_100_BIN2"),
                    JoinedAt = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false),
                    RetiredAt = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Memberships", x => x.Id);
                    table.CheckConstraint("CK_Memberships_Dates", "DATEPART(TZOFFSET, [JoinedAt]) = 0 AND ([RetiredAt] IS NULL OR ([RetiredAt] >= [JoinedAt] AND DATEPART(TZOFFSET, [RetiredAt]) = 0))");
                    table.CheckConstraint("CK_Memberships_Retirement", "([State] = 'active' AND [RetiredAt] IS NULL) OR ([State] = 'retired' AND [RetiredAt] IS NOT NULL)");
                    table.CheckConstraint("CK_Memberships_Role", "DATALENGTH(LTRIM(RTRIM([Role])))/2 BETWEEN 2 AND 150");
                    table.CheckConstraint("CK_Memberships_State", "[State] IN ('active','retired')");
                    table.ForeignKey(
                        name: "FK_Memberships_Initiatives_InitiativeId",
                        column: x => x.InitiativeId,
                        principalTable: "Initiatives",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Memberships_ParticipationRequests_SourceRequestId_InitiativeId_UserId",
                        columns: x => new { x.SourceRequestId, x.InitiativeId, x.UserId },
                        principalTable: "ParticipationRequests",
                        principalColumns: new[] { "Id", "InitiativeId", "ApplicantId" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Memberships_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProjectTechnologies",
                columns: table => new
                {
                    ProjectId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Position = table.Column<int>(type: "int", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    NormalizedValue = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, collation: "Latin1_General_100_BIN2")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectTechnologies", x => new { x.ProjectId, x.Position });
                    table.CheckConstraint("CK_ProjectTechnologies_NormalizedValue", "DATALENGTH(LTRIM(RTRIM([NormalizedValue])))/2 BETWEEN 1 AND 50");
                    table.CheckConstraint("CK_ProjectTechnologies_Position", "[Position] BETWEEN 0 AND 19");
                    table.CheckConstraint("CK_ProjectTechnologies_Value", "DATALENGTH(LTRIM(RTRIM([Value])))/2 BETWEEN 1 AND 50");
                    table.ForeignKey(
                        name: "FK_ProjectTechnologies_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MembershipEvents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MembershipId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ActorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RequestId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Type = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false, collation: "Latin1_General_100_BIN2"),
                    OccurredAt = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MembershipEvents", x => x.Id);
                    table.CheckConstraint("CK_MembershipEvents_Type", "[Type] IN ('joined','retired')");
                    table.CheckConstraint("CK_MembershipEvents_Utc", "DATEPART(TZOFFSET, [OccurredAt]) = 0");
                    table.ForeignKey(
                        name: "FK_MembershipEvents_Memberships_MembershipId",
                        column: x => x.MembershipId,
                        principalTable: "Memberships",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MembershipEvents_ParticipationRequests_RequestId",
                        column: x => x.RequestId,
                        principalTable: "ParticipationRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MembershipEvents_Users_ActorId",
                        column: x => x.ActorId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "Memberships",
                columns: new[] { "Id", "InitiativeId", "JoinedAt", "RetiredAt", "Role", "SourceRequestId", "State", "UserId" },
                values: new object[,]
                {
                    { new Guid("30000000-0000-4000-8000-000000000001"), new Guid("10000000-0000-4000-8000-000000000001"), new DateTimeOffset(new DateTime(2026, 10, 20, 14, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "Propietaria", null, "active", new Guid("11111111-1111-4111-8111-111111111111") },
                    { new Guid("30000000-0000-4000-8000-000000000002"), new Guid("10000000-0000-4000-8000-000000000002"), new DateTimeOffset(new DateTime(2026, 10, 20, 15, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "Propietaria", null, "active", new Guid("11111111-1111-4111-8111-111111111111") },
                    { new Guid("30000000-0000-4000-8000-000000000003"), new Guid("10000000-0000-4000-8000-000000000003"), new DateTimeOffset(new DateTime(2026, 10, 20, 16, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "Propietaria", null, "active", new Guid("11111111-1111-4111-8111-111111111111") },
                    { new Guid("30000000-0000-4000-8000-000000000004"), new Guid("10000000-0000-4000-8000-000000000004"), new DateTimeOffset(new DateTime(2026, 10, 21, 14, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "Propietaria", null, "active", new Guid("11111111-1111-4111-8111-111111111111") },
                    { new Guid("30000000-0000-4000-8000-000000000005"), new Guid("10000000-0000-4000-8000-000000000005"), new DateTimeOffset(new DateTime(2026, 10, 21, 15, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "Propietaria", null, "active", new Guid("11111111-1111-4111-8111-111111111111") },
                    { new Guid("30000000-0000-4000-8000-000000000006"), new Guid("10000000-0000-4000-8000-000000000006"), new DateTimeOffset(new DateTime(2026, 10, 22, 14, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "Propietaria", null, "active", new Guid("11111111-1111-4111-8111-111111111111") },
                    { new Guid("30000000-0000-4000-8000-000000000007"), new Guid("10000000-0000-4000-8000-000000000007"), new DateTimeOffset(new DateTime(2026, 10, 22, 15, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "Propietaria", null, "active", new Guid("11111111-1111-4111-8111-111111111111") },
                    { new Guid("30000000-0000-4000-8000-000000000008"), new Guid("10000000-0000-4000-8000-000000000008"), new DateTimeOffset(new DateTime(2026, 10, 23, 14, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "Propietaria", null, "active", new Guid("11111111-1111-4111-8111-111111111111") },
                    { new Guid("30000000-0000-4000-8000-000000000010"), new Guid("10000000-0000-4000-8000-000000000008"), new DateTimeOffset(new DateTime(2026, 10, 24, 10, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "Coordinación de talleres", null, "active", new Guid("55555555-5555-4555-8555-555555555555") },
                    { new Guid("30000000-0000-4000-8000-000000000012"), new Guid("10000000-0000-4000-8000-000000000008"), new DateTimeOffset(new DateTime(2026, 10, 24, 12, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2026, 10, 27, 12, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "Investigación laboral", null, "retired", new Guid("22222222-2222-4222-8222-222222222222") }
                });

            migrationBuilder.InsertData(
                table: "ParticipationRequests",
                columns: new[] { "Id", "ApplicantId", "Availability", "CreatedAt", "DecidedAt", "DecisionComment", "InitiativeId", "Message", "OfferedSkillId", "Role", "State", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("20000000-0000-4000-8000-000000000001"), new Guid("55555555-5555-4555-8555-555555555555"), "high", new DateTimeOffset(new DateTime(2026, 10, 21, 10, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2026, 10, 22, 10, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "Bienvenida al equipo de accesibilidad.", new Guid("10000000-0000-4000-8000-000000000002"), "Puedo coordinar los levantamientos y organizar las visitas semanales.", new Guid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5"), "Coordinación logística", "accepted", new DateTimeOffset(new DateTime(2026, 10, 22, 10, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("20000000-0000-4000-8000-000000000002"), new Guid("22222222-2222-4222-8222-222222222222"), "medium", new DateTimeOffset(new DateTime(2026, 10, 22, 10, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, null, new Guid("10000000-0000-4000-8000-000000000005"), "Puedo apoyar la comunicación con organizaciones y posibles donantes.", new Guid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4"), "Comunicación con donantes", "cancelled", new DateTimeOffset(new DateTime(2026, 10, 23, 10, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("20000000-0000-4000-8000-000000000003"), new Guid("22222222-2222-4222-8222-222222222222"), "medium", new DateTimeOffset(new DateTime(2026, 10, 23, 10, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2026, 10, 24, 10, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "El primer ciclo ya tenía cubierta esta función.", new Guid("10000000-0000-4000-8000-000000000004"), "Quiero preparar materiales para las sesiones de mentoría tecnológica.", new Guid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4"), "Preparación de materiales", "rejected", new DateTimeOffset(new DateTime(2026, 10, 24, 10, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("20000000-0000-4000-8000-000000000004"), new Guid("22222222-2222-4222-8222-222222222222"), "medium", new DateTimeOffset(new DateTime(2026, 10, 26, 10, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, null, new Guid("10000000-0000-4000-8000-000000000004"), "Ahora puedo apoyar la investigación y seguimiento de cada mentoría.", new Guid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3"), "Seguimiento de mentorías", "pending", new DateTimeOffset(new DateTime(2026, 10, 26, 10, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { new Guid("20000000-0000-4000-8000-000000000005"), new Guid("33333333-3333-4333-8333-333333333333"), "low", new DateTimeOffset(new DateTime(2026, 10, 25, 11, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new DateTimeOffset(new DateTime(2026, 10, 26, 11, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, new Guid("10000000-0000-4000-8000-000000000008"), "Puedo revisar materiales y realizar entrevistas de práctica con participantes.", new Guid("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3"), "Mentoría de entrevistas", "accepted", new DateTimeOffset(new DateTime(2026, 10, 26, 11, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) }
                });

            migrationBuilder.InsertData(
                table: "Projects",
                columns: new[] { "Id", "CreatedAt", "Description", "EstimatedEndDate", "Name", "Objective", "RepositoryUrl", "SourceInitiativeId", "StartDate", "State", "UpdatedAt" },
                values: new object[] { new Guid("50000000-0000-4000-8000-000000000001"), new DateTimeOffset(new DateTime(2026, 10, 25, 16, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "Implementación de talleres y recursos para preparar postulaciones y entrevistas.", new DateOnly(2027, 2, 28), "Programa de orientación laboral", "Acompañar a participantes durante la preparación de su búsqueda laboral.", null, new Guid("10000000-0000-4000-8000-000000000008"), new DateOnly(2026, 11, 1), "planning", new DateTimeOffset(new DateTime(2026, 10, 25, 16, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.InsertData(
                table: "MembershipEvents",
                columns: new[] { "Id", "ActorId", "MembershipId", "OccurredAt", "RequestId", "Type" },
                values: new object[,]
                {
                    { new Guid("40000000-0000-4000-8000-000000000001"), new Guid("11111111-1111-4111-8111-111111111111"), new Guid("30000000-0000-4000-8000-000000000001"), new DateTimeOffset(new DateTime(2026, 10, 20, 14, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "joined" },
                    { new Guid("40000000-0000-4000-8000-000000000002"), new Guid("11111111-1111-4111-8111-111111111111"), new Guid("30000000-0000-4000-8000-000000000002"), new DateTimeOffset(new DateTime(2026, 10, 20, 15, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "joined" },
                    { new Guid("40000000-0000-4000-8000-000000000003"), new Guid("11111111-1111-4111-8111-111111111111"), new Guid("30000000-0000-4000-8000-000000000003"), new DateTimeOffset(new DateTime(2026, 10, 20, 16, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "joined" },
                    { new Guid("40000000-0000-4000-8000-000000000004"), new Guid("11111111-1111-4111-8111-111111111111"), new Guid("30000000-0000-4000-8000-000000000004"), new DateTimeOffset(new DateTime(2026, 10, 21, 14, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "joined" },
                    { new Guid("40000000-0000-4000-8000-000000000005"), new Guid("11111111-1111-4111-8111-111111111111"), new Guid("30000000-0000-4000-8000-000000000005"), new DateTimeOffset(new DateTime(2026, 10, 21, 15, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "joined" },
                    { new Guid("40000000-0000-4000-8000-000000000006"), new Guid("11111111-1111-4111-8111-111111111111"), new Guid("30000000-0000-4000-8000-000000000006"), new DateTimeOffset(new DateTime(2026, 10, 22, 14, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "joined" },
                    { new Guid("40000000-0000-4000-8000-000000000007"), new Guid("11111111-1111-4111-8111-111111111111"), new Guid("30000000-0000-4000-8000-000000000007"), new DateTimeOffset(new DateTime(2026, 10, 22, 15, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "joined" },
                    { new Guid("40000000-0000-4000-8000-000000000008"), new Guid("11111111-1111-4111-8111-111111111111"), new Guid("30000000-0000-4000-8000-000000000008"), new DateTimeOffset(new DateTime(2026, 10, 23, 14, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "joined" },
                    { new Guid("40000000-0000-4000-8000-000000000010"), new Guid("11111111-1111-4111-8111-111111111111"), new Guid("30000000-0000-4000-8000-000000000010"), new DateTimeOffset(new DateTime(2026, 10, 24, 10, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "joined" },
                    { new Guid("40000000-0000-4000-8000-000000000012"), new Guid("11111111-1111-4111-8111-111111111111"), new Guid("30000000-0000-4000-8000-000000000012"), new DateTimeOffset(new DateTime(2026, 10, 24, 12, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "joined" },
                    { new Guid("40000000-0000-4000-8000-000000000013"), new Guid("11111111-1111-4111-8111-111111111111"), new Guid("30000000-0000-4000-8000-000000000012"), new DateTimeOffset(new DateTime(2026, 10, 27, 12, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "retired" }
                });

            migrationBuilder.InsertData(
                table: "Memberships",
                columns: new[] { "Id", "InitiativeId", "JoinedAt", "RetiredAt", "Role", "SourceRequestId", "State", "UserId" },
                values: new object[,]
                {
                    { new Guid("30000000-0000-4000-8000-000000000009"), new Guid("10000000-0000-4000-8000-000000000002"), new DateTimeOffset(new DateTime(2026, 10, 22, 10, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "Coordinación logística", new Guid("20000000-0000-4000-8000-000000000001"), "active", new Guid("55555555-5555-4555-8555-555555555555") },
                    { new Guid("30000000-0000-4000-8000-000000000011"), new Guid("10000000-0000-4000-8000-000000000008"), new DateTimeOffset(new DateTime(2026, 10, 26, 11, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "Mentoría de entrevistas", new Guid("20000000-0000-4000-8000-000000000005"), "active", new Guid("33333333-3333-4333-8333-333333333333") }
                });

            migrationBuilder.InsertData(
                table: "ProjectTechnologies",
                columns: new[] { "Position", "ProjectId", "NormalizedValue", "Value" },
                values: new object[,]
                {
                    { 0, new Guid("50000000-0000-4000-8000-000000000001"), "react", "React" },
                    { 1, new Guid("50000000-0000-4000-8000-000000000001"), "node.js", "Node.js" }
                });

            migrationBuilder.InsertData(
                table: "MembershipEvents",
                columns: new[] { "Id", "ActorId", "MembershipId", "OccurredAt", "RequestId", "Type" },
                values: new object[,]
                {
                    { new Guid("40000000-0000-4000-8000-000000000009"), new Guid("11111111-1111-4111-8111-111111111111"), new Guid("30000000-0000-4000-8000-000000000009"), new DateTimeOffset(new DateTime(2026, 10, 22, 10, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("20000000-0000-4000-8000-000000000001"), "joined" },
                    { new Guid("40000000-0000-4000-8000-000000000011"), new Guid("11111111-1111-4111-8111-111111111111"), new Guid("30000000-0000-4000-8000-000000000011"), new DateTimeOffset(new DateTime(2026, 10, 26, 11, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), new Guid("20000000-0000-4000-8000-000000000005"), "joined" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_MembershipEvents_ActorId_OccurredAt_Id",
                table: "MembershipEvents",
                columns: new[] { "ActorId", "OccurredAt", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_MembershipEvents_MembershipId_OccurredAt_Id",
                table: "MembershipEvents",
                columns: new[] { "MembershipId", "OccurredAt", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_MembershipEvents_MembershipId_Type",
                table: "MembershipEvents",
                columns: new[] { "MembershipId", "Type" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MembershipEvents_RequestId",
                table: "MembershipEvents",
                column: "RequestId");

            migrationBuilder.CreateIndex(
                name: "IX_Memberships_InitiativeId_State_JoinedAt_Id",
                table: "Memberships",
                columns: new[] { "InitiativeId", "State", "JoinedAt", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_Memberships_SourceRequestId_InitiativeId_UserId",
                table: "Memberships",
                columns: new[] { "SourceRequestId", "InitiativeId", "UserId" },
                unique: true,
                filter: "[SourceRequestId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Memberships_UserId_State_Id",
                table: "Memberships",
                columns: new[] { "UserId", "State", "Id" });

            migrationBuilder.CreateIndex(
                name: "UX_Memberships_Active",
                table: "Memberships",
                columns: new[] { "InitiativeId", "UserId" },
                unique: true,
                filter: "[State] = N'active'");

            migrationBuilder.CreateIndex(
                name: "IX_ParticipationRequests_ApplicantId_CreatedAt_Id",
                table: "ParticipationRequests",
                columns: new[] { "ApplicantId", "CreatedAt", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_ParticipationRequests_InitiativeId_State_CreatedAt_Id",
                table: "ParticipationRequests",
                columns: new[] { "InitiativeId", "State", "CreatedAt", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_ParticipationRequests_OfferedSkillId_State_Id",
                table: "ParticipationRequests",
                columns: new[] { "OfferedSkillId", "State", "Id" });

            migrationBuilder.CreateIndex(
                name: "UX_Requests_Pending",
                table: "ParticipationRequests",
                columns: new[] { "InitiativeId", "ApplicantId" },
                unique: true,
                filter: "[State] = N'pending'");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_CreatedAt_Id",
                table: "Projects",
                columns: new[] { "CreatedAt", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_Projects_SourceInitiativeId",
                table: "Projects",
                column: "SourceInitiativeId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProjectTechnologies_ProjectId_NormalizedValue",
                table: "ProjectTechnologies",
                columns: new[] { "ProjectId", "NormalizedValue" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MembershipEvents");

            migrationBuilder.DropTable(
                name: "ProjectTechnologies");

            migrationBuilder.DropTable(
                name: "Memberships");

            migrationBuilder.DropTable(
                name: "Projects");

            migrationBuilder.DropTable(
                name: "ParticipationRequests");
        }
    }
}
