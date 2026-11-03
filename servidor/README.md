# Servidor Express y MongoDB de Innovation Hub

API01 estableció Express por capas, API02 agregó MongoDB, API03 implementó autenticación persistente, API04 agregó perfiles/directorio/catálogos, API05 agregó escritura de iniciativas, API06 agregó consultas con permisos y API07 implementa eliminación/archivo según historial. Las contraseñas usan `scrypt` con sal aleatoria; los tokens Bearer son opacos y solo su hash SHA-256 llega a MongoDB.

## Requisitos

- Node.js `22.12.0` o posterior compatible.
- npm compatible con la versión instalada.
- MongoDB Community 8.0 en replica set. El entorno reproducible usa la imagen oficial `mongo:8.0.34-noble` mediante Docker Compose.

MongoDB standalone permite lecturas y escrituras simples, pero no sirve para aprobar las transacciones requeridas por aceptación, retiro y conversión.

## Arranque local

Desde la raíz del repositorio:

Si ya hay una instancia nativa de MongoDB en replica set escuchando en el puerto configurado, continuar directamente con los comandos de `servidor/`; no es necesario instalar ni ejecutar Docker. El bloque siguiente es la alternativa para equipos con Docker.

```bash
docker compose up -d
docker compose ps
```

`mongo` debe aparecer saludable y `mongo-init` debe terminar con código `0`. El segundo servicio inicializa de manera idempotente el replica set `innovationHubRs`. Si falla:

```bash
docker compose logs mongo
docker compose logs mongo-init
```

Después, desde `servidor/`:

```bash
cp .env.example .env
npm ci --cache /private/tmp/innovation-hub-npm-cache
npm run seed
npm run dev
```

El seed valida primero todos los fixtures de CO01 y carga ocho categorías, diez competencias, cinco usuarios demo, ocho iniciativas, doce membresías y trece eventos. La contraseña de los usuarios es `DEMO_USER_PASSWORD`; el valor de `.env.example` sirve solo para desarrollo local. Cada usuario recibe una sal distinta. Repetir el seed actualiza fixtures por `id`, conserva los hashes e inserta eventos una sola vez. Los registros creados fuera del fixture se conservan. Solicitudes/proyectos aún no forman parte de la carga; sus fixtures se completan con sus módulos.

La API queda en `http://127.0.0.1:3000`. `GET /api/health` comprueba la vida de Express. El proceso abre el puerto solo después de conectar MongoDB, pero el DTO de health no reemplaza una comprobación detallada de dependencias.

## Variables

| Variable | Obligatoria | Uso |
| --- | --- | --- |
| `NODE_ENV` | No | `development`, `test` o `production`; por defecto `development`. |
| `HOST` | No | Interfaz HTTP; por defecto `127.0.0.1`. |
| `PORT` | Sí | Puerto HTTP entre 1 y 65535. |
| `CLIENT_ORIGIN` | Sí | Origen HTTP(S) exacto autorizado por CORS. |
| `BODY_LIMIT` | No | Límite JSON en `kb` o `mb`; por defecto `100kb`. |
| `MONGODB_URI` | Sí | URI `mongodb://` o `mongodb+srv://`; nunca se imprime al fallar. |
| `MONGODB_DATABASE` | Sí | Base de la aplicación; se rechazan `admin`, `config` y `local`. |
| `MONGODB_CONNECT_TIMEOUT_MS` | No | Espera entre 100 y 60000 ms; por defecto 5000. |
| `AUTH_SESSION_TTL_MINUTES` | No | Vigencia de una sesión entre 5 y 10080 minutos; por defecto 480. |
| `DEMO_USER_PASSWORD` | Seed local | Contraseña sintética para los cinco usuarios de fixtures; el seed se bloquea en producción. |
| `MONGODB_TEST_URI` | Integración | Replica set real usado solo por la suite de integración. |
| `MONGODB_TEST_DATABASE` | Integración | Base aislada cuyo nombre empieza o termina en `test`. |

`.env` y `.env.test` están ignorados. Los archivos `.example` no contienen credenciales.

## Comandos

| Comando | Función |
| --- | --- |
| `npm run dev` | Inicia API en modo watch usando `.env`. |
| `npm start` | Inicia API usando `.env`. |
| `npm run fixtures:validate` | Comprueba referencias e invariantes de todos los fixtures CO01. |
| `npm run seed` | Crea índices y carga catálogos, usuarios, iniciativas y membresías/eventos de fixture. |
| `npm run lint` | Ejecuta ESLint. |
| `npm test` | Ejecuta unidades/HTTP; omite integración cuando no hay variables reales. |
| `npm run test:integration` | Exige `.env.test` y prueba MongoDB real; no permite una aprobación simulada. |
| `npm run db:reset:test` | Elimina solo una base con `NODE_ENV=test` y nombre seguro. |
| `npm run check` | Ejecuta lint, validador de fixtures y pruebas automáticas. |

Para integración:

```bash
cp .env.test.example .env.test
npm run test:integration
```

Las pruebas crean índices únicos, ejecutan seeds repetidos, reconectan para verificar persistencia y fuerzan colisiones dentro de transacciones. Autenticación cubre registro concurrente con el mismo correo, hashes distintos, credenciales indistinguibles, tokens ausentes o dañados, expiración y revocación. Perfiles cubre privacidad del correo, reemplazo completo, competencias válidas, filtros combinados, paginación y catálogos públicos. API05 cubre propietario derivado de sesión, referencias de catálogo, membresía/evento automáticos, reemplazo completo, estimados superados y rollback si una relación no puede crearse. Los archivos de integración se ejecutan en serie para que sus limpiezas no compitan por la misma base. La suite limpia únicamente sus colecciones conocidas dentro de la base indicada.

El reset está deliberadamente restringido:

```bash
npm run db:reset:test
```

Falla antes de conectar si `NODE_ENV` no es `test`, si el nombre no empieza o termina en `test`, o si apunta a una base reservada. No existe un comando para borrar la base de desarrollo.

## Estructura

```text
src/
├── app.js                  # Compone Express sin abrir puerto
├── server.js               # Conecta DB, escucha y cierra HTTP/DB
├── config/                 # Valida HTTP y MongoDB
├── database/               # Conexión, transacciones y protecciones
├── models/                 # Esquemas Mongoose por módulo
├── repositories/           # Persistencia sin filtrar documentos a HTTP
├── seeds/                  # Lectura y carga idempotente de fixtures
├── controllers/            # Adaptación HTTP
├── dto/                    # Proyecciones públicas
├── errors/                 # Errores HTTP conocidos
├── middleware/             # CORS, request ID, 404 y errores
├── modules/                # Inicialización de modelos, índices y dependencias
├── routes/                 # Registro de endpoints
├── security/               # scrypt, tokens opacos y hashes de token
└── services/               # Reglas de aplicación
```

Los modelos reciben una conexión explícita y las rutas nunca acceden directamente a Mongoose. `autoIndex` está desactivado en la conexión; cada módulo crea de forma explícita sus índices durante su inicialización o seed. Los DTO futuros deben conservar UUID públicos y ocultar `_id` y `__v`.

## Autenticación local

Después de `npm run seed`, cualquiera de los correos de `pruebas/fixtures/users.json` puede iniciar sesión con `DEMO_USER_PASSWORD`; `diego.inactive@example.test` se conserva inactivo para verificar el rechazo. Ejemplo:

```bash
curl -s http://127.0.0.1:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"ana.owner@example.test","password":"DemoSegura2026"}'
```

Usar `accessToken` como `Authorization: Bearer <token>` en `/api/auth/me` y `/api/auth/logout`. Logout devuelve `204` y el mismo token debe recibir `401` en el siguiente uso. Los errores de correo desconocido, contraseña incorrecta y usuario inactivo son deliberadamente iguales.

El formato persistido de contraseña registra `scrypt`, `N=16384`, `r=8`, `p=1`, una sal aleatoria de 16 bytes y una clave derivada de 64 bytes. Cinco mediciones locales con Node 24.21.0 dieron 49, 41, 39, 40 y 41 ms, promedio 42 ms; es evidencia del equipo usado, no un tiempo garantizado en otra computadora.

## Perfiles y catálogos locales

`GET /api/categories` y `GET /api/skills` son públicos. `GET /api/users`, `GET /api/users/{id}` y `PUT /api/users/me` requieren `Authorization: Bearer <token>`. El directorio nunca devuelve correo; consultar el UUID propio sí lo incluye. Un `PUT` reemplaza todos los campos editables, por lo que no funciona como actualización parcial.

Ejemplos con la API iniciada y un token obtenido mediante login:

```bash
curl -s 'http://127.0.0.1:3000/api/skills?q=desarrollo&page=1&size=5'

curl -s 'http://127.0.0.1:3000/api/users?availability=high&page=1&size=12' \
  -H 'Authorization: Bearer <token>'

curl -s 'http://127.0.0.1:3000/api/users/11111111-1111-4111-8111-111111111111' \
  -H 'Authorization: Bearer <token>'
```

El perfil acepta `career`, `bio` y `portfolioUrl` como `null`, hasta 15 intereses y 20 competencias. Los niveles válidos son `basic`, `intermediate` y `advanced`. `email`, IDs, fechas y contraseñas son inmutables; una competencia inexistente o repetida rechaza toda la operación.

## Escritura de iniciativas

`POST /api/initiatives` y `PUT /api/initiatives/{id}` requieren `Authorization: Bearer <token>`. Ambos reciben el cuerpo completo definido en `docs/api-contract.md`; el propietario, estado, IDs y fechas los administra el servidor. La creación fija `published` y confirma en una sola transacción la iniciativa, la membresía activa del propietario y su evento `joined`.

Ejemplo de creación:

```bash
curl -i -X POST http://127.0.0.1:3000/api/initiatives \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "title":"Tutorías colaborativas",
    "type":"idea",
    "summary":"Red universitaria para intercambiar tutorías entre carreras.",
    "description":"La iniciativa coordina sesiones y seguimiento entre estudiantes.",
    "problem":"El apoyo académico informal es difícil de localizar.",
    "beneficiaries":"Estudiantes de todas las carreras",
    "categoryId":"education",
    "skillIds":["aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1"],
    "estimatedMembers":4,
    "visibility":"public",
    "tags":["tutorías","comunidad"]
  }'
```

La respuesta es `201`, incluye `Location: /api/initiatives/{id}` y nunca expone `_id`, campos técnicos ni correo. `PUT` reemplaza todos los campos editables y solo lo ejecuta el propietario. Conservar una estimación ya superada es válido; solo se rechaza reducirla por debajo de los miembros activos. Categorías o competencias inexistentes, campos de servidor y cuerpos parciales producen `400` sin escritura parcial.

API06 ya permite `GET /api/initiatives`, `GET /api/initiatives/mine` y `GET /api/initiatives/{id}`. El catálogo combina `q/type/category/skill/state/hasSpaces/ownerId`, páginas y orden estable. `/mine` solo acepta página/tamaño/orden y representa propiedad, no participación. El detalle y el catálogo públicos comprueban cualquier Bearer recibido: un token inválido produce `401`, no una degradación silenciosa a visitante.

Las privadas ajenas se ocultan con `404`; las restringidas presentan un resumen seguro a autenticados ajenos y rechazan su detalle con `403`. Un visitante recibe `401` en detalle institucional/restringido y no las ve en catálogo. Solo el propietario consulta borradores/archivadas por `/mine` o detalle. Título, resumen y etiquetas se buscan sin distinguir tildes/mayúsculas, pero una restringida ajena nunca coincide por etiquetas ocultas. `hasSpaces=false` incluye estimados superados y no impone cupo.

La agregación MongoDB aplica autorización antes del conteo/página, calcula membresías activas, y usa un único `$facet` para resultados y total. Los datos relacionados se consultan por lote dentro de la agregación, sin una petición adicional por tarjeta. El módulo completa campos de búsqueda ausentes en documentos previos de API05 al arrancar, sin cambiar su UUID, fechas o revisión. Detalles de consumo para los módulos posteriores: [iniciativas-api.md](../docs/iniciativas-api.md).

## Eliminar o archivar iniciativas

`DELETE /api/initiatives/{id}` requiere la sesión del propietario y rechaza body o query. La operación usa una transacción con escritura condicional sobre la revisión de la iniciativa antes de inspeccionar relaciones.

| Situación | Resultado |
| --- | --- |
| Solo membresía activa automática del propietario y su evento original, sin otra historia | `204` sin cuerpo; se eliminan iniciativa, membresía y evento automáticos. |
| Cualquier solicitud, miembro adicional activo/retirado, evento adicional o proyecto | `200` con `{data:{id,state:"archived",operation:"archived"}}`; relaciones intactas. |
| Ya archivada | El mismo `200`, sin cambiar fecha ni revisión. |
| Ya borrada o inexistente | `404`. |
| Ajeno autenticado / sin sesión | `403` / `401`. |

Un estado `converted` o una relación automática incompleta obliga a conservar el registro mediante archivo. No se intenta corregir ese historial mediante borrado. Archivar saca la iniciativa del catálogo, conserva su consulta por el dueño en `/mine`/detalle e impide editarla. No cancela solicitudes pendientes.

Las futuras transacciones de API08/API09/API10 deben leer y validar la iniciativa dentro de su sesión y llamar a `lockInitiativeRevision` antes de modificar sus relaciones. Las pruebas de API07 simulan esos escritores sobre las colecciones acordadas; la integración HTTP con las rutas futuras se completa cuando estén implementadas. `npm run test:integration` incluye nueve subcasos de API07: permisos, ambos resultados HTTP, historia, idempotencia, rollback y ambos órdenes de operaciones concurrentes.

## Recuperación y diagnóstico

- `No fue posible conectar con MongoDB.`: confirmar `docker compose ps`, puerto y URI. El mensaje omite credenciales deliberadamente.
- `Transaction numbers are only allowed...`: MongoDB se inició como standalone; levantar el replica set indicado.
- Seed repetido con otros conteos: ejecutar `npm run fixtures:validate` y revisar que no se cambió el `MONGODB_DATABASE`.
- Para reiniciar procesos sin borrar datos: `docker compose restart mongo` y después `docker compose up mongo-init`.
- `docker compose down` detiene contenedores y conserva el volumen. Eliminar el volumen borra los datos y no forma parte del flujo normal.

API02 se verificó con MongoDB Community 8.0.34 nativo en un replica set temporal de un nodo. Docker Compose quedó preparado para la reproducción entre ambos integrantes y requiere validación manual en un equipo con Docker disponible.
