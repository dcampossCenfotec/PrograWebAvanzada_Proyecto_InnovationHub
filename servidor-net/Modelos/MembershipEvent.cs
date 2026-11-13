namespace InnovationHub.ServidorNet.Modelos;

public sealed class MembershipEvent
{
    public Guid Id { get; set; }
    public Guid MembershipId { get; set; }
    public Guid ActorId { get; set; }
    public Guid? RequestId { get; set; }
    public required string Type { get; set; }
    public DateTimeOffset OccurredAt { get; set; }
    public Membership Membership { get; set; } = null!;
    public User Actor { get; set; } = null!;
    public ParticipationRequest? Request { get; set; }
}
