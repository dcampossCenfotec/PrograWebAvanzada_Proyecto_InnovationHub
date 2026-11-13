namespace InnovationHub.ServidorNet.Modelos;

public sealed class UserInterest
{
    public Guid UserId { get; set; }
    public int Position { get; set; }
    public required string Value { get; set; }
    public required string NormalizedValue { get; set; }
    public User User { get; set; } = null!;
}
