# Bitácora de verificación — Avance 2

Esta bitácora registra resultados ejecutados, no intenciones. Cada entrada debe incluir comando o recorrido, fecha, entorno, resultado y hash cuando exista. No guardar tokens, contraseñas reales, `.env`, volcados de base ni datos personales.

## Estado inicial

| Fecha | Tarea | Entorno | Verificación | Resultado | Commit |
| --- | --- | --- | --- | --- | --- |
| 2026-10-29 | CO00 | macOS; repositorio local en `main` | `git status --short --branch` y `git log -5 --oneline` antes de editar | Repositorio limpio; HEAD `033361c`; sin implementación de Avance 2 | Sin commit |
| 2026-10-29 | CO00 | macOS; ripgrep | Inventario de encabezados HTTP, bloques Markdown, espacios finales y endpoints de proyecto fuera de alcance | 26/26 endpoints; 48 cercas de código balanceadas; sin espacios finales; sin PUT/DELETE de proyectos | Sin commit |
| 2026-10-29 | CO00 | macOS; Git | `git diff --check` | Sin errores de whitespace | Sin commit |
| 2026-10-29 | CO00 | Node.js; runner `node:test` | `cd avance1 && npm test` | 31 aprobadas, 0 fallidas; el cambio documental no altera el prototipo | Sin commit |
| 2026-10-29 | UI01 | Node 24.21.0; npm 12.2.0 | `cd cliente && npm ci` con caché temporal aislada | 147 paquetes instalados desde lockfile; 0 vulnerabilidades. npm bloqueó el script opcional de `fsevents`, sin impedir la instalación | Sin commit |
| 2026-10-29 | UI01 | Sandbox restringido | Primera ejecución de `npm test` | ESLint aprobó; build bloqueado por `EPERM` al crear `node_modules/.vite-temp`. Fallo del permiso de ejecución, no del código | Sin commit |
| 2026-10-29 | UI01 | Node 24.21.0; permiso de escritura del repositorio | `cd cliente && npm test` | ESLint aprobó; Vite 8.3.5 compiló 98 módulos y generó `dist/` | Sin commit |
| 2026-10-29 | UI01 | Preview local de Vite | Solicitud directa a las 19 rutas acordadas y `/ruta-inexistente` mediante `fetch` de Node | 20/20 respuestas HTTP 200; el fallback entrega la SPA y React resuelve la página 404. Revisión visual/navegación pendiente de Daniel | Sin commit |
| 2026-10-29 | UI02 | npm 12.2.0 | Instalar `bootstrap@5.3.8` y `sass@1.107.0` | Lockfile actualizado; 0 vulnerabilidades. Scripts opcionales de `fsevents`/`@parcel/watcher` bloqueados por npm sin impedir compilación | Sin commit |
| 2026-10-29 | UI02 | Sass 1.107.0 | Primera compilación del tema completo | Build aprobado; 314 avisos repetidos de deprecación, principalmente desde Bootstrap | Sin commit |
| 2026-10-29 | UI02 | Vite 8.3.5; Node 24.21.0 | `cd cliente && npm test` después de configurar `quietDeps` | ESLint aprobado; 103 módulos; CSS 229.34 kB/32.00 kB gzip; JS 323.06 kB/101.62 kB gzip; quedan cuatro avisos `@import` propios | Sin commit |
| 2026-10-29 | UI02 | Bundle de producción | Buscar textos de `/componentes`, imports de Bootstrap JS y atributos `data-bs-*` | Vista de desarrollo ausente del bundle; no hay controladores Bootstrap JS duplicados | Sin commit |
| 2026-10-29 | UI02 | Servidor Vite local | Primera aserción MIME de `/componentes`, JSX y Sass | Ruta y JSX respondieron 200; el chequeo falló porque esperaba `text/css` para Sass, pero Vite lo transforma como módulo JavaScript | Sin commit |
| 2026-10-29 | UI02 | Servidor Vite local | Repetir aserción con MIME real de Vite | `/componentes`, JSX y Sass respondieron 200 con tipos esperados | Sin commit |
| 2026-10-29 | UI02 | Cálculo WCAG de luminancia | Contraste de texto base y colores principales sobre sus fondos | Body 12.92:1; primary 7.06:1; success 6.33:1; danger 6.19:1; secondary 5.58:1 | Sin commit |
| 2026-10-29 | CO01 | Node 24.21.0; validador sin dependencias | `node pruebas/fixtures/validate-fixtures.mjs` | 5 usuarios, 8 categorías, 10 competencias, 8 iniciativas, 5 solicitudes, 12 membresías, 13 eventos y 1 proyecto; referencias/estados/invariantes aprobados | Sin commit |
| 2026-10-29 | CO01 | Python 3; parser JSON | `python3 -m json.tool` sobre cada `pruebas/fixtures/*.json` | Todos los archivos JSON válidos | Sin commit |
| 2026-10-29 | CO01 | Revisión manual de Daniel | Recorrido de actores, visibilidades, borrado/archivo, reintentos, estimación superada, conversión, mapeo heredado y modelo | Daniel confirmó todos los escenarios; revisión cruzada de Francisco pendiente | Sin commit |
| 2026-10-30 | UI03 | npm 12.2.0 | Instalar Vitest, jsdom y Testing Library como dependencias de desarrollo | 64 paquetes instalados; 0 vulnerabilidades. npm bloqueó scripts opcionales de `fsevents`/`@parcel/watcher` sin impedir instalación ni pruebas | Sin commit |
| 2026-10-30 | UI03 | Vitest 5.0.5 y ESLint | Primera ejecución de `cd cliente && npm test` | 29 pruebas aprobadas; ESLint rechazó un `setState` síncrono dentro de `useEffect` | Sin commit |
| 2026-10-30 | UI03 | Vitest 5.0.5 | Segunda ejecución después de programar los cambios de estado del hook | 27 aprobadas y 2 fallidas: las pruebas todavía asumían carga e invocación síncronas | Sin commit |
| 2026-10-30 | UI03 | Node 24.21.0; Vitest/ESLint/Vite | `cd cliente && npm test` después de ajustar el estado inicial y capturar errores síncronos | 29 pruebas aprobadas; ESLint aprobado; build aprobado con 119 módulos | Sin commit |
| 2026-10-30 | UI03 | Bundle de producción | Reconstruir tras limitar mocks a `import.meta.env.DEV`; listar assets y buscar `mock-owner-token` | 112 módulos; no se generó chunk mock y el token sintético no aparece en `dist/` | Sin commit |
| 2026-10-30 | UI03 | Vite 8.3.5 | `VITE_API_MODE=mock npm run build` | Falló de forma deliberada con “VITE_API_MODE=mock no está permitido en builds de producción” | Sin commit |
| 2026-10-30 | UI03 | Vite local en modo mock | Solicitar `/api-demo`, router, vista, cliente y módulo mock mediante HTTP | Ruta y módulos respondieron correctamente; quedan recorrido visual e interacción manual de Daniel | Sin commit |
| 2026-10-30 | UI03 | Node 24.21.0; Vitest/ESLint/Vite | `cd cliente && npm test` después de alinear iniciativas, solicitudes y proyectos mock con los DTO públicos | 31 pruebas aprobadas; ESLint aprobado; build aprobado con 112 módulos | Sin commit |
| 2026-10-30 | API01 | npm 12.2.0 | Instalar Express 5.3, CORS, ESLint y Supertest | 164 paquetes en lockfile; 0 vulnerabilidades | Sin commit |
| 2026-10-30 | API01 | Node 24.21.0; ESLint y `node:test` | `cd servidor && npm run check` | ESLint aprobado; 12 pruebas HTTP/configuración aprobadas | Sin commit |
| 2026-10-30 | API01 | Proceso Express local | Consultar health, ruta inexistente, preflight permitido, origen rechazado y JSON roto mediante `fetch` de Node | Estados 200/404/204/403/400; cuerpos uniformes y `X-Request-Id` presentes | Sin commit |
| 2026-10-30 | API01 | Sandbox restringido | Primera reproducción `npm ci && npm run check` | `npm ci` bloqueado por `EPERM` al reemplazar `node_modules/.package-lock.json`; fallo del permiso, no del lockfile | Sin commit |
| 2026-10-30 | API01 | Node 24.21.0; permiso de escritura del repositorio | Repetir `npm ci && npm run check` | 164 paquetes reproducidos, 0 vulnerabilidades, ESLint y 12 pruebas aprobados | Sin commit |
| 2026-10-30 | API01 | Git `main` | Commit y push de la base Express verificada | Publicado `25e0206` en `origin/main` | `25e0206` |
| 2026-10-30 | API02 | npm 12.2.0 | Instalar Mongoose 9.11.4 con lockfile | 17 paquetes agregados; 182 auditados; 0 vulnerabilidades | Sin commit |
| 2026-10-30 | API02 | Node 24.21.0; ESLint; fixtures | `cd servidor && npm run check` | 21 pruebas aprobadas, 1 integración omitida sin variables; ESLint y fixtures CO01 aprobados | Sin commit |
| 2026-10-30 | API02 | MongoDB Community 8.0.34; replica set temporal real | `npm run test:integration` con base `innovation_hub_test` | Seed dos veces 8/10, índices únicos, persistencia tras reconexión y rollback total aprobados | Sin commit |
| 2026-10-30 | API02 | MongoDB Community 8.0.34 | Ejecutar `npm run seed` dos veces | Ambas ejecuciones conservaron 8 categorías y 10 competencias | Sin commit |
| 2026-10-30 | API02 | MongoDB Community 8.0.34 | Reset protegido de `innovation_hub_test` y nuevo seed | Base de prueba eliminada y recuperada; ninguna base de desarrollo fue afectada | Sin commit |
| 2026-10-30 | API02 | Express y MongoDB reales | Iniciar API en 127.0.0.1:3100, consultar health y detener | HTTP 200, `X-Request-Id` UUID y conexión DB previa a la escucha | Sin commit |
| 2026-10-30 | API02 | macOS sin Docker | `docker version` | Comando ausente; Compose queda pendiente de reproducción manual. La validación DB se realizó con binario oficial nativo | Sin commit |
| 2026-10-30 | API03 | Node 24.21.0; ESLint; fixtures | `cd servidor && npm run check` | ESLint y fixtures aprobados; 27 pruebas aprobadas y 2 integraciones omitidas sin cargar `.env.test` | Sin commit |
| 2026-10-30 | API03 | Replica set temporal detenido | Primer `npm run test:integration` | 2 pruebas fallaron antes de aserciones con conexión MongoDB; se comprobó que `mongod` no estaba activo | Sin commit |
| 2026-10-30 | API03 | MongoDB Community 8.0.34; replica set temporal real | `npm run test:integration` | 2 integraciones aprobadas: registro concurrente, hashes, seed repetido, expiración, revocación, índices, persistencia y rollback | Sin commit |
| 2026-10-30 | API03 | MongoDB Community 8.0.34 | Ejecutar `npm run seed` dos veces | Ambas ejecuciones conservaron 8 categorías, 10 competencias y 5 usuarios demo; los hashes existentes no rotaron | Sin commit |
| 2026-10-30 | API03 | Express y MongoDB reales | Login de Ana, `/auth/me`, logout y reutilización del token por HTTP | Estados 200, 200, 204 y 401; token opaco de 43 caracteres y código final `AUTHENTICATION_REQUIRED` | Sin commit |
| 2026-10-30 | API03 | Node 24.21.0; scrypt N=16384/r=8/p=1 | Medir cinco hashes consecutivos con sal aleatoria de 16 bytes | 49, 41, 39, 40 y 41 ms; promedio local 42 ms | Sin commit |
| 2026-10-30 | UI04 | Copia de trabajo con `node_modules` enlazado | Primer build de UI04 | Falló con `EPERM` al escribir `.vite-temp` dentro del enlace de solo lectura; se reemplazó por una copia local para continuar | Sin commit |
| 2026-10-30 | UI04 | `.env.local` configurado en mock | Build de producción sin sobrescribir modo | Falló deliberadamente: el build impide publicar `VITE_API_MODE=mock`; se repitió con `VITE_API_MODE=real` | Sin commit |
| 2026-10-30 | UI04 | Node 24.21.0; Vitest/ESLint/Vite | `VITE_API_MODE=real npm test` y prueba final de sesión incomprobable | 47 pruebas en 8 archivos, ESLint y build con 121 módulos aprobados; solo 4 avisos Sass ya documentados | Sin commit |
| 2026-10-30 | UI04 | Express en 3001; Vite en 5175; MongoDB real | Solicitar `/ingresar` y login demo con origen real del cliente | Página `200`, login `200`, CORS exacto, token opaco de 43 caracteres e identidad de Ana | Sin commit |
| 2026-10-30 | UI04 | Navegador integrado | Intentar recorrido visual automatizado | El host del navegador no estuvo disponible; no se cuenta como aprobación visual y queda en revisión manual | Sin commit |
| 2026-10-31 | UI04 | Revisión manual de Daniel | Recorrido entregado y solicitud explícita de commit/push | Daniel confirmó UI04 para cierre; revisión cruzada de Francisco continúa pendiente | Sin commit |
| 2026-11-02 | API04 | Node 24.21.0; npm 12.2.0 | `npm ci --cache /private/tmp/innovation-hub-npm-cache` | 181 paquetes instalados desde lockfile; 5 avisos moderados limitados a ESLint y 0 vulnerabilidades en dependencias de producción | Sin commit |
| 2026-11-02 | API04 | Node 24.21.0; ESLint; fixtures; `node:test` | `cd servidor && npm run check` fuera del sandbox para permitir puertos de Supertest | ESLint y fixtures aprobados; 34 pruebas aprobadas, 0 fallidas y 3 integraciones omitidas sin cargar `.env.test` | Sin commit |
| 2026-11-02 | API04 | MongoDB Community 8.0.34; replica set real | `npm run test:integration` con ejecución serial | 3 integraciones aprobadas: autenticación, persistencia/transacciones y perfiles/directorio/catálogos; 0 fallidas | Sin commit |
| 2026-11-02 | API04 | npm audit | `npm audit --omit=dev` | 0 vulnerabilidades reportadas en las 86 dependencias de producción; los 5 avisos del audit completo pertenecen a la cadena de ESLint | Sin commit |
| 2026-11-02 | API04 | Revisión manual de Daniel | Recorrido de catálogos, autorización, filtros, privacidad y actualización completa | Daniel confirmó todos los resultados esperados; revisión cruzada de Francisco continúa pendiente | Sin commit |
| 2026-11-02 | UI05 | Node 24.21.0; npm 12.2.0 | `npm ci --cache /private/tmp/innovation-hub-npm-cache` | 220 paquetes instalados desde lockfile; scripts opcionales de `@parcel/watcher` y `fsevents` bloqueados sin impedir pruebas o build | Sin commit |
| 2026-11-02 | UI05 | Vitest 5.0.5 | Primera ejecución de `npm run test:unit` | 56 aprobadas y 1 fallida porque la prueba encontraba los dos botones “Limpiar filtros”; se cambió la acción del estado vacío a “Ver todas las personas” | Sin commit |
| 2026-11-02 | UI05 | Vitest/ESLint/Vite | `cd cliente && npm test` | 59 pruebas aprobadas, ESLint aprobado y build de producción con 130 módulos; permanecen cuatro avisos Sass documentados | Sin commit |
| 2026-11-02 | UI05 | npm audit | `npm audit --omit=dev` | 0 vulnerabilidades reportadas en dependencias de producción | Sin commit |
| 2026-11-02 | UI05 | React, Express y MongoDB reales | Login, perfil propio, `PUT /users/me`, búsqueda `q=Ana` y perfil ajeno con origen del cliente | Estados 200; directorio con 1 coincidencia; correo ausente del listado y perfil ajeno; CORS `http://localhost:5173` | Sin commit |
| 2026-11-02 | UI05 | Vite local en 5173 | Solicitar `/perfil`, router y módulo del directorio mediante HTTP | Ruta SPA `200 text/html`; módulos `200 text/javascript` | Sin commit |
| 2026-11-02 | UI05 | Navegador integrado | Intentar recorrido visual automatizado | El host de acceso al navegador no estuvo disponible; no se cuenta como aprobación visual y queda en revisión manual | Sin commit |
| 2026-11-02 | UI05 | Vitest/ESLint | Prueba focal de pantallas después de reforzar privacidad del perfil ajeno y limpieza del error de intereses | 6 pruebas de usuarios y ESLint aprobados; un correo inesperado en el DTO ajeno tampoco se renderiza | Sin commit |
| 2026-11-03 | UI05 | Revisión manual de Daniel | Recorrido entregado y solicitud explícita de commit/push | Daniel confirmó UI05 para cierre; revisión cruzada de Francisco continúa pendiente | Sin commit |
| 2026-11-03 | API05 | Node 24.21.0; ESLint; fixtures; `node:test` | Primera ejecución local de `npm test` dentro del sandbox | Las pruebas sin HTTP aprobaron; Supertest y servidor fallaron con `listen EPERM` por bloqueo de puertos del sandbox; cuatro predicados nuevos también devolvían texto en vez de booleano | Sin commit |
| 2026-11-03 | API05 | Node 24.21.0; ESLint; fixtures; `node:test` | `npm run check` fuera del sandbox | ESLint y fixtures aprobados; 47 pruebas aprobadas, 0 fallidas y 4 integraciones omitidas por no cargar `.env.test` | Sin commit |
| 2026-11-03 | API05 | MongoDB Community 8.0.34; replica set real | Primera ejecución de `npm run test:integration` | 3 integraciones aprobadas y API05 falló con `500`: se ejecutaban consultas paralelas sobre una misma sesión transaccional | Sin commit |
| 2026-11-03 | API05 | MongoDB Community 8.0.34; replica set real | Prueba focal después de hacer secuenciales las consultas de catálogo y membresías | Integración API05 aprobada; creación, edición y rollback transaccional funcionaron | Sin commit |
| 2026-11-03 | API05 | MongoDB Community 8.0.34; replica set real | Ejecución final de `npm run test:integration` con concurrencia 1 | 4 integraciones aprobadas, 0 fallidas: autenticación, API05, persistencia/transacciones y perfiles/directorio | Sin commit |
| 2026-11-03 | API05 | Express en 3002; MongoDB de pruebas | Login de dueño/ajeno, POST, PUT autorizado, PUT ajeno y GET todavía diferido | `201 published` con membresía 1, `200` al editar, `403 FORBIDDEN` para ajeno, `404` de lectura hasta API06 y cero campos internos expuestos | Sin commit |
| 2026-11-03 | API05 | Express; MongoDB replica set de pruebas | `npm run lint && npm run test:integration` con casos HTTP ampliados | ESLint y 4 integraciones aprobados; campos inmutables, duplicados y body parcial rechazados; dos arranques HTTP con conexiones nuevas conservaron ID/fecha de creación y permitieron editar sin duplicar membresías | Sin commit |
| 2026-11-03 | API06 | ESLint | Primera ejecución de lint | 6 variables sin uso en la nueva integración; se eliminaron antes de ejecutar la suite | Sin commit |
| 2026-11-03 | API06 | Node 24.21.0; ESLint; fixtures | `npm run check` | Lint y fixtures aprobados; 54 pruebas locales aprobadas, 0 fallidas, 5 integraciones omitidas sin cargar `.env.test` | Sin commit |
| 2026-11-03 | API06 | MongoDB Community 8.0.34; replica set real | `npm run test:integration` con ejecución serial | 5 integraciones aprobadas, 0 fallidas; matriz de cuatro visibilidades, permisos por URL, campos ocultos, filtros, paginación de 25 registros adicionales, seed repetido y migración desde API05 | Sin commit |
| 2026-11-03 | API06 | Repositorio real; base de pruebas | `node --env-file-if-exists=.env.test scripts/seed.js` y recorrido HTTP con Express en puerto temporal | Seed con 8 iniciativas/12 membresías/13 eventos; catálogos visitante/Carla/Ana de 3/5/6, mine de Ana 8; detalle restringido ajeno `403`, privado ajeno `404`, institucional visitante `401`, búsqueda MENTORIAS 1 y CORS correcto | Sin commit |
| 2026-11-03 | API06 | Node; colección Postman v2.1 | Analizar JSON, verificar IDs únicos, cuerpos y sintaxis de scripts con `node:vm` | Fragmento de 18 peticiones válido y variables sensibles vacías; ejecución dentro de Postman pendiente de UI14 | Sin commit |
| 2026-11-03 | API07 | Node; ESLint | `npm run lint` y prueba focal del servicio de eliminación | Lint y 8 pruebas del servicio aprobados, con idempotencia, permisos y abortos ante conflicto | Sin commit |
| 2026-11-03 | API07 | Node 24.21.0; ESLint; fixtures | `npm run check` | 62 pruebas locales aprobadas, 0 fallidas; 6 integraciones principales omitidas sin `.env.test`; lint y fixtures aprobados | Sin commit |
| 2026-11-03 | API07 | MongoDB Community 8.0.34; replica set real | `npm run test:integration` con concurrencia 1 | 6 integraciones principales y los 9 subcasos de API07 aprobados (15 resultados); rollback de borrado/archivo, preservación de historial y ambos órdenes de operaciones concurrentes verificados | Sin commit |
| 2026-11-03 | API07 | Repositorio real; Express en puerto temporal; MongoDB de pruebas | Seed y recorrido HTTP real de DELETE | Ajeno `403`, eliminación `204` sin cuerpo ni relaciones automáticas huérfanas, repetición `404`; archivo y repetición `200` con historial intacto y misma fecha/revisión; CORS correcto | Sin commit |
| 2026-11-03 | API07 | Node; fragmento Postman v2.1 | Verificar JSON, IDs únicos, bodies y sintaxis con `node:vm` | 27 peticiones válidas, variables sensibles vacías; ejecución dentro de Postman pendiente de UI14 | Sin commit |

## Plantilla de entrada

Copiar una fila por verificación real:

| Fecha | Tarea | Entorno | Verificación | Resultado | Commit |
| --- | --- | --- | --- | --- | --- |
| AAAA-MM-DD | ID | Node/navegador/DB | Comando exacto o recorrido manual | Aprobó/falló y evidencia concreta | Hash real o “sin commit” |

Si una prueba falla, conservar la entrada y agregar otra después de corregirla. No reemplazar el fallo por el resultado nuevo.

## Revisión documental CO00

- [ ] Francisco comparó todos los endpoints con la consigna y el alcance.
- [ ] Cada endpoint tiene actor, request/query, respuesta y códigos relevantes.
- [ ] Las respuestas `204` no contienen JSON.
- [ ] Los códigos `400`, `401`, `403`, `404`, `409` y `500` tienen significado estable.
- [ ] Crear iniciativa asigna `published` y no existe endpoint de borrador.
- [ ] Borrar frente a archivar contempla relaciones creadas concurrentemente.
- [ ] Estimación superada no impide solicitar/aceptar y espacios quedan en cero.
- [ ] Nuevo intento de solicitud conserva el historial y usa otro ID.
- [ ] Aceptar después de convertir conserva `converted` y el mismo equipo.
- [ ] No se añadieron edición, archivo, búsqueda o filtros de proyecto.
- [ ] Las equivalencias RN se citan por significado y fuente, no solo por número.

Resultado de CO00: **pendiente de revisión manual de Daniel y revisión cruzada de Francisco**.

## Revisión documental CO01

- [x] Todos los JSON se pueden analizar y los UUID públicos tienen formato válido.
- [x] Referencias, cuatro visibilidades y estados de iniciativa/solicitud son coherentes.
- [x] Existe una sola solicitud pendiente y una sola membresía activa por pareja iniciativa/usuario.
- [x] Fixtures no contienen campos de contraseña ni token.
- [x] Daniel recorre actores, visibilidad, borrado/archivo, reintentos, estimación superada y conversión.
- [ ] Francisco confirma que índices parciales y transacciones se pueden implementar en Mongoose sin reinterpretar el contrato.
- [ ] Francisco confirma que API02 puede cargar catálogos y estructura de seed de forma idempotente y aislada.
- [ ] Ambos revisan la equivalencia relacional prevista para la futura API .NET.

Resultado de CO01: **validación estructural y recorrido manual de Daniel aprobados; revisión cruzada de Francisco pendiente**.

## Revisión manual UI01

- [ ] Navegar mediante enlaces sin recarga completa del documento.
- [ ] Abrir directamente una ruta de detalle y confirmar que muestra el `id` de la URL.
- [ ] Cambiar el `id` en la barra y confirmar que cambia el valor presentado.
- [ ] Probar Atrás y Adelante entre tres rutas.
- [ ] Abrir una ruta desconocida y comprobar el título “Página no encontrada”.
- [ ] Recorrer enlaces y salto al contenido con teclado.

Resultado de UI01: **verificación automática aprobada; recorrido manual de Daniel y revisión cruzada de Francisco pendientes**.

## Revisión manual UI02

- [ ] A 360 px, abrir/cerrar menú con clic, Enter y Espacio; Escape lo cierra y devuelve foco al botón.
- [ ] A 768 y 1440 px, comprobar navegación, hero, tarjetas, acciones y ausencia de scroll horizontal.
- [ ] En `/componentes`, abrir el diálogo y cerrarlo con Escape y Cancelar; el foco regresa a “Probar confirmación”.
- [ ] Confirmar la acción y verificar el anuncio actualizado debajo de los paneles.
- [ ] Recorrer todos los controles con teclado y comprobar foco visible.
- [ ] Aplicar zoom de navegador al 200 %; menú, diálogo y acciones siguen disponibles.
- [ ] Comparar colores, tipografía y bordes con Avance 1 sin exigir una copia pixel a pixel.

Resultado de UI02: **lint/build aprobados; revisión visual, responsive y teclado de Daniel y revisión cruzada de Francisco pendientes**.

## Revisión manual UI03

- [ ] En modo mock, abrir `/api-demo` y confirmar que aparecen 10 competencias después de la carga.
- [ ] Buscar `desarrollo` y confirmar que queda “Desarrollo web”.
- [ ] Buscar `zzzz` y confirmar el estado “Sin coincidencias”.
- [ ] Buscar una sola letra y confirmar `INVALID_QUERY` con estado HTTP 400; pulsar Reintentar.
- [ ] Escribir rápidamente `desarrollo`, borrar y escribir `zzzz`; confirmar que una respuesta anterior no sobrescribe el último estado. La carrera A lenta/B rápida también está cubierta por Vitest.
- [ ] Definir `mock-owner-token` en `sessionStorage`, recargar y consultar desde consola un endpoint protegido si se desea revisar la identidad sintética.
- [ ] Cambiar a modo real sin servidor, reiniciar Vite y confirmar el estado `NETWORK_ERROR`; después levantar Express y comprobar que la misma vista consulta la URL configurada.
- [ ] Comprobar teclado, foco visible y zoom al 200 % en el buscador y el botón de reintento.

Resultado de UI03: **31 pruebas, lint, build, aislamiento de mocks y ruta local aprobados; recorrido manual de Daniel y revisión cruzada de Francisco pendientes**.

## Revisión manual API01

- [ ] Copiar `servidor/.env.example` a `.env`, ejecutar `npm start` y confirmar el mensaje de escucha sin errores.
- [ ] Consultar `GET /api/health`: estado 200, DTO documentado y encabezado `X-Request-Id` UUID.
- [ ] Consultar una ruta inexistente y confirmar `404 NOT_FOUND` con `fields: {}`.
- [ ] Enviar JSON roto y confirmar `400 INVALID_JSON`, sin stack ni HTML de Express.
- [ ] Ejecutar preflight desde `http://localhost:5173` y confirmar 204 con el origen permitido.
- [ ] Enviar `Origin: https://malicioso.example` y confirmar `403 FORBIDDEN` sin `Access-Control-Allow-Origin`.
- [ ] Ejecutar una petición sin `Origin` y confirmar que funciona; CORS no reemplaza autenticación.
- [ ] Detener con `Ctrl+C` y confirmar que el puerto queda libre.

Resultado de API01: **instalación reproducible, lint, 12 pruebas y proceso HTTP real aprobados; recorrido manual de Daniel y revisión cruzada de Francisco pendientes**.

## Revisión manual API02

- [ ] Instalar o abrir Docker y confirmar que `docker compose version` responde.
- [ ] Desde la raíz, ejecutar `docker compose up -d`; `mongo` queda saludable y `mongo-init` termina con código 0.
- [ ] Copiar `servidor/.env.example` a `.env` y `.env.test.example` a `.env.test`.
- [ ] Ejecutar `npm ci --cache /private/tmp/innovation-hub-npm-cache` y `npm run check`.
- [ ] Ejecutar `npm run seed` dos veces; ambas muestran 8 categorías y 10 competencias.
- [ ] Ejecutar `npm run test:integration`; seed, unicidad, persistencia y rollback aprueban sin omisiones.
- [ ] Ejecutar `npm start` y consultar `/api/health`; la API no debe escuchar si MongoDB está detenido.
- [ ] Ejecutar `npm run db:reset:test`; solo `innovation_hub_test` se elimina y puede recuperarse con seed.
- [ ] Detener con `Ctrl+C` y confirmar cierre de HTTP y de la conexión MongoDB; `docker compose down` conserva el volumen.

Resultado de API02: **unidad, fixtures, seed, índices, persistencia, rollback, reset y arranque real aprobados con MongoDB nativo 8.0.34; reproducción de Docker Compose y revisión cruzada de Francisco pendientes**.

## Revisión manual API03

- [ ] Ejecutar `npm ci --cache /private/tmp/innovation-hub-npm-cache`, `npm run seed` y `npm start` con MongoDB activo.
- [ ] Registrar un usuario con `termsAccepted: true`; confirmar `201`, `Location`, token y ausencia de contraseña/hash en el JSON.
- [ ] Repetir el correo con mayúsculas y espacios; confirmar `409 EMAIL_ALREADY_EXISTS`.
- [ ] Enviar confirmación distinta, términos falsos, contraseña débil y un campo ajeno; confirmar `400 VALIDATION_ERROR` con campos concretos.
- [ ] Iniciar sesión como `ana.owner@example.test` con la contraseña demo; confirmar `200` y token Bearer.
- [ ] Consultar `/auth/me` con el token; confirmar correo propio, perfil y ausencia de `_id`, `passwordHash` y `tokenHash`.
- [ ] Probar correo desconocido, contraseña incorrecta y `diego.inactive@example.test`; los tres deben responder el mismo `401 INVALID_CREDENTIALS`.
- [ ] Cerrar sesión; confirmar `204` sin cuerpo y `401` al reutilizar el token en `/auth/me` o `/auth/logout`.
- [ ] Probar `/auth/me` sin token y con `Bearer token-corrupto`; confirmar `401` uniforme.
- [ ] Francisco usa `requireSession` en una ruta propia y verifica sesión válida, ausente, expirada y revocada.

Resultado de API03: **automatización, MongoDB real, seed repetido y recorrido HTTP aprobados; Daniel confirmó la prueba manual antes del commit y queda pendiente la revisión cruzada de Francisco**.

## Revisión manual UI04

- [ ] Configurar `cliente/.env.local` con `VITE_API_MODE=real`, levantar API y Vite y abrir `/ingresar`.
- [ ] Como visitante, abrir `/iniciativas` y `/proyectos`; ambas rutas públicas permanecen accesibles.
- [ ] Abrir `/perfil`, `/usuarios` o `/iniciativas/nueva`; debe redirigir a ingreso y volver a la ruta solicitada después de autenticar.
- [ ] En registro vacío, confirmar errores por campo; probar correo inválido, contraseña débil, confirmación distinta y términos sin aceptar.
- [ ] Registrar una cuenta válida; confirmar identidad en la barra, ruta de perfil y que el formulario no solicita ni descarta carrera.
- [ ] Repetir el correo con mayúsculas y espacios; confirmar `EMAIL_ALREADY_EXISTS` junto al campo y que los valores permanecen.
- [ ] Ingresar como `ana.owner@example.test` con `DemoSegura2026`; recargar y confirmar que `/auth/me` restaura la identidad.
- [ ] Intentar `diego.inactive@example.test`; confirmar el mismo mensaje que una contraseña incorrecta o correo desconocido.
- [ ] Cerrar sesión desde una ruta protegida; confirmar aviso, redirección a ingreso y que Atrás no recupera la página privada.
- [ ] Detener la API antes de cerrar sesión; confirmar que se informa el fallo, el nombre sigue visible y el botón permite reintentar después de reiniciar la API.
- [ ] En modo mock, guardar `mock-expired-token`, recargar una ruta protegida y confirmar aviso de sesión terminada.
- [ ] Revisar a 360, 768 y 1440 px, teclado completo, foco visible y zoom de 200 % en ambos formularios y menú autenticado.

Resultado de UI04: **47 pruebas, lint, build, integración HTTP real y confirmación manual de Daniel aprobados; revisión cruzada de Francisco pendiente**.

## Revisión manual API04

- [x] Instalar con `npm ci --cache /private/tmp/innovation-hub-npm-cache`, ejecutar `npm run seed` y levantar la API con MongoDB activo.
- [x] Consultar `/api/categories` sin token: esperar `200`, exactamente 8 elementos y solo `id`/`name`; agregar `?page=1` y esperar `400 INVALID_QUERY`.
- [x] Consultar `/api/skills?q=desarrollo&page=1&size=5` sin token: esperar solo “Desarrollo web” y paginación total 1; `q=x` y `size=51` deben producir `400 INVALID_QUERY`.
- [x] Consultar `/api/users` sin token y esperar `401 AUTHENTICATION_REQUIRED`; iniciar sesión como Ana y repetir con su Bearer.
- [x] En `/api/users?page=1&size=2&sort=lastName&order=asc`, esperar 2 perfiles, total 4, 2 páginas y ausencia de `email`, hashes, `_id` y sesiones.
- [x] Probar filtros válidos por búsqueda, carrera, competencia y disponibilidad; una página fuera de rango debe devolver `200`, `data: []` y conservar el total real.
- [x] Probar un UUID de competencia bien formado sin usuarios y esperar lista vacía; UUID malformado, query repetida o parámetro desconocido deben responder `400 INVALID_QUERY`.
- [x] Consultar el UUID de Ana y esperar correo; consultar el UUID de Luis con el mismo token y confirmar que el correo se omite; UUID desconocido `404` y malformado `400`.
- [x] Reemplazar el perfil propio con todos los campos editables mediante `PUT /api/users/me`; esperar `200`, datos recortados, correo original y `updatedAt` nuevo.
- [x] Enviar correo, ID o fecha en el `PUT`; omitir un campo; repetir una competencia; usar una competencia inexistente, nivel inválido, URL no HTTP(S) o bio de 601 caracteres. Cada caso debe producir `400` y ninguno debe alterar el último perfil válido.
- [x] Confirmar que `/perfil`, `/usuarios` y `/usuarios/:id` siguen mostrando “Sección en preparación”: API04 habilita los endpoints y UI05 construirá esas pantallas.

Resultado de API04: **34 pruebas locales, lint, fixtures, 3 integraciones con MongoDB real, audit de producción y recorrido manual de Daniel aprobados; revisión cruzada de Francisco pendiente**.

## Revisión manual UI05

- [x] Ejecutar `npm run seed` para restaurar los perfiles demo, configurar `VITE_API_MODE=real`, mantener MongoDB/API activos e iniciar el cliente con `npm run dev`.
- [x] Ingresar como Ana y abrir `/perfil`: esperar el formulario completo, correo de solo lectura, valores del seed y competencias Diseño/Facilitación con sus niveles.
- [x] Cambiar nombre, carrera, biografía, intereses, disponibilidad y portafolio; agregar una competencia, cambiar su nivel y quitar otra. Guardar y esperar “Perfil guardado correctamente”.
- [x] Confirmar que el nombre actualizado aparece en la barra, recargar `/perfil` y verificar que todos los cambios persistieron.
- [x] Intentar agregar la misma competencia dos veces y más de 15 intereses; comprobar que el cliente bloquea el envío. Una URL que no sea HTTP(S) también debe mostrar error local.
- [x] Provocar un `400` del servidor si se desea mediante DevTools o una competencia invalidada; el formulario debe conservar lo escrito y mostrar errores por campo.
- [x] Abrir `/usuarios`: esperar 4 personas activas, sin Diego y sin correos. Con tamaño 2, esperar “Página 1 de 2” y navegación Anterior/Siguiente.
- [x] Buscar `Ana`, filtrar disponibilidad Alta y aplicar: esperar solo Ana. La URL y Network deben contener `q=Ana`, `availability=high`, página 1 y no una descarga completa seguida de filtro local.
- [x] Combinar una carrera que no coincida con la competencia seleccionada: esperar “Sin coincidencias”; pulsar “Ver todas las personas” y esperar de nuevo los 4 perfiles.
- [x] Abrir el perfil de Luis desde su tarjeta: esperar datos públicos, intereses y competencias, sin correo ni botón para guardar.
- [x] Abrir manualmente `/usuarios/11111111-1111-4111-8111-111111111111`: debe redirigir a `/perfil`, porque es la identidad autenticada.
- [x] Probar Atrás/Adelante después de cambiar filtros; los controles y resultados deben reconstruirse desde la query de la URL.
- [x] Detener la API y reintentar perfil/directorio: esperar panel de error con Reintentar; al reiniciar la API, la consulta debe recuperarse.
- [x] Revisar `/perfil`, `/usuarios` y `/usuarios/:id` a 360, 768 y 1440 px, con teclado, foco visible y zoom de 200 %.
- [x] Confirmar que `/iniciativas` continúa mostrando “Sección en preparación”; UI05 no implementa ese módulo.

Resultado de UI05: **59 pruebas, ESLint, build, audit de producción, integración HTTP real y recorrido manual de Daniel aprobados; revisión cruzada de Francisco pendiente**.

## Revisión manual API05

- [x] Cargar catálogos y usuarios sintéticos sobre MongoDB replica set de pruebas e iniciar Express.
- [x] Iniciar sesión como Ana y Carla: `200` y token opaco.
- [x] Crear una iniciativa válida: `201`, encabezado `Location`, estado `published`, propietario Ana, `memberCount: 1` y espacios calculados.
- [x] Verificar DTO sin `_id`, `revision`, `searchText`, correo ni hashes de contraseña/token.
- [x] Cambiar título mediante `PUT` completo: `200`, mismo ID/propietario/fecha de creación y `updatedAt` posterior.
- [x] Intentar editar como Carla: `403 FORBIDDEN`; el título persistido no cambia.
- [x] Enviar `ownerId`, `state`, `id`, fechas o conteos: `400`, sin iniciativas, membresías ni eventos adicionales.
- [x] Probar categoría desconocida, competencia inexistente/repetida, etiqueta repetida y cuerpo parcial: `400` sin escritura parcial.
- [x] Crear o editar sin token: `401`.
- [x] Ejecutar dos arranques HTTP con conexiones nuevas y editar el ID existente: `200`, identidad/creación y equipo conservados.
- [x] Con estimado 2 y tres miembros activos, conservar 2 permite editar; reducir a 1 da `400`; aumentar a 4 funciona y los espacios nunca son negativos.
- [x] Forzar colisión al crear membresía: se revierte también la iniciativa y no queda evento parcial.
- [x] Intentar editar una iniciativa archivada: `409 STATE_CONFLICT`.
- [x] Confirmar `404` en `GET /api/initiatives` y `GET /api/initiatives/{id}`: las lecturas pertenecen a API06.

Los casos se comprobaron mediante pruebas automatizadas con HTTP/MongoDB real y el recorrido HTTP de terminal registrado arriba. Las pantallas de iniciativas se implementarán en UI06–UI10; API05 no modifica esas rutas React.

Resultado de API05: **47 pruebas locales, lint, fixtures, 4 integraciones con MongoDB real y recorrido HTTP aprobados; revisión cruzada de Francisco pendiente**.

## Revisión API06

- [x] Catálogo visitante: solo públicas de estados visibles; totales sin privadas ajenas.
- [x] Catálogo autenticado: resumen seguro de restringidas, sin propietario, etiquetas o campos de detalle.
- [x] Matriz visitante/propietario/miembro/ajeno para las cuatro visibilidades; errores seguros `401/403/404`.
- [x] `/mine` exige sesión, representa propiedad y conserva borrador/archivada.
- [x] Retirar una membresía elimina el acceso derivado a la privada.
- [x] Búsqueda sin tildes/mayúsculas y combinación de texto/tipo/categoría/competencia/estado/espacios/propietario.
- [x] Buscar etiqueta oculta o filtrar propietario oculto no revela una restringida por coincidencia o conteo.
- [x] Query desconocida/repetida/inválida, UUID inválido y token malformado se rechazan.
- [x] Páginas de 25 iniciativas adicionales: 10/10/5/0 elementos, total 25, orden estable y sin duplicados.
- [x] Estimación superada mantiene cero espacios; solicitudes pendientes y miembros activos desactivan `canRequest`.
- [x] Seed repetido: ocho iniciativas, doce membresías y trece eventos sin duplicación de fixtures.
- [x] Documentos anteriores de API05 reciben campos de búsqueda nuevos sin cambiar IDs.

Resultado de API06: **54 pruebas locales, lint, fixtures y 5 integraciones con MongoDB real aprobados; revisión cruzada de Francisco pendiente**. Las rutas React de iniciativas permanecen pendientes de UI06–UI10.

## Revisión API07

- [x] Dueño sin historial adicional: `204` sin cuerpo y eliminación de iniciativa/membresía/evento automáticos, conservando usuario/catálogos.
- [x] Solicitudes pendientes/canceladas/rechazadas/aceptadas obligan a archivar y no cambian de estado.
- [x] Miembros activos/retirados, eventos históricos y proyectos obligan a conservar relaciones.
- [x] Archivo devuelve `200`, sale del catálogo y conserva consulta por el dueño; editar da `409`.
- [x] Repetir archivo conserva fecha/revisión; repetir borrado físico da `404`.
- [x] Sin sesión, ajeno, UUID inválido, body JSON/texto y query no permiten eliminar.
- [x] Fallo después de borrar o archivar revierte iniciativa, revisión y relaciones completas.
- [x] Relación concurrente que confirma primero obliga al reintento de DELETE y al archivo.
- [x] Si el borrado confirma primero, el escritor reintentado no puede crear una relación huérfana.
- [x] Dos DELETE simultáneos respetan idempotencia y unicidad del resultado físico.

Resultado de API07: **62 pruebas locales, lint, fixtures y 6 integraciones principales con MongoDB real aprobados, incluidos nueve subcasos de API07; revisión cruzada de Francisco pendiente**. Las escrituras futuras de API08–API10 se simulan por transacciones según el protocolo de revisión; sus rutas HTTP se integran cuando existan.

## Verificación UI06

Catálogo y listado propio integrados con los servicios reales, filtros en URL, paginación del servidor, selector de propietario y tarjetas con permisos. Detalle, publicación y edición siguen en preparación hasta sus tareas. El mock de iniciativas se alineó con filtros y proyecciones del contrato.

- [x] 85 pruebas del cliente aprobadas: filtros combinados, permisos/privacidad, paginación, historial del navegador, selección de propietario, validaciones, estados de error/vacío, cancelación de consultas anteriores y retiro de tarjetas privadas al cerrar sesión.
- [x] ESLint y build de producción aprobados (138 módulos); continúan los cuatro avisos conocidos de Sass `@import`.
- [x] Tres pruebas adicionales de React con servicios HTTP reales contra Express en puerto temporal 3002 y MongoDB de pruebas: visitante 3 públicas/búsqueda Huertos, Carla 5/resumen restringido y Ana 8 propias con borrador/archivada.
- [x] API temporal de pruebas detenida al terminar; procesos de desarrollo y MongoDB nativo conservados.
- [x] Daniel aprobó los ajustes visuales y autorizó publicar UI06; no se registra confirmación individual de cada caso del recorrido.
- [ ] Revisión cruzada de Francisco.

El primer intento de Vitest necesitó permisos por el `node_modules` compartido de la copia de trabajo. La integración real detectó dos fallos de pruebas: opción “Sostenibilidad” ambigua entre categoría/competencia y aserciones sobre resultados anteriores mientras cambiaba la página. Se corrigieron el alcance del selector y la espera al conjunto final de ocho tarjetas; los tres escenarios aprobaron. El acceso al navegador no estuvo disponible, por lo que no se afirma aprobación visual ni manual. Las tres pruebas reales requieren activación explícita y aparecen omitidas en la suite general.

Resultado de UI06: **pruebas automáticas, ESLint, build e integración React/Express/MongoDB aprobados; aprobación visual de Daniel recibida y publicación autorizada**. API07 ya se publicó como `f26bd1c`.

Ajuste visual de UI06 solicitado por Daniel: estado en banda independiente con texto y colores por estado; visibilidad en etiqueta separada de borde. Contraste calculado de texto/fondo entre 6.15:1 y 8.88:1 para las nueve combinaciones conocidas. ESLint y build aprobados; se conservan los cuatro avisos Sass anteriores. Daniel aprobó el ajuste visual.

Segundo ajuste visual de UI06: tipo de iniciativa aumentado a 1.1rem y visibilidad alineada al extremo superior derecho del contenido de la tarjeta mediante una cabecera de dos columnas. Los textos pueden ajustarse en pantallas estrechas y con zoom; Daniel aprobó el ajuste visual.
