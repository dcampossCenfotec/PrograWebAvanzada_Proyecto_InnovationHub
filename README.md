# Innovation Hub

**Plataforma universitaria para la gestión de iniciativas, colaboración interdisciplinaria y desarrollo de proyectos.**

| Información | Detalle |
|---|---|
| Universidad | Universidad CENFOTEC — Escuela de Software |
| Curso | SOFT-12 — Programación Web Avanzada |
| Periodo | III cuatrimestre de 2026 |
| Sección | SCV2 |
| Docente | Álvaro Cordero Peña |
| Proyecto | Innovation Hub |
| Entrega | Avance 2 — Aplicación web cliente-servidor |
| Integrantes | Daniel Campos Sánchez y Francisco José Torres Sandoval |
| Modalidad | Ejecución local con React, Express y MongoDB |

---

## 1. Descripción general

**Innovation Hub** es una aplicación web orientada a la comunidad universitaria que permite publicar ideas, identificar necesidades, proponer retos, encontrar colaboradores y formar equipos interdisciplinarios para desarrollar proyectos.

La plataforma centraliza el ciclo de vida de una iniciativa: desde su publicación y descubrimiento hasta la recepción de solicitudes, la incorporación de participantes y su eventual conversión en un proyecto.

El sistema contempla distintos perfiles de la comunidad académica, competencias técnicas, reglas de visibilidad y mecanismos de autorización que determinan qué información puede consultar o modificar cada usuario.

### 1.1 Objetivo general

Desarrollar una plataforma web que facilite la colaboración entre integrantes de la comunidad universitaria mediante la publicación y gestión de iniciativas, el descubrimiento de oportunidades de participación, la conformación de equipos y el seguimiento inicial de proyectos.

### 1.2 Objetivos específicos

- Permitir el registro y autenticación de usuarios.
- Administrar perfiles y competencias.
- Publicar, consultar, editar, eliminar o archivar iniciativas según las reglas del sistema.
- Facilitar búsquedas mediante filtros combinados y paginación.
- Gestionar solicitudes de participación y sus estados.
- Permitir que los propietarios acepten o rechacen solicitudes.
- Administrar las membresías activas de los equipos.
- Convertir iniciativas en proyectos cuando se cumplan las condiciones establecidas.
- Consultar proyectos y sus equipos asociados.
- Integrar información de repositorios públicos mediante GitHub.
- Mantener la integridad de los datos y aplicar los controles de acceso en el servidor.

### 1.3 Evolución del sistema

El proyecto se desarrolla de forma incremental.

| Etapa | Arquitectura | Alcance |
|---|---|---|
| Avance 1 | HTML, CSS, JavaScript, Bootstrap y Sass | Prototipo de navegación, catálogo y gestión local de iniciativas |
| Avance 2 | React, Vite, Express y MongoDB | Aplicación cliente-servidor con autenticación, persistencia, API REST y reglas de negocio |
| Entrega final | React y nueva API ASP.NET Core con base de datos relacional | Sustitución del backend conservando el contrato HTTP y ampliación del alcance correspondiente |

El directorio `avance1/` conserva la implementación original como parte de la evolución del proyecto.

La aplicación funcional del Avance 2 se encuentra en `cliente/` y `servidor/`.

---

## 2. Tecnologías y herramientas

### 2.1 Stack tecnológico

| Tecnología | Función |
|---|---|
| JavaScript (ES Modules) | Lenguaje principal del frontend y backend |
| React 19 | Construcción de componentes e interfaces dinámicas |
| React Router 8 | Navegación del cliente y rutas protegidas |
| Vite 8 | Servidor de desarrollo y compilación del frontend |
| Bootstrap 5 | Sistema responsive y componentes visuales |
| Sass | Variables, estilos y personalización visual |
| Node.js | Entorno de ejecución del servidor |
| Express 5 | Framework HTTP para la API REST |
| MongoDB 8 | Base de datos documental |
| Mongoose 9 | Modelos, índices y operaciones de persistencia |
| Docker Compose | Inicialización reproducible de MongoDB |
| Vitest | Pruebas automatizadas del cliente |
| React Testing Library | Pruebas de componentes React |
| Node.js Test Runner | Pruebas unitarias del backend |
| Supertest | Validación HTTP de endpoints Express |
| ESLint | Análisis estático y calidad de código |
| Postman | Ejecución de pruebas HTTP y validación del contrato |
| Git y GitHub | Control de versiones y colaboración |
| GitHub REST API | Consulta pública de metadatos de repositorios |

Las dependencias se administran mediante npm y quedan registradas en los archivos `package.json` y `package-lock.json`.

**No es necesario instalar globalmente React, Vite, Express, Mongoose, Bootstrap o Sass.**

### 2.2 Herramientas para ejecutar el proyecto

**Obligatorias:**

- Git.
- Node.js 22.12.0 o una versión posterior compatible.
- npm.
- MongoDB 8 ejecutándose como replica set.
- Navegador web moderno.

**Recomendadas:**

- Visual Studio Code.
- Docker Desktop con WSL 2 para Windows.
- Postman para las pruebas de API.
- MongoDB Compass para inspeccionar colecciones.

Docker Desktop es una alternativa para ejecutar MongoDB. Si existe una instalación nativa correctamente configurada, no es obligatorio utilizar Docker.

### 2.3 Consideraciones de versiones

El cliente requiere Node.js compatible con la versión declarada en `cliente/package.json`. El archivo `cliente/.nvmrc` permite consultar la versión de referencia del equipo.

Se recomienda utilizar una versión LTS compatible y ejecutar `npm ci` para instalar las dependencias conforme a los archivos de bloqueo.

El proyecto no requiere actualizar manualmente todos los paquetes a sus últimas versiones para ejecutarse.

---

## 3. Arquitectura del sistema

Innovation Hub implementa una arquitectura cliente-servidor con separación de responsabilidades.

```text
                 NAVEGADOR
                     |
                     v
             +----------------+
             | React + Vite   |
             | React Router   |
             | Bootstrap/Sass |
             +----------------+
                     |
               HTTP / JSON
                     |
                     v
             +----------------+
             | API Express    |
             | Rutas y CORS   |
             | Autenticación  |
             +----------------+
                     |
                     v
             +----------------+
             | Controladores  |
             +----------------+
                     |
                     v
             +----------------+
             | Servicios      |
             | Reglas negocio |
             | Transacciones  |
             +----------------+
                     |
                     v
             +----------------+
             | Repositorios   |
             | Mongoose       |
             +----------------+
                     |
                     v
             +----------------+
             | MongoDB        |
             | Replica Set    |
             +----------------+

Integración externa independiente:

React ---> GitHub REST API
```

### 3.1 Frontend

El cliente está desarrollado con React y utiliza componentes reutilizables.

Sus responsabilidades incluyen:

- Presentación de información.
- Navegación entre pantallas.
- Formularios controlados.
- Validaciones de entrada para mejorar la experiencia de usuario.
- Gestión del estado de la interfaz.
- Comunicación HTTP con la API.
- Presentación de estados de carga, error, vacío y éxito.
- Gestión de mensajes y confirmaciones.
- Consulta de información pública de GitHub.

El cliente **no se conecta directamente a MongoDB**.

### 3.2 Backend

Express expone los endpoints HTTP y organiza el procesamiento en capas.

| Capa | Responsabilidad |
|---|---|
| Routes | Asociar métodos y rutas HTTP con controladores y middleware |
| Controllers | Recibir solicitudes y generar respuestas según el contrato |
| Services | Ejecutar reglas de negocio y coordinar operaciones |
| Repositories | Acceder a la información persistida |
| Models | Definir esquemas e índices de MongoDB |
| Middleware | Gestionar autenticación, CORS, validaciones generales y errores |
| DTO | Construir representaciones públicas seguras |
| Database | Gestionar conexiones y transacciones |

Esta separación permite modificar las reglas de negocio sin mezclar su implementación con componentes React o detalles de transporte HTTP.

### 3.3 Persistencia

MongoDB conserva usuarios, sesiones, iniciativas, solicitudes, membresías, eventos y proyectos.

La aplicación utiliza identificadores públicos UUID para mantener independencia respecto de los identificadores internos de MongoDB.

Las relaciones del dominio se implementan mediante referencias y documentos embebidos según su naturaleza y ciclo de vida.

Las operaciones que afectan múltiples documentos relacionados utilizan transacciones, apoyadas por índices y verificaciones de concurrencia.

### 3.4 Contrato HTTP

La interfaz pública está definida en:

[`docs/api-contract.md`](docs/api-contract.md)

El contrato establece:

- Rutas y métodos HTTP.
- Formatos de solicitudes y respuestas.
- DTO públicos.
- Identificadores y fechas.
- Validaciones y valores controlados.
- Estados HTTP.
- Autenticación y autorización.
- Filtros, ordenamiento y paginación.
- Transiciones de estado.

El objetivo es conservar este contrato durante la futura sustitución del backend por ASP.NET Core y una base de datos relacional.

---

## 4. Funcionalidades del Avance 2

### 4.1 Autenticación y sesiones

El módulo de autenticación permite:

- Registro de usuarios.
- Inicio de sesión.
- Identificación del usuario autenticado.
- Restauración de sesión.
- Cierre de sesión.
- Revocación de tokens.

Las contraseñas se protegen mediante `scrypt` con sal aleatoria.

Los tokens de acceso son opacos y el servidor conserva hashes de sesión.

El cliente almacena el token de sesión en `sessionStorage`.

Las operaciones protegidas requieren el encabezado:

```http
Authorization: Bearer <accessToken>
```

### 4.2 Perfiles y directorio

Los usuarios pueden consultar y actualizar sus datos editables.

El correo electrónico funciona como identificador y no puede modificarse desde la actualización ordinaria del perfil.

El directorio permite buscar colaboradores mediante criterios como nombre, carrera, competencias y disponibilidad.

Los perfiles públicos y los listados aplican proyecciones de datos que evitan revelar información reservada.

### 4.3 Competencias

El sistema relaciona usuarios e iniciativas con competencias identificadas mediante UUID.

Las competencias de cada usuario pueden incluir un nivel:

- `basic`
- `intermediate`
- `advanced`

Una solicitud de participación debe ofrecer una competencia activa que pertenezca al perfil del solicitante.

### 4.4 Gestión de iniciativas

Las iniciativas representan ideas, necesidades o retos.

Sus funcionalidades incluyen:

- Publicación.
- Consulta individual.
- Catálogo general.
- Consulta de iniciativas propias.
- Edición por el propietario.
- Búsqueda y filtros combinados.
- Paginación y ordenamiento.
- Eliminación bajo condiciones específicas.
- Archivado independiente.

Los tipos disponibles son:

| Valor | Significado |
|---|---|
| `idea` | Idea o propuesta |
| `need` | Necesidad identificada |
| `challenge` | Reto |

Los estados del dominio son:

- `draft`
- `published`
- `forming_team`
- `converted`
- `archived`

Los cuatro niveles de visibilidad son:

- `public`
- `institutional`
- `restricted`
- `private`

El servidor determina qué información puede consultar cada actor.

**Eliminar y archivar son operaciones diferentes.**

La eliminación física se permite únicamente cuando no existe historial adicional incompatible. Cuando una iniciativa tiene historial relacionado, debe conservarse mediante archivado.

### 4.5 Búsqueda, filtros y paginación

Los listados implementan filtros en el backend para evitar descargar colecciones completas y procesarlas únicamente en el navegador.

El contrato contempla:

- Página (`page`).
- Tamaño (`size`).
- Campo de ordenamiento (`sort`).
- Dirección (`order`).
- Parámetros de búsqueda propios de cada recurso.

El tamaño de página permitido es de 1 a 50.

Los conteos se calculan sobre los recursos accesibles al actor, respetando sus permisos.

Los resultados usan ordenamiento estable, incorporando el identificador cuando corresponde para resolver empates.

### 4.6 Solicitudes de participación

Los usuarios autenticados pueden solicitar integrarse a iniciativas accesibles.

El formulario registra:

- Mensaje de presentación.
- Competencia ofrecida.
- Rol solicitado.
- Disponibilidad.

Los estados de una solicitud son:

| Estado | Descripción |
|---|---|
| `pending` | Pendiente de revisión |
| `accepted` | Aceptada por el propietario |
| `rejected` | Rechazada |
| `cancelled` | Cancelada por el solicitante |

El módulo incluye:

- Creación de solicitudes.
- Consulta de solicitudes propias.
- Consulta de solicitudes recibidas.
- Edición de solicitudes pendientes.
- Cancelación.
- Aceptación o rechazo por el propietario.
- Filtros por estado y otros criterios contractuales.
- Conservación del historial.

Una solicitud pendiente duplicada para el mismo usuario e iniciativa produce un conflicto.

El envío de una solicitud **no incorpora automáticamente al usuario al equipo**.

### 4.7 Administración de equipos

Una solicitud aceptada permite incorporar automáticamente al solicitante como miembro activo.

La aceptación coordina transaccionalmente:

1. La actualización del estado de la solicitud.
2. La creación de la membresía.
3. El registro del evento de ingreso.
4. Las modificaciones necesarias de la iniciativa.

El sistema también permite consultar el equipo y retirar integrantes según los permisos del actor.

Las membresías retiradas se conservan como historial.

El propietario no puede retirarse a sí mismo del equipo.

### 4.8 Conversión de iniciativas en proyectos

El propietario puede convertir una iniciativa en proyecto cuando se cumplen las condiciones del dominio.

La regla principal exige **al menos un miembro activo adicional al propietario**.

El proyecto conserva una referencia a su iniciativa de origen.

Los datos del proyecto incluyen:

- Nombre.
- Descripción.
- Objetivo.
- Tecnologías.
- Fecha de inicio.
- Fecha estimada de finalización, opcional.
- Estado.
- URL de repositorio, opcional.

El estado inicial de un nuevo proyecto es `planning`.

Una iniciativa solamente puede convertirse una vez, y la operación utiliza una transacción para evitar proyectos duplicados o estados parciales.

El equipo del proyecto se obtiene mediante las membresías de la iniciativa de origen, evitando duplicar los mismos integrantes en otra colección.

### 4.9 Integración con GitHub

El detalle de proyecto puede consultar metadatos de un repositorio público de GitHub.

Se presenta información como:

- Nombre del repositorio.
- Propietario.
- Descripción.
- Lenguaje principal.
- Rama predeterminada.
- Última actualización.
- Número de asuntos abiertos.

La consulta se realiza desde el cliente mediante la API pública de GitHub.

Se contemplan respuestas de repositorios inexistentes o privados, limitaciones de solicitudes, problemas de red y respuestas incompletas.

**La falta de disponibilidad de GitHub no debe impedir visualizar la información principal del proyecto.**

El token de sesión de Innovation Hub no se envía a GitHub.

---

## 5. Estructura del repositorio

```text
innovation-hub/
|
|-- README.md
|-- .gitignore
|-- compose.yaml
|
|-- avance1/
|   |-- index.html
|   |-- paginas/
|   |-- js/
|   |-- scss/
|   |-- css/
|   |-- datos/
|   |-- tests/
|   |-- package.json
|   `-- INTEGRACION.md
|
|-- cliente/
|   |-- index.html
|   |-- package.json
|   |-- package-lock.json
|   |-- vite.config.js
|   |-- eslint.config.js
|   |-- .env.example
|   |-- .nvmrc
|   `-- src/
|       |-- api/
|       |   |-- external/
|       |   `-- services/
|       |-- app/
|       |-- auth/
|       |-- components/
|       |-- features/
|       |   |-- users/
|       |   |-- initiatives/
|       |   |-- requests/
|       |   |-- teams/
|       |   `-- projects/
|       |-- hooks/
|       |-- styles/
|       `-- dev/
|
|-- servidor/
|   |-- package.json
|   |-- package-lock.json
|   |-- .env.example
|   |-- .env.test.example
|   |-- scripts/
|   |-- test/
|   `-- src/
|       |-- config/
|       |-- controllers/
|       |-- database/
|       |-- dto/
|       |-- errors/
|       |-- middleware/
|       |-- models/
|       |-- modules/
|       |-- repositories/
|       |-- routes/
|       |-- security/
|       |-- seeds/
|       |-- services/
|       `-- validation/
|
|-- pruebas/
|   |-- fixtures/
|   |-- fragmentos/
|   `-- innovation-hub.postman_collection.json
|
`-- docs/
    |-- alcance-avance2.md
    |-- api-contract.md
    |-- modelo-datos.md
    |-- matriz-reglas.md
    |-- matriz-pruebas.md
    |-- iniciativas-api.md
    |-- bitacora-avance2.md
    |-- verificacion-contrato.md
    |-- qa-cliente.md
    |-- defensa.md
    `-- cierre-avance2.md
```

**Organización funcional:** el cliente agrupa pantallas, formularios y servicios por dominio; el backend separa las rutas HTTP, la lógica de negocio y las operaciones de persistencia.

Las carpetas `node_modules/`, los archivos privados `.env` y los resultados temporales de pruebas no forman parte del código versionado.

---

## 6. Instalación y configuración del entorno

Las siguientes instrucciones están orientadas a Windows con PowerShell y Docker Desktop. También es posible utilizar terminales Bash realizando los cambios de sintaxis correspondientes.

### 6.1 Requisitos previos

Comprobar:

```powershell
node --version
npm --version
git --version
docker --version
docker compose version
```

Asegurarse de que:

- Node.js cumple el requisito del proyecto.
- Git está disponible.
- Docker Desktop está iniciado, si se utiliza MongoDB en contenedor.
- WSL 2 y virtualización están configurados correctamente, cuando corresponda.

### 6.2 Obtener el repositorio

Clonar utilizando la URL real del proyecto:

```powershell
git clone <URL_DEL_REPOSITORIO>
cd innovation-hub
```

Si el repositorio ya está descargado, basta con abrir su carpeta principal en VS Code.

### 6.3 Inicializar MongoDB

Desde la raíz de `innovation-hub`:

```powershell
docker compose up -d
docker compose ps
```

El archivo `compose.yaml` define MongoDB con replica set:

```text
Replica set: innovationHubRs
Puerto:      27017
Host local:  127.0.0.1
```

La configuración de Docker utiliza un volumen persistente para conservar la información entre reinicios del contenedor.

Verificar el replica set:

```powershell
docker compose exec -T mongo mongosh --quiet --eval 'printjson({set: db.hello().setName, primary: db.hello().isWritablePrimary})'
```

El resultado esperado es el nombre `innovationHubRs` y un nodo primario disponible.

Si MongoDB ya se encuentra iniciado y el replica set está configurado, no es necesario ejecutar nuevamente la inicialización.

**Importante:** MongoDB debe funcionar como replica set porque el proyecto utiliza transacciones. Una instancia standalone no cumple este requisito.

### 6.4 Instalar el backend Express

Abrir una terminal en la raíz del repositorio:

```powershell
cd servidor
npm ci
```

El comando `npm ci` instala las dependencias definidas en `package-lock.json`, incluidas Express, Mongoose, CORS y las herramientas de prueba.

Crear el archivo de configuración solamente si todavía no existe:

```powershell
if (!(Test-Path .env)) {
    Copy-Item .env.example .env
}
```

Comprobar la configuración local:

```dotenv
NODE_ENV=development
HOST=127.0.0.1
PORT=3000
CLIENT_ORIGIN=http://localhost:5173
BODY_LIMIT=100kb
MONGODB_URI=mongodb://127.0.0.1:27017/?replicaSet=innovationHubRs&directConnection=true
MONGODB_DATABASE=innovation_hub
MONGODB_CONNECT_TIMEOUT_MS=5000
AUTH_SESSION_TTL_MINUTES=480
DEMO_USER_PASSWORD=CONTRASENA_LOCAL_DE_DEMOSTRACION
```

`DEMO_USER_PASSWORD` debe contener el valor local que se utilizará al cargar las cuentas sintéticas.

No publicar archivos `.env` ni credenciales reales.

### 6.5 Validar y cargar datos iniciales

Dentro de `servidor/`:

```powershell
npm run fixtures:validate
```

Este comando valida la estructura y las relaciones de los fixtures compartidos.

Para cargar los datos de demostración en la base configurada:

```powershell
npm run seed
```

En una base limpia, el conjunto de fixtures contempla:

| Entidad | Cantidad |
|---|---:|
| Categorías | 8 |
| Competencias | 10 |
| Usuarios | 5 |
| Iniciativas | 8 |
| Membresías | 12 |
| Eventos de membresía | 13 |
| Solicitudes | 5 |
| Proyectos | 1 |

El seed utiliza identificadores definidos y operaciones orientadas a evitar la duplicación de los registros iniciales.

La carga de solicitudes y proyectos utiliza inserciones no destructivas para conservar los estados de documentos ya existentes.

**Precaución:** antes de repetir el seed, revisar qué campos pueden actualizar los módulos que cargan usuarios e iniciativas. No ejecutar la carga sobre datos que necesiten preservarse sin comprobar su comportamiento.

### 6.6 Iniciar el backend

Desde `servidor/`:

```powershell
npm run dev
```

La API se inicia normalmente en:

```text
http://127.0.0.1:3000/api
```

Verificar su disponibilidad:

```text
http://127.0.0.1:3000/api/health
```

Respuesta esperada:

```json
{
  "data": {
    "status": "ok",
    "service": "innovation-hub-api"
  }
}
```

Este endpoint verifica que el servidor HTTP responde; no sustituye una prueba de lectura y escritura de MongoDB.

Mantener abierta la terminal del servidor durante las pruebas.

### 6.7 Instalar el frontend React

Abrir otra terminal desde la raíz del repositorio:

```powershell
cd cliente
npm ci
```

Crear el archivo de configuración local si no existe:

```powershell
if (!(Test-Path .env.local)) {
    Copy-Item .env.example .env.local
}
```

Configurar la aplicación para utilizar la API real:

```dotenv
VITE_API_MODE=real
VITE_API_BASE_URL=http://127.0.0.1:3000/api
VITE_API_TIMEOUT_MS=15000
VITE_GITHUB_API_BASE_URL=https://api.github.com
VITE_GITHUB_API_VERSION=2022-11-28
```

`VITE_API_MODE=real` permite consultar Express y MongoDB.

El modo `mock` se reserva para escenarios de desarrollo y no debe utilizarse para validar la persistencia real de la entrega.

Las variables con prefijo `VITE_` pueden incorporarse al código del navegador; por esta razón, no deben contener contraseñas ni claves privadas.

### 6.8 Iniciar React

Desde `cliente/`:

```powershell
npm run dev
```

Abrir en el navegador:

```text
http://localhost:5173/
```

**Esta es la dirección de acceso a la aplicación del Avance 2.**

No abrir directamente `cliente/index.html` mediante `file://`, porque React necesita que Vite procese y sirva sus módulos.

Si se modifica `.env.local`, reiniciar Vite para aplicar la nueva configuración.

### 6.9 Servicios utilizados durante la ejecución

| Servicio | Dirección | Responsabilidad |
|---|---|---|
| MongoDB | `127.0.0.1:27017` | Persistencia |
| Express | `http://127.0.0.1:3000/api` | API y lógica del sistema |
| React + Vite | `http://localhost:5173` | Interfaz web |
| GitHub API | `https://api.github.com` | Metadatos públicos de repositorios |

Para probar la aplicación completa deben estar activos MongoDB, Express y Vite.

---

## 7. Datos y usuarios de demostración

Los datos sintéticos se encuentran en:

[`pruebas/fixtures/`](pruebas/fixtures/)

Los actores permiten comprobar distintos comportamientos de autorización y participación.

| Usuario | Correo de demostración | Función |
|---|---|---|
| Ana Rojas | `ana.owner@example.test` | Propietaria de iniciativas |
| Luis Mora | `luis.applicant@example.test` | Solicitante |
| Carla Vega | `carla.outsider@example.test` | Usuario autenticado externo a determinados equipos |
| Diego Núñez | `diego.inactive@example.test` | Usuario inactivo para pruebas |
| Elena Solís | `elena.member@example.test` | Integrante aceptada |

La contraseña de las cuentas activas cargadas mediante el seed corresponde al valor local de `DEMO_USER_PASSWORD`.

El usuario inactivo se utiliza para validar restricciones y no debe tratarse como una cuenta habilitada.

Estos datos son exclusivamente de demostración y no contienen información real de estudiantes o colaboradores.

---

## 8. Navegación de la aplicación

El cliente utiliza React Router.

### 8.1 Rutas principales

| Ruta | Pantalla |
|---|---|
| `/` | Página principal |
| `/ingresar` | Inicio de sesión |
| `/registro` | Registro de usuarios |
| `/perfil` | Perfil propio |
| `/usuarios` | Directorio de colaboradores |
| `/usuarios/:id` | Perfil de otro usuario |
| `/iniciativas` | Catálogo |
| `/mis-iniciativas` | Iniciativas propias |
| `/iniciativas/nueva` | Publicar iniciativa |
| `/iniciativas/:id` | Detalle de iniciativa |
| `/iniciativas/:id/editar` | Editar iniciativa |
| `/iniciativas/:id/participar` | Solicitar participación |
| `/iniciativas/:id/convertir` | Convertir en proyecto |
| `/mis-solicitudes` | Historial de solicitudes propias |
| `/solicitudes/:id` | Detalle de solicitud |
| `/solicitudes/:id/editar` | Editar solicitud pendiente |
| `/solicitudes-recibidas` | Solicitudes de las iniciativas propias |
| `/proyectos` | Listado de proyectos |
| `/proyectos/:id` | Detalle de proyecto |
| `*` | Página 404 |

Las rutas que requieren identidad utilizan controles de autenticación del cliente.

La autorización definitiva siempre se aplica en el servidor.

---

## 9. API REST

La API utiliza la URL base:

```text
http://127.0.0.1:3000/api
```

El contrato contiene **27 operaciones funcionales** y un endpoint adicional de salud.

### 9.1 Autenticación — 4 operaciones

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/auth/register` | Registrar usuario |
| POST | `/auth/login` | Iniciar sesión |
| POST | `/auth/logout` | Revocar sesión |
| GET | `/auth/me` | Consultar identidad autenticada |

### 9.2 Usuarios y catálogos — 5 operaciones

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/users` | Consultar directorio |
| GET | `/users/:id` | Consultar perfil |
| PUT | `/users/me` | Actualizar perfil propio |
| GET | `/categories` | Consultar categorías |
| GET | `/skills` | Consultar competencias |

### 9.3 Iniciativas — 7 operaciones

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/initiatives` | Listar y filtrar iniciativas |
| GET | `/initiatives/mine` | Consultar iniciativas propias |
| GET | `/initiatives/:id` | Consultar detalle |
| POST | `/initiatives` | Crear iniciativa |
| PUT | `/initiatives/:id` | Editar iniciativa |
| DELETE | `/initiatives/:id` | Eliminar cuando esté permitido |
| POST | `/initiatives/:id/archive` | Archivar conservando historial |

### 9.4 Solicitudes — 6 operaciones

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/initiatives/:id/requests` | Crear solicitud |
| GET | `/requests` | Listar solicitudes por alcance |
| GET | `/requests/:id` | Consultar solicitud |
| PUT | `/requests/:id` | Editar solicitud pendiente |
| POST | `/requests/:id/cancel` | Cancelar solicitud |
| POST | `/requests/:id/decision` | Aceptar o rechazar |

El listado de solicitudes utiliza `scope=mine` o `scope=received`, según el actor y la operación.

### 9.5 Equipos — 2 operaciones

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/initiatives/:id/members` | Consultar integrantes |
| DELETE | `/initiatives/:id/members/:userId` | Retirar miembro |

### 9.6 Proyectos — 3 operaciones

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/initiatives/:id/project` | Convertir iniciativa |
| GET | `/projects` | Consultar proyectos accesibles |
| GET | `/projects/:id` | Consultar detalle de proyecto |

### 9.7 Respuestas HTTP

Las respuestas individuales utilizan:

```json
{
  "data": {
    "id": "uuid"
  }
}
```

Los listados paginados utilizan:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "size": 12,
    "total": 0,
    "totalPages": 0
  }
}
```

Los errores mantienen un formato uniforme:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Revisa los campos indicados.",
    "fields": {}
  }
}
```

### 9.8 Códigos HTTP contemplados

| Código | Significado |
|---|---|
| `200` | Consulta u operación completada |
| `201` | Recurso creado |
| `204` | Operación completada sin contenido |
| `400` | Datos o parámetros inválidos |
| `401` | Autenticación requerida o inválida |
| `403` | Operación no autorizada |
| `404` | Recurso inexistente o no revelable |
| `409` | Duplicado, estado incompatible o concurrencia |
| `500` | Error interno controlado |

Para los campos obligatorios, parámetros, DTO completos y reglas de cada endpoint, consultar [`docs/api-contract.md`](docs/api-contract.md).

---

## 10. Modelo de datos

El diseño documental está descrito en:

[`docs/modelo-datos.md`](docs/modelo-datos.md)

### 10.1 Colecciones principales

| Colección | Contenido |
|---|---|
| `users` | Usuarios, perfiles y competencias |
| `sessions` | Sesiones autenticadas y tokens protegidos |
| `categories` | Categorías de iniciativas |
| `skills` | Catálogo de competencias |
| `initiatives` | Iniciativas y datos de publicación |
| `requests` | Solicitudes de participación |
| `memberships` | Integrantes y periodos de pertenencia |
| `membershipEvents` | Historial de ingreso y retiro |
| `projects` | Proyectos y referencias a iniciativas |

### 10.2 Decisiones de diseño

Se utilizan datos embebidos cuando forman parte de un agregado pequeño y se consultan habitualmente junto con su entidad.

Se utilizan referencias cuando los datos tienen ciclos de vida independientes, requieren consultas propias o deben conservarse como historial.

Ejemplo de relación:

```text
User
  |
  +---- Request ---- Initiative
  |                     |
  +---- Membership ------+
                          |
                       Project
                          |
                   sourceInitiativeId
```

### 10.3 Integridad

La implementación contempla:

- UUID públicos.
- Validación de referencias.
- Índices únicos.
- Índices parciales.
- Historial de membresías.
- Control de solicitudes pendientes duplicadas.
- Control de conversión única por iniciativa.
- Transacciones MongoDB.
- Comprobaciones de revisión para operaciones concurrentes.

Los conteos derivados, como miembros activos y espacios estimados, se calculan a partir de los datos relacionados.

---

## 11. Pruebas y aseguramiento de calidad

El proyecto combina pruebas unitarias, de integración, validaciones estáticas, pruebas HTTP y recorridos manuales.

### 11.1 Pruebas del backend

Desde `servidor/`:

```powershell
npm run check
```

Este script ejecuta:

1. ESLint.
2. Validación de fixtures.
3. Pruebas locales mediante Node.js Test Runner.

También pueden ejecutarse:

```powershell
npm run lint
npm test
npm run fixtures:validate
```

### 11.2 Pruebas de integración con MongoDB

El proyecto dispone de un entorno de prueba separado.

Crear `servidor/.env.test` a partir de `.env.test.example`:

```powershell
if (!(Test-Path .env.test)) {
    Copy-Item .env.test.example .env.test
}
```

Verificar especialmente:

```dotenv
NODE_ENV=test
MONGODB_TEST_URI=mongodb://127.0.0.1:27017/?replicaSet=innovationHubRs&directConnection=true
MONGODB_TEST_DATABASE=innovation_hub_test
```

Después ejecutar desde `servidor/`:

```powershell
npm run test:integration
```

**Advertencia:** las pruebas de integración pueden eliminar o restablecer colecciones de la base de pruebas. Utilizar únicamente una base desechable.

Nunca apuntar `MONGODB_TEST_DATABASE` a una base de producción o a datos importantes.

### 11.3 Pruebas del frontend

Desde `cliente/`:

```powershell
npm test
```

Este script ejecuta las pruebas Vitest, ESLint y el build de producción.

También están disponibles:

```powershell
npm run test:unit
npm run lint
npm run build
npm run test:watch
```

### 11.4 Pruebas API con Postman

La colección se encuentra en:

[`pruebas/innovation-hub.postman_collection.json`](pruebas/innovation-hub.postman_collection.json)

Está organizada en ocho grupos:

1. Autenticación.
2. Usuarios.
3. Catálogos.
4. Iniciativas.
5. Solicitudes.
6. Equipos.
7. Proyectos.
8. Transiciones y cierre.

Incluye 65 peticiones definidas para recorrer respuestas exitosas, validaciones negativas, errores de autenticación, autorizaciones, duplicados y cambios de estado.

**Procedimiento:**

1. Preparar una base de pruebas desechable.
2. Iniciar MongoDB y Express contra esa base.
3. Cargar los fixtures.
4. Abrir Postman.
5. Importar la colección.
6. Verificar `baseUrl`.
7. Configurar localmente `demoPassword`.
8. Ejecutar las carpetas en el orden previsto.
9. Revisar respuestas y aserciones.
10. Registrar fallos y evidencia.

La colección incluye operaciones que modifican datos; por lo tanto, no debe ejecutarse sobre una base con información que se quiera conservar.

Las contraseñas y tokens obtenidos durante las pruebas no deben exportarse al repositorio.

### 11.5 QA funcional y accesibilidad

La matriz de revisión está definida en:

[`docs/qa-cliente.md`](docs/qa-cliente.md)

Los aspectos contemplados incluyen:

- Navegación.
- Formularios controlados.
- Estados de carga y error.
- Catálogos vacíos.
- Persistencia en MongoDB.
- Autenticación y cierre de sesión.
- Visibilidad y autorización.
- Solicitudes y equipos.
- Conversión de proyectos.
- Integración externa GitHub.
- Navegación mediante teclado.
- Foco en diálogos y formularios.
- Diseño responsive.
- Comportamiento ante fallos de red.

Se contemplan revisiones de interfaz en anchos de 360 px, 768 px y 1440 px.

### 11.6 Matriz de verificación contractual

Consultar:

[`docs/verificacion-contrato.md`](docs/verificacion-contrato.md)

El documento relaciona el contrato HTTP con las pruebas estructurales, locales, integradas y manuales.

Los resultados deben registrarse después de su ejecución. La existencia de una prueba no constituye por sí sola evidencia de que haya sido aprobada.

---

## 12. Recorrido recomendado para demostrar el proyecto

Para comprobar el sistema completo se recomienda el siguiente flujo:

### Escenario 1 — Inicio y usuarios

1. Iniciar MongoDB.
2. Iniciar Express.
3. Iniciar React mediante Vite.
4. Abrir `http://localhost:5173/`.
5. Consultar el catálogo como visitante.
6. Iniciar sesión con una cuenta de demostración.
7. Consultar el perfil.
8. Revisar el directorio de colaboradores.

### Escenario 2 — Gestión de iniciativas

1. Ingresar como propietario.
2. Crear una iniciativa.
3. Comprobar que aparece en el catálogo.
4. Abrir el detalle.
5. Editar los campos permitidos.
6. Comprobar la persistencia tras recargar la página.
7. Probar filtros y paginación.

### Escenario 3 — Participación

1. Cerrar sesión como propietario.
2. Iniciar sesión con otro usuario.
3. Abrir una iniciativa accesible.
4. Enviar una solicitud válida.
5. Abrir Mis solicitudes.
6. Consultar el detalle.
7. Editar una solicitud pendiente.
8. Verificar el estado actualizado.

### Escenario 4 — Administración del equipo

1. Ingresar nuevamente como propietario.
2. Abrir Solicitudes recibidas.
3. Consultar las solicitudes de la iniciativa.
4. Aceptar una solicitud.
5. Comprobar que el solicitante pertenece al equipo.
6. Verificar que una solicitud ya resuelta no puede aceptarse nuevamente.
7. Comprobar las restricciones de retiro.

### Escenario 5 — Conversión y GitHub

1. Utilizar una iniciativa con otro miembro activo además del propietario.
2. Abrir la opción de conversión.
3. Completar los datos del proyecto.
4. Confirmar la operación.
5. Consultar la lista de proyectos.
6. Abrir el detalle del nuevo proyecto.
7. Verificar la referencia a la iniciativa de origen.
8. Consultar su equipo.
9. Revisar metadatos de GitHub si existe un repositorio público asociado.
10. Comprobar que el detalle sigue accesible si GitHub falla.

### Escenario 6 — Seguridad y restricciones

Comprobar adicionalmente:

- Que una persona ajena no modifica iniciativas de otro propietario.
- Que los datos privados no se muestran mediante URLs directas.
- Que no pueden generarse solicitudes pendientes duplicadas.
- Que una solicitud resuelta no puede editarse como pendiente.
- Que la conversión exige otro integrante activo.
- Que la misma iniciativa no genera dos proyectos.
- Que eliminar y archivar producen resultados distintos.
- Que el cierre de sesión invalida las operaciones protegidas.

---

## 13. Solución de problemas frecuentes

| Problema | Causa posible | Verificación |
|---|---|---|
| Docker no inicia | WSL 2 o virtualización | Revisar Docker Desktop y configuración de Windows |
| MongoDB no conecta | Contenedor detenido, URI o puerto incorrecto | `docker compose ps` y `.env` |
| Error de transacción | MongoDB sin replica set | Verificar `innovationHubRs` |
| Express no arranca | Dependencias, variables o conexión | Ejecutar `npm ci` y revisar logs |
| API responde 404 | Ruta incorrecta o recurso inexistente | Revisar `docs/api-contract.md` |
| React muestra error de red | API apagada o URL incorrecta | Verificar puerto 3000 y `.env.local` |
| Error CORS | Origen no permitido | Revisar `CLIENT_ORIGIN` |
| Error 401 | Sesión ausente, vencida o revocada | Iniciar sesión nuevamente |
| Error 403 | Permisos insuficientes | Revisar propietario, visibilidad y membresía |
| Error 409 | Duplicado o estado incompatible | Consultar estado actual antes de repetir |
| No aparecen datos | Base vacía o modo mock | Revisar seed, MongoDB y `VITE_API_MODE` |
| GitHub no carga | Repositorio privado, inexistente, límite o red | Comprobar URL y respuesta externa |
| Vite cambia de puerto | Puerto 5173 ocupado | Liberar puerto o ajustar configuración y CORS |
| Pruebas integradas no inician | Variables de test ausentes | Revisar `.env.test` |

**Nota:** el endpoint `/api/health` comprueba que Express responde, pero no reemplaza las pruebas funcionales contra MongoDB.

---

## 14. Calidad, seguridad y decisiones técnicas

La solución aplica las siguientes prácticas de ingeniería:

### 14.1 Organización

- Componentes reutilizables.
- Separación por dominios.
- API independiente del frontend.
- Controladores y servicios separados.
- Repositorios para persistencia.
- DTO para las respuestas públicas.
- Código dividido en módulos ES.

### 14.2 Frontend

- Formularios controlados.
- Actualización inmutable del estado.
- Navegación con React Router.
- Rutas protegidas.
- Validación de campos.
- Estados explícitos de consulta.
- Cancelación de operaciones asíncronas.
- Componentes responsive.
- Manejo de errores HTTP.

### 14.3 Backend

- Validación de datos en el servidor.
- Verificación de autenticación.
- Autorización por actor y recurso.
- Manejo centralizado de errores.
- CORS configurado.
- Respuestas HTTP consistentes.
- Proyecciones de campos públicos.
- Control de concurrencia.
- Transacciones para cambios relacionados.

### 14.4 Persistencia

- Índices de búsqueda y unicidad.
- UUID públicos.
- Restricciones de estado.
- Referencias entre documentos.
- Conservación de historiales.
- Operaciones transaccionales.

### 14.5 Seguridad

- Hash de contraseñas.
- Tokens de sesión revocables.
- Tokens almacenados mediante hash en MongoDB.
- Exclusión de secretos del repositorio.
- Validación de parámetros.
- Restricción de acciones por propietario.
- Separación de bases de desarrollo y prueba.
- Ausencia de credenciales de Innovation Hub en las consultas públicas de GitHub.

Estas decisiones se documentan con mayor detalle en las matrices, el modelo de datos y el contrato HTTP.

---

## 15. Historial de desarrollo y control de versiones

El repositorio conserva la evolución desde el prototipo hasta la aplicación cliente-servidor.

El desarrollo se realizó mediante commits incrementales, separando la construcción de la interfaz, la API, la persistencia, las funcionalidades de colaboración y las verificaciones finales.

### 15.1 Resumen de participación

| Etapa | Daniel Campos Sánchez | Francisco José Torres Sandoval |
|---|---|---|
| Avance 1 | Inicio, navegación, catálogo, filtros, búsqueda e integración visual | Base compartida, Sass, detalle, formularios, gestión de iniciativas, perfil y solicitudes simuladas |
| Avance 2 | Base React, HTTP, Express, MongoDB, autenticación, perfiles, directorio e iniciativas | Solicitudes, equipos, proyectos, GitHub, paginación, seguridad, pruebas, seed integral y cierre |

### 15.2 Historial del Avance 2

La siguiente cronología incorpora los cambios registrados entre el 29 de octubre y el 8 de noviembre de 2026.

Los identificadores de autor mostrados corresponden a los utilizados en GitHub.

#### Desarrollo del 29 de octubre al 3 de noviembre

| Fecha | Autor | Cambio |
|---|---|---|
| 29/10/2026 | Daniel Campos Sánchez | Definir contrato HTTP y alcance del Avance 2 |
| 29/10/2026 | Daniel Campos Sánchez | Iniciar React con Vite y rutas del sistema |
| 29/10/2026 | Daniel Campos Sánchez | Conservar Bootstrap y tema Sass del prototipo |
| 29/10/2026 | Daniel Campos Sánchez | Modelar MongoDB y acordar fixtures de integración |
| 30/10/2026 | Daniel Campos Sánchez | Organizar la coordinación de la integración final |
| 30/10/2026 | Daniel Campos Sánchez| Integrar cliente HTTP y mocks de desarrollo |
| 30/10/2026 | Daniel Campos Sánchez | Iniciar Express por capas y errores uniformes |
| 30/10/2026 | Daniel Campos Sánchez | Modelar MongoDB e inicializar datos de prueba |
| 30/10/2026 | Daniel Campos Sánchez | Autenticar usuarios y revocar sesiones |
| 31/10/2026 | Daniel Campos Sánchez | Integrar autenticación y navegación del cliente |
| 02/11/2026 | Daniel Campos Sánchez | Gestionar perfiles y buscar colaboradores |
| 03/11/2026 | Daniel Campos Sánchez | Consultar perfiles y filtrar colaboradores |
| 03/11/2026 | Daniel Campos Sánchez | Crear y modificar iniciativas con validación propia |
| 03/11/2026 | Daniel Campos Sánchez| Filtrar iniciativas y aplicar visibilidad por actor |
| 03/11/2026 | Daniel Campos Sánchez | Archivar iniciativas con historial relacionado |
| 03/11/2026 | Daniel Campos Sánchez | Consumir catálogo paginado y mostrar permisos |
| 03/11/2026 | Daniel Campos Sánchez | Detallar iniciativas y separar eliminación y archivo |
| 03/11/2026 | Daniel Campos Sánchez | Crear y editar iniciativas con formularios controlados |
| 03/11/2026 | Daniel Campos Sánchez | Controlar competencias y representar etiquetas como chips |
| 03/11/2026 | Daniel Campos Sánchez | Validar campos al corregir y confirmar guardados |
| 03/11/2026 | Daniel Campos Sánchez | Refactorizar la estructura del código para mejorar legibilidad y mantenimiento |

#### Desarrollo del 5 al 8 de noviembre

| Fecha | Autor | Cambio |
|---|---|---|
| 05/11/2026 | FranciscoTorresSandov | Implementar ciclo de solicitudes propias |
| 05/11/2026 | FranciscoTorresSandov | Gestionar participación y solicitudes propias |
| 05/11/2026 | FranciscoTorresSandov | Resolver solicitudes y mantener membresías |
| 06/11/2026 | FranciscoTorresSandov | Gestionar solicitudes recibidas y equipos |
| 06/11/2026 | FranciscoTorresSandov | Convertir iniciativas y consultar proyectos accesibles |
| 06/11/2026 | FranciscoTorresSandov | Convertir iniciativas y mostrar repositorios de GitHub |
| 07/11/2026 | FranciscoTorresSandov | Mantener paginación y conteos coherentes por recurso |
| 07/11/2026 | FranciscoTorresSandov | Cubrir autorización y operaciones concurrentes |
| 07/11/2026 | FranciscoTorresSandov | Completar seed de solicitudes y proyectos |
| 08/11/2026 | FranciscoTorresSandov | Completar colección Postman y verificar contrato HTTP |
| 08/11/2026 | FranciscoTorresSandov | Consolidar QA y documentar ejecución integral |
| 08/11/2026 | FranciscoTorresSandov | Preparar defensa y cierre de entrega |

**Resumen del historial aportado del Avance 2:**

| Integrante | Commits identificados |
|---|---:|
| Daniel Campos Sánchez | 21 |
| Francisco José Torres Sandoval | 12 |
| **Total** | **33** |

Los commits del 5 al 8 de noviembre se organizaron en cuatro bloques diarios, cubriendo funcionalidades, integridad, pruebas y documentación.

La cantidad anterior corresponde a la cronología consignada para el Avance 2; el total definitivo y los hashes deben contrastarse con el historial real del repositorio.

### 15.3 Historial del Avance 1

El Avance 1 conserva 21 commits históricos, realizados entre el 24 y el 27 de septiembre de 2026.

| Hash | Autor | Cambio |
|---|---|---|
| `7e0b8a9` | dcampossCenfotec | Initial commit |
| `45f54d1` | Francisco | Estructura navegable del proyecto |
| `97a8537` | Francisco | Tema Sass y Bootstrap |
| `626527a` | Francisco | Datos JSON y gestión local |
| `8173e7f` | Francisco | Detalle y visibilidad |
| `b4e9523` | Francisco | Formulario de iniciativas |
| `ff2c95f` | Francisco | Validación y publicación |
| `fac37ba` | Francisco | Edición de iniciativas |
| `c297845` | Francisco | Eliminación con confirmación |
| `06b2aed` | Francisco | Perfil de demostración |
| `b4aff06` | Francisco | Solicitudes simuladas |
| `56d6449` | Daniel | Navegación global |
| `0080342` | Daniel | Página principal |
| `27bff69` | Daniel | Tarjetas del catálogo |
| `585f79e` | Daniel | Estados de carga y errores |
| `ab1a495` | Daniel | Búsqueda textual |
| `f52e9f8` | Daniel | Filtro por tipo |
| `731e2dd` | Daniel | Filtros de categoría y competencia |
| `624bab3` | Daniel | Filtros combinados |
| `6802fb6` | Daniel | Integración del catálogo |
| `033361c` | Daniel | Documentación del Avance 1 |

### 15.4 Verificación mediante Git

Para consultar el historial real, ejecutar:

```powershell
git log --reverse --format="%h | %as | %an | %s"
```

Para conocer el número total de commits alcanzables desde la rama actual:

```powershell
git rev-list --count HEAD
```

Para conocer el commit actual:

```powershell
git rev-parse HEAD
```

El historial de Git constituye la fuente definitiva de hashes, autores y fechas.

No se modifican autores ni fechas históricas para alterar artificialmente la distribución de contribuciones.

---

## 16. Preparación de defensa académica

La evaluación del Avance 2 contempla tanto la calidad del producto como el conocimiento individual de la solución.

Cada integrante debe estar preparado para explicar:

- La composición de componentes React.
- El uso de props y estado.
- Formularios controlados.
- Navegación y rutas protegidas.
- Consumo HTTP y errores.
- Rutas y controladores Express.
- Servicios y repositorios.
- Autenticación y sesiones.
- Autorización y visibilidad.
- Modelo MongoDB.
- Índices y transacciones.
- Solicitudes y equipos.
- Conversión de proyectos.
- Integración GitHub.
- Estrategia de pruebas.
- Decisiones de arquitectura.
- Compatibilidad del contrato con el backend futuro.

La guía de preparación se encuentra en:

[`docs/defensa.md`](docs/defensa.md)

La defensa requiere comprender también módulos desarrollados por el otro integrante.

Las prácticas de defensa deben realizarse respetando las restricciones académicas sobre herramientas de asistencia y generación automática de código.

---

## 17. Alcance de la entrega y trabajo posterior

### Incluido en el Avance 2

- Cliente React con Vite.
- Diseño visual mediante Bootstrap y Sass.
- API REST con Express.
- MongoDB y Mongoose.
- Autenticación y perfiles.
- Directorio de colaboradores.
- Gestión de iniciativas.
- Solicitudes de participación.
- Gestión de equipos.
- Conversión en proyectos.
- Listado y detalle de proyectos.
- Consulta pública de GitHub.
- Scripts de seed.
- Pruebas unitarias y de integración.
- Colección Postman.
- Documentación del modelo y contrato.

### Fuera del alcance del Avance 2

La consigna reserva para la entrega final determinadas operaciones adicionales, entre ellas la edición, búsqueda y archivado de proyectos, así como la implementación del backend en otro lenguaje y con persistencia relacional.

El Avance 2 no requiere despliegue público de la aplicación.

La demostración se realiza localmente.

---

## 18. Entrega y versionado

La etiqueta establecida para el Avance 2 es:

```text
entrega-2
```

La etiqueta debe apuntar al commit aprobado para la entrega.

Antes de publicarla se requiere verificar:

- Estado limpio del repositorio.
- Dependencias instalables desde los archivos de bloqueo.
- Arranque de MongoDB, Express y React.
- Pruebas automatizadas.
- Integración contra MongoDB.
- Colección Postman.
- QA de interfaz.
- Consistencia del contrato HTTP.
- Ausencia de secretos.
- Documentación actualizada.

El procedimiento detallado se encuentra en:

[`docs/cierre-avance2.md`](docs/cierre-avance2.md)

La preparación del código y de la documentación no equivale a confirmar que la etiqueta se publicó o que Moodle recibió la entrega.

Una vez aprobada la versión, el contrato HTTP correspondiente quedará congelado para asegurar la compatibilidad requerida por la entrega final.

---

## 19. Ejecución del prototipo del Avance 1

El código original se conserva en `avance1/`.

Puede ejecutarse de forma independiente y no requiere Express ni MongoDB.

### Instalar dependencias

Desde la raíz:

```powershell
cd avance1
npm ci
npm run build:css
npm test
```

### Iniciar servidor estático

Regresar a la raíz de `innovation-hub`:

```powershell
py -m http.server 8000 --bind 127.0.0.1
```

Abrir:

```text
http://127.0.0.1:8000/avance1/index.html
```

El prototipo original utiliza módulos JavaScript y carga datos mediante `fetch`, por lo que no debe abrirse directamente desde `file://`.

### Diferencia respecto del Avance 2

| Aspecto | Avance 1 | Avance 2 |
|---|---|---|
| Interfaz | HTML y JavaScript | React |
| Navegación | Páginas HTML | React Router |
| Persistencia | JSON y localStorage | MongoDB |
| Backend | No disponible | Express |
| Autenticación | Identidad simulada | Sesiones reales |
| Solicitudes | Simulación | Persistencia y estados |
| Equipos | Datos de demostración | Membresías persistentes |
| Proyectos | No implementados como entidad independiente | Entidad y conversión |
| Pruebas | Node Test Runner | Vitest, Node Test Runner, Supertest y Postman |

La conservación del prototipo permite consultar la evolución funcional y arquitectónica del sistema.

---

## 20. Documentación complementaria

| Documento | Contenido |
|---|---|
| [`docs/alcance-avance2.md`](docs/alcance-avance2.md) | Alcance y decisiones generales |
| [`docs/api-contract.md`](docs/api-contract.md) | Contrato HTTP y DTO |
| [`docs/modelo-datos.md`](docs/modelo-datos.md) | Modelo MongoDB y relaciones |
| [`docs/matriz-reglas.md`](docs/matriz-reglas.md) | Reglas de negocio y equivalencias |
| [`docs/matriz-pruebas.md`](docs/matriz-pruebas.md) | Escenarios y cobertura |
| [`docs/iniciativas-api.md`](docs/iniciativas-api.md) | Operaciones y permisos de iniciativas |
| [`docs/bitacora-avance2.md`](docs/bitacora-avance2.md) | Registro técnico de verificaciones |
| [`docs/verificacion-contrato.md`](docs/verificacion-contrato.md) | Validación de la API |
| [`docs/qa-cliente.md`](docs/qa-cliente.md) | QA funcional y accesibilidad |
| [`docs/defensa.md`](docs/defensa.md) | Preparación de defensa |
| [`docs/cierre-avance2.md`](docs/cierre-avance2.md) | Procedimiento de cierre y publicación |
| [`cliente/README.md`](cliente/README.md) | Documentación específica del frontend |
| [`servidor/README.md`](servidor/README.md) | Documentación específica del backend |
| [`pruebas/fixtures/README.md`](pruebas/fixtures/README.md) | Datos sintéticos y escenarios |

---

## 21. Integrantes

| Integrante | Identificación |
|---|---|
| Daniel Campos Sánchez | P000011085 |
| Francisco José Torres Sandoval | P00006284 |

**Universidad CENFOTEC — SOFT-12, Programación Web Avanzada — III cuatrimestre de 2026.**

Innovation Hub integra desarrollo frontend, backend, persistencia documental, seguridad, pruebas y control de versiones en una aplicación web orientada a la colaboración universitaria.

## Tarea 3 — parte B (.NET y SQL Server)

El trabajo se incorpora progresivamente en [`servidor-net/`](servidor-net/README.md). El [plan por commits](docs/tarea3-parte-b.md) fija alcance, reparto Daniel/Francisco, criterios de evaluación, entregables y pruebas. La [consigna extraída](docs/fuentes/consigna-tarea3.md) conserva la referencia sin reconvertir el PDF.

Estado T3B-03: modelo relacional completo, dos migraciones evolutivas y 107 filas HasData. Incluye solicitudes, equipos, historia y proyectos; los GET siguen pendientes de T3B-04. Esta API parcial no sustituye Express ni requiere modificar el cliente React.

Dentro de `servidor-net`: `dotnet tool restore`, `dotnet restore --locked-mode` y `dotnet build --no-restore`. Se usa SDK **10.0.404** y EF Core **10.0.15**. La clave **`ConnectionStrings:InnovationHub`** se configura con user-secrets, nunca se versiona su valor. El README específico explica cómo. El README de .NET explica cómo comprobar el destino exclusivo, aplicar ambas migraciones, ejecutar `--verify-domain=true` y comparar actualización incremental con construcción limpia. La reconstrucción destructiva completa se verificará en T3B-05; todavía no hay etiqueta final de entrega.

La [guía de Francisco para Tarea 3](docs/handoff-francisco-tarea3.md) reúne preparación, documentos, sus tres tareas, prompts y revisión de entrega. Es independiente del handoff histórico del Avance 2.
