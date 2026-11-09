
# QA integral del cliente — Innovation Hub

## Propósito

Validar el cliente React del Avance 2 con Express y MongoDB reales, incluyendo accesibilidad, errores HTTP, navegación, persistencia y regresiones del Avance 1.

No declarar una prueba como aprobada sin ejecutarla.

## Entorno requerido

- MongoDB en replica set activo.
- API Express iniciada con base de datos de prueba.
- Cliente React iniciado mediante Vite.
- `VITE_API_MODE=real`.
- Datos de demostración cargados.
- Al menos tres actores: propietario, solicitante y tercero ajeno.

## Pruebas automáticas

Desde `cliente/`:

```bash
npm test
```

Desde `servidor/`:

```bash
npm run check
npm run test:integration
```

Las integraciones deben utilizar una base de datos desechable e independiente de desarrollo.

## Matriz de navegación

| Pantalla | Carga | Error | Vacío | Permisos | Estado |
| --- | --- | --- | --- | --- | --- |
| Inicio y navegación | No aplica | No aplica | No aplica | Público | Pendiente |
| Catálogo de iniciativas | Revisar | Revisar | Revisar | Por visibilidad | Pendiente |
| Detalle de iniciativa | Revisar | Revisar | Revisar | Por actor | Pendiente |
| Mis iniciativas | Revisar | Revisar | Revisar | Propietario | Pendiente |
| Registro e inicio | Revisar | Revisar | No aplica | Público | Pendiente |
| Perfil propio | Revisar | Revisar | No aplica | Autenticado | Pendiente |
| Directorio | Revisar | Revisar | Revisar | Autenticado | Pendiente |
| Solicitar participación | Revisar | Revisar | No aplica | Autenticado | Pendiente |
| Mis solicitudes | Revisar | Revisar | Revisar | Solicitante | Pendiente |
| Solicitudes recibidas | Revisar | Revisar | Revisar | Propietario | Pendiente |
| Equipo de iniciativa | Revisar | Revisar | Revisar | Según visibilidad | Pendiente |
| Convertir iniciativa | Revisar | Revisar | No aplica | Propietario | Pendiente |
| Lista de proyectos | Revisar | Revisar | Revisar | Según visibilidad | Pendiente |
| Detalle de proyecto | Revisar | Revisar | No aplica | Según visibilidad | Pendiente |
| GitHub | Revisar | Revisar | Sin repositorio | API pública | Pendiente |
| Ruta inexistente | No aplica | Revisar | No aplica | Público | Pendiente |

## Recorrido funcional completo

1. Abrir la aplicación sin iniciar sesión.
2. Consultar iniciativas públicas.
3. Registrar o iniciar sesión como propietario.
4. Modificar perfil sin alterar correo.
5. Consultar el directorio y combinar filtros.
6. Crear una iniciativa pública válida.
7. Editar la iniciativa creada.
8. Cerrar sesión.
9. Ingresar como solicitante.
10. Abrir la iniciativa y enviar una solicitud.
11. Consultar y editar la solicitud mientras esté pendiente.
12. Cerrar sesión.
13. Ingresar nuevamente como propietario.
14. Consultar solicitudes recibidas.
15. Aceptar la solicitud.
16. Comprobar que el solicitante aparece como miembro activo.
17. Convertir la iniciativa en proyecto.
18. Abrir listado y detalle del proyecto.
19. Consultar miembros a través de la iniciativa original.
20. Probar repositorio válido, inexistente y servicio no disponible.
21. Retirar un miembro y comprobar la conservación del historial.
22. Cerrar sesión y verificar que las rutas protegidas ya no sean accesibles.

## Accesibilidad

Repetir las pantallas críticas mediante:

- Teclado: Tab, Shift+Tab, Enter, Espacio y Escape.
- Foco visible en enlaces, botones, formularios y diálogos.
- Restauración del foco al cerrar confirmaciones.
- Etiquetas asociadas a controles.
- Errores específicos de campo y anuncios accesibles.
- Contraste suficiente de texto, botones y estados.
- Zoom del navegador al 200 %.
- Ausencia de scroll horizontal que impida completar operaciones.

## Responsive

Verificar, como mínimo:

| Ancho | Resultado | Evidencia |
| --- | --- | --- |
| 360 px | Pendiente | Captura pendiente |
| 768 px | Pendiente | Captura pendiente |
| 1440 px | Pendiente | Captura pendiente |

No registrar una resolución como aprobada únicamente porque el CSS tenga media queries.

## Casos de regresión

- Filtros combinados y persistidos en URL.
- Diferencia entre catálogo vacío y búsqueda sin resultados.
- Borradores y archivadas fuera del catálogo público.
- Iniciativas privadas sin fuga de información.
- Acciones exclusivas del propietario.
- Separación entre eliminar y archivar.
- Formularios controlados y preservación ante error.
- Competencias identificadas por UUID.
- Avisos de éxito que no reaparecen al navegar.
- Ninguna solicitud crea una membresía antes de ser aceptada.
- Ningún miembro retirado conserva su condición de activo.
- Conversión bloqueada sin un segundo miembro.
- GitHub no impide consultar el proyecto si falla.
- Ningún token de sesión se envía a GitHub.
- Las consultas principales usan la API real y no mocks.

## Evidencia de red

En DevTools > Network comprobar:

- React consulta la URL configurada en Vite.
- Los filtros se transmiten mediante query params.
- Las mutaciones usan los verbos HTTP previstos.
- No hay consultas directas desde React a MongoDB.
- Los 401/403/404/409 se presentan de forma controlada.
- Las peticiones a GitHub se realizan solo cuando procede.

## Registro de ejecución

- Fecha:
- Navegador y versión:
- Resoluciones revisadas:
- Zoom verificado:
- Commit HEAD:
- Resultado de Vitest:
- Resultado de ESLint:
- Resultado del build:
- Resultado del recorrido funcional:
- Incidencias:
- Evidencia/capturas:
- Responsable:
- Revisor:

Si existe un defecto funcional bloqueante, no aprobar el cierre hasta corregirlo y repetir el escenario.
