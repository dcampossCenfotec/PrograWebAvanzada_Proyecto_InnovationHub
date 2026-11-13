namespace InnovationHub.ServidorNet.Modelos;

public sealed class Project
{
    public Guid Id { get; set; }
    public Guid SourceInitiativeId { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
    public required string Objective { get; set; }
    public required string State { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly? EstimatedEndDate { get; set; }
    public string? RepositoryUrl { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public Initiative SourceInitiative { get; set; } = null!;
    public ICollection<ProjectTechnology> Technologies { get; set; } = [];
}
