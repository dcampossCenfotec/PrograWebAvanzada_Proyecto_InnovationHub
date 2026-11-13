using InnovationHub.ServidorNet.Modelos;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InnovationHub.ServidorNet.Datos.Configuraciones;

internal sealed class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> entity)
    {
        entity.ToTable("Categories", table =>
        {
            table.HasCheckConstraint("CK_Categories_Id",
                "DATALENGTH([Id]) BETWEEN 1 AND 80 AND [Id] NOT LIKE '%[^a-z0-9-]%' AND [Id] NOT LIKE '-%' AND [Id] NOT LIKE '%-' AND [Id] NOT LIKE '%--%'");
            table.HasCheckConstraint("CK_Categories_Name", ModelRules.Length("Name", 2, 80));
            table.HasCheckConstraint("CK_Categories_NameNormalized", ModelRules.Length("NameNormalized", 2, 80));
        });
        entity.HasKey(x => x.Id);
        entity.Property(x => x.Id).HasMaxLength(80).IsUnicode(false)
            .UseCollation(ModelRules.BinaryCollation).ValueGeneratedNever();
        ModelRules.Text(entity.Property(x => x.Name), 80);
        ModelRules.FixedValue(entity.Property(x => x.NameNormalized), 80);
        entity.HasIndex(x => x.NameNormalized).IsUnique();
    }
}

internal sealed class SkillConfiguration : IEntityTypeConfiguration<Skill>
{
    public void Configure(EntityTypeBuilder<Skill> entity)
    {
        entity.ToTable("Skills", table =>
        {
            table.HasCheckConstraint("CK_Skills_Name", ModelRules.Length("Name", 2, 80));
            table.HasCheckConstraint("CK_Skills_NameNormalized", ModelRules.Length("NameNormalized", 2, 80));
        });
        entity.HasKey(x => x.Id);
        entity.Property(x => x.Id).ValueGeneratedNever();
        ModelRules.Text(entity.Property(x => x.Name), 80);
        ModelRules.FixedValue(entity.Property(x => x.NameNormalized), 80);
        entity.HasIndex(x => x.NameNormalized).IsUnique();
    }
}
