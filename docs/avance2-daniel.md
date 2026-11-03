# Entregables de Daniel — Avance 2

Corte 3 de noviembre de 2026. Base publicada: `5e12be3954ec617f3442f981d65054f59c3f6160`. Las 19 tareas de implementación de Daniel están cerradas; Francisco conserva 15 tareas y revisión cruzada. Este archivo y el [handoff a Francisco](handoff-francisco.md) se preparan después de esa base; su publicación documental no se da por realizada aquí.

## Commits funcionales/documentales del plan

| Tarea | Commit real | Resultado |
| --- | --- | --- |
| CO00 | `17dba85` | Contrato/alcance |
| CO01 | `18dfd7c` | Modelo, fixtures y matrices |
| UI01 | `01c5658` | React/Vite/Router |
| UI02 | `7d71af3` | Bootstrap/Sass/componentes |
| UI03 | `c1c6eba` | HTTP, servicios y mocks |
| API01 | `25e0206` | Express/capas/errores |
| API02 | `f996cb7` | Mongo/índices/seed |
| API03 | `8e2ac1c` | Auth y sesiones revocables |
| UI04 | `a01f38f` | Interfaz de autenticación |
| API04 | `16104cd` | Perfiles/directorio/catálogos |
| UI05 | `50d8c72` | Interfaz de perfiles/directorio |
| API05 | `a5df168` | Crear/editar iniciativas |
| API06 | `f86fea6` | Consultar/filtrar/proteger iniciativas |
| API07 | `f26bd1c` | Transacciones de eliminación/archivo; comportamiento sustituido en UI07 |
| UI06 | `fa471e8` | Catálogo/propias/indicadores |
| UI07 | `4e03568` | Detalle y acciones independientes DELETE/archive; actualiza API07 |
| UI08 | `dafc19c` | Formularios crear/editar y ancho completo |
| UI09 | `73f82ae` | Competencias/chips |
| UI10 | `5e12be3` | Validación, contadores y avisos únicos |

La lista es por las 19 tareas del plan, no todos los commits auxiliares del repositorio. No modificar autores/fechas ni hacer squash que oculte el trabajo progresivo. API07 histórico no define el comportamiento actual: desde UI07, DELETE con historia falla 409 sin cambios y Archivar es POST independiente.

## Interfaz entregada y documentación

Autenticación real, perfiles/directorio y catálogos; módulo completo de iniciativas en servidor y React, con permisos y persistencia Mongo. [Contrato](api-contract.md), [modelo](modelo-datos.md), [reglas](matriz-reglas.md), [pruebas](matriz-pruebas.md), [consumo de iniciativas](iniciativas-api.md) y READMEs forman la entrega técnica. El [plan](plan-avance2.md) conserva las 34 tareas y el handoff ordena las 15 restantes.

Las bases comunes se reutilizan desde los módulos nuevos: middleware/sesión, HTTP/errores, DTO, conexión explícita, modelos de iniciativa/membresía/eventos, consultas de visibilidad, revisión común y transacciones. app.js/server.js/router requieren cambios puntuales de Francisco para registrar sus módulos. No es necesario que Daniel implemente esos registros por él.

## Evidencia recibida

- UI10: 190 pruebas cliente, ESLint/build (148 módulos) y 23 integraciones separadas con API/Mongo reales (3 catálogo, 9 detalle, 11 formulario).
- Última evidencia servidor de iniciativas: 66 pruebas locales, lint/fixtures y 17 resultados de integración (6 principales más 11 subcasos). Consultar bitácora para entorno, casos y fallos/correcciones; no sumar suites históricas como pruebas independientes.
- [Fragmento Postman de iniciativas](../pruebas/fragmentos/iniciativas.postman_collection.json): 31 peticiones; sintaxis/scripts revisados, ejecución Postman pendiente UI14. No existen fragmentos separados de auth/perfiles/catálogos: Francisco completa su cobertura en la colección final apoyándose en las pruebas HTTP existentes.
- Daniel confirmó UI10 y autorizó su publicación. QA integral, revisión cruzada y ensayos de defensa siguen pendientes. Los diálogos jsdom no equivalen a navegador nativo.
- Pruebas destructivas de integración realizadas solo sobre innovation_hub_test; API temporal3002 detenida al terminar. La base de desarrollo contiene cambios manuales y registros extra; no restaurarlos para igualar baseline.

Los comandos exactos y resultados esperados se concentran en la sección 6 del handoff y en READMEs. En macOS usar siempre `npm ci --cache /private/tmp/innovation-hub-npm-cache`, dentro de cliente/servidor; no hay package.json raíz.

## Límites y recepción pendiente

Persisten cuatro avisos Sass de importación, documentados sin bloquear build. Docker Compose está preparado, pero el entorno probado por Daniel fue MongoDB nativo en replica set. Las rutas de solicitudes/proyectos/conversión siguen siendo placeholders. Los fixtures requests/projects no implican seed ni API implementados. No hay despliegue público ni backend .NET en este avance.

Francisco recibe el código y evidencia; debe comprobar arranque y revisión cruzada antes de afirmar recepción validada. La implementación de requests/resolución/equipo/proyectos, colección completa, QA/contrato/arranque integrales, integración/defensa/etiqueta/TXT es su parte, con revisión de Daniel. Daniel conserva revisión y práctica individual de toda la solución. No se ha publicado entrega-2 ni enviado Moodle como parte de este handoff.
