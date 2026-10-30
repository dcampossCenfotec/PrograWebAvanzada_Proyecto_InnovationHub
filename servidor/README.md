# Servidor Express y MongoDB de Innovation Hub

API01 estableció Express por capas, API02 agregó MongoDB y API03 implementa autenticación persistente. Están disponibles registro, login, sesión actual y logout con revocación. Las contraseñas usan `scrypt` con sal aleatoria; los tokens Bearer son opacos y solo su hash SHA-256 llega a MongoDB.

## Requisitos

- Node.js `22.12.0` o posterior compatible.
- npm compatible con la versión instalada.
- MongoDB Community 8.0 en replica set. El entorno reproducible usa la imagen oficial `mongo:8.0.34-noble` mediante Docker Compose.

MongoDB standalone permite lecturas y escrituras simples, pero no sirve para aprobar las transacciones requeridas por aceptación, retiro y conversión.

## Arranque local

Desde la raíz del repositorio:

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

El seed valida primero todos los fixtures de CO01 y carga ocho categorías, diez competencias y cinco usuarios demo. La contraseña de esos usuarios es `DEMO_USER_PASSWORD`; el valor de `.env.example` sirve solo para desarrollo local. Cada usuario recibe una sal distinta. Repetir el seed actualiza perfiles por `id` y conserva el hash existente para no rotar credenciales ni sesiones accidentalmente.

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
| `npm run seed` | Crea índices y carga catálogos y usuarios demo de forma idempotente. |
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

Las pruebas crean índices únicos, ejecutan seeds repetidos, reconectan para verificar persistencia y fuerzan una colisión dentro de una transacción. Autenticación cubre registro concurrente con el mismo correo, hashes distintos, credenciales indistinguibles, tokens ausentes o dañados, expiración y revocación. La suite limpia únicamente sus colecciones conocidas dentro de la base indicada.

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

## Recuperación y diagnóstico

- `No fue posible conectar con MongoDB.`: confirmar `docker compose ps`, puerto y URI. El mensaje omite credenciales deliberadamente.
- `Transaction numbers are only allowed...`: MongoDB se inició como standalone; levantar el replica set indicado.
- Seed repetido con otros conteos: ejecutar `npm run fixtures:validate` y revisar que no se cambió el `MONGODB_DATABASE`.
- Para reiniciar procesos sin borrar datos: `docker compose restart mongo` y después `docker compose up mongo-init`.
- `docker compose down` detiene contenedores y conserva el volumen. Eliminar el volumen borra los datos y no forma parte del flujo normal.

API02 se verificó con MongoDB Community 8.0.34 nativo en un replica set temporal de un nodo. Docker Compose quedó preparado para la reproducción entre ambos integrantes y requiere validación manual en un equipo con Docker disponible.
