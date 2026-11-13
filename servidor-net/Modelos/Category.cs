namespace InnovationHub.ServidorNet.Modelos;

public sealed class Category
{
    public required string Id { get; set; }
    public required string Name { get; set; }
    public required string NameNormalized { get; set; }
    public bool Active { get; set; }
    public ICollection<Initiative> Initiatives { get; set; } = [];
}
