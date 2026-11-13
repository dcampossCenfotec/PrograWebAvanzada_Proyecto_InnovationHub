using InnovationHub.ServidorNet.Modelos;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InnovationHub.ServidorNet.Datos.Configuraciones;

internal sealed class SessionConfiguration : IEntityTypeConfiguration<Session>
{
    public void Configure(EntityTypeBuilder<Session> entity)
    {
        entity.ToTable("Sessions", table =>
        {
            table.HasCheckConstraint("CK_Sessions_TokenHash",
                "DATALENGTH([TokenHash]) = 64 AND [TokenHash] NOT LIKE '%[^0-9a-f]%'");
            table.HasCheckConstraint("CK_Sessions_Dates",
                $"[ExpiresAt] > [CreatedAt] AND ([RevokedAt] IS NULL OR [RevokedAt] >= [CreatedAt]) AND {ModelRules.Utc("CreatedAt")} AND {ModelRules.Utc("ExpiresAt")} AND ([RevokedAt] IS NULL OR {ModelRules.Utc("RevokedAt")})");
        });
        entity.HasKey(x => x.Id);
        entity.Property(x => x.Id).ValueGeneratedNever();
        entity.Property(x => x.TokenHash).HasMaxLength(64).IsUnicode(false)
            .UseCollation(ModelRules.BinaryCollation).IsRequired();
        entity.Property(x => x.CreatedAt).HasPrecision(3);
        entity.Property(x => x.ExpiresAt).HasPrecision(3);
        entity.Property(x => x.RevokedAt).HasPrecision(3);
        entity.HasIndex(x => x.TokenHash).IsUnique();
        entity.HasIndex(x => x.ExpiresAt);
        entity.HasIndex(x => new { x.UserId, x.CreatedAt });
        entity.HasOne(x => x.User).WithMany(x => x.Sessions)
            .HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Restrict);
    }
}
