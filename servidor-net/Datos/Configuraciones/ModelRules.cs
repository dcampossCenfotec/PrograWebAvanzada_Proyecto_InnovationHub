using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InnovationHub.ServidorNet.Datos.Configuraciones;

internal static class ModelRules
{
    internal const string BinaryCollation = "Latin1_General_100_BIN2";

    internal static void Text(PropertyBuilder<string> property, int maximum) =>
        property.HasMaxLength(maximum).IsRequired();

    internal static void FixedValue(PropertyBuilder<string> property, int maximum) =>
        property.HasMaxLength(maximum).UseCollation(BinaryCollation).IsRequired();

    // NVARCHAR y DATALENGTH/2 cuentan unidades UTF-16, igual que String.length en JS.
    internal static string Length(string column, int minimum, int maximum) =>
        $"DATALENGTH(LTRIM(RTRIM([{column}])))/2 BETWEEN {minimum} AND {maximum}";

    internal static string Utc(string column) => $"DATEPART(TZOFFSET, [{column}]) = 0";
}
