using InnovationHub.ServidorNet.Modelos;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InnovationHub.ServidorNet.Datos.Configuraciones;

internal sealed class InitiativeConfiguration : IEntityTypeConfiguration<Initiative>
{
    public void Configure(EntityTypeBuilder<Initiative> entity)
    {
        entity.ToTable("Initiatives", table =>
        {
            table.HasCheckConstraint("CK_Initiatives_Title", ModelRules.Length("Title", 5, 100));
            table.HasCheckConstraint("CK_Initiatives_Summary", ModelRules.Length("Summary", 15, 240));
            table.HasCheckConstraint("CK_Initiatives_Description", ModelRules.Length("Description", 20, 2000));
            table.HasCheckConstraint("CK_Initiatives_Problem", ModelRules.Length("Problem", 10, 500));
            table.HasCheckConstraint("CK_Initiatives_Beneficiaries", ModelRules.Length("Beneficiaries", 3, 150));
            table.HasCheckConstraint("CK_Initiatives_Type", "[Type] IN ('idea','need','challenge')");
            table.HasCheckConstraint("CK_Initiatives_Visibility", "[Visibility] IN ('public','institutional','restricted','private')");
            table.HasCheckConstraint("CK_Initiatives_State", "[State] IN ('draft','published','forming_team','converted','archived')");
            table.HasCheckConstraint("CK_Initiatives_EstimatedMembers", "[EstimatedMembers] BETWEEN 1 AND 100");
            table.HasCheckConstraint("CK_Initiatives_Revision", "[Revision] >= 0");
            table.HasCheckConstraint("CK_Initiatives_Dates",
                $"[UpdatedAt] >= [CreatedAt] AND {ModelRules.Utc("CreatedAt")} AND {ModelRules.Utc("UpdatedAt")}");
        });
        entity.HasKey(x => x.Id);
        entity.Property(x => x.Id).ValueGeneratedNever();
        ModelRules.Text(entity.Property(x => x.Title), 100);
        ModelRules.FixedValue(entity.Property(x => x.Type), 9);
        ModelRules.Text(entity.Property(x => x.Summary), 240);
        ModelRules.Text(entity.Property(x => x.Description), 2000);
        ModelRules.Text(entity.Property(x => x.Problem), 500);
        ModelRules.Text(entity.Property(x => x.Beneficiaries), 150);
        entity.Property(x => x.CategoryId).HasMaxLength(80).IsUnicode(false)
            .UseCollation(ModelRules.BinaryCollation).IsRequired();
        ModelRules.FixedValue(entity.Property(x => x.Visibility), 13);
        ModelRules.FixedValue(entity.Property(x => x.State), 12);
        entity.Property(x => x.CreatedAt).HasPrecision(3);
        entity.Property(x => x.UpdatedAt).HasPrecision(3);
        entity.Property(x => x.Revision).IsConcurrencyToken();
        entity.HasIndex(x => new { x.OwnerId, x.State, x.UpdatedAt, x.Id });
        entity.HasIndex(x => new { x.State, x.Visibility, x.CreatedAt, x.Id });
        entity.HasIndex(x => new { x.CategoryId, x.State, x.Id });
        entity.HasOne(x => x.Owner).WithMany(x => x.OwnedInitiatives)
            .HasForeignKey(x => x.OwnerId).OnDelete(DeleteBehavior.Restrict);
        entity.HasOne(x => x.Category).WithMany(x => x.Initiatives)
            .HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Restrict);
        entity.HasMany(x => x.Skills).WithMany(x => x.Initiatives).UsingEntity<InitiativeSkill>(
            right => right.HasOne(x => x.Skill).WithMany(x => x.InitiativeSkills)
                .HasForeignKey(x => x.SkillId).OnDelete(DeleteBehavior.Restrict),
            left => left.HasOne(x => x.Initiative).WithMany(x => x.InitiativeSkills)
                .HasForeignKey(x => x.InitiativeId).OnDelete(DeleteBehavior.Cascade));
    }
}

internal sealed class InitiativeSkillConfiguration : IEntityTypeConfiguration<InitiativeSkill>
{
    public void Configure(EntityTypeBuilder<InitiativeSkill> entity)
    {
        entity.ToTable("InitiativeSkills", table =>
            table.HasCheckConstraint("CK_InitiativeSkills_Position", "[Position] BETWEEN 0 AND 9"));
        entity.HasKey(x => new { x.InitiativeId, x.SkillId });
        entity.HasIndex(x => new { x.InitiativeId, x.Position }).IsUnique();
        entity.HasIndex(x => new { x.SkillId, x.InitiativeId });
    }
}

internal sealed class InitiativeTagConfiguration : IEntityTypeConfiguration<InitiativeTag>
{
    public void Configure(EntityTypeBuilder<InitiativeTag> entity)
    {
        entity.ToTable("InitiativeTags", table =>
        {
            table.HasCheckConstraint("CK_InitiativeTags_Position", "[Position] BETWEEN 0 AND 9");
            table.HasCheckConstraint("CK_InitiativeTags_Value", ModelRules.Length("Value", 1, 40));
            table.HasCheckConstraint("CK_InitiativeTags_NormalizedValue", ModelRules.Length("NormalizedValue", 1, 40));
        });
        entity.HasKey(x => new { x.InitiativeId, x.Position });
        ModelRules.Text(entity.Property(x => x.Value), 40);
        ModelRules.FixedValue(entity.Property(x => x.NormalizedValue), 40);
        entity.HasIndex(x => new { x.InitiativeId, x.NormalizedValue }).IsUnique();
        entity.HasOne(x => x.Initiative).WithMany(x => x.Tags)
            .HasForeignKey(x => x.InitiativeId).OnDelete(DeleteBehavior.Cascade);
    }
}
