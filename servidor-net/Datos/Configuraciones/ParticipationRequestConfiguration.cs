using InnovationHub.ServidorNet.Modelos;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InnovationHub.ServidorNet.Datos.Configuraciones;

internal sealed class ParticipationRequestConfiguration : IEntityTypeConfiguration<ParticipationRequest>
{
    public void Configure(EntityTypeBuilder<ParticipationRequest> entity)
    {
        entity.ToTable("ParticipationRequests", table =>
        {
            table.HasCheckConstraint("CK_Requests_Message", ModelRules.Length("Message", 15, 500));
            table.HasCheckConstraint("CK_Requests_Role", ModelRules.Length("Role", 3, 100));
            table.HasCheckConstraint("CK_Requests_Availability", "[Availability] IN ('low','medium','high')");
            table.HasCheckConstraint("CK_Requests_State", "[State] IN ('pending','accepted','rejected','cancelled')");
            table.HasCheckConstraint("CK_Requests_DecisionComment",
                "[DecisionComment] IS NULL OR " + ModelRules.Length("DecisionComment", 1, 500));
            table.HasCheckConstraint("CK_Requests_Decision",
                "([State] IN ('accepted','rejected') AND [DecidedAt] IS NOT NULL) OR ([State] IN ('pending','cancelled') AND [DecidedAt] IS NULL)");
            table.HasCheckConstraint("CK_Requests_Dates",
                $"[UpdatedAt] >= [CreatedAt] AND {ModelRules.Utc("CreatedAt")} AND {ModelRules.Utc("UpdatedAt")} AND ([DecidedAt] IS NULL OR ([DecidedAt] BETWEEN [CreatedAt] AND [UpdatedAt] AND {ModelRules.Utc("DecidedAt")}))");
        });
        entity.HasKey(x => x.Id);
        entity.Property(x => x.Id).ValueGeneratedNever();
        entity.HasAlternateKey(x => new { x.Id, x.InitiativeId, x.ApplicantId })
            .HasName("AK_Requests_Id_Initiative_Applicant");
        ModelRules.Text(entity.Property(x => x.Message), 500);
        ModelRules.Text(entity.Property(x => x.Role), 100);
        ModelRules.FixedValue(entity.Property(x => x.Availability), 6);
        ModelRules.FixedValue(entity.Property(x => x.State), 9);
        entity.Property(x => x.DecisionComment).HasMaxLength(500);
        entity.Property(x => x.CreatedAt).HasPrecision(3);
        entity.Property(x => x.UpdatedAt).HasPrecision(3);
        entity.Property(x => x.DecidedAt).HasPrecision(3);
        entity.HasIndex(x => new { x.InitiativeId, x.ApplicantId }).IsUnique()
            .HasFilter("[State] = N'pending'").HasDatabaseName("UX_Requests_Pending");
        entity.HasIndex(x => new { x.ApplicantId, x.CreatedAt, x.Id });
        entity.HasIndex(x => new { x.InitiativeId, x.State, x.CreatedAt, x.Id });
        entity.HasIndex(x => new { x.OfferedSkillId, x.State, x.Id });
        entity.HasOne(x => x.Initiative).WithMany(x => x.Requests)
            .HasForeignKey(x => x.InitiativeId).OnDelete(DeleteBehavior.Restrict);
        entity.HasOne(x => x.Applicant).WithMany(x => x.Requests)
            .HasForeignKey(x => x.ApplicantId).OnDelete(DeleteBehavior.Restrict);
        // FK al catálogo, no al perfil editable: quitar una competencia no borra historia.
        entity.HasOne(x => x.OfferedSkill).WithMany(x => x.OfferedRequests)
            .HasForeignKey(x => x.OfferedSkillId).OnDelete(DeleteBehavior.Restrict);
    }
}
