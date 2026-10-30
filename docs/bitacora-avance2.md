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

## Revisión manual UI01

- [ ] Navegar mediante enlaces sin recarga completa del documento.
- [ ] Abrir directamente una ruta de detalle y confirmar que muestra el `id` de la URL.
- [ ] Cambiar el `id` en la barra y confirmar que cambia el valor presentado.
- [ ] Probar Atrás y Adelante entre tres rutas.
- [ ] Abrir una ruta desconocida y comprobar el título “Página no encontrada”.
- [ ] Recorrer enlaces y salto al contenido con teclado.

Resultado de UI01: **verificación automática aprobada; recorrido manual de Daniel y revisión cruzada de Francisco pendientes**.
