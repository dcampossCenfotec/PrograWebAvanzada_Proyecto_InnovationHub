
# Verificación del contrato HTTP — Avance 2

## Objetivo

Comprobar que el cliente React, los servicios Express y las respuestas HTTP respeten `docs/api-contract.md`, sin depender de detalles internos de MongoDB.

Este documento es una matriz de verificación. No constituye evidencia de ejecución si no se completan los resultados de las pruebas.

## Inventario contractual

| Dominio | Operaciones |
| --- | ---: |
| Autenticación | 4 |
| Usuarios | 3 |
| Catálogos | 2 |
| Iniciativas | 7 |
| Solicitudes | 6 |
| Membresías | 2 |
| Proyectos | 3 |
| **Total** | **27** |

`GET /api/health` es operativo y no forma parte de las 27 operaciones de negocio.

## Esquemas obligatorios

- Respuesta individual: `{ "data": { ... } }`.
- Listado paginado: `{ "data": [], "pagination": { "page": 1, "size": 12, "total": 0, "totalPages": 0 } }`.
- Error: `{ "error": { "code": "...", "message": "...", "fields": {} } }`.
- `204`: sin cuerpo de respuesta.
- `201`: encabezado `Location` apuntando al recurso creado.
- IDs públicos: UUID; nunca BSON `ObjectId`.
- Fechas y horas: ISO 8601 UTC; fechas de proyecto: `YYYY-MM-DD`.
- Campos sensibles: nunca incluir hashes, contraseñas, tokens almacenados, URI de MongoDB ni trazas.

## Matriz de validación

| Comprobación | Herramienta | Estado inicial |
| --- | --- | --- |
| Inventario de 27 métodos y subrutas | `node --test test/contract-routes.test.js` | Pendiente de ejecutar en repositorio integrado |
| Suite del servidor | `npm run check` | Pendiente de ejecutar |
| Integraciones MongoDB | `npm run test:integration` | Pendiente de ejecutar |
| Colección HTTP | Postman Collection Runner | Pendiente de ejecutar |
| Estados 200/201/204/400/401/403/404/409 | Postman y tests HTTP | Pendiente de ejecutar |
| Error 500 sanitizado | `test/security-error.test.js` | Pendiente de verificar en el entorno integrado |
| DTO de proyectos, solicitudes y miembros | Postman y suites de dominio | Pendiente de comprobar |
| Correspondencia React/API | Navegación con `VITE_API_MODE=real` | Pendiente de ejecutar |
| Privacidad entre usuarios | Postman y pruebas de integración | Pendiente de ejecutar |
| Reinicio y persistencia | MongoDB y API local | Pendiente de ejecutar |

## Colección Postman

Archivo: `pruebas/innovation-hub.postman_collection.json`.

1. Iniciar MongoDB en replica set.
2. Configurar un backend conectado a una base de pruebas desechable.
3. Cargar el seed correspondiente.
4. Iniciar Express.
5. Importar la colección en Postman.
6. Configurar la contraseña de demostración localmente en `demoPassword`.
7. Ejecutar todas las carpetas en el orden definido.
8. Revisar cada error o aserción fallida.
9. Registrar fecha, entorno, total ejecutado, aprobados, fallidos y defectos.
10. Limpiar tokens y contraseñas de las variables antes de exportar una colección.

Las pruebas de Postman crean iniciativas, solicitudes, miembros y proyectos. No deben ejecutarse sobre una base con datos importantes.

Los endpoints públicos de categorías y competencias no tienen un recurso individual por UUID, por lo que un `404` de recurso inexistente no corresponde a esos endpoints. La ausencia de token es válida en estos recursos.

La cobertura de `500` se verifica por inyección controlada de fallos en tests, sin crear rutas públicas inseguras.

## Reglas que no deben modificarse

- DELETE y archivo de iniciativas son acciones diferentes.
- Una iniciativa con historial no puede eliminarse físicamente.
- Solo el propietario puede decidir solicitudes recibidas.
- Aceptar una solicitud crea una membresía y un evento en una transacción.
- Retirar a un integrante conserva el historial.
- El propietario no puede retirarse a sí mismo.
- Convertir exige otro miembro activo además del propietario.
- Los proyectos conservan el UUID de la iniciativa de origen.
- Búsqueda, autorización, filtros y paginación ocurren en el servidor.
- El cliente no utiliza identificadores internos de MongoDB.

## Compatibilidad con la entrega final

En la entrega final se sustituirá Express/MongoDB por un servidor en otro lenguaje y un modelo relacional.

La implementación futura debe conservar:

- Las 27 operaciones y sus métodos HTTP.
- Los DTO y sus nombres de propiedades.
- UUID públicos, enums y representación de fechas.
- Las reglas de autorización y visibilidad.
- Los códigos y formatos de error.
- Las convenciones de paginación, ordenamiento y filtros.
- Los resultados de las transiciones de estado.

La dirección base de la API puede cambiar por configuración; las llamadas desde React no deben requerir cambios funcionales.

## Registro de resultados

Completar únicamente después de ejecutar las pruebas:

- Fecha:
- Sistema operativo:
- Versiones Node/npm:
- Versión MongoDB:
- Commit HEAD:
- Resultado `npm run check`:
- Resultado `npm run test:integration`:
- Resultado Collection Runner:
- Defectos encontrados:
- Correcciones realizadas:
- Revisión de Daniel:
- Revisión de Francisco:

**Congelación:** el contrato queda congelado únicamente cuando el commit aprobado recibe la etiqueta `entrega-2`. No declarar la congelación antes de comprobar el candidato.
