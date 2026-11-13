using Microsoft.EntityFrameworkCore;

namespace InnovationHub.ServidorNet.Datos;

// T3B-02 y T3B-03 incorporarán las entidades, restricciones y HasData.
public sealed class InnovationHubContext(DbContextOptions<InnovationHubContext> options)
    : DbContext(options);
