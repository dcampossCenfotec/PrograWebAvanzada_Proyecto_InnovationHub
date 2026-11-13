using InnovationHub.ServidorNet.Datos;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Development carga ConnectionStrings:InnovationHub desde user-secrets.
// No se abre una conexión ni se modifica la base al iniciar el host.
builder.Services.AddDbContext<InnovationHubContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("InnovationHub")));

var app = builder.Build();

// T3B-04 incorporará las dos rutas de lectura del contrato del Avance 2.
app.Run();
