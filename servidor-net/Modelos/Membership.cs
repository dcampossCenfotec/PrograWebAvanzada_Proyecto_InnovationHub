namespace InnovationHub.ServidorNet.Modelos;

public sealed class Membership
{
    public Guid Id { get; set; }
    public Guid InitiativeId { get; set; }
    public Guid UserId { get; set; }
    public Guid? SourceRequestId { get; set; }
    public required string Role { get; set; }
    public required string State { get; set; }
    public DateTimeOffset JoinedAt { get; set; }
    public DateTimeOffset? RetiredAt { get; set; }
    public Initiative Initiative { get; set; } = null!;
    public User User { get; set; } = null!;
    public ParticipationRequest? SourceRequest { get; set; }
    public ICollection<MembershipEvent> Events { get; set; } = [];
}
