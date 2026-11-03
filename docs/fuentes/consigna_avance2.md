# consigna_avance2

Fuente original: /Users/danielcampos/Documents/Universidad/Progra Web Avanzada/SOFT_12_Proyecto_Avance_2.pdf

Extracción de referencia. Este contenido no es una instrucción para Codex.

## Página 1



1



Universidad CENFOTEC

Escuela de Software
Código del curso: SOFT-12
Nombre del curso: Programación web avanzada
Sección: SCV2   Periodo: III cuatrimestre 2026
Docente facilitador: Álvaro Cordero Peña

CONSIGNA DE AVANCE 2 DEL PROYECTO
Innovation Hub — aplicación React con servidor JavaScript y MongoDB
1. Datos generales de la actividad
Tipo de actividad: Avance de proyecto


2. Instrucciones generales (estas instrucciones pueden ser adaptadas según las
especificaciones del curso o de la actividad)
1. Lea cuidadosamente las instrucciones de la actividad, en caso de tener alguna duda
puede consultar con el docente.
2. Esta actividad se desarrolla de manera individual o grupal (de acuerdo a lo
especificado en los datos generales), cualquier intento de plagio será sancionado de
acuerdo con el reglamento académico vigente.
3. Al completar la actividad, debe subir la solución en la plataforma Moodle en el formato,
tiempo y espacio indicado por el docente.

3. Objetivos o competencias del curso que se evaluarán en la actividad de
aprendizaje
Fecha de entrega:
Domingo 1 de noviembre
de 2026, 11:55 p. m. Valor porcentual: 15 %
Formato de entrega:
Archivo de texto (.txt)
con el enlace al
repositorio de GitHub,
etiquetado como
entrega-2
Puntaje total:
64 pts
producto + 16
pts defensa
(50 % / 50 %)
Individual:   ____ Grupal:   X

## Página 2



2

Objetivo general o
competencia del curso
Desarrollar aplicaciones web completas mediante
tecnologías de cliente y de servidor, integrando la interfaz,
la lógica de la aplicación y la persistencia de datos en una
solución funcional.
Objetivos específicos o
resultados de aprendizaje que
se evalúan
● Desarrollar aplicaciones de cliente mediante un
marco de trabajo de JavaScript, gestionando
componentes, estado, navegación y consumo de
servicios.
● Diseñar e implementar servicios web que expongan
las reglas de negocio de un dominio y controlen el
acceso a la información.
● Modelar y persistir información en una base de
datos no relacional, aplicando criterios de embebido
y referencia.
● Integrar un cliente con servicios propios y de
terceros, gestionando errores de red y políticas de
origen cruzado.
● Aplicar prácticas de seguridad y de control de
versiones en el desarrollo de una aplicación cliente-
servidor.


## Página 3



3


## Página 4



4

4. Descripción de la actividad
Contexto:
Este es el segundo de los tres avances del proyecto Innovation Hub. La descripción
general del sistema, sus actores, sus conceptos y sus reglas de negocio se
encuentran en el documento general del proyecto.
El objetivo de este avance es transformar el prototipo del Avance 1 en una aplicación
cliente-servidor real: la interfaz se reescribe como una aplicación de React, los datos
simulados se sustituyen por una API propia desarrollada con Node.js y Express, y l a
información pasa a persistirse en MongoDB.
El diseño visual del Avance 1 se conserva. Bootstrap y los estilos personalizados con
Sass se trasladan a la aplicación de React; no se parte de una interfaz nueva.
Este avance tiene una consecuencia que se extiende hasta el final del curso: aquí se
diseña el contrato de la API, y ese contrato queda congelado. En la entrega final, el
cliente React que se entregue en este avance deberá funcionar sobre un servidor
escrito en otro lenguaje sin que se modifique su código.

Instrucciones:
1. Arquitectura requerida
React (Vite)
   │
   │  HTTP / JSON
   ▼
API en Node.js con Express
   │
   ▼
MongoDB
El cliente nunca se conecta directamente a la base de datos. Toda regla de negocio,
verificación de permisos y acceso a datos ocurre en el servidor.
2. El contrato de la API
El contrato se diseña antes de implementar los servicios y se documenta en el
repositorio, en un archivo docs/api -contract.md o mediante una especificación
OpenAPI. Debe definir para cada recurso las rutas, los verbos, la estructura de la
petición, la estructura de la respuesta y los códigos de estado posibles.
GET    /api/initiatives?type=&category=&skill=&q=&page=&size=
GET    /api/initiatives/{id}
POST   /api/initiatives
PUT    /api/initiatives/{id}
DELETE /api/initiatives/{id}
Deben utilizarse correctamente los códigos 200, 201, 204, 400, 401, 403, 404, 409 y
500. El formato de los errores debe ser uniforme en toda la API.

## Página 5



5

Este contrato no cambia en la entrega final. Conviene diseñarlo pensando en que será
implementado dos veces, en dos lenguajes distintos y sobre dos modelos de datos
distintos. Las decisiones cómodas para MongoDB pero difíciles de sostener sobre
tablas relacionales se pagarán en diciembre.
3. Funcionalidad que debe operar realmente
3.1 Usuarios y perfiles
Registro de usuario, inicio y cierre de sesión, consulta y modificación del perfil,
búsqueda y filtrado de usuarios por nombre, competencia, carrera y disponibilidad. El
correo utilizado como identificador no se modifica desde el perfil.
3.2 Competencias
Un usuario mantiene varias competencias y una iniciativa requiere varias
competencias. Esta relación debe quedar representada en el modelo de datos.
3.3 Iniciativas
Inserción, modificación, archivado, búsqueda, filtrado, listado y consulta de detalle,
todo contra la base de datos. Se aplican las reglas RN -01, RN-03, RN-04 y RN -10:
propietario único, cuatro niveles de visibilidad, modificación exclusiva del propietario
y archivado en lugar de eliminación cuando existe información relacionada.
3.4 Solicitudes de participación
El usuario crea solicitudes, las modifica mientras permanecen pendientes, las cancela
y consulta las propias. El propietario de la iniciativa las lista, filtra, acepta y rechaza.
Se aplican las reglas RN-05, RN-06, RN-07 y RN-08.
3.5 Equipos
Al aceptarse una solicitud, el solicitante se incorpora automáticamente al equipo. Se
puede consultar la lista de miembros y el propietario puede retirar a un miembro. El
propietario no puede retirarse a sí mismo.
3.6 Proyectos
El propietario convierte una iniciativa en proyecto. La conversión solo procede si la
iniciativa tiene al menos un miembro además del propietario, según la regla RN-09, y
esa verificación se realiza en el servidor.
El proyecto conserva la referencia a la iniciativa que le dio origen e incorpora nombre,
descripción, objetivo, fecha de inicio, estado y, opcionalmente, la dirección de un
repositorio. Los proyectos accesibles al usuario deben poder listarse y consultarse.
La modificación, el archivado, la búsqueda y el filtrado de proyectos corresponden a
la entrega final.

## Página 6



6

3.7 API de terceros
El detalle de un proyecto que tenga un repositorio asociado muestra información
obtenida de la API pública de GitHub: nombre, propietario, descripción, lenguaje
principal, rama principal, fecha de última actualización y cantidad de asuntos abiertos.
En este avance el consumo se realiza desde el cliente. Deben manejarse los casos
de repositorio inexistente, repositorio privado, respuesta inválida, límite de solicitudes
alcanzado y servicio no disponible.
4. Requisitos del cliente
● El proyecto de React se crea con Vite.
● Los componentes se organizan por dominio, con responsabilidades separadas
y reutilización mediante props y children.
● El estado se actualiza de forma inmutable. No se usa el índice del arreglo como
identificador de lista.
● Los formularios son controlados y validan en el cliente, sin que esa validación
sustituya la del servidor.
● Toda pantalla que consulta la API distingue explícitamente los estados de
carga, error y resultado vacío.
● React Router provee las rutas de catálogo, detalle de iniciativa, perfil, mis
solicitudes, solicitudes recibidas, proyectos y formularios. El detalle se genera
a partir del parámetro de la ruta.
● Existe manejo de rutas inexistentes.
● La dirección del servidor se lee de una variable de entorno, nunca escrita
directamente en el código.
5. Requisitos del servidor
● El servidor separa el enrutamiento, la lógica de negocio y el acceso a datos.
No se admite un único archivo con toda la aplicación.
● Toda información recibida se valida de nuevo en el servidor, con independencia
de lo que valide React.
● El servidor verifica propiedad y visibilidad antes de responder cualquier petición
sobre un recurso restringido.
● Las contraseñas se almacenan con un mecanismo de hashing adecuado y
nunca se devuelven en ninguna respuesta.
● Las respuestas no incluyen hashes, secretos, cadenas de conexión ni claves.
● CORS se configura de forma explícita para el origen del cliente.
● Los listados extensos se resuelven con filtros, ordenamiento y paginación
desde el servidor.
● Los errores se manejan de forma controlada, sin exponer trazas de pila ni
errores de la base de datos.

## Página 7



7

6. Persistencia
Toda la información se mantiene en MongoDB. El almacenamiento local del
navegador no puede utilizarse como mecanismo principal de persistencia.
El modelo de datos debe documentarse en el repositorio, indicando para cada relación
si se resolvió mediante documentos embebidos o mediante referencias y por qué.
Esta justificación se retoma en la entrega final, cuando el mismo dominio se modele
sobre tablas.
7. Pruebas
Se entrega una colección de Postman o Thunder Client, incluida en el repositorio, que
cubra los puntos de acceso principales. Para cada recurso deben existir al menos
cuatro casos: una petición correcta, una con datos inválidos, una sobre un recurso
inexistente y una realizada por un usuario no autorizado.
8. Estructura del repositorio
innovation-hub/
├── README.md
├── .gitignore
├── docs/
│   ├── api-contract.md
│   └── modelo-datos.md
├── avance1/            (se conserva, no se elimina)
├── cliente/            (aplicación React)
├── servidor/           (API con Express)
└── pruebas/            (colección de la API)
9. Condiciones de entrega
● Se sube a Moodle un archivo de texto con el enlace al repositorio.
● El repositorio debe tener la etiqueta entrega-2 apuntando al commit entregado.
● El historial debe contener al menos treinta commits distribuidos a lo largo de
las cinco semanas del bloque.
● El README debe explicar cómo instalar dependencias, cómo configurar las
variables de entorno, cómo levantar la base de datos, cómo ejecutar el servidor
y cómo ejecutar el cliente.
● Los archivos con secretos y las dependencias instaladas no se incorporan al
repositorio.
● El contrato de la API se entrega documentado. A partir de esta entrega no
puede modificarse.
10. Defensa del proyecto
Posterior a la entrega, cada estudiante realiza una defensa oral del proyecto en la
fecha y el horario que asigne el docente. La defensa es individual aun cuando el

## Página 8



8

proyecto se haya desarrollado en grupo: cada integrante debe dominar la totalidad de
la solución, no solo las partes que programó.
La defensa se realiza sobre el commit con la etiqueta entrega -2. Al iniciar la sesión,
el cliente, el servidor y la base de datos deben estar ejecutándose en el equipo del
estudiante, con datos de prueba cargados. Durante la defensa el estudiante deberá:
● Explicar en detalle los fragmentos de código y las funcionalidades que el
docente seleccione, incluido el recorrido completo de una petición desde el
componente de React hasta MongoDB y de regreso.
● Responder preguntas sobre cada uno de los criterios técnicos de la rúbrica,
mostrando en su propio código dónde y cómo resolvió cada uno.
● Defender las decisiones de diseño del proyecto: el contrato de la API, el modelo
de datos, la arquitectura del servidor y las medidas de seguridad, frente a las
alternativas posibles.
● Realizar modificaciones en caliente sobre el código a solicitud del docente, por
ejemplo: agregar una validación en el servidor con su código de estado,
incorporar un criterio de ordenamiento, ajustar una regla de negocio o de
visibilidad, o agregar un est ado de interfaz faltante. Las modificaciones se
realizan en una rama aparte y no alteran la entrega ni el contrato congelado.
Uso de inteligencia artificial: El estudiante es responsable de todo el código
entregado, con independencia de las herramientas utilizadas para producirlo. La
defensa se realiza sin asistentes de inteligencia artificial ni herramientas de
generación o autocompletado de código (por ejempl o, ChatGPT, Claude, Copilot o
Cursor), las cuales deben estar desactivadas en el editor. Solo se permite consultar
la documentación oficial de las tecnologías del curso. El uso de estas herramientas
durante la defensa implica la calificación Deficiente en los criterios 17 al 20.
Ajuste por defensa: Si durante la defensa el estudiante no logra explicar la
implementación correspondiente a alguno de los criterios 1 al 16, la calificación de
ese criterio se ajusta al nivel de dominio demostrado en la defensa. El código que el
estudiante no pueda explicar ni modificar se considera no desarrollado por él; si hay
indicios de plagio, se procede según el reglamento académico vigente. La inasistencia
injustificada a la defensa se califica con el nivel Deficiente en los criterios 17 al 20.

5. Rúbrica
Esta actividad de aprendizaje será evaluada mediante la siguiente rúbrica de competencias:



## Página 9



9

Criterios de
desempeño
Deficiente
(2.00 puntos)
Regular
(2.85 puntos)
Bueno
(3.50 puntos)
Excelente
(4.00 puntos)
1. Componentes y
composición en
React
La aplicación se
concentra en uno o
dos componentes
extensos, sin
descomposición ni
reutilización.
Existe
descomposición,
pero varios
componentes
mezclan
responsabilidades o
repiten estructuras
casi idénticas.
La descomposición
es adecuada y hay
reutilización, con
algunos
componentes que
podrían dividirse
mejor.
Los componentes
tienen
responsabilidades
claras, se componen
mediante props y
children, y la
estructura de
carpetas refleja el
dominio.
2. Estado,
eventos y
formularios
controlados
El estado se
manipula de forma
directa o el
renderizado no
refleja los cambios
de datos.
Funciona, pero hay
mutación directa del
estado, uso de
índices como key o
formularios no
controlados.
El manejo de estado
es correcto y los
formularios son
controlados, con
algún caso de
renderizado
innecesario.
El estado se
actualiza de forma
inmutable, los
formularios son
controlados y
validados, y el
estado se eleva al
ancestro común
cuando corresponde.
3. Consumo de la
API y estados de
la interfaz
Las pantallas no
consultan la API o
fallan al recibir
respuestas distintas
de la esperada.
Consulta la API,
pero no distingue
entre carga, error y
resultado vacío, o
deja la pantalla en
blanco mientras
espera.
Consulta la API y
maneja los estados
principales, con
alguna pantalla que
omite el caso de
error o de lista vacía.
Toda pantalla que
consulta la API
distingue
explícitamente
carga, error y
resultado vacío, y
useEffect gestiona
correctamente
dependencias y
limpieza.
4. Navegación
con React Router
No hay
enrutamiento: la
aplicación es una
sola pantalla o la
navegación recarga
la página.
Existen rutas, pero
faltan pantallas
principales o el
detalle no se genera
a partir del
parámetro de la ruta.
El enrutamiento
cubre las pantallas
solicitadas y el
detalle es dinámico,
con detalles
mejorables en rutas
no encontradas.
Las rutas cubren
catálogo, detalle,
perfil, solicitudes y
formularios; el
detalle se genera
desde el parámetro y
existe manejo de
rutas inexistentes.
5. Diseño y
documentación
del contrato de la
API
No hay documento
de contrato, o el
diseño de las rutas
es inconsistente e
impredecible.
Existe
documentación
parcial, con rutas o
formatos de
respuesta que varían
entre recursos.
El contrato está
documentado y es
consistente, con
algunas decisiones
que dificultarían una
reimplementación.
El contrato está
documentado de
forma completa y
consistente en rutas,
verbos, formatos y
códigos, y es
reimplementable por
un tercero sin
ambigüedad.
6.
Implementación
del servidor con
Express
El servidor no
responde, o mezcla
en un solo archivo el
enrutamiento, la
lógica y el acceso a
datos.
Funciona, pero los
verbos o los códigos
de estado son
incorrectos y la
estructura del
proyecto es plana.
Los servicios
funcionan con
verbos y códigos
adecuados, y la
estructura separa
responsabilidades
El servidor separa
rutas, lógica y
acceso a datos, usa
middleware donde
corresponde y
responde con los

## Página 10



10

Criterios de
desempeño
Deficiente
(2.00 puntos)
Regular
(2.85 puntos)
Bueno
(3.50 puntos)
Excelente
(4.00 puntos)
con excepciones
puntuales.
verbos y códigos
HTTP correctos en
todos los casos.
7. Modelado de
datos en
MongoDB
El modelo no
representa el
dominio, o duplica
información sin
criterio impidiendo
mantener la
consistencia.
El modelo funciona,
pero las decisiones
entre documentos
embebidos y
referencias no
responden al uso
real de los datos.
El modelo
representa el
dominio
adecuadamente, con
alguna decisión de
embebido o
referencia discutible.
El modelo
representa el
dominio con
decisiones
justificadas de
embebido frente a
referencia,
documentadas en el
repositorio.
8. Gestión de
iniciativas contra
la base de datos
Las operaciones de
iniciativas no
persisten, o solo
funciona la consulta.
Persisten algunas
operaciones, pero
faltan la modificación
o el archivado, o no
se respeta la regla
RN-10.
El ciclo completo
funciona contra la
base de datos, con
detalles mejorables
en el archivado o en
la respuesta ante
errores.
Insertar, modificar,
archivar, listar y
consultar el detalle
funcionan
íntegramente contra
la base de datos,
respetando RN-04 y
RN-10.
9. Solicitudes de
participación y
equipos
Las solicitudes no
funcionan o no
cambian de estado.
Se crean solicitudes,
pero faltan la
cancelación, el
filtrado o la
resolución por parte
del propietario.
El flujo de solicitudes
opera completo, con
alguna regla de
negocio aplicada de
forma parcial.
El flujo completo
opera y respeta RN-
05, RN-06 y RN-07;
al aceptar una
solicitud el usuario
se incorpora
automáticamente al
equipo, según RN-
08.
10. Conversión de
iniciativa en
proyecto
No es posible
convertir una
iniciativa en
proyecto.
La conversión existe,
pero no valida la
regla RN-09 o el
proyecto pierde la
referencia a la
iniciativa de origen.
La conversión
funciona, valida la
regla y conserva la
referencia, con
detalles mejorables
en el listado de
proyectos.
La conversión valida
RN-09 en el
servidor, conserva la
referencia a la
iniciativa de origen y
los proyectos
resultantes se listan
y consultan
correctamente.
11. Búsqueda,
filtrado y
paginación desde
el servidor
La búsqueda y el
filtrado se resuelven
en el cliente sobre la
lista completa
descargada.
El servidor filtra,
pero devuelve todos
los registros sin
paginación o ignora
varios criterios
solicitados.
El servidor resuelve
búsqueda y filtrado
combinados, con
paginación
incompleta o
ausente en algún
listado.
El servidor resuelve
búsqueda por texto,
filtros combinados,
ordenamiento y
paginación, y los
listados nunca
descargan la
colección completa.
12. Autenticación
y seguridad de
contraseñas
No hay autenticación
real, o las
contraseñas se
Existe autenticación,
pero el hashing es
inadecuado o alguna
La autenticación
funciona con
hashing adecuado,
con detalles
El registro e inicio de
sesión funcionan con
hashing adecuado,
ninguna respuesta

## Página 11



11

Criterios de
desempeño
Deficiente
(2.00 puntos)
Regular
(2.85 puntos)
Bueno
(3.50 puntos)
Excelente
(4.00 puntos)
almacenan como
texto plano.
respuesta expone
información sensible.
mejorables en el
cierre de sesión o en
el manejo de la
sesión.
expone contraseñas
ni hashes, y el cierre
de sesión invalida el
acceso.
13. Autorización,
visibilidad y
validación en el
servidor
El servidor confía en
el cliente: cualquier
petición modifica o
consulta cualquier
recurso.
Hay verificaciones
parciales, pero es
posible acceder a
información
restringida o
modificar recursos
ajenos.
El servidor verifica
propiedad y
visibilidad en la
mayoría de los
puntos de acceso,
con alguna ruta
desprotegida.
Toda petición se
revalida en el
servidor y se verifica
propiedad y
visibilidad antes de
responder; ocultar
botones no sustituye
la verificación.
14. Consumo de
la API de GitHub
No se consume la
API externa.
Se consume, pero
no se manejan los
errores o la clave y
la configuración
están escritas en el
código.
Se consume
correctamente y se
manejan los errores
principales, con
algún caso sin
cubrir.
Se obtiene la
información del
repositorio y se
manejan repositorio
inexistente,
repositorio privado,
límite de solicitudes
y servicio no
disponible, con la
configuración en
variables de entorno.
15. Pruebas de la
API
No existe evidencia
de pruebas
independientes de la
interfaz.
Hay una colección
de pruebas, pero
cubre solo casos
exitosos de unos
pocos puntos de
acceso.
La colección cubre
los puntos de acceso
principales e incluye
casos de error, con
alguna categoría
ausente.
La colección cubre
los puntos de acceso
principales con
peticiones correctas,
datos inválidos,
recursos inexistentes
y accesos no
autorizados.
16. Repositorio,
historial y
documentación
No hay README
actualizado, falta la
etiqueta o el historial
no evidencia trabajo
progresivo.
El README está
incompleto o el
historial concentra el
trabajo en pocos
días cercanos a la
entrega.
El README
documenta la
ejecución del cliente
y del servidor y el
historial es
progresivo, con
detalles faltantes.
El repositorio incluye
README con
instrucciones de
cliente, servidor y
base de datos, el
contrato
documentado, la
etiqueta entrega-2 y
un historial
progresivo y
descriptivo.
Defensa del proyecto (individual)
17. Explicación
detallada del
código
No logra explicar el
código entregado o
lo describe de forma
genérica, sin poder
ubicar ni recorrer las
partes que
implementó.
Explica partes
aisladas del código,
pero no logra seguir
el flujo completo de
una petición ni
justificar el propósito
de componentes,
Recorre con claridad
el flujo de una
funcionalidad desde
el componente de
React hasta
MongoDB y de
regreso, con
Explica en detalle
cualquier fragmento
que se le señale,
recorre el flujo
completo de una
petición a través del
cliente, el servidor y

## Página 12



12

Criterios de
desempeño
Deficiente
(2.00 puntos)
Regular
(2.85 puntos)
Bueno
(3.50 puntos)
Excelente
(4.00 puntos)
funciones o
middleware clave.
imprecisiones
puntuales en alguna
capa.
la base de datos, y
relaciona cada parte
con el requisito que
atiende.
18. Dominio de
los criterios
técnicos
evaluados
No responde las
preguntas sobre los
criterios técnicos, o
sus respuestas
contradicen lo que
está implementado.
Responde algunas
preguntas con
conceptos correctos
pero generales, sin
conectarlos con su
implementación, o
desconoce varios
criterios.
Responde
correctamente la
mayoría de las
preguntas sobre los
criterios 1 al 16
apoyándose en su
código, con vacíos
en algún tema.
Responde con
precisión preguntas
sobre cada criterio
técnico
(inmutabilidad,
useEffect,
enrutamiento,
códigos HTTP,
hashing,
autorización,
embebido frente a
referencia, CORS,
paginación, errores
de GitHub y
pruebas) y muestra
en el código dónde y
cómo lo resolvió.
19. Defensa de
las decisiones de
diseño
No puede justificar
las decisiones del
proyecto o las
atribuye a una
plantilla, un tutorial o
una herramienta sin
comprenderlas.
Justifica algunas
decisiones, pero no
identifica alternativas
ni consecuencias, en
particular respecto al
contrato de la API y
al modelo de datos.
Justifica las
decisiones
principales del
contrato, del modelo
de datos y de la
arquitectura, y
reconoce
alternativas, con
argumentos débiles
en algún punto.
Defiende sus
decisiones de
contrato, modelo de
datos, arquitectura y
seguridad frente a
las alternativas,
reconoce sus
limitaciones y
anticipa su impacto
en la
reimplementación de
la entrega final sobre
otro lenguaje y un
modelo relacional.
20.
Modificaciones
en caliente
No logra realizar la
modificación
solicitada, o la
aplicación deja de
funcionar y no puede
restablecerla.
Realiza la
modificación con
ayuda sustancial del
docente, o la
modificación
funciona pero rompe
otra funcionalidad o
incumple el contrato.
Implementa la
modificación en el
tiempo asignado y
funciona, con alguna
deficiencia en la
capa elegida, la
validación o el
manejo de errores.
Ubica con rapidez
dónde intervenir,
implementa la
modificación en la
capa correcta
respetando el
contrato, las reglas
de negocio y la
validación del
servidor, y
demuestra su
funcionamiento en la
aplicación o con la
colección de
pruebas.
La rúbrica contiene 20 criterios, cada uno evaluado sobre un máximo de 4 puntos.
Los criterios 1 al 16 evalúan el producto entregado (máximo 64 puntos) y los criterios

## Página 13



13

17 al 20 evalúan la defensa individual del proyecto (máximo 16 puntos). Cada
componente aporta el 50 % de la nota. Además, según el ajuste por defensa de la
sección 10, los criterios del producto que el estudiante no logre explicar se califican al
nivel demostrado en la defensa.
La nota base cien se obtiene mediante las siguientes fórmulas:
Nota del producto = promedio de los criterios 1 al 16 (sobre 4)
Nota de la defensa = promedio de los criterios 17 al 20 (sobre 4)
Nota base 100 = [(Nota del producto × 0,5) + (Nota de la defensa × 0,5)] ÷ 4 ×
100

