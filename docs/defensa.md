
# Guía de defensa individual — Innovation Hub

## 1. Propósito

Preparar la defensa del Avance 2 de SOFT-12, basada en la consigna y los 20 criterios de evaluación.

La defensa es individual. Daniel y Francisco deben explicar tanto el código propio como el desarrollado por su compañero.

La práctica debe realizarse sin asistentes de inteligencia artificial ni herramientas de generación o autocompletado de código, conforme a la consigna.

Este documento es material de preparación, no evidencia de haber completado la defensa.

## 2. Arquitectura principal

```text
Navegador
  |
  | React + Vite
  | Componentes y formularios controlados
  v
Cliente HTTP
  |
  | JSON + Bearer Token
  v
Express Router
  |
  v
Controller
  |
  v
Service (reglas de negocio)
  |
  v
Repository
  |
  v
Mongoose
  |
  v
MongoDB Replica Set
```

El flujo de respuesta sigue el camino inverso.

El cliente no consulta MongoDB directamente.

## 3. Matriz de los 20 criterios

| Criterio | Dónde estudiarlo |
| --- | --- |
| 1. Componentes React | `cliente/src/components/`, `features/` |
| 2. Estado y formularios | `InitiativeEditor.jsx`, `RequestFormPage.jsx`, `ProjectConvertPage.jsx` |
| 3. Consumo API y estados | `cliente/src/hooks/useApiQuery.js`, `api/http.js` |
| 4. React Router | `cliente/src/app/router.jsx`, `ProtectedRoute.jsx` |
| 5. Contrato de API | `docs/api-contract.md` |
| 6. Express por capas | `servidor/src/app.js`, `routes/`, `controllers/`, `services/`, `repositories/` |
| 7. Modelo MongoDB | `servidor/src/models/`, `docs/modelo-datos.md` |
| 8. CRUD iniciativas | `initiatives.service.js`, rutas y servicios de eliminación |
| 9. Solicitudes/equipos | `requests.service.js`, `members.service.js` |
| 10. Conversión | `projects.service.js`, `projects.repository.js` |
| 11. Búsqueda y paginación | Repositorios, validadores de consulta y `pagination-window.js` |
| 12. Autenticación | `security/password.js`, `security/token.js`, servicio de autenticación |
| 13. Autorización | `authentication.js`, `initiative-access.js`, servicios de dominio |
| 14. GitHub | `cliente/src/api/external/github.js`, `ProjectDetailPage.jsx` |
| 15. Pruebas API | `servidor/test/`, `pruebas/innovation-hub.postman_collection.json` |
| 16. Repositorio | `README.md`, Git, documentación y etiqueta |
| 17. Explicación del código | Recorrido completo de petición |
| 18. Dominio técnico | Preguntas y explicaciones de esta guía |
| 19. Decisiones de diseño | Contrato, MongoDB, transacciones y alternativas |
| 20. Modificaciones en caliente | Ejercicios de la sección 8 |

## 4. Ejemplo: recorrido completo de una solicitud

Caso: un usuario solicita participar en una iniciativa.

### Paso 1 — React

`RequestFormPage.jsx` mantiene los valores del formulario con estado React.

El usuario ingresa:

- Mensaje.
- Competencia ofrecida.
- Rol.
- Disponibilidad.

La validación del navegador evita enviar campos evidentemente incorrectos.

### Paso 2 — Cliente HTTP

`initiativesService.requestParticipation()` envía una petición HTTP.

```http
POST /api/initiatives/{id}/requests
Authorization: Bearer <token>
Content-Type: application/json
```

Los datos se serializan a JSON.

### Paso 3 — Router

`requests.routes.js` relaciona la ruta HTTP con el controlador correspondiente y exige autenticación.

### Paso 4 — Controller

`requests.controller.js` recibe parámetros, identidad y cuerpo.

Traduce el resultado del servicio al contrato HTTP.

Una creación correcta devuelve `201`, `Location` y el DTO.

### Paso 5 — Service

`requests.service.js` verifica:

- Existencia de la iniciativa.
- Identidad del solicitante.
- Propiedad y visibilidad.
- Estado de la iniciativa.
- Membresía activa.
- Solicitud pendiente duplicada.
- Competencia disponible en el perfil.
- Campos válidos.

Las reglas se comprueban nuevamente en el servidor.

### Paso 6 — Repository y MongoDB

El repositorio consulta modelos Mongoose y crea el documento de solicitud.

Se utiliza la revisión común de iniciativa dentro de la transacción para coordinar escrituras relacionadas.

Un índice único parcial impide múltiples solicitudes pendientes para la misma iniciativa y solicitante.

### Paso 7 — Respuesta

El servidor devuelve el resultado a React.

React muestra la confirmación y permite consultar el historial.

Crear una solicitud no convierte al usuario automáticamente en miembro.

## 5. Caso transaccional: aceptar una solicitud

Explicar que una aceptación afecta varias entidades relacionadas.

```text
Inicio de transacción
  |
  v
Validar propietario y solicitud pendiente
  |
  v
Comprobar membresía y estado
  |
  v
Actualizar revisión de iniciativa
  |
  v
Cambiar solicitud a accepted
  |
  v
Crear membresía activa
  |
  v
Crear evento joined
  |
  v
Commit de transacción
```

Si una escritura falla, la transacción debe abortarse y no dejar modificaciones parciales.

La aceptación no depende de un cupo máximo: `estimatedMembers` es una estimación.

Las solicitudes en iniciativas convertidas siguen siendo posibles.

Una iniciativa archivada no acepta nuevas incorporaciones.

## 6. MongoDB: embebido frente a referencia

### Documentos embebidos

En los perfiles, las competencias pueden almacenarse como:

```json
{
  "skills": [
    {
      "skillId": "uuid",
      "level": "advanced"
    }
  ]
}
```

Ventajas:

- Son datos acotados.
- Se consultan junto con el usuario.
- Se actualizan con el perfil.
- No necesitan una colección adicional de asignaciones.

### Referencias

Las solicitudes, membresías, iniciativas y proyectos usan referencias UUID.

Motivos:

- Tienen ciclos de vida independientes.
- Crecen de forma separada.
- Se consultan por distintos actores.
- Requieren índices y reglas de unicidad.
- En la entrega final tendrán equivalentes relacionales.

Ejemplo:

```json
{
  "sourceInitiativeId": "uuid",
  "ownerId": "uuid"
}
```

No se copia el equipo en el proyecto. El proyecto utiliza las membresías de su iniciativa de origen.

## 7. Preguntas técnicas de preparación

### ¿Por qué Express?

Permite implementar una API HTTP con rutas, middleware y separación por capas.

La interfaz React consume HTTP/JSON y no necesita conocer cómo se almacena cada dato.

### ¿Por qué Mongoose?

Permite declarar esquemas, índices y operaciones sobre colecciones MongoDB desde Node.js.

No sustituye las validaciones de negocio que ejecutan los servicios.

### ¿Qué es middleware?

Una función que participa en el procesamiento de una petición.

Ejemplos:

- Autenticación.
- CORS.
- Identificador de petición.
- Validación común de paginación.
- Manejo centralizado de errores.

### ¿Por qué hashing de contraseñas?

Para no almacenar contraseñas en texto plano.

El proyecto utiliza scrypt con sal aleatoria.

Los tokens de sesión también se guardan mediante hash, no como tokens utilizables en texto plano.

### ¿Por qué los códigos 401 y 403 son distintos?

`401`: falta una sesión válida.

`403`: existe una sesión, pero el usuario no tiene autorización suficiente.

### ¿Por qué a veces se devuelve 404 en un recurso privado?

Porque informar la existencia del recurso también podría revelar información no autorizada.

El contrato distingue esta situación de una denegación explícita con 403.

### ¿Por qué un índice único parcial?

Para impedir duplicados únicamente cuando cumplen una condición.

Por ejemplo, una solicitud única por usuario e iniciativa mientras está pendiente, sin prohibir nuevos intentos después de una cancelación o rechazo.

### ¿Para qué sirve la revisión común?

Coordina las modificaciones que afectan una misma iniciativa.

Evita que operaciones incompatibles confirmen cambios basados en un estado anterior sin revalidarlo.

### ¿Qué garantiza una transacción?

Atomicidad de las modificaciones incluidas.

No garantiza automáticamente que todas las decisiones de negocio sean correctas: también deben verificarse condiciones e índices.

### ¿Por qué React usa formularios controlados?

Porque el valor presentado está relacionado con el estado React.

Esto permite validación, preservación de valores y actualización predecible de la interfaz.

### ¿Qué hace useEffect?

Sincroniza el componente con sistemas externos o ejecuta efectos según dependencias.

Debe controlar limpieza y cancelación cuando el efecto inicia consultas asíncronas.

### ¿Por qué las consultas se cancelan?

Para impedir que una respuesta antigua sobrescriba una consulta más reciente o actualice una pantalla desmontada.

### ¿Por qué paginar en MongoDB?

Para evitar descargar colecciones completas y procesarlas únicamente en el navegador.

La autorización debe aplicarse antes del conteo y la paginación.

### ¿Qué pasa cuando GitHub devuelve 404?

Puede significar que el repositorio no existe o no es público.

La aplicación debe presentar un mensaje controlado sin impedir consultar el proyecto.

### ¿Qué ocurre cuando GitHub devuelve 403 por rate limit?

Se informa el límite de solicitudes y se ofrece un reintento apropiado.

No se envía el token de Innovation Hub a la API pública.

### ¿Por qué congelar el contrato?

Porque el último avance cambiará el backend a otro lenguaje y modelo relacional.

React debe funcionar sin modificar su lógica de negocio ni sus llamadas HTTP.

## 8. Ejercicios de modificación en caliente

Realizar en una rama local de práctica, sin afectar la entrega aprobada.

### Ejercicio A — Validación

Añadir una restricción de entrada en un servicio o validador.

Verificar:

1. Petición inválida produce 400.
2. Error mantiene formato uniforme.
3. Petición válida sigue funcionando.
4. No se modifican DTO ni rutas innecesariamente.

### Ejercicio B — Estado de interfaz

Introducir o mejorar un mensaje de resultado vacío en una pantalla de consulta.

Verificar:

1. Carga diferenciada.
2. Error diferenciado.
3. Resultado vacío diferenciado.
4. Resultado con datos correcto.

### Ejercicio C — Autorización

Agregar una comprobación de permisos a un punto de acceso controlado.

Verificar con dos usuarios y Postman que solo el actor autorizado puede ejecutar la acción.

### Ejercicio D — Ordenamiento

Modificar la implementación interna de un ordenamiento ya permitido por el contrato.

No agregar un nuevo parámetro público si ello modifica el contrato congelado.

### Ejercicio E — GitHub

Simular un error de la API pública.

Mantener accesible el proyecto mientras se presenta el error externo.

## 9. Ensayo individual

Cada integrante debe completar personalmente:

- Explicar un componente React ajeno.
- Explicar un servicio Express ajeno.
- Recorrer autenticación y autorización.
- Explicar una operación transaccional.
- Explicar embebido frente a referencia.
- Ejecutar una prueba HTTP sin ayuda.
- Identificar dónde modificar una regla.
- Aplicar una modificación pequeña en rama de práctica.
- Restaurar el entorno después del ejercicio.

## 10. Registro de resultados

No rellenar como aprobado antes de realizar el ensayo.

| Comprobación | Daniel | Francisco |
| --- | --- | --- |
| Explica componentes React | Pendiente | Pendiente |
| Explica servicios Express | Pendiente | Pendiente |
| Explica autenticación y seguridad | Pendiente | Pendiente |
| Explica modelo MongoDB | Pendiente | Pendiente |
| Explica transacciones | Pendiente | Pendiente |
| Explica los 27 endpoints | Pendiente | Pendiente |
| Ejecuta modificación en caliente | Pendiente | Pendiente |
| Valida el resultado sin IA | Pendiente | Pendiente |

## 11. Preparación inmediata para defensa

Antes de la sesión:

1. Abrir VS Code con el commit etiquetado.
2. Verificar Docker/MongoDB.
3. Iniciar Express.
4. Iniciar React.
5. Confirmar datos de prueba.
6. Comprobar login y catálogo.
7. Tener Postman preparado.
8. Desactivar asistentes de IA y autocompletado generativo.
9. Conocer la ubicación de los archivos principales.
10. Estar preparado para modificar una regla sin romper el contrato.

La guía no sustituye el ensayo individual ni la comprensión de las implementaciones.
