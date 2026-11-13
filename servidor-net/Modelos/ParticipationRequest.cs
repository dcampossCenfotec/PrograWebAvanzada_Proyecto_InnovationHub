namespace InnovationHub.ServidorNet.Modelos;

public sealed class ParticipationRequest
{
    public Guid Id { get; set; }
    public Guid InitiativeId { get; set; }
    public Guid ApplicantId { get; set; }
    public Guid OfferedSkillId { get; set; }
    public required string Message { get; set; }
    public required string Role { get; set; }
    public required string Availability { get; set; }
    public required string State { get; set; }
    public string? DecisionComment { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? DecidedAt { get; set; }
    public Initiative Initiative { get; set; } = null!;
    public User Applicant { get; set; } = null!;
    public Skill OfferedSkill { get; set; } = null!;
    public Membership? Membership { get; set; }
    public ICollection<MembershipEvent> Events { get; set; } = [];
}
