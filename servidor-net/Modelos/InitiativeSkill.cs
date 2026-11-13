namespace InnovationHub.ServidorNet.Modelos;

public sealed class InitiativeSkill
{
    public Guid InitiativeId { get; set; }
    public Guid SkillId { get; set; }
    public int Position { get; set; }
    public Initiative Initiative { get; set; } = null!;
    public Skill Skill { get; set; } = null!;
}
