using InnovationHub.ServidorNet.Modelos;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InnovationHub.ServidorNet.Datos.Configuraciones;

internal sealed class MembershipConfiguration : IEntityTypeConfiguration<Membership>
{
    public void Configure(EntityTypeBuilder<Membership> entity)
    {
        entity.ToTable("Memberships", table =>
        {
            table.HasCheckConstraint("CK_Memberships_Role", ModelRules.Length("Role", 2, 150));
            table.HasCheckConstraint("CK_Memberships_State", "[State] IN ('active','retired')");
            table.HasCheckConstraint("CK_Memberships_Retirement",
                "([State] = 'active' AND [RetiredAt] IS NULL) OR ([State] = 'retired' AND [RetiredAt] IS NOT NULL)");
            table.HasCheckConstraint("CK_Memberships_Dates",
                $"{ModelRules.Utc("JoinedAt")} AND ([RetiredAt] IS NULL OR ([RetiredAt] >= [JoinedAt] AND {ModelRules.Utc("RetiredAt")}))");
        });
        entity.HasKey(x => x.Id);
        entity.Property(x => x.Id).ValueGeneratedNever();
        ModelRules.Text(entity.Property(x => x.Role), 150);
        ModelRules.FixedValue(entity.Property(x => x.State), 7);
        entity.Property(x => x.JoinedAt).HasPrecision(3);
        entity.Property(x => x.RetiredAt).HasPrecision(3);
        entity.HasIndex(x => new { x.InitiativeId, x.UserId }).IsUnique()
            .HasFilter("[State] = N'active'").HasDatabaseName("UX_Memberships_Active");
        entity.HasIndex(x => new { x.InitiativeId, x.State, x.JoinedAt, x.Id });
        entity.HasIndex(x => new { x.UserId, x.State, x.Id });
        entity.HasOne(x => x.Initiative).WithMany(x => x.Memberships)
            .HasForeignKey(x => x.InitiativeId).OnDelete(DeleteBehavior.Restrict);
        entity.HasOne(x => x.User).WithMany(x => x.Memberships)
            .HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Restrict);
        entity.HasOne(x => x.SourceRequest).WithOne(x => x.Membership)
            .HasForeignKey<Membership>(x => new { x.SourceRequestId, x.InitiativeId, x.UserId })
            .HasPrincipalKey<ParticipationRequest>(x => new { x.Id, x.InitiativeId, x.ApplicantId })
            .IsRequired(false).OnDelete(DeleteBehavior.Restrict);
    }
}

internal sealed class MembershipEventConfiguration : IEntityTypeConfiguration<MembershipEvent>
{
    public void Configure(EntityTypeBuilder<MembershipEvent> entity)
    {
        entity.ToTable("MembershipEvents", table =>
        {
            table.HasCheckConstraint("CK_MembershipEvents_Type", "[Type] IN ('joined','retired')");
            table.HasCheckConstraint("CK_MembershipEvents_Utc", ModelRules.Utc("OccurredAt"));
        });
        entity.HasKey(x => x.Id);
        entity.Property(x => x.Id).ValueGeneratedNever();
        ModelRules.FixedValue(entity.Property(x => x.Type), 7);
        entity.Property(x => x.OccurredAt).HasPrecision(3);
        entity.HasIndex(x => new { x.MembershipId, x.Type }).IsUnique();
        entity.HasIndex(x => new { x.MembershipId, x.OccurredAt, x.Id });
        entity.HasIndex(x => new { x.ActorId, x.OccurredAt, x.Id });
        entity.HasOne(x => x.Membership).WithMany(x => x.Events)
            .HasForeignKey(x => x.MembershipId).OnDelete(DeleteBehavior.Restrict);
        entity.HasOne(x => x.Actor).WithMany(x => x.ActedEvents)
            .HasForeignKey(x => x.ActorId).OnDelete(DeleteBehavior.Restrict);
        entity.HasOne(x => x.Request).WithMany(x => x.Events)
            .HasForeignKey(x => x.RequestId).OnDelete(DeleteBehavior.Restrict);
    }
}
