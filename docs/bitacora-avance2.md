# Bitácora de verificación — Avance 2

Esta bitácora registra resultados ejecutados, no intenciones. Cada entrada debe incluir comando o recorrido, fecha, entorno, resultado y hash cuando exista. No guardar tokens, contraseñas reales, `.env`, volcados de base ni datos personales.

## Estado inicial

| Fecha | Tarea | Entorno | Verificación | Resultado | Commit |
| --- | --- | --- | --- | --- | --- |
| 2026-10-29 | CO00 | macOS; repositorio local en `main` | `git status --short --branch` y `git log -5 --oneline` antes de editar | Repositorio limpio; HEAD `033361c`; sin implementación de Avance 2 | Sin commit |
| 2026-10-29 | CO00 | macOS; ripgrep | Inventario de encabezados HTTP, bloques Markdown, espacios finales y endpoints de proyecto fuera de alcance | 26/26 endpoints; 48 cercas de código balanceadas; sin espacios finales; sin PUT/DELETE de proyectos | Sin commit |
| 2026-10-29 | CO00 | macOS; Git | `git diff --check` | Sin errores de whitespace | Sin commit |
| 2026-10-29 | CO00 | Node.js; runner `node:test` | `cd avance1 && npm test` | 31 aprobadas, 0 fallidas; el cambio documental no altera el prototipo | Sin commit |

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
