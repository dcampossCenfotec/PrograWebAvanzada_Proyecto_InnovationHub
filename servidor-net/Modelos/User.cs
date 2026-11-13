namespace InnovationHub.ServidorNet.Modelos;

public sealed class User
{
    public Guid Id { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string MemberType { get; set; }
    public required string Email { get; set; }
    public required string EmailNormalized { get; set; }
    public string? PasswordHash { get; set; }
    public string? Career { get; set; }
    public string? Bio { get; set; }
    public string? PortfolioUrl { get; set; }
    public required string Availability { get; set; }
    public bool Active { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public ICollection<Skill> Skills { get; set; } = [];
    public ICollection<UserSkill> UserSkills { get; set; } = [];
    public ICollection<UserInterest> Interests { get; set; } = [];
    public ICollection<Initiative> OwnedInitiatives { get; set; } = [];
    public ICollection<Session> Sessions { get; set; } = [];
}
