namespace InnovationHub.ServidorNet.Modelos;

public sealed class ProjectTechnology
{
    public Guid ProjectId { get; set; }
    public int Position { get; set; }
    public required string Value { get; set; }
    public required string NormalizedValue { get; set; }
    public Project Project { get; set; } = null!;
}
