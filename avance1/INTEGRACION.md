# Integración de Discovery, Gestión y Participación

Los dos bloques del Avance 1 comparten datos, utilidades DOM, navegación y tema Sass. La página principal y el catálogo están en `index.html`; las pantallas de gestión y participación se encuentran en `paginas/`.

La identificación del equipo, ejecución, pruebas e historial están en el [README principal](../README.md).

## Ejecución

Desde la raíz del repositorio:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Abrir `http://127.0.0.1:8000/avance1/index.html`. En Windows se puede usar `py` en lugar de `python3`. También se puede utilizar Live Server; no abrir los archivos mediante `file://`.

Desde `avance1`, con Node 22 actualizado y npm:

```bash
npm ci
npm run build:css
npm test
```

## Contrato de datos

La fuente inicial utilizada es `datos/iniciativas.json`. La copia situada en la raíz de `avance1` no se consume. No crear colecciones persistidas paralelas ni un segundo `fetch` desde el catálogo.

Cada iniciativa conserva estos campos:

```text
id, titulo, tipo, resumen, descripcion, problema, beneficiarios,
categoria, competencias, participantesEstimados, visibilidad,
etiquetas, propietario, miembros, estado
```

Los valores actuales son `idea`, `necesidad`, `reto` para tipo y `publica`, `comunidad`, `equipo`, `restringida` para visibilidad. No cambiar nombres o valores sin adaptar conjuntamente formularios, validación, detalle, catálogo y pruebas. El README describe las diferencias de este contrato respecto al documento general del proyecto.

## API compartida

| Función | Uso |
| --- | --- |
| `cargarIniciativas()` | Carga almacenamiento o JSON, reutiliza memoria y devuelve una copia. |
| `cargarIniciativas({ recargar: true })` | Relee la persistencia al restaurar el catálogo desde la caché de navegación. |
| `obtenerIniciativa(id)` | Busca después de cargar; devuelve una copia o `null`. |
| `crearIniciativa(campos)` | Genera ID, asigna propietario y miembro de demostración y estado Abierta. |
| `actualizarIniciativa(id, campos)` | Actualiza solo iniciativas propias, conservando ID y propietario. |
| `eliminarIniciativa(id)` | Elimina solo iniciativas propias. |
| `alCambiarIniciativas(callback)` | Suscribe la vista al evento del documento actual; devuelve una función para cancelar la suscripción. |

La clave de persistencia es `innovation-hub-iniciativas-v1` y el evento es `iniciativas:actualizadas`. Las respuestas usan `structuredClone`. El evento no atraviesa páginas ni sincroniza pestañas abiertas; una nueva página carga la persistencia, mientras que el catálogo restaurado mediante Atrás solicita una relectura explícita.

## Catálogo y navegación

`inicio.js` coordina carga, reintento, filtros y modal. `tarjetas.js` construye nodos sin registrar listeners. `filtros.js` contiene funciones puras de búsqueda y generación de opciones.

Los cuatro criterios se combinan mediante AND. Las opciones se calculan desde toda la colección y excluyen metadatos restringidos. Una selección que deja de existir se conserva marcada «sin disponibles»; Limpiar filtros restablece los controles y retira esas opciones obsoletas.

| Destino | Ruta desde index.html |
| --- | --- |
| Catálogo | `#catalogo` |
| Detalle | `paginas/detalle.html?id=ID` |
| Crear | `paginas/formulario.html` |
| Editar | `paginas/formulario.html?id=ID` |
| Perfil | `paginas/perfil.html` |
| Participar | `paginas/participar.html?id=ID` |

Los enlaces generados codifican el ID con `encodeURIComponent`. Desde las páginas internas se regresa al catálogo mediante `../index.html#catalogo`.

## Propiedad, visibilidad y solicitudes

`USUARIO_ACTUAL` identifica al `Usuario de prueba`. No representa autenticación real. Las tarjetas propias muestran edición y eliminación. El modal utiliza delegación de eventos, borra el ID pendiente al cerrarse y devuelve el foco al botón de origen o al título del catálogo si la tarjeta ya no existe.

Según el contrato implementado, las iniciativas restringidas muestran un encabezado genérico, resumen y aviso. No se insertan sus metadatos completos en el DOM. No coinciden con filtros de tipo, categoría o competencia y solo se buscan por resumen. El detalle no ofrece solicitud de participación para ellas.

El formulario de solicitud toma las competencias de la iniciativa ajena seleccionada y guarda la simulación en `innovation-hub-solicitudes-v1`. Enviar una solicitud no modifica `miembros`. No existe aprobación de solicitudes ni control de duplicados en este prototipo.

## Estilos y verificación

Mantener el orden de Sass: variables propias, Bootstrap y componentes. Generar `css/app.css` mediante `npm run build:css`; no editar el CSS compilado a mano. Bootstrap 5.3.3 proporciona grilla, navegación, formularios, tarjetas y modal.

Las pruebas automatizadas cubren ambas partes y sus principales conexiones. Los recorridos completos en navegador, responsive y accesibilidad visual requieren revisión manual adicional; no deben darse por verificados únicamente porque pasen las simulaciones del DOM.
