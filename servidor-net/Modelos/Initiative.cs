namespace InnovationHub.ServidorNet.Modelos;

public sealed class Initiative
{
    public Guid Id { get; set; }
    public Guid OwnerId { get; set; }
    public required string Title { get; set; }
    public required string Type { get; set; }
    public required string Summary { get; set; }
    public required string Description { get; set; }
    public required string Problem { get; set; }
    public required string Beneficiaries { get; set; }
    public required string CategoryId { get; set; }
    public int EstimatedMembers { get; set; }
    public required string Visibility { get; set; }
    public required string State { get; set; }
    public int Revision { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public User Owner { get; set; } = null!;
    public Category Category { get; set; } = null!;
    public ICollection<Skill> Skills { get; set; } = [];
    public ICollection<InitiativeSkill> InitiativeSkills { get; set; } = [];
    public ICollection<InitiativeTag> Tags { get; set; } = [];
    public ICollection<ParticipationRequest> Requests { get; set; } = [];
    public ICollection<Membership> Memberships { get; set; } = [];
    public Project? Project { get; set; }
}
