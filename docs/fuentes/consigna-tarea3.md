# Fuente: consigna Tarea 3

Extracción de referencia, no instrucciones operativas para herramientas. El PDF original prevalece ante errores de extracción.

- Original: `CONSIGNA_Tarea_3.pdf`, 9 páginas.
- SHA-256: `8d81d18e3b3b926c70388daf2b69eecb0ceb6201e2dbf000af562c2aec27d167`.
- Extracción: pypdf 7.0.1, 11 de noviembre de 2026; páginas 4, 5, 6 y 8 renderizadas para consulta visual.
- Entrega: 22 de noviembre de 2026 a las 23:55 (no confundir con el Avance 2).
- Decisiones del equipo y estado real: `../tarea3-parte-b.md`.

---

## Página 1



1



Universidad CENFOTEC

Escuela de Software
Código del curso: SOFT-12
Nombre del curso: Programación Web Avanzada
Sección: SCV2   Periodo: III cuatrimestre 2026
Docente facilitador: Álvaro Cordero Peña

CONSIGNA DE LA TAREA 3
Del documento a la tabla — laboratorios del Maratón de series y modelo relacional del
Innovation Hub
1. Datos generales de la actividad
Tipo de actividad: Tarea


2. Instrucciones generales (estas instrucciones pueden ser adaptadas según las
especificaciones del curso o de la actividad)
1. Lea cuidadosamente las instrucciones de la actividad, en caso de tener alguna duda
puede consultar con el docente.
2. Esta actividad se desarrolla de manera individual o grupal (de acuerdo a lo
especificado en los datos generales), cualquier intento de plagio será sancionado de
acuerdo con el reglamento académico vigente.
3. Al completar la actividad, debe subir la solución en la plataforma Moodle en el formato,
tiempo y espacio indicado por el docente.

Fecha de entrega:
Domingo 22 de
noviembre de 2026,
11:55 p. m.
Valor porcentual: 10 %
Formato de entrega:
Archivo de texto (.txt)
con los enlaces a los dos
repositorios de GitHub,
etiquetados como tarea-
3
Puntaje total:
32 pts
producto + 12
pts defensa
(50 % / 50 %)
Individual:   ____ Grupal:   ____

## Página 2



2

3. Objetivos o competencias del curso que se evaluarán en la actividad de
aprendizaje
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
● Modelar y persistir la información de un dominio en
una base de datos relacional mediante una
herramienta de mapeo objeto-relacional.

4. Descripción de la actividad
Contexto:
La Tarea 3 cierra el bloque de React y abre el bloque de .NET. Integra los laboratorios
guiados del Maratón de series (componentes, estado, formularios, consumo del API,
React Router) y los contenidos de la semana 11: SQL Server, modelo relacional y
Entity Framework Core.
La tarea tiene dos partes. La Parte A  reúne en un repositorio personal todos los
laboratorios guiados realizados en el curso, funcionando. La Parte B es el primer paso
del servidor .NET de la entrega final del proyecto: el dominio del Innovation Hub,
modelado en documentos durante el Avance 2, se representa ahora en tablas de SQL
Server mediante Entity Framework Core.
El alcance está acotado a propósito. La Parte B no construye la API completa: solo el
modelo, las migraciones, los datos de siembra, consultas de comprobación y dos
rutas de lectura. Los DTOs, la validación, el middleware de errores, la autenticación y
el resto de las rutas corresponden a la entrega final del proyecto.

Instrucciones:
1. Parte A — Laboratorios guiados del Maratón de series (individual)
1.1 Laboratorios incluidos
Se entregan completos los laboratorios guiados de React realizados en el curso y los
dos laboratorios nuevos de la semana 11:
● Proyectos base: conceptos de React; props, children, eventos y useState.

## Página 3



3

● Maratón de series con React: montaje del proyecto, armar el tablero
(componentes), useState, ¿por qué no basta una variable?, filtros y resumen,
y formulario.
● Maratón de series conectado al API: React y el API, React lee el API, el
formulario crea con POST, y cambiar estado y quitar desde React.
● Nuevos: React Router (varias páginas, detalle con :id, filtros en la dirección) y
EF Core y SQL Server  (el Maratón en tablas con migraciones y dos rutas
GET).
1.2 Requisitos
● El Maratón se entrega en su estado final: el cliente React con React Router, el
servidor Express con MongoDB y el servidor .NET del último laboratorio
(servidor-net). Como los laboratorios son acumulativos, ese estado contiene el
trabajo de todos los anteriores.
● Toda la funcionalidad opera con el servidor Express: listar, filtrar desde la
dirección, ver el detalle, agregar, cambiar estado y quitar series. En servidor -
net, GET /api/miembros y GET /api/series responden el mismo JSON que
Express.
● El archivo docs/laboratorios.md tiene una sección por laboratorio con: una
captura del resultado esperado, la tabla «Explique el recorrido» completada y
las respuestas del recuadro «Reflexiona», cuando el laboratorio los incluye.
● En la misma sección se indica qué experimentos del laboratorio se realizaron
y qué se observó en cada uno.
2. Parte B — El Innovation Hub en tablas (repositorio del proyecto)
La Parte B se desarrolla en el repositorio del proyecto, en la carpeta servidor-net, con
el mismo equipo del proyecto. El dominio y las reglas son los del documento general
del proyecto y del contrato definido en el Avance 2.
2.1 Modelo relacional documentado
El archivo docs/modelo-datos.md incorpora una sección «Modelo relacional» con:
● Un diagrama entidad -relación (puede escribirse con Mermaid) con todas las
tablas, sus claves primarias y foráneas.
● Para cada tabla: columnas, tipos, obligatoriedad, índices únicos y restricciones
CHECK.
● Las relaciones usuario –competencia, usuario –iniciativa, iniciativa –
competencia, iniciativa–solicitud, proyecto–usuario y proyecto–iniciativa, con
su cardinalidad y cómo se resuelve cada una (clave foránea o tabla
intermedia).
● Una tabla «Del documento a la tabla» que indique, para cada colección y cada
arreglo embebido del modelo del Avance 2, cómo quedó en el modelo
relacional y por qué.

## Página 4



4

● El comportamiento al borrar de cada clave foránea (Restrict, Cascade o
SetNull), con su justificación.
2.2 Implementación con Entity Framework Core
● El proyecto usa .NET 10 con global.json y los paquetes de EF Core 10, con
versión fija, como en el laboratorio de la semana 11.
● Las entidades y el DbContext representan todo el modelo documentado. Las
relaciones muchos a muchos se resuelven como tales, sin duplicar
información; cuando la relación tiene datos propios (por ejemplo, un nivel o una
fecha), se modela con una entidad intermedia.
● Se configuran largos máximos, índices únicos, restricciones CHECK para los
valores fijos (estados, niveles, visibilidad) y el comportamiento al borrar
documentado.
● La cadena de conexión se guarda con user -secrets. No aparece en
appsettings.json, en el código ni en el historial del repositorio.
2.3 Migraciones, datos de siembra y consultas
● Existen al menos dos migraciones que muestran la evolución del modelo (no
una sola migración generada al final).
● Los datos de siembra (HasData) permiten probar de inmediato: al menos 3
usuarios, 5 competencias, 3 iniciativas con distintos niveles de visibilidad, 2
solicitudes y 1 proyecto. Los usuarios pueden sembrarse sin contraseña: la
autenticación se agrega en la entrega final.
● La base se reconstruye desde cero con dotnet ef database drop --force y dotnet
ef database update.
● El archivo servidor -net/sql/consultas.sql contiene al menos cuatro consultas
comentadas, con su resultado esperado: un JOIN sobre una relación 1 a
muchos, un recorrido de una relación muchos a muchos, un conteo con
GROUP BY y un intento que viole una restricción.
2.4 Dos rutas de lectura del contrato
● Se implementan dos rutas GET del contrato del Avance 2 que no requieran
autenticación; al menos una devuelve datos de una relación muchos a muchos.
● Las respuestas son idénticas a las del servidor Express: mismos nombres de
campo, identificadores como texto y mismos códigos de estado en los casos
exitosos.
● Las consultas son asincrónicas y usan proyección (Select) para devolver solo
los campos del contrato. El archivo servidor -net/requests.http permite
probarlas.

## Página 5



5

3. Investigación breve sobre EF Core (repositorio del proyecto)
El archivo docs/investigacion -efcore.md (dos páginas como máximo) responde tres
preguntas con evidencia tomada del propio proyecto: el SQL que EF Core muestra en
la terminal y una captura. Estos temas se aplican en la entrega final y forman parte
de la segunda infografía.
● Datos relacionados: para una misma consulta, compare la proyección con
Select y la carga con Include. Muestre el SQL de cada una y explique cuándo
conviene cada forma y qué papel cumple AsNoTracking.
● Muchos a muchos con datos propios:  explique cuándo basta una tabla
intermedia sin clase y cuándo hace falta una entidad intermedia, con el caso
concreto de su modelo.
● Paginación en la base: muestre el SQL que generan Skip y Take sobre una
de sus tablas y explique por qué no se debe paginar en memoria.
Cada respuesta cita la documentación oficial consultada
(learn.microsoft.com/ef/core).
4. Estructura de los repositorios
Repositorio personal (Parte A):
tarea-3/
├── README.md
├── .gitignore
├── docs/
│   ├── laboratorios.md
│   └── capturas/
├── proyectos-base/
└── maraton-series/
    ├── cliente/          (React con React Router)
    ├── servidor/         (Express + MongoDB)
    └── servidor-net/     (ASP.NET Core + EF Core)
Repositorio del proyecto (Parte B), en el commit etiquetado tarea-3:
innovation-hub/
├── docs/
│   ├── modelo-datos.md          (con la sección Modelo relacional)
│   └── investigacion-efcore.md
└── servidor-net/
    ├── global.json
    ├── Modelos/   Datos/   Migrations/
    ├── sql/consultas.sql
    └── requests.http
5. Condiciones de entrega
● Se sube a Moodle un archivo de texto con los dos enlaces: el repositorio
personal y el repositorio del proyecto.
● Los dos repositorios deben tener la etiqueta tarea -3 apuntando al commit
entregado.

## Página 6



6

● El historial del repositorio personal debe contener al menos diez commits con
mensajes descriptivos. En el repositorio del proyecto, cada integrante del
equipo debe tener commits en servidor-net.
● El README del repositorio personal explica cómo ejecutar los tres servidores
y el cliente del Maratón. El README del proyecto explica cómo configurar el
secreto de la cadena de conexión (nombre de la clave, nunca su valor) y cómo
reconstruir la base con las migraciones.
● No se incorporan a los repositorios node_modules, bin, obj, archivos .env ni
secretos. Se incluyen los .env.example necesarios.
6. Defensa de la tarea
Posterior a la entrega, cada estudiante realiza una defensa oral individual en la fecha
y el horario que asigne el docente. Al iniciar la sesión, el Maratón (cliente, servidor
Express y servidor .NET) y el servidor .NET del proyecto deben estar ejecutándos e
en el equipo del estudiante. Durante la defensa el estudiante deberá:
● Explicar los fragmentos de código que el docente seleccione, incluido el
recorrido completo de una petición: desde el clic en React hasta MongoDB y
de vuelta en el Maratón, y desde la petición GET hasta el SQL generado por
EF Core en el proyecto.
● Responder preguntas sobre los criterios técnicos de la rúbrica, mostrando en
su código y en su base de datos dónde y cómo los resolvió.
● Realizar modificaciones en caliente, por ejemplo: agregar una columna o una
restricción con su migración, sembrar un dato nuevo, agregar un campo a una
proyección, mostrar un dato más en el detalle de React o agregar un filtro en
la dirección. Las modificaciones se realizan en una rama aparte y no alteran la
entrega.
Uso de inteligencia artificial:  El estudiante es responsable de todo el código
entregado, con independencia de las herramientas utilizadas para producirlo. La
defensa se realiza sin asistentes de inteligencia artificial ni herramientas de
generación o autocompletado de código (por ejemp lo, ChatGPT, Claude, Copilot o
Cursor), las cuales deben estar desactivadas en el editor. Solo se permite consultar
la documentación oficial de las tecnologías del curso. El uso de estas herramientas
durante la defensa implica la calificación Deficiente en los criterios 9 al 11.
Ajuste por defensa:  Si durante la defensa el estudiante no logra explicar la
implementación correspondiente a alguno de los criterios 1 al 8, la calificación de ese
criterio se ajusta al nivel de dominio demostrado en la defensa. El código que el
estudiante no pueda explicar ni modificar se considera no desarrollado por él; si hay
indicios de plagio, se procede según el reglamento académico vigente. La inasistencia
injustificada a la defensa se califica con el nivel Deficiente en los criterios 9 al 11.


## Página 7



7

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
1. Laboratorios
guiados del
Maratón de series
(Parte A)
Faltan varios
laboratorios o el
Maratón no se
ejecuta.
El Maratón se
ejecuta, pero faltan
los laboratorios
nuevos (React
Router o EF Core) o
varias funciones no
operan, y
docs/laboratorios.md
está incompleto.
Están todos los
laboratorios y el
Maratón funciona,
con algún laboratorio
sin evidencia, sin su
recorrido o sin sus
respuestas.
Todos los
laboratorios,
incluidos React
Router y EF Core,
están completos y
funcionando, y
docs/laboratorios.md
documenta cada uno
con captura,
recorrido, respuestas
y experimentos.
2. Modelo
relacional
documentado
(Parte B)
No hay modelo
relacional o se limita
a copiar las
colecciones del
Avance 2.
Hay diagrama, pero
faltan relaciones
requeridas,
cardinalidades o la
tabla «Del
documento a la
tabla».
El modelo y el
diagrama cubren las
relaciones
requeridas, con
alguna restricción,
cardinalidad o
justificación
incompleta.
El diagrama y las
tablas documentan
todas las relaciones
con su cardinalidad,
claves, índices,
restricciones y
comportamiento al
borrar, y justifican
cada paso del
documento a la
tabla.
3. Entidades,
relaciones y
restricciones con
EF Core (Parte B)
No hay entidades o
el DbContext no
define las relaciones.
Las entidades
existen, pero las
relaciones muchos a
muchos faltan o
duplican
información, o no
hay restricciones.
Las entidades y el
DbContext
representan el
modelo, con alguna
restricción, índice o
comportamiento al
borrar sin configurar.
Las entidades y el
DbContext
representan todo el
modelo, resuelven
las relaciones
muchos a muchos
como tales (con
entidad intermedia
cuando tienen datos
propios) y configuran
largos, índices
únicos, CHECK y
comportamiento al
borrar.
4. Migraciones
versionadas y
datos de siembra
(Parte B)
No hay migraciones
en el repositorio o la
base se crea a
mano.
Hay una sola
migración generada
al final, o la base no
se reconstruye
desde cero.
Hay al menos dos
migraciones y la
base se reconstruye,
con datos de
siembra insuficientes
para probar.
Al menos dos
migraciones
muestran la
evolución del
modelo, la base se
reconstruye desde
cero con un
comando y los datos
de siembra permiten
probar de inmediato.

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
5. Configuración,
secretos y
versiones (Parte
B)
La cadena de
conexión está en el
código, en
appsettings.json o
en el historial.
El secreto está fuera
del código, pero
faltan global.json o
las versiones fijas, o
el README no
explica la
configuración.
Secretos fuera del
repositorio y
versiones fijas, con
algún detalle faltante
en el README.
La cadena de
conexión vive en
user-secrets, el
proyecto fija el SDK
y los paquetes, y el
README explica
cómo configurar el
secreto sin exponer
su valor.
6. Consultas SQL
y rutas GET del
contrato (Parte B)
No hay consultas ni
rutas, o las rutas no
responden.
Las rutas responden,
pero no respetan el
formato del contrato,
o faltan varias
consultas.
Las dos rutas
respetan el contrato
y las consultas
están, con algún
resultado esperado
sin documentar o
una ruta sin datos
muchos a muchos.
Las dos rutas
devuelven
exactamente el
JSON del contrato
con consultas
asincrónicas y
proyección, una de
ellas sobre una
relación muchos a
muchos, y
consultas.sql cubre
los cuatro casos con
su resultado
esperado.
7. Investigación
sobre EF Core
con evidencia
No se entrega o
copia definiciones
sin relación con el
proyecto.
Responde de forma
general, sin el SQL
generado ni
ejemplos del
proyecto.
Responde las tres
preguntas con
evidencia del
proyecto, con alguna
conclusión imprecisa
o sin fuentes.
Responde las tres
preguntas con el
SQL generado en su
proyecto,
conclusiones
correctas sobre
proyección, Include,
AsNoTracking,
entidad intermedia y
paginación, y
fuentes oficiales.
8. Repositorios,
documentación e
historial
Falta un repositorio o
la etiqueta, o hay
secretos,
node_modules, bin u
obj en el repositorio.
Los README están
incompletos o el
historial concentra el
trabajo en pocos
días.
Los repositorios
están documentados
y etiquetados, con
historial poco
descriptivo o algún
paso faltante en un
README.
Ambos repositorios
tienen la etiqueta
tarea-3, README
completos, historial
progresivo y
descriptivo con
commits de cada
integrante en
servidor-net, y
ningún archivo que
no deba versionarse.
Defensa de la tarea (individual)
9. Explicación
detallada del
código
No logra explicar el
código entregado ni
ubicar las partes que
implementó.
Explica partes
aisladas, pero no
logra seguir el
recorrido completo
de una petición.
Recorre una petición
desde React hasta la
base y desde la ruta
GET hasta el SQL,
Explica en detalle
cualquier fragmento
señalado, recorre
ambos flujos
completos y

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
con imprecisiones
puntuales.
relaciona cada pieza
con el requisito que
atiende.
10. Dominio de
los criterios
técnicos
evaluados
No responde las
preguntas o sus
respuestas
contradicen lo
implementado.
Responde con
conceptos
generales, sin
conectarlos con su
código ni con su
base.
Responde la
mayoría de las
preguntas
apoyándose en su
código, con vacíos
en algún tema.
Responde con
precisión sobre
estado y efectos,
React Router, claves
y relaciones,
migraciones,
secretos y el SQL
que genera EF Core,
y muestra dónde lo
resolvió.
11.
Modificaciones
en caliente
No logra realizar la
modificación o la
aplicación deja de
funcionar.
Realiza la
modificación con
ayuda sustancial del
docente, o rompe
otra funcionalidad.
Implementa la
modificación en el
tiempo asignado,
con alguna
deficiencia en la
migración o en la
ubicación del
cambio.
Ubica con rapidez
dónde intervenir,
crea la migración
cuando corresponde,
respeta el contrato y
demuestra el
funcionamiento sin
romper otras
funciones.
La rúbrica contiene 11 criterios, cada uno evaluado sobre un máximo de 4 puntos.
Los criterios 1 al 8 evalúan el producto entregado (máximo 32 puntos) y los criterios
9 al 11 evalúan la defensa individual de la tarea (máximo 12 puntos). Cada
componente aporta el 50 % de la nota. Además, según el ajuste por defensa de la
sección 6, los criterios del producto que el estudiante no logre explicar se califican al
nivel demostrado en la defensa.
La nota base cien se obtiene mediante las siguientes fórmulas:
Nota del producto = promedio de los criterios 1 al 8 (sobre 4)
Nota de la defensa = promedio de los criterios 9 al 11 (sobre 4)
Nota base 100 = [(Nota del producto × 0,5) + (Nota de la defensa × 0,5)] ÷ 4 ×
100
