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
