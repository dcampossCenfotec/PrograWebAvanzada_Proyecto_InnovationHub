namespace InnovationHub.ServidorNet.Modelos;

public sealed class InitiativeTag
{
    public Guid InitiativeId { get; set; }
    public int Position { get; set; }
    public required string Value { get; set; }
    public required string NormalizedValue { get; set; }
    public Initiative Initiative { get; set; } = null!;
}
