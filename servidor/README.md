# Servidor Express de Innovation Hub

Base HTTP del Avance 2. API01 incorpora configuración validada, CORS explícito, límite JSON, `X-Request-Id`, errores contractuales, healthcheck y cierre limpio. MongoDB y las rutas de dominio comienzan en API02 y tareas posteriores.

## Requisitos y configuración

- Node.js `22.12.0` o posterior compatible.
- npm compatible con la versión instalada.

Preparar el entorno local:

```bash
cp .env.example .env
npm ci --cache /private/tmp/innovation-hub-npm-cache
```

| Variable | Obligatoria | Uso |
| --- | --- | --- |
| `NODE_ENV` | No | `development`, `test` o `production`; por defecto `development`. |
| `HOST` | No | Interfaz de escucha; por defecto `127.0.0.1`. |
| `PORT` | Sí | Puerto HTTP entre 1 y 65535. |
| `CLIENT_ORIGIN` | Sí | Origen HTTP(S) exacto autorizado por CORS, sin ruta ni `*`. |
| `BODY_LIMIT` | No | Límite JSON expresado en `kb` o `mb`; por defecto `100kb`. |

API01 todavía no consume `MONGODB_URI` ni nombre de base. Documentarlos como activos antes de API02 sería engañoso: el healthcheck actual confirma el proceso Express, no MongoDB.

## Comandos

| Comando | Función |
| --- | --- |
| `npm run dev` | Inicia Node en modo watch y carga `.env` si existe. |
| `npm start` | Inicia el servidor y carga `.env` si existe. |
| `npm run lint` | Ejecuta ESLint sobre código y pruebas. |
| `npm test` | Ejecuta pruebas HTTP y de configuración con `node:test`. |
| `npm run check` | Ejecuta lint y pruebas. |

Con la configuración de ejemplo, la API queda en `http://127.0.0.1:3000` y el endpoint operativo es:

```text
GET http://127.0.0.1:3000/api/health
```

Respuesta:

```json
{
  "data": {
    "status": "ok",
    "service": "innovation-hub-api"
  }
}
```

Cada respuesta incluye `X-Request-Id`. Una ruta inexistente, JSON roto, origen CORS rechazado o fallo inesperado usa `{ "error": { "code", "message", "fields" } }`. Los fallos `500` no exponen mensajes internos ni stack.

## Estructura

```text
src/
├── app.js                  # Compone Express sin abrir un puerto
├── server.js               # Escucha y cierre por SIGINT/SIGTERM
├── config/                 # Lectura y validación del entorno
├── controllers/            # Adaptación HTTP
├── dto/                    # Proyecciones de salida
├── errors/                 # Errores HTTP conocidos
├── middleware/             # CORS, request ID, 404 y errores
├── routes/                 # Registro de endpoints
└── services/               # Operaciones independientes de Express
```

Los repositorios y modelos se agregan cuando API02 introduzca persistencia. No se crean carpetas vacías para aparentar una capa que todavía no existe.
