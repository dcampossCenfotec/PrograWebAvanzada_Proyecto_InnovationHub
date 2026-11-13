using InnovationHub.ServidorNet.Modelos;
using Microsoft.EntityFrameworkCore;

namespace InnovationHub.ServidorNet.Datos;

public sealed class InnovationHubContext(DbContextOptions<InnovationHubContext> options)
    : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Session> Sessions => Set<Session>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Skill> Skills => Set<Skill>();
    public DbSet<UserSkill> UserSkills => Set<UserSkill>();
    public DbSet<UserInterest> UserInterests => Set<UserInterest>();
    public DbSet<Initiative> Initiatives => Set<Initiative>();
    public DbSet<InitiativeSkill> InitiativeSkills => Set<InitiativeSkill>();
    public DbSet<InitiativeTag> InitiativeTags => Set<InitiativeTag>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(InnovationHubContext).Assembly);
        CoreSeed.Configure(modelBuilder);
    }
}
