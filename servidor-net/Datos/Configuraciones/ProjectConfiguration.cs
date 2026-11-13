using InnovationHub.ServidorNet.Modelos;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InnovationHub.ServidorNet.Datos.Configuraciones;

internal sealed class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> entity)
    {
        entity.ToTable("Projects", table =>
        {
            table.HasCheckConstraint("CK_Projects_Name", ModelRules.Length("Name", 5, 120));
            table.HasCheckConstraint("CK_Projects_Description", ModelRules.Length("Description", 20, 2000));
            table.HasCheckConstraint("CK_Projects_Objective", ModelRules.Length("Objective", 10, 500));
            table.HasCheckConstraint("CK_Projects_State", "[State] IN ('planning','in_development','paused','finished','archived')");
            table.HasCheckConstraint("CK_Projects_Calendar", "[EstimatedEndDate] IS NULL OR [EstimatedEndDate] >= [StartDate]");
            table.HasCheckConstraint("CK_Projects_RepositoryUrl", "[RepositoryUrl] IS NULL OR " + ModelRules.Length("RepositoryUrl", 1, 2048));
            table.HasCheckConstraint("CK_Projects_Dates",
                $"[UpdatedAt] >= [CreatedAt] AND {ModelRules.Utc("CreatedAt")} AND {ModelRules.Utc("UpdatedAt")}");
        });
        entity.HasKey(x => x.Id);
        entity.Property(x => x.Id).ValueGeneratedNever();
        ModelRules.Text(entity.Property(x => x.Name), 120);
        ModelRules.Text(entity.Property(x => x.Description), 2000);
        ModelRules.Text(entity.Property(x => x.Objective), 500);
        ModelRules.FixedValue(entity.Property(x => x.State), 14);
        entity.Property(x => x.StartDate).HasColumnType("date");
        entity.Property(x => x.EstimatedEndDate).HasColumnType("date");
        entity.Property(x => x.RepositoryUrl).HasMaxLength(2048);
        entity.Property(x => x.CreatedAt).HasPrecision(3);
        entity.Property(x => x.UpdatedAt).HasPrecision(3);
        entity.HasIndex(x => x.SourceInitiativeId).IsUnique();
        entity.HasIndex(x => new { x.CreatedAt, x.Id });
        entity.HasOne(x => x.SourceInitiative).WithOne(x => x.Project)
            .HasForeignKey<Project>(x => x.SourceInitiativeId).OnDelete(DeleteBehavior.Restrict);
    }
}

internal sealed class ProjectTechnologyConfiguration : IEntityTypeConfiguration<ProjectTechnology>
{
    public void Configure(EntityTypeBuilder<ProjectTechnology> entity)
    {
        entity.ToTable("ProjectTechnologies", table =>
        {
            table.HasCheckConstraint("CK_ProjectTechnologies_Position", "[Position] BETWEEN 0 AND 19");
            table.HasCheckConstraint("CK_ProjectTechnologies_Value", ModelRules.Length("Value", 1, 50));
            table.HasCheckConstraint("CK_ProjectTechnologies_NormalizedValue", ModelRules.Length("NormalizedValue", 1, 50));
        });
        entity.HasKey(x => new { x.ProjectId, x.Position });
        ModelRules.Text(entity.Property(x => x.Value), 50);
        ModelRules.FixedValue(entity.Property(x => x.NormalizedValue), 50);
        entity.HasIndex(x => new { x.ProjectId, x.NormalizedValue }).IsUnique();
        entity.HasOne(x => x.Project).WithMany(x => x.Technologies)
            .HasForeignKey(x => x.ProjectId).OnDelete(DeleteBehavior.Cascade);
    }
}
