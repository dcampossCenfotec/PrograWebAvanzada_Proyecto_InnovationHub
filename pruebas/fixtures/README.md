# Fixtures compartidos de CO01

Datos sintéticos para mocks, seed y pruebas de integración. No son un volcado de MongoDB y no contienen credenciales ni tokens. API03 añadirá credenciales sintéticas durante el seed de autenticación.

## Actores

| Alias | Papel en los escenarios |
| --- | --- |
| `ACTOR_A` | Propietario principal. |
| `ACTOR_B` | Solicitante con intentos pendientes y terminales. |
| `ACTOR_C` | Usuario autenticado ajeno a las iniciativas de A. |
| `ACTOR_D` | Usuario inactivo para pruebas de autenticación. |
| `ACTOR_E` | Miembro aceptado de equipos. |
| `VISITOR` | Ausencia de sesión; no existe documento de usuario. |

Los alias y rutas de archivos viven en `manifest.json`. El validador no instala dependencias:

```bash
node pruebas/fixtures/validate-fixtures.mjs
```

El resultado esperado es `Fixtures CO01 válidos` con conteos. Esto valida JSON, referencias e invariantes del diseño; no sustituye las pruebas de MongoDB en replica set.

`legacy-mapping.json` documenta la traducción de las ocho iniciativas del Avance 1. `testSets` reserva datos que el seed futuro debe clonar o aislar para pruebas destructivas y concurrentes.

