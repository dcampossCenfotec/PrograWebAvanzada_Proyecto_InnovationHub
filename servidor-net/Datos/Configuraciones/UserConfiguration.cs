using InnovationHub.ServidorNet.Modelos;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InnovationHub.ServidorNet.Datos.Configuraciones;

internal sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> entity)
    {
        entity.ToTable("Users", table =>
        {
            table.HasCheckConstraint("CK_Users_FirstName", ModelRules.Length("FirstName", 2, 60));
            table.HasCheckConstraint("CK_Users_LastName", ModelRules.Length("LastName", 2, 80));
            table.HasCheckConstraint("CK_Users_Email", ModelRules.Length("Email", 3, 254));
            table.HasCheckConstraint("CK_Users_EmailNormalized",
                "[EmailNormalized] = LOWER(LTRIM(RTRIM([Email]))) COLLATE Latin1_General_100_BIN2");
            table.HasCheckConstraint("CK_Users_MemberType",
                "[MemberType] IN ('student','professor','administrative','graduate','external')");
            table.HasCheckConstraint("CK_Users_Availability", "[Availability] IN ('low','medium','high')");
            table.HasCheckConstraint("CK_Users_Career", "[Career] IS NULL OR " + ModelRules.Length("Career", 2, 120));
            table.HasCheckConstraint("CK_Users_Bio", "[Bio] IS NULL OR " + ModelRules.Length("Bio", 1, 600));
            table.HasCheckConstraint("CK_Users_PortfolioUrl", "[PortfolioUrl] IS NULL OR " + ModelRules.Length("PortfolioUrl", 1, 2048));
            table.HasCheckConstraint("CK_Users_Dates",
                $"[UpdatedAt] >= [CreatedAt] AND {ModelRules.Utc("CreatedAt")} AND {ModelRules.Utc("UpdatedAt")}");
        });
        entity.HasKey(x => x.Id);
        entity.Property(x => x.Id).ValueGeneratedNever();
        ModelRules.Text(entity.Property(x => x.FirstName), 60);
        ModelRules.Text(entity.Property(x => x.LastName), 80);
        ModelRules.FixedValue(entity.Property(x => x.MemberType), 20);
        ModelRules.Text(entity.Property(x => x.Email), 254);
        ModelRules.FixedValue(entity.Property(x => x.EmailNormalized), 254);
        entity.Property(x => x.PasswordHash).HasMaxLength(512);
        entity.Property(x => x.Career).HasMaxLength(120);
        entity.Property(x => x.Bio).HasMaxLength(600);
        entity.Property(x => x.PortfolioUrl).HasMaxLength(2048);
        ModelRules.FixedValue(entity.Property(x => x.Availability), 6);
        entity.Property(x => x.CreatedAt).HasPrecision(3);
        entity.Property(x => x.UpdatedAt).HasPrecision(3);
        entity.HasIndex(x => x.EmailNormalized).IsUnique().HasDatabaseName("UX_Users_EmailNormalized");
        entity.HasIndex(x => new { x.Career, x.Availability, x.Id });
        entity.HasMany(x => x.Skills).WithMany(x => x.Users).UsingEntity<UserSkill>(
            right => right.HasOne(x => x.Skill).WithMany(x => x.UserSkills)
                .HasForeignKey(x => x.SkillId).OnDelete(DeleteBehavior.Restrict),
            left => left.HasOne(x => x.User).WithMany(x => x.UserSkills)
                .HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade));
    }
}

internal sealed class UserSkillConfiguration : IEntityTypeConfiguration<UserSkill>
{
    public void Configure(EntityTypeBuilder<UserSkill> entity)
    {
        entity.ToTable("UserSkills", table =>
        {
            table.HasCheckConstraint("CK_UserSkills_Level", "[Level] IN ('basic','intermediate','advanced')");
            table.HasCheckConstraint("CK_UserSkills_Position", "[Position] BETWEEN 0 AND 19");
        });
        entity.HasKey(x => new { x.UserId, x.SkillId });
        ModelRules.FixedValue(entity.Property(x => x.Level), 12);
        entity.HasIndex(x => new { x.UserId, x.Position }).IsUnique();
        entity.HasIndex(x => new { x.SkillId, x.UserId });
    }
}

internal sealed class UserInterestConfiguration : IEntityTypeConfiguration<UserInterest>
{
    public void Configure(EntityTypeBuilder<UserInterest> entity)
    {
        entity.ToTable("UserInterests", table =>
        {
            table.HasCheckConstraint("CK_UserInterests_Position", "[Position] BETWEEN 0 AND 14");
            table.HasCheckConstraint("CK_UserInterests_Value", ModelRules.Length("Value", 1, 40));
            table.HasCheckConstraint("CK_UserInterests_NormalizedValue", ModelRules.Length("NormalizedValue", 1, 40));
        });
        entity.HasKey(x => new { x.UserId, x.Position });
        ModelRules.Text(entity.Property(x => x.Value), 40);
        ModelRules.FixedValue(entity.Property(x => x.NormalizedValue), 40);
        entity.HasIndex(x => new { x.UserId, x.NormalizedValue }).IsUnique();
        entity.HasOne(x => x.User).WithMany(x => x.Interests)
            .HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
    }
}
