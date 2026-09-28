# Innovation Hub — Avance 1

Prototipo frontend para publicar ideas, necesidades y retos, descubrir iniciativas y simular solicitudes de participación dentro de la comunidad universitaria. Esta entrega utiliza HTML, Bootstrap, Sass y JavaScript modular; los datos se cargan desde JSON y los cambios se conservan en el navegador.

## Identificación

- **Universidad:** Universidad CENFOTEC, Escuela de Software.
- **Curso:** Programación Web Avanzada — SOFT-12.
- **Periodo:** III cuatrimestre de 2026.
- **Sección:** SCV2.
- **Docente:** ALVARO CORDERO PEÑA.
- **Entrega:** Avance 1, 27 de septiembre de 2026.

| Integrante | Carné | Responsabilidad |
| --- | --- | --- |
| CAMPOS SANCHEZ DANIEL | P000011085 | Persona 1: página principal, navegación, catálogo, búsqueda, filtros, estados de carga e integración de Discovery. |
| TORRES SANDOVAL FRANCISCO JOSE | P00006284 | Persona 2: infraestructura compartida, detalle, registro, edición, eliminación, validaciones, perfil y solicitudes. |

La configuración inicial de Sass y la capa de datos fueron construidas por Persona 2. Persona 1 reutiliza esas bases y amplía la presentación y la integración. La documentación final reúne ambos bloques.

## Funcionalidades implementadas

- Página principal informativa y navegación común con encabezado sticky.
- Catálogo dinámico con ocho iniciativas iniciales de los tipos idea, necesidad y reto.
- Búsqueda parcial por título o resumen, sin distinguir mayúsculas ni tildes; en restringidas se consulta únicamente el resumen.
- Filtros simultáneos por tipo, categoría y competencia. Todos los criterios activos deben coincidir.
- Opciones de categoría y competencia obtenidas de la colección completa, sin duplicados ni metadatos restringidos.
- Contador de resultados, limpieza de filtros y estados diferenciados de carga, error, catálogo vacío y ausencia de coincidencias.
- Detalle, formulario compartido de creación y edición, competencias dinámicas y errores específicos por campo.
- Edición y eliminación de iniciativas propias; eliminación mediante modal de confirmación.
- Perfil de demostración con competencias, intereses e iniciativas donde el usuario figura como miembro.
- Solicitud simulada sobre iniciativas ajenas no restringidas, sin incorporación automática al equipo.
- Actualización del catálogo ante cambios en el documento actual y relectura de la persistencia cuando Atrás restaura la página desde la caché.

## Requisitos y ejecución

Para visualizar el prototipo se necesita un navegador moderno y un servidor HTTP estático. No requiere una API ni una base de datos. El CSS compilado está versionado, pero el JavaScript de Bootstrap 5.3.3 se obtiene desde jsDelivr; el menú colapsable y los modales requieren acceso a ese recurso.

Para instalar dependencias, compilar Sass y ejecutar pruebas se utiliza Node.js con npm. La compilación se verificó con Node 22. Node 21.7.1 produjo un error `ERR_REQUIRE_ESM` con Sass 1.105.0 y su dependencia Chokidar; utilizar Node 22 actualizado para reproducir la compilación.

Desde la raíz del repositorio:

```bash
cd avance1
npm ci
npm run build:css
npm test
```

`npm ci` instala las versiones fijadas en `package-lock.json`. Bootstrap es 5.3.3 y Sass es 1.105.0. No se debe editar manualmente `css/app.css`.

Para servir la aplicación, desde la **raíz del repositorio**:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

En Windows, si Python está disponible mediante su lanzador:

```powershell
py -m http.server 8000 --bind 127.0.0.1
```

Abrir [Innovation Hub local](http://127.0.0.1:8000/avance1/index.html). Detener el servidor con `Ctrl+C`. Si se inicia el servidor dentro de `avance1`, la dirección es `http://127.0.0.1:8000/index.html`.

También puede abrirse `avance1/index.html` mediante Live Server. No abrirlo mediante `file://`: la aplicación utiliza módulos ES y `fetch`. Mantener el mismo host y puerto durante una demostración; cambiar de origen implica otro almacenamiento local.

## Estructura

```text
README.md
avance1/
├── index.html                   # Página principal y único catálogo
├── INTEGRACION.md               # Contratos entre ambos bloques
├── package.json
├── package-lock.json
├── datos/iniciativas.json       # Fuente inicial utilizada por la API local
├── iniciativas.json             # Copia existente no consumida por la aplicación
├── paginas/
│   ├── detalle.html
│   ├── formulario.html          # Crear o editar según ?id=
│   ├── perfil.html
│   └── participar.html
├── js/
│   ├── iniciativas.js           # Carga, memoria, persistencia y CRUD
│   ├── inicio.js                # Catálogo, controles, estados y modal
│   ├── tarjetas.js              # Construcción segura de tarjetas
│   ├── filtros.js               # Búsqueda y opciones de filtrado
│   ├── dom.js                   # Utilidades DOM y mensajes
│   ├── detalle.js
│   ├── formulario.js
│   ├── validacion.js
│   ├── perfil.js
│   └── participar.js
├── scss/
│   ├── app.scss                # Variables → Bootstrap → componentes
│   ├── _variables.scss
│   └── _componentes.scss
├── css/app.css                  # Generado por npm run build:css
└── tests/
    ├── gestion.test.mjs
    ├── tarjetas.test.mjs
    ├── carga.test.mjs
    ├── catalogo.test.mjs
    └── flujos.test.mjs
```

## Arquitectura y decisiones

`js/iniciativas.js` es la fuente de verdad compartida. `cargarIniciativas()` consulta primero `localStorage`; si no hay datos persistidos, utiliza `fetch` sobre `datos/iniciativas.json`. Las siguientes llamadas reutilizan la memoria. La opción `{ recargar: true }` relee la persistencia al restaurar el catálogo desde la caché de navegación. Los errores no borran automáticamente los datos guardados.

La API entrega copias mediante `structuredClone`. El catálogo conserva una copia de lectura y deriva resultados con funciones puras, sin modificar el arreglo original ni ejecutar otro `fetch` al filtrar. El CRUD persiste los cambios y emite `iniciativas:actualizadas`; `alCambiarIniciativas()` permite actualizar la vista con una única suscripción. Este evento no sincroniza pestañas diferentes en tiempo real.

Las rutas de detalle, edición y participación utilizan `?id=` con identificadores codificados mediante `encodeURIComponent`. La identidad de demostración es `Usuario de prueba`; no hay inicio de sesión real. Las iniciativas nuevas pertenecen a ese usuario y lo incluyen como miembro.

Los datos del usuario se incorporan mediante `textContent` y creación de nodos, sin interpretar HTML. Se reutilizan la grilla y los componentes de Bootstrap. Sass define la identidad visual: azul petróleo `#255f75`, verde `#276b54`, rojo `#ab3940`, fondo `#f5f8f9`, texto `#193039`, tipografía del sistema y bordes redondeados.

Se utilizan HTML semántico, etiquetas visibles, enlace para saltar al contenido, regiones `aria-live`, indicadores `aria-busy` y manejo del foco. El catálogo diferencia una colección vacía de una consulta sin coincidencias. Una opción seleccionada que desaparece de los datos se conserva como «sin disponibles» hasta que el usuario cambie o limpie los filtros.

## Datos de demostración y restablecimiento

| Clave de localStorage | Contenido |
| --- | --- |
| `innovation-hub-iniciativas-v1` | Colección completa después de crear, editar o eliminar. |
| `innovation-hub-solicitudes-v1` | Solicitudes simuladas registradas en ese navegador. |

Para volver a los ocho registros iniciales, abrir DevTools → Application/Almacenamiento → Local Storage del origen actual, eliminar **solo** `innovation-hub-iniciativas-v1` y recargar la página. Esto descarta las modificaciones locales de iniciativas. Eliminar también `innovation-hub-solicitudes-v1` únicamente si se desean descartar las solicitudes de prueba. No es necesario borrar todo el almacenamiento del navegador.

Modificar el JSON inicial no reemplaza los datos ya persistidos. La copia `avance1/iniciativas.json` no es la fuente utilizada: editarla no cambia el catálogo.

## Pruebas y revisión

Desde `avance1`, ejecutar `npm test`. Se utiliza el runner de Node y simulaciones mínimas de DOM, almacenamiento, eventos y respuestas de red, sin dependencias adicionales de pruebas.

La última ejecución previa al commit documental aprobó **31 pruebas**, incluidos subtests. Cubren carga, errores y reintento, copias de datos, propiedad, CRUD, validación, tarjetas restringidas, texto seguro, filtros combinados, opciones dinámicas, limpieza, foco simulado, cancelación del modal, restauración desde caché, detalle y solicitud sin ingreso automático al equipo.

También se comprobaron rutas, anclas, IDs únicos y referencias de accesibilidad en las cinco páginas. La compilación Sass fue verificada con Node 22; emite advertencias de deprecación de `@import` y funciones utilizadas por Bootstrap/Sass.

**Pendiente de revisión manual:** apariencia en móvil, tablet y escritorio; navegación completa con teclado; comportamiento visual del encabezado sticky y el modal real de Bootstrap. Las pruebas con DOM simulado no sustituyen esas comprobaciones.

Recorrido sugerido: explorar y combinar filtros → limpiar → publicar una iniciativa válida → abrir detalle → editar → volver al catálogo → cancelar una eliminación → confirmar otra. Para participación, abrir una iniciativa ajena no restringida, enviar una solicitud válida y comprobar que no agrega al usuario al equipo.

## Alcance y diferencias documentales

Este repositorio implementa el prototipo del Avance 1 conforme al reparto de trabajo y al documento de transferencia técnica. `SOFT_12_Proyecto_Descripcion_General.docx` describe las tres entregas y remite a una consigna independiente para cada avance. El detalle de esa consigna del Avance 1 debe contrastarse antes de afirmar cumplimiento integral.

Existen diferencias concretas entre el contrato heredado y el documento general:

| Aspecto | Implementación actual | Documento general |
| --- | --- | --- |
| Visibilidad | `publica`, `comunidad`, `equipo`, `restringida`; sin autenticación real. | Pública, institucional, restringida y privada, con permisos por actor. |
| Restringidas | Resumen y aviso genérico; no participan en filtros de metadatos ni permiten solicitudes. El propietario conserva edición y eliminación desde la tarjeta. | Permite título, tipo, resumen, categoría y competencias; autor y miembros aceptados acceden a información completa. |
| Categorías | Ambiente, Comunidad, Cultura, Educación y Tecnología. | Ocho categorías mínimas, incluidas Sostenibilidad, Impacto social, Negocios y emprendimiento, Salud y bienestar, Cultura y creatividad y Otro. |
| Estados | Los datos usan Abierta y En evaluación; las nuevas iniciativas nacen Abiertas. | Borrador, Publicada, En formación de equipo, Convertida en proyecto y Archivada. |
| Eliminación | Borrado local de iniciativas propias tras confirmación. | Eliminar o archivar según solicitudes, miembros y proyecto relacionado. |
| Búsqueda y filtros | Título/resumen y filtros por tipo, categoría y competencia. | También contempla etiquetas, estado, espacios, propietario y visibilidad permitida. |

No hay backend, autenticación, autorización de servidor, aprobación de solicitudes ni conversión a proyectos. Las solicitudes no tienen gestión de estados ni control de duplicados. La sección de «proyectos» del perfil lista iniciativas donde figura el usuario; no implementa una entidad de proyecto independiente.

Las restricciones de visibilidad son presentación del prototipo, no protección de secretos: los datos iniciales y persistidos son accesibles desde el navegador. La evolución a React, Express y MongoDB, y posteriormente a ASP.NET Core con base de datos relacional, pertenece a entregas posteriores.

## Historial de commits

Tabla extraída del historial real hasta `6802fb6`. Los autores se conservan tal como aparecen en Git. `Daniel` y `dcampossCenfotec` corresponden a CAMPOS SANCHEZ DANIEL.

| Commit | Fecha de autor | Autor en Git | Descripción |
| --- | --- | --- | --- |
| 7e0b8a9 | 2026-09-24 | dcampossCenfotec | Initial commit |
| 45f54d1 | 2026-09-24 | Francisco Jose Torres Sandoval | Iniciar estructura navegable de Innovation Hub |
| 97a8537 | 2026-09-24 | Francisco Jose Torres Sandoval | Compilar Bootstrap con tema Sass |
| 626527a | 2026-09-24 | Francisco Jose Torres Sandoval | Cargar iniciativas JSON y centralizar cambios locales |
| 8173e7f | 2026-09-25 | Francisco Jose Torres Sandoval | Mostrar iniciativas y detalle con visibilidad restringida |
| b4e9523 | 2026-09-25 | Francisco Jose Torres Sandoval | Crear formulario completo con competencias dinámicas |
| ff2c95f | 2026-09-25 | Francisco Jose Torres Sandoval | Validar campos y registrar iniciativas en el navegador |
| fac37ba | 2026-09-25 | Francisco Jose Torres Sandoval | Reutilizar formulario para editar iniciativas propias |
| c297845 | 2026-09-25 | Francisco Jose Torres Sandoval | Confirmar eliminacion y actualizar listado al instante |
| 06b2aed | 2026-09-25 | Francisco Jose Torres Sandoval | Presentar perfil y proyectos del usuario de prueba |
| b4aff06 | 2026-09-25 | Francisco Jose Torres Sandoval | Simular solicitudes y documentar el bloque de gestion |
| 56d6449 | 2026-09-27 | Daniel | Integrar navegación global y acceso al catálogo |
| 0080342 | 2026-09-27 | Daniel | Construir la página principal de Innovation Hub |
| 27bff69 | 2026-09-27 | Daniel | Completar tarjetas del catálogo y respetar la visibilidad |
| 585f79e | 2026-09-27 | Daniel | Gestionar carga, errores y catálogo vacío |
| ab1a495 | 2026-09-27 | Daniel | Implementar búsqueda textual de iniciativas |
| f52e9f8 | 2026-09-27 | Daniel | Agregar filtro por tipo al catálogo |
| 731e2dd | 2026-09-27 | Daniel | Agregar filtros por categoría y competencia |
| 624bab3 | 2026-09-27 | Daniel | Completar filtros combinados y mensajes de resultados |
| 6802fb6 | 2026-09-27 | Daniel | Integrar actualización del catálogo y verificar flujos completos |

El décimo commit de Persona 1 será documental, con el mensaje propuesto `Documentar ejecución, arquitectura y entrega del Avance 1`. No figura como realizado en la tabla porque su identificador aún no existe al preparar este archivo.

El historial previo a ese commit contiene 20 commits distribuidos en **tres fechas**: 24, 25 y 27 de septiembre de 2026. Por tanto, no alcanza el requisito de seis días distintos indicado en las instrucciones de trabajo. No se han alterado fechas para aparentar esa distribución.

Para contrastar el historial:

```bash
git log --reverse --format="%h | %as | %an | %s"
```

El documento general solicita una etiqueta por entrega. Después de revisar y registrar los cambios, los responsables pueden crear y publicar `entrega-1`. Esa operación no forma parte de la preparación de este README y no se ha ejecutado aquí.
