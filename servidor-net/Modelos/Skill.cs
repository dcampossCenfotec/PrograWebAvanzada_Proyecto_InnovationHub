namespace InnovationHub.ServidorNet.Modelos;

public sealed class Skill
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string NameNormalized { get; set; }
    public bool Active { get; set; }
    public ICollection<User> Users { get; set; } = [];
    public ICollection<UserSkill> UserSkills { get; set; } = [];
    public ICollection<Initiative> Initiatives { get; set; } = [];
    public ICollection<InitiativeSkill> InitiativeSkills { get; set; } = [];
}
