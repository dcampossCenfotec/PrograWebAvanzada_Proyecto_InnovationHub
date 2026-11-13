namespace InnovationHub.ServidorNet.Modelos;

public sealed class UserSkill
{
    public Guid UserId { get; set; }
    public Guid SkillId { get; set; }
    public required string Level { get; set; }
    public int Position { get; set; }
    public User User { get; set; } = null!;
    public Skill Skill { get; set; } = null!;
}
