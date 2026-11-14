using System.Globalization;
using InnovationHub.ServidorNet.Datos;
using Microsoft.EntityFrameworkCore;

namespace InnovationHub.ServidorNet.Lecturas;

// Solo las dos lecturas anónimas de Tarea 3. No serializa entidades EF ni simula sesión.
internal static class PublicReadEndpoints
{
    internal static void MapPublicReads(this WebApplication app)
    {
        app.MapGet("/api/categories", CategoriesAsync);
        app.MapGet("/api/initiatives/{id}", InitiativeAsync);
    }

    private static async Task<IResult> CategoriesAsync(HttpRequest request,
        InnovationHubContext context, CancellationToken cancellationToken)
    {
        if (InvalidQuery(request) is { } invalid) return invalid;
        var data = await context.Categories.AsNoTracking()
            .Where(category => category.Active)
            .OrderBy(category => category.NameNormalized).ThenBy(category => category.Id)
            .Select(category => new { id = category.Id, name = category.Name })
            .ToListAsync(cancellationToken);
        return Results.Ok(new { data });
    }

    private static async Task<IResult> InitiativeAsync(string id, HttpRequest request,
        InnovationHubContext context, CancellationToken cancellationToken)
    {
        // Express intenta autenticar cualquier Authorization presente antes del detalle.
        // Esta fase no implementa sesiones: el consumidor debe hacer estas lecturas sin token.
        if (request.Headers.ContainsKey("Authorization")) return AuthenticationRequired();
        if (!TryContractId(id, out var initiativeId))
            return Error(400, "VALIDATION_ERROR", "Revisa los campos indicados.",
                new Dictionary<string, string> { ["id"] = "Debe ser un UUID válido." });
        if (InvalidQuery(request) is { } invalid) return invalid;

        var data = await context.Initiatives.AsNoTracking().AsSingleQuery()
            .Where(initiative => initiative.Id == initiativeId && initiative.Visibility == "public"
                && initiative.State != "draft" && initiative.State != "archived")
            .Select(initiative => new
            {
                Entry = initiative,
                MemberCount = initiative.Memberships.Count(member => member.State == "active"),
            })
            .Select(row => new
            {
                // System.Text.Json representa Guid como texto canónico, igual al contrato.
                id = row.Entry.Id,
                title = row.Entry.Title,
                type = row.Entry.Type,
                summary = row.Entry.Summary,
                category = new { id = row.Entry.Category.Id, name = row.Entry.Category.Name },
                skills = row.Entry.InitiativeSkills.OrderBy(link => link.Position)
                    .Select(link => new { id = link.SkillId, name = link.Skill.Name }).ToArray(),
                estimatedMembers = row.Entry.EstimatedMembers,
                memberCount = row.MemberCount,
                availableSpaces = row.Entry.EstimatedMembers > row.MemberCount
                    ? row.Entry.EstimatedMembers - row.MemberCount : 0,
                visibility = row.Entry.Visibility,
                state = row.Entry.State,
                access = new
                {
                    canViewDetails = true, canEdit = false, canDelete = false,
                    canArchive = false, canRequest = false, canManageRequests = false,
                    canViewTeam = true, canConvert = false,
                },
                owner = new
                {
                    id = row.Entry.Owner.Id,
                    firstName = row.Entry.Owner.FirstName,
                    lastName = row.Entry.Owner.LastName,
                },
                tags = row.Entry.Tags.OrderBy(tag => tag.Position).Select(tag => tag.Value).ToArray(),
                createdAt = ContractDate(row.Entry.CreatedAt),
                updatedAt = ContractDate(row.Entry.UpdatedAt),
                description = row.Entry.Description,
                problem = row.Entry.Problem,
                beneficiaries = row.Entry.Beneficiaries,
            }).SingleOrDefaultAsync(cancellationToken);
        if (data is not null) return Results.Ok(new { data });

        // Para decidir 401/404 no se cargan texto privado, dueño, equipo ni competencias.
        var access = await context.Initiatives.AsNoTracking().Where(initiative => initiative.Id == initiativeId)
            .Select(initiative => new { initiative.Visibility, initiative.State })
            .SingleOrDefaultAsync(cancellationToken);
        if (access is not null && access.State is not ("draft" or "archived")
            && access.Visibility is "institutional" or "restricted") return AuthenticationRequired();
        return Error(404, "NOT_FOUND", "No se encontró el recurso solicitado.");
    }

    private static string ContractDate(DateTimeOffset value) =>
        value.ToUniversalTime().ToString("yyyy-MM-dd'T'HH:mm:ss.fff'Z'", CultureInfo.InvariantCulture);

    private static bool TryContractId(string value, out Guid id)
    {
        id = default;
        return value.Length == 36 && value[14] == '4'
            && "89abAB".Contains(value[19]) && Guid.TryParseExact(value, "D", out id);
    }

    private static IResult? InvalidQuery(HttpRequest request)
    {
        if (request.Query.Count == 0) return null;
        var fields = request.Query.Keys.ToDictionary(key => key, _ => "Este campo no está permitido.");
        return Error(400, "INVALID_QUERY", "Revisa los parámetros de consulta.", fields);
    }

    private static IResult AuthenticationRequired() =>
        Error(401, "AUTHENTICATION_REQUIRED", "Se requiere una sesión válida.");

    private static IResult Error(int status, string code, string message,
        Dictionary<string, string>? fields = null) =>
        Results.Json(new { error = new { code, message, fields = fields ?? [] } }, statusCode: status);
}
