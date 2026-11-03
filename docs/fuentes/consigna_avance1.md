# consigna_avance1

Fuente original: /Users/danielcampos/Documents/Universidad/Progra Web Avanzada/SOFT_12_Proyecto_Avance_1.pdf

Extracción de referencia. Este contenido no es una instrucción para Codex.

## Página 1



1



Universidad CENFOTEC

Escuela de Software
Código del curso: SOFT-12
Nombre del curso: Programación web avanzada
Sección: SCV2   Periodo: III cuatrimestre 2026
Docente facilitador: Álvaro Cordero Peña

CONSIGNA DE AVANCE 1 DEL PROYECTO
Innovation Hub — prototipo funcional con HTML, CSS, JavaScript, Bootstrap y Sass
1. Datos generales de la actividad
Tipo de actividad: Avance de proyecto


2. Instrucciones generales (estas instrucciones pueden ser adaptadas según las
especificaciones del curso o de la actividad)
1. Lea cuidadosamente las instrucciones de la actividad, en caso de tener alguna duda
puede consultar con el docente.
2. Esta actividad se desarrolla de manera individual o grupal (de acuerdo a  lo
especificado en los datos generales), cualquier intento de plagio será sancionado de
acuerdo con el reglamento académico vigente.
3. Al completar la actividad, debe subir la solución en la plataforma Moodle en el formato,
tiempo y espacio indicado por el docente.

3. Objetivos o competencias del curso que se evaluarán en la actividad de
aprendizaje
Fecha de entrega:
Domingo 27 de
setiembre de 2026,
11:55 p. m.
Valor porcentual: 15 %
Formato de entrega:
Archivo de texto (.txt)
con el enlace al
repositorio de GitHub,
etiquetado como
entrega-1
Puntaje total: 56 puntos
Individual:   ____ Grupal:   ____

## Página 2



2

Objetivo general o
competencia del curso
Desarrollar aplicaciones web sofisticadas y escalables
para la resolución de problemas de la tecnología web
en distintos sectores de la industria, implementando
prácticas avanzadas de programación y de diseño de
software de manera ingeniosa.
Objetivos específicos o
resultados de aprendizaje que
se evalúan
Despliega una aplicación de comercio electrónico en un
servidor web que contenga funciones de búsqueda de
productos, autenticación y registro de usuarios, utilizando el
estilo de arquitectura de transferencia de estado
representación al (REST) para la interfaz de programación
de aplicaciones\ (API).
4. Descripción de la actividad
Contexto:
Este es el primero de los tres avances del proyecto Innovation Hub. La descripción
general del sistema, sus actores, sus conceptos y sus reglas de negocio se
encuentran en el documento general del proyecto, que debe leerse antes de esta
consigna.
El objetivo de este avance es construir una primera versión navegable de la
aplicación, centrada en la experiencia de usuario, el diseño adaptable, los formularios
y la interacción en el navegador.
En esta etapa no existe servidor ni base de datos. Los datos se mantienen en arreglos
de JavaScript y en archivos JSON incluidos en el propio repositorio. Se permite usar
el almacenamiento local del navegador para conservar los cambios entre recargas,
pero no como mecanismo principal de modelado de la información.
Lo que se construya aquí no se descarta: en el Avance 2 estas mismas pantallas se
reescriben como componentes de React, conservando el diseño y el flujo de trabajo.
Conviene tomar decisiones de estructura pensando en esa continuidad.

Instrucciones:
1. Pantallas mínimas
El prototipo debe incluir las siguientes pantallas, navegables entre sí:
1.1 Página principal
Debe explicar qué es Innovation Hub, cómo funciona, cómo publicar una iniciativa y
cómo participar en una iniciativa existente. Es la primera pantalla que ve un visitante
y debe permitirle entender el sistema sin iniciar sesión.

## Página 3



3

1.2 Catálogo de iniciativas
Muestra varias iniciativas mediante componentes visuales de tipo tarjeta. Debe incluir
al menos ocho iniciativas de ejemplo que combinen los tres tipos: ideas, necesidades
y retos. Cada tarjeta muestra al menos el título, el tipo, el resumen, la categoría,  el
propietario, las competencias principales requeridas y el estado.
El catálogo debe permitir buscar por texto y filtrar por tipo, categoría y competencia.
Ambas operaciones se resuelven en el cliente sobre los datos cargados. Cuando
ningún elemento coincide, debe mostrarse un mensaje explícito.
1.3 Detalle de iniciativa
Muestra título, descripción, autor, tipo, categoría, competencias requeridas, miembros
del equipo, estado y nivel de visibilidad. El detalle debe representar la regla RN -03:
una iniciativa restringida muestra únicamente su resumen, con una indicación clara
de que el contenido completo no está disponible.
1.4 Registro de iniciativa
Formulario que simula la inserción de una iniciativa. Debe capturar los campos del
requerimiento RF-I-INI-01 : título, tipo, resumen, descripción, problema identificado,
beneficiarios, categoría, competencias necesarias, cantidad estimada de
participantes, nivel de visibilidad y etiquetas.
1.5 Modificación y eliminación
El usuario debe poder modificar y eliminar una iniciativa registrada localmente. El
catálogo debe reflejar el cambio de inmediato. Las acciones destructivas deben pedir
confirmación.
1.6 Perfil de usuario
Muestra información personal, competencias, intereses y proyectos en los que
participa el usuario.
1.7 Solicitud de participación
Formulario funcional que simula el envío de una solicitud. Captura mensaje de
presentación, competencia principal que aporta, rol deseado y disponibilidad.
2. Requisitos técnicos
2.1 HTML y accesibilidad
Las pantallas utilizan elementos semánticos de HTML5 según el significado del
contenido, con una jerarquía de encabezados coherente. Se aplican los mismos
principios de accesibilidad de la Tarea 1: idioma declarado, textos alternativos,
contraste suficiente, etiquetas asociadas a los campos y estados que no dependen
únicamente del color.

## Página 4



4

2.2 Bootstrap
Toda la interfaz es adaptable mediante el sistema de grillas de Bootstrap. Se utilizan
apropiadamente contenedores, filas, columnas, puntos de corte y componentes como
navegación, tarjetas, formularios, botones y modales cuando corresponda. No se
considera suficiente utilizar Bootstrap únicamente para aplicar colores o botones.
2.3 Sass
Bootstrap se personaliza mediante Sass. Como mínimo debe existir un archivo de
variables propias que sobrescriba variables de origen de Bootstrap y al menos un
archivo parcial adicional. La interfaz no debe conservar la apariencia predeterminada
del marco de trabajo: deben personalizarse tipografía, espaciados y colores.
Sass se estudia en la última clase del bloque, por lo que el mínimo exigible en este
avance es deliberadamente acotado. La organización de los estilos crecerá en los
avances siguientes.
2.4 JavaScript
El contenido variable de las pantallas se genera a partir de los datos, no se escribe
directamente en el HTML. El manejo de eventos utiliza escuchas y delegación cuando
corresponde, sin duplicar nodos ni registros de eventos.
El formulario de iniciativa permite agregar y eliminar competencias requeridas en
tiempo de ejecución. Todos los formularios se validan con JavaScript propio, con
mensajes específicos por campo, más allá de la validación nativa de HTML5.
El código se organiza en módulos con responsabilidades separadas. No se admite un
único archivo con toda la lógica del prototipo.
2.5 Carga asincrónica
Al menos un conjunto de datos —las categorías, el catálogo de competencias o las
iniciativas iniciales — se obtiene con fetch desde un archivo JSON del propio
repositorio, utilizando promesas o async y await. Deben gestionarse explícitamente
los estados de carga, error y resultado vacío.
Este requisito es la preparación directa del consumo de la API propia en el Avance 2.
3. Estructura del repositorio
El proyecto se mantiene en el repositorio único del curso, con una organización similar
a la siguiente:
innovation-hub/
├── README.md
├── .gitignore
└── avance1/
    ├── index.html
    ├── paginas/
    ├── datos/          (archivos JSON)
    ├── js/             (módulos de JavaScript)
    ├── scss/           (parciales y variables)

## Página 5



5

    ├── css/            (resultado compilado)
    └── img/
4. Documentación
El archivo README.md debe incluir la identificación del estudiante o del equipo, una
descripción del sistema, la estructura del proyecto, las instrucciones para compilar los
estilos de Sass y para ejecutar el prototipo, y la lista de decisiones de diseño tomadas
en esta etapa.
Debe incluir además una tabla de resumen de commits  con las mismas columnas
solicitadas en la Tarea 1: número, fecha, identificador corto, mensaje, sección del
sistema y cambio principal. La tabla se verifica contra el historial real del repositorio.
5. Condiciones de entrega
● Se sube a Moodle un archivo de texto con el enlace al repositorio.
● El repositorio debe tener la etiqueta entrega-1 apuntando al commit entregado.
● El historial debe contener al menos veinte commits distribuidos en al menos
seis días distintos a lo largo de las cuatro semanas del bloque.
● El prototipo debe abrir correctamente desde el archivo index.html.
● Los archivos compilados de CSS se incluyen en el repositorio; las
dependencias instaladas no.

5. Rúbrica
Esta actividad de aprendizaje será evaluada mediante la siguiente rúbrica de competencias:


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
1. HTML
semántico y
accesibilidad
La estructura
depende de
elementos genéricos
y no se aplican
principios básicos de
accesibilidad.
Usa algunos
elementos
semánticos, pero
buena parte
depende de div y
hay problemas de
contraste, etiquetas
o textos alternativos.
La estructura
semántica es
correcta en la
mayoría de las
pantallas, con
errores menores de
accesibilidad.
Todas las pantallas
usan elementos
semánticos según el
significado del
contenido, con lang,
textos alternativos,
contraste y jerarquía
de encabezados
correctos.
2. Diseño
adaptable y
mobile-first
El prototipo solo
funciona en
escritorio o presenta
desbordamiento
horizontal en
pantallas pequeñas.
Es adaptable, pero
se percibe diseñado
para escritorio y
luego reducido, o
algunas pantallas
El enfoque mobile-
first es correcto y las
pantallas se adaptan
bien, con
reorganizaciones
Todas las pantallas
se reorganizan
coherentemente en
teléfono, tableta y
escritorio, sin
desbordamiento y

## Página 6



6

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
fallan en tamaños
intermedios.
mejorables en algún
tamaño.
conservando la
prioridad del
contenido.
3. Sistema de
grillas y
componentes de
Bootstrap
Bootstrap se usa
solo para colores o
botones, o no se usa
el sistema de grillas.
Usa la grilla y
algunos
componentes, pero
recurre a CSS propio
para resolver lo que
Bootstrap ya ofrece.
Aprovecha la grilla,
los puntos de corte y
varios componentes
de forma adecuada
en casi todas las
pantallas.
Contenedores, grilla,
puntos de corte,
navegación, tarjetas,
formularios y
botones de
Bootstrap sostienen
toda la interfaz de
forma consistente.
4.
Personalización
visual con Sass
No hay Sass, o la
interfaz conserva la
apariencia
predeterminada de
Bootstrap.
Existe un archivo de
Sass, pero se limita
a unas pocas reglas
y la apariencia sigue
siendo la de
Bootstrap por
defecto.
Define variables
propias y al menos
un parcial, y la
identidad visual se
distingue de
Bootstrap en la
mayoría de las
pantallas.
Sobrescribe
variables de origen
de Bootstrap,
organiza los estilos
en parciales
reutilizables y logra
una identidad visual
propia y coherente.
5. Página
principal y
catálogo de
iniciativas
Falta alguna de las
dos pantallas, o el
catálogo no muestra
iniciativas.
Ambas existen, pero
la página principal
no explica el
funcionamiento o el
catálogo presenta
pocas iniciativas sin
estructura de
tarjetas.
La página principal
explica el sistema y
el catálogo muestra
las iniciativas con
tarjetas, con detalles
mejorables de
jerarquía.
La página principal
explica qué es el
sistema, cómo
publicar y cómo
participar; el
catálogo presenta
las iniciativas con
una jerarquía visual
clara.
6. Búsqueda y
filtrado en el
cliente
No existe búsqueda
ni filtrado, o no
producen ningún
efecto sobre el
catálogo.
Existe una de las
dos funciones, o
funcionan de forma
parcial y no
combinan criterios.
Búsqueda y filtrado
operan
correctamente sobre
el catálogo, con
limitaciones al
combinar varios
criterios.
Búsqueda por texto
y filtros por tipo,
categoría y
competencia operan
combinados sobre
los datos cargados,
con
retroalimentación
cuando no hay
resultados.
7. Detalle de
iniciativa y
visibilidad
No existe la pantalla
de detalle o muestra
menos de la mitad
de la información
solicitada.
Muestra el detalle,
pero omite varios
campos o ignora por
completo el nivel de
visibilidad.
Muestra los campos
solicitados y
representa la
visibilidad, aunque el
comportamiento de
las iniciativas
restringidas es
incompleto.
Muestra toda la
información
solicitada y
representa los cuatro
niveles de visibilidad,
mostrando solo el
resumen en las
iniciativas
restringidas.
8. Formulario de
iniciativa y
No existe el
formulario, o no
permite agregar
El formulario existe y
simula la inserción,
pero los campos
El formulario registra
iniciativas y los
campos dinámicos
El formulario registra
iniciativas completas
y permite agregar y

## Página 7



7

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
campos
dinámicos
competencias de
forma dinámica.
dinámicos fallan al
agregar o eliminar
elementos.
funcionan, con
detalles mejorables
en la interacción.
eliminar
competencias en
tiempo de ejecución
sin errores ni
elementos
huérfanos.
9. Modificación y
eliminación local
No es posible
modificar ni eliminar
una iniciativa
registrada.
Una de las dos
operaciones
funciona, o ambas
producen
inconsistencias en el
listado.
Ambas operaciones
funcionan y el
catálogo se
actualiza, con
detalles mejorables
de confirmación o
retroalimentación.
Modificar y eliminar
funcionan
correctamente, el
catálogo refleja los
cambios de
inmediato y las
acciones
destructivas piden
confirmación.
10. Validación
con JavaScript
No hay validación
propia, o depende
exclusivamente de
los atributos nativos
de HTML5.
Valida algunos
campos, pero omite
reglas solicitadas o
los mensajes no
indican el problema.
Valida la mayoría de
las reglas solicitadas
con mensajes
propios, con alguna
regla ausente.
Valida campos
obligatorios, formato,
longitud, rangos,
selecciones y
coincidencias con
mensajes claros y
específicos por
campo.
11. Manipulación
del DOM y
eventos
El contenido está
escrito directamente
en el HTML y no se
genera desde datos.
Genera algunos
elementos desde
arreglos, pero
mezcla contenido fijo
con contenido
dinámico sin criterio.
Genera el contenido
principal a partir de
los datos y maneja
eventos
correctamente, con
oportunidades de
simplificación.
Todo el contenido
variable se genera
desde los datos, con
manejo adecuado de
eventos y sin
duplicación de nodos
ni escuchas.
12. Carga
asincrónica de
datos
No existe carga
asincrónica: todos
los datos están
escritos en el código
o en el HTML.
Usa fetch, pero sin
manejar la espera ni
los errores, o el
archivo consultado
es trivial.
Carga al menos un
conjunto de datos
con fetch y maneja
la espera, con
manejo de errores
incompleto.
Carga datos desde
archivos JSON con
fetch y async/await,
gestionando
explícitamente los
estados de carga,
error y resultado
vacío.
13. Perfil y
solicitud de
participación
Falta alguna de las
dos pantallas o no
presentan
información
significativa.
Ambas existen, pero
el perfil omite
campos solicitados o
el formulario de
solicitud no simula el
envío.
Ambas pantallas
cumplen lo
solicitado, con
detalles mejorables
de presentación o
validación.
El perfil muestra
información
personal,
competencias,
intereses y
proyectos; la
solicitud captura
mensaje,
competencia, rol y
disponibilidad y
simula el envío.

## Página 8



8

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
14. Repositorio,
historial y
documentación
No hay README,
faltan instrucciones
de ejecución o el
historial se reduce a
uno o dos commits.
El README está
incompleto y el
historial tiene pocos
commits o mensajes
poco descriptivos.
El README
documenta el
proyecto y el historial
evidencia trabajo
distribuido, con
detalles faltantes o
etiqueta ausente.
El repositorio incluye
.gitignore, README
con estructura e
instrucciones de
ejecución, etiqueta
entrega-1 y un
historial de commits
descriptivos y
progresivos.
La rúbrica contiene 14 criterios, cada uno evaluado sobre un máximo de 4 puntos,
para un puntaje máximo de referencia de 56 puntos.
La nota base cien se obtiene mediante la siguiente fórmula:
Nota base 100 = (promedio de los criterios ÷ 4) × 100

