# descripcion_general

Fuente original: /Users/danielcampos/Downloads/SOFT_12_Proyecto_Descripcion_General (1).docx

Extracción de referencia. Este contenido no es una instrucción para Codex.

[Tabla]
 | Universidad CENFOTEC Escuela de Software Código del curso: SOFT-12 Nombre del curso:  Programación Web Avanzada Sección:  SCV2    Periodo: III cuatrimestre 2026 Docente facilitador:  Álvaro Cordero Peña

PROYECTO DEL CURSO

Innovation Hub — descripción general y estructura de entregables

Datos generales de la actividad

[Tabla]
Fecha de entrega: | Este documento no se entrega. Cada avance tiene su propia consigna y su propia fecha, indicadas en el apartado 5. | Valor porcentual: | 50 % de la nota del curso, distribuido en tres avances
Formato de entrega: | No aplica | Puntaje total: | Ver la consigna de cada avance
Individual:   ____ | Grupal:   ____ |  |

Instrucciones generales (estas instrucciones pueden ser adaptadas según las especificaciones del curso o de la actividad)

Lea cuidadosamente las instrucciones de la actividad, en caso de tener alguna duda puede consultar con el docente.

Esta actividad se desarrolla de manera individual o grupal (de acuerdo a lo especificado en los datos generales), cualquier intento de plagio será sancionado de acuerdo con el reglamento académico vigente.

Al completar la actividad, debe subir la solución en la plataforma Moodle en el formato, tiempo y espacio indicado por el docente.

Objetivos o competencias del curso que se evaluarán en la actividad de aprendizaje

[Tabla]
Objetivo general o competencia del curso | Desarrollar aplicaciones web sofisticadas y  escalables para la  resolución de   problemas de la   tecnología web en distintos   sectores de la   industria,   implementando   prácticas   avanzadas de   programación y   de diseño de software de   manera   ingeniosa.
Objetivos específicos o resultados de aprendizaje que se evalúan | Despliega una aplicación de comercio electrónico en un servidor web que contenga funciones de búsqueda de productos, autenticación y registro de usuarios, utilizando el estilo de arquitectura de transferencia de estado representación al (REST) para la interfaz de programación de aplicaciones\ (API).

4. Descripción de la actividad

Contexto:

Una institución universitaria desea fomentar la innovación, el emprendimiento y la colaboración interdisciplinaria entre estudiantes, docentes y otros miembros de la comunidad.

Actualmente las ideas, necesidades y oportunidades se comparten de manera informal: conversaciones, cursos, grupos de mensajería y correo electrónico. Como consecuencia, muchas iniciativas no llegan a desarrollarse porque sus promotores no encuentran personas con las competencias necesarias para conformar un equipo. A la vez, existen estudiantes interesados en participar en proyectos reales que no cuentan con un espacio centralizado donde conocer qué iniciativas existen ni qué competencias requiere cada una.

Innovation Hub es una aplicación web que permite publicar ideas, necesidades y retos, declarar las competencias que cada iniciativa requiere, buscar oportunidades de colaboración y conformar equipos interdisciplinarios. Algunas iniciativas serán públicas y otras deberán permanecer restringidas según lo decida su autor.

El sistema se construye una sola vez y evoluciona durante tres entregas. No se trata de desarrollar tres aplicaciones distintas.

Instrucciones:

Este documento describe el proyecto en su conjunto y la forma en que se organizan las tres entregas. El detalle de cada avance, con sus requisitos y su rúbrica, se publica en una consigna independiente.

Objetivo del sistema

Desarrollar una aplicación web que conecte ideas, necesidades y retos con personas interesadas en colaborar en su desarrollo, facilitando la creación de equipos interdisciplinarios dentro de la comunidad universitaria.

Actores del sistema

Visitante. Accede sin iniciar sesión y consulta únicamente información pública.

Usuario registrado. Mantiene su perfil, registra competencias, publica y consulta iniciativas, solicita participación e integra equipos.

Autor de una iniciativa. Modifica su iniciativa, define su visibilidad, indica las competencias requeridas, resuelve solicitudes y convierte la iniciativa en proyecto.

Miembro de equipo. Consulta la información del proyecto e integra el equipo asignado.

Administrador. Administra información general de la plataforma y modera.

Conceptos del dominio

Iniciativa

Se utiliza el término iniciativa para representar genéricamente una idea, necesidad o reto registrado en Innovation Hub.  Toda iniciativa deberá clasificarse obligatoriamente como uno de los tipos descritos a continuación

Idea

Propuesta de una posible solución, producto, servicio o proyecto. Por ejemplo, crear una plataforma para coordinar voluntarios universitarios.

Necesidad

Situación problemática para la cual todavía no existe una solución definida. Por ejemplo, una organización necesita mejorar la coordinación de sus voluntarios y hoy utiliza hojas de cálculo y mensajería.

Reto

Problema delimitado que requiere que uno o varios equipos propongan una solución. Por ejemplo, reducir el tiempo necesario para asignar tutores a estudiantes que solicitan apoyo académico.

Proyecto

Iniciativa que ya cuenta con equipo y ha iniciado formalmente su desarrollo.

Catálogos y valores controlados

Para evitar que cada estudiante interprete de manera diferente determinados datos, Innovation Hub utilizará los siguientes valores controlados.

Tipo de iniciativa

Idea.

Necesidad.

Reto.

Visibilidad

Pública

Cualquier persona puede consultar la información completa.

Institucional

La información completa solamente puede ser consultada por usuarios autenticados.

Restringida

Los usuarios autorizados a explorar iniciativas pueden visualizar:

título;

tipo;

resumen;

categoría;

competencias requeridas.

La descripción detallada y el problema completo solamente serán visibles para:

propietario;

miembros aceptados del equipo.

Privada

La iniciativa no aparece en el catálogo general.

Solamente puede ser consultada por:

propietario;

miembros aceptados del equipo.

Estado de una iniciativa

Borrador.

Publicada.

En formación de equipo.

Convertida en proyecto.

Archivada.

Estado de una solicitud

Pendiente.

Aceptada.

Rechazada.

Cancelada.

Estado de proyecto

Planificación.

En desarrollo.

Pausado.

Finalizado.

Archivado.

Categorías iniciales

La aplicación deberá manejar como mínimo las siguientes categorías:

Tecnología.

Educación.

Sostenibilidad.

Impacto social.

Negocios y emprendimiento.

Salud y bienestar.

Cultura y creatividad.

Otro.

Reglas de negocio

RN-01. Cada usuario deberá utilizar un correo electrónico único.

RN-02. Toda iniciativa deberá tener exactamente un propietario.

RN-03. El propietario deberá ser un usuario registrado y activo.

RN-04. Toda iniciativa deberá clasificarse como idea, necesidad o reto.

RN-05. Toda iniciativa deberá poseer exactamente un nivel de visibilidad.

RN-06. Únicamente el propietario podrá modificar una iniciativa.

RN-07. Únicamente el propietario podrá eliminar o archivar una iniciativa.

RN-08. Una iniciativa que no posea solicitudes, miembros ni proyecto asociado podrá eliminarse.

RN-09. Cuando una iniciativa ya posea información relacionada, deberá archivarse en lugar de eliminarse físicamente.

RN-10. Un usuario no podrá solicitar participación en una iniciativa de la cual sea propietario.

RN-11. Un usuario no podrá mantener dos solicitudes pendientes para una misma iniciativa.

RN-12. Una solicitud aceptada o rechazada no podrá ser modificada por el solicitante.

RN-13. Solamente las solicitudes pendientes podrán cancelarse.

RN-14. Al aceptar una solicitud, el usuario deberá incorporarse automáticamente al equipo de la iniciativa.

RN-15. Un usuario no podrá incorporarse dos veces al mismo equipo.

RN-16. El propietario forma parte del equipo de manera automática y no requiere una solicitud de participación.

RN-17. Una iniciativa solamente podrá convertirse en proyecto si posee al menos un miembro adicional al propietario.

RN-18. Una iniciativa solamente podrá generar un proyecto.

RN-19. Una iniciativa convertida en proyecto deberá conservarse para mantener el vínculo entre el problema original y el proyecto generado.

RN-20. Toda consulta deberá respetar el nivel de visibilidad de la iniciativa.

Requerimientos funcionales

Los requerimientos se dividen en dos clases.  Requerimiento funcional de acción — RF-A Describe qué operación deberá realizar el sistema. Y Requerimiento funcional de información — RF-I

Gestión de usuarios

RF-A-USU-01 — Registrar usuario

El sistema deberá permitir registrar un nuevo usuario.

RF-I-USU-01 — Información para registrar usuario

El registro deberá solicitar:

nombre;

primer apellido;

segundo apellido, opcional;

correo electrónico;

contraseña;

confirmación de contraseña;

tipo de miembro:

estudiante;

docente;

administrativo;

carrera o área profesional;

aceptación de los términos de utilización.

El sistema deberá generar:

identificador único;

fecha de registro;

estado de cuenta: Activa.

El correo deberá ser único.

La contraseña y su confirmación deberán coincidir.

RF-A-USU-02 — Consultar usuario

El sistema deberá permitir consultar el perfil de un usuario.

RF-I-USU-02 — Información de consulta del usuario

La consulta deberá mostrar:

nombre completo;

tipo de miembro;

carrera o área profesional;

descripción personal;

competencias;

intereses;

disponibilidad para participar;

enlace a portafolio, cuando exista.

No deberá mostrar:

contraseña;

hash de contraseña;

información de seguridad;

información privada de autenticación.

RF-A-USU-03 — Modificar perfil

Un usuario autenticado deberá poder modificar su propio perfil.

RF-I-USU-03 — Información para modificar perfil

Se podrá modificar:

nombre;

primer apellido;

segundo apellido;

carrera o área;

descripción personal;

intereses;

disponibilidad;

enlace de portafolio;

competencias.

El sistema deberá registrar la fecha de última modificación.

El identificador del usuario no podrá modificarse.

RF-A-USU-04 — Eliminar o desactivar usuario

El usuario deberá poder solicitar la desactivación de su cuenta.

RF-I-USU-04 — Información para desactivar usuario

El sistema deberá utilizar:

identificador del usuario;

estado actual;

fecha de desactivación;

confirmación del usuario.

Cuando existan iniciativas, solicitudes, equipos o proyectos relacionados, la información histórica deberá conservarse y la cuenta pasará al estado Inactiva.

RF-A-USU-05 — Filtrar usuarios

Los usuarios autenticados deberán poder filtrar usuarios disponibles para colaboración.

RF-I-USU-05 — Información para filtrar usuarios

Los filtros podrán combinar:

carrera o área;

competencia;

disponibilidad.

Por cada resultado se mostrará:

nombre;

carrera o área;

competencias principales;

disponibilidad.

Gestión de iniciativas

Esta sección constituye el núcleo principal de Innovation Hub.

RF-A-INI-01 — Registrar iniciativa

El sistema deberá permitir que un usuario autenticado registre una iniciativa.

RF-I-INI-01 — Información para registrar iniciativa

El formulario deberá solicitar:

título;

tipo:

idea;

necesidad;

reto;

resumen;

descripción detallada;

problema o situación identificada;

población o usuarios beneficiados;

categoría;

competencias requeridas;

cantidad estimada de integrantes;

nivel de visibilidad;

etiquetas.

El sistema deberá generar:

identificador;

propietario, utilizando el usuario autenticado;

fecha de creación;

fecha de última modificación;

estado inicial.

El título, tipo, resumen, descripción, categoría y visibilidad serán obligatorios.

La cantidad estimada de integrantes deberá ser mayor que cero.

RF-A-INI-02 — Consultar iniciativa

El sistema deberá permitir consultar el detalle de una iniciativa cuando el usuario posea permiso para hacerlo.

RF-I-INI-02 — Información de consulta de iniciativa

Cuando el usuario tenga acceso completo se deberá mostrar:

identificador;

título;

tipo;

resumen;

descripción detallada;

problema identificado;

beneficiarios;

categoría;

competencias requeridas;

cantidad estimada de integrantes;

propietario;

integrantes actuales;

espacios disponibles;

estado;

visibilidad;

etiquetas;

fecha de publicación;

fecha de última modificación.

El contenido presentado deberá variar según las reglas de visibilidad.

RF-A-INI-03 — Modificar iniciativa

El propietario deberá poder modificar una iniciativa mientras esta no se encuentre archivada.

RF-I-INI-03 — Información para modificar iniciativa

El propietario podrá modificar:

título;

tipo;

resumen;

descripción;

problema identificado;

beneficiarios;

categoría;

competencias requeridas;

cantidad estimada de integrantes;

visibilidad;

etiquetas.

El sistema deberá conservar:

identificador;

propietario;

fecha original de creación.

El sistema deberá actualizar:

fecha de última modificación.

No se permitirá reducir la cantidad de integrantes esperados a un valor inferior a la cantidad de miembros ya aceptados.

RF-A-INI-04 — Eliminar o archivar iniciativa

El propietario deberá poder eliminar o archivar una iniciativa.

RF-I-INI-04 — Información para eliminar o archivar iniciativa

Antes de ejecutar la operación, el sistema deberá identificar:

iniciativa;

propietario;

estado;

cantidad de solicitudes asociadas;

cantidad de miembros asociados;

existencia de proyecto asociado.

Antes de confirmar la acción se deberá mostrar:

título de la iniciativa;

acción que se realizará;

mensaje de confirmación.

Si no existe información relacionada, podrá eliminarse.

Si existe información relacionada, deberá cambiar al estado Archivada.

RF-A-INI-05 — Filtrar iniciativas

El sistema deberá permitir filtrar las iniciativas disponibles para el usuario.

RF-I-INI-05 — Información para filtrar iniciativas

Los filtros deberán permitir utilizar uno o varios de los siguientes criterios:

tipo;

categoría;

competencia requerida;

estado;

disponibilidad de espacios;

propietario;

visibilidad permitida.

Adicionalmente deberá existir búsqueda textual sobre:

título;

resumen;

etiquetas.

Los resultados deberán mostrar:

título;

tipo;

resumen;

categoría;

propietario;

competencias requeridas principales;

integrantes actuales;

espacios disponibles;

estado.

Cuando no existan coincidencias deberá mostrarse explícitamente que no se encontraron resultados.

Gestión de competencias del usuario (esto es opcional. Pude no existir el mantenimiento y trabajarlo como una lista desplegable. Se darán puntos extra si se realiza)

RF-A-COM-01 — Registrar competencia

El usuario deberá poder asociar competencias a su perfil.

RF-I-COM-01 — Información para registrar competencia

Cada competencia asociada deberá contener:

competencia;

nivel declarado:

básico;

intermedio;

avanzado.

Un usuario no podrá registrar dos veces la misma competencia.

RF-A-COM-02 — Consultar competencias

El sistema deberá permitir consultar las competencias asociadas con un usuario.

RF-I-COM-02 — Información de competencias

Se deberá mostrar:

nombre de la competencia;

nivel declarado.

RF-A-COM-03 — Modificar competencia

El usuario deberá poder modificar el nivel declarado de una competencia.

RF-I-COM-03 — Información para modificar competencia

Se deberá identificar:

usuario;

competencia;

nivel actual;

nuevo nivel.

RF-A-COM-04 — Eliminar competencia

El usuario deberá poder eliminar una competencia de su perfil.

RF-I-COM-04 — Información para eliminar competencia

Se deberá identificar:

usuario;

competencia;

confirmación de eliminación.

La eliminación de una competencia del perfil no deberá eliminar la competencia del catálogo general.

RF-A-COM-05 — Filtrar competencias

El sistema deberá permitir filtrar el catálogo de competencias.

RF-I-COM-05 — Información para filtrar competencias

Se deberá permitir filtrar o buscar por:

nombre;

categoría de competencia.

Gestión de solicitudes de participación

RF-A-SOL-01 — Registrar solicitud

Un usuario autenticado deberá poder solicitar participación en una iniciativa.

RF-I-SOL-01 — Información para registrar solicitud

La solicitud deberá contener:

iniciativa;

usuario solicitante;

mensaje de presentación;

competencia principal que desea aportar;

rol que desea desempeñar;

disponibilidad;

fecha de solicitud.

El sistema deberá generar:

identificador;

estado inicial: Pendiente.

RF-A-SOL-02 — Consultar solicitud

El solicitante y el propietario de la iniciativa deberán poder consultar una solicitud.

RF-I-SOL-02 — Información de consulta de solicitud

Se deberá mostrar:

iniciativa;

solicitante;

competencias del solicitante;

mensaje;

competencia ofrecida;

rol solicitado;

disponibilidad;

fecha;

estado;

respuesta del propietario, cuando exista.

RF-A-SOL-03 — Modificar solicitud

El solicitante deberá poder modificar una solicitud mientras permanezca pendiente.

RF-I-SOL-03 — Información para modificar solicitud

Se podrá modificar:

mensaje;

competencia ofrecida;

rol solicitado;

disponibilidad.

No podrán modificarse:

solicitante;

iniciativa;

fecha original.

RF-A-SOL-04 — Eliminar o cancelar solicitud

El solicitante deberá poder cancelar una solicitud pendiente.

RF-I-SOL-04 — Información para cancelar solicitud

Se deberá identificar:

solicitud;

iniciativa;

solicitante;

estado actual.

El sistema deberá solicitar confirmación y cambiar el estado a Cancelada.

La información deberá mantenerse para conservar la trazabilidad.

RF-A-SOL-05 — Filtrar solicitudes

El propietario deberá poder filtrar las solicitudes recibidas para una iniciativa.

RF-I-SOL-05 — Información para filtrar solicitudes

Los filtros deberán permitir:

estado;

competencia;

rol solicitado;

fecha.

Los resultados deberán mostrar:

solicitante;

competencia principal;

rol solicitado;

fecha;

estado.

RF-A-SOL-06 — Aceptar o rechazar solicitud

El propietario de una iniciativa deberá poder aceptar o rechazar una solicitud pendiente.

RF-I-SOL-06 — Información para resolver solicitud

El sistema deberá utilizar:

solicitud;

iniciativa;

solicitante;

propietario;

decisión;

fecha de decisión;

comentario opcional.

Cuando la decisión sea Aceptada:

el estado de la solicitud cambiará a Aceptada;

el usuario será agregado al equipo;

se registrará la fecha de incorporación.

Cuando sea Rechazada:

el estado cambiará a Rechazada;

el usuario no será agregado al equipo.

Gestión del equipo

RF-A-EQU-01 — Registrar miembro en el equipo

El sistema deberá incorporar automáticamente al equipo a un usuario cuya solicitud haya sido aceptada.

Esta operación no será ejecutada manualmente por el usuario.

RF-I-EQU-01 — Información para registrar miembro

Se deberá almacenar:

iniciativa;

usuario;

rol dentro del equipo;

fecha de incorporación;

estado de participación.

RF-A-EQU-02 — Consultar equipo

Los usuarios autorizados deberán poder consultar el equipo de una iniciativa.

RF-I-EQU-02 — Información de consulta del equipo

Por cada integrante se deberá mostrar:

nombre;

carrera o área;

competencias;

rol;

fecha de incorporación.

RF-A-EQU-03 — Modificar miembro

El propietario deberá poder modificar el rol de un integrante.

RF-I-EQU-03 — Información para modificar miembro

Se deberá utilizar:

iniciativa;

integrante;

rol actual;

nuevo rol.

RF-A-EQU-04 — Eliminar miembro

El propietario podrá retirar a un integrante del equipo.

RF-I-EQU-04 — Información para retirar miembro

Se deberá registrar:

iniciativa;

integrante;

fecha de retiro;

motivo opcional.

El propietario no podrá retirarse mediante esta operación.

RF-A-EQU-05 — Filtrar miembros

El sistema deberá permitir filtrar los miembros del equipo.

RF-I-EQU-05 — Información para filtrar miembros

Se podrán utilizar:

competencia;

rol.

Gestión de proyectos

RF-A-PRO-01 — Registrar proyecto

El propietario deberá poder convertir una iniciativa en proyecto cuando se cumplan las reglas de negocio.

RF-I-PRO-01 — Información para registrar proyecto

Se deberá solicitar:

nombre del proyecto;

objetivo;

descripción;

tecnologías previstas;

fecha de inicio;

fecha estimada de finalización, opcional.

El sistema deberá obtener automáticamente:

iniciativa de origen;

propietario;

integrantes existentes;

fecha de creación.

El estado inicial será Planificación.

RF-A-PRO-02 — Consultar proyecto

Los usuarios autorizados deberán poder consultar el proyecto.

RF-I-PRO-02 — Información de consulta del proyecto

Se deberá mostrar:

nombre;

iniciativa de origen;

objetivo;

descripción;

propietario;

integrantes;

tecnologías;

estado;

fecha de inicio;

fecha estimada de finalización;

repositorio asociado, cuando exista.

RF-A-PRO-03 — Modificar proyecto

El propietario deberá poder modificar un proyecto.

RF-I-PRO-03 — Información para modificar proyecto

Se podrá modificar:

nombre;

objetivo;

descripción;

tecnologías;

estado;

fecha estimada de finalización;

repositorio asociado.

No podrá modificarse la iniciativa de origen.

RF-A-PRO-04 — Eliminar o archivar proyecto

El propietario deberá poder archivar un proyecto.

RF-I-PRO-04 — Información para archivar proyecto

Se deberá registrar:

proyecto;

propietario;

estado anterior;

fecha;

confirmación.

Los proyectos no deberán eliminarse físicamente una vez iniciado su desarrollo.

RF-A-PRO-05 — Filtrar proyectos

El sistema deberá permitir filtrar proyectos disponibles para el usuario.

RF-I-PRO-05 — Información para filtrar proyectos

Se podrá filtrar por:

estado;

categoría de la iniciativa;

competencia;

tecnología;

propietario.

La búsqueda textual utilizará:

nombre;

objetivo;

descripción.

Por cada resultado se mostrará:

nombre;

objetivo resumido;

propietario;

integrantes;

tecnologías principales;

estado.

Integración con una API de terceros

Para cubrir el consumo de servicios externos, Innovation Hub utilizará como integración de referencia la API pública de GitHub.

RF-A-EXT-01 — Asociar repositorio

El propietario de un proyecto deberá poder asociar un repositorio público de GitHub.

RF-I-EXT-01 — Información para asociar repositorio

El usuario deberá indicar:

URL del repositorio.

El sistema deberá almacenar únicamente la información necesaria para identificar el repositorio.

RF-A-EXT-02 — Consultar información del repositorio

El sistema deberá obtener información actualizada utilizando la API de GitHub.

RF-I-EXT-02 — Información externa del repositorio

Cuando se encuentre disponible, se deberá presentar:

nombre;

propietario;

descripción;

lenguaje principal;

rama principal;

fecha de última actualización;

cantidad de issues abiertos;

enlace al repositorio.

El sistema deberá reconocer y controlar:

repositorio inexistente;

repositorio no accesible;

error HTTP;

límite de solicitudes;

servicio externo temporalmente no disponible.

 Requerimientos no funcionales

RNF-01 — Diseño adaptable

Todas las interfaces deberán funcionar correctamente en teléfonos, tabletas y computadoras de escritorio.

RNF-02 — Accesibilidad

Las interfaces deberán utilizar:

HTML semántico;

etiquetas asociadas a formularios;

jerarquía apropiada de encabezados;

textos alternativos;

navegación mediante teclado;

contraste suficiente;

mensajes que no dependan exclusivamente del color.

RNF-03 — Validación

Todo formulario deberá validar:

obligatoriedad;

formato;

longitud;

rangos;

selecciones válidas;

relaciones entre campos cuando corresponda.

A partir del Avance 2, las validaciones deberán ejecutarse tanto en el cliente como en el servidor.

RNF-04 — Seguridad de contraseñas

Las contraseñas no podrán almacenarse como texto plano.

RNF-05 — Autorización

Las restricciones de acceso deberán verificarse en el servidor.

RNF-06 — Protección de información

La API nunca deberá devolver:

contraseñas;

hashes;

cadenas de conexión;

claves privadas;

secretos.

RNF-07 — Configuración sensible

Los secretos y cadenas de conexión deberán mantenerse fuera del repositorio mediante variables de entorno o mecanismos equivalentes.

RNF-08 — Arquitectura cliente-servidor

A partir del Avance 2, la aplicación deberá mantener separadas:

interfaz;

API;

lógica;

acceso a datos;

base de datos.

El cliente nunca deberá consultar directamente la base de datos.

RNF-09 — Base de datos

A partir del Avance 2, la persistencia principal deberá realizarse mediante una base de datos. En el avance 2 se utilizará Mongo DB y para la entrega final, una base de datos relacional.

5. Estructura de los entregables

El proyecto se desarrolla en tres avances sucesivos sobre el mismo sistema. Cada avance conserva y amplía la funcionalidad del anterior.

Avance 1 — Prototipo funcional en el navegador

Semanas 1 a 4. Entrega el domingo 27 de setiembre de 2026. Vale 15 % del curso. Construye una versión navegable de la aplicación con HTML, CSS, JavaScript, Bootstrap y Sass, sin servidor ni base de datos. Los datos se mantienen en archivos JSON y en memoria.

Avance 2 — React con servidor JavaScript y MongoDB

Semanas 5 a 9. Entrega el domingo 1 de noviembre de 2026. Vale 15 % del curso. Convierte el prototipo en una aplicación cliente-servidor real: interfaz en React, servicios en Node.js con Express y persistencia en MongoDB. En este avance se diseña el contrato de la API.

Entrega final — Servidor .NET con base de datos relacional

Semanas 10 a 14. Entrega el domingo 6 de diciembre de 2026. Vale 20 % del curso. Reemplaza el servidor JavaScript por una API en C# con ASP.NET Core y Entity Framework Core sobre una base de datos relacional, manteniendo el mismo cliente React. Incluye la presentación final.

6. La regla del contrato inmutable

El contrato de la API se diseña durante el Avance 2 y queda congelado a partir de ese momento. Rutas, verbos, formato de las peticiones, formato de las respuestas y códigos de estado deben ser idénticos en el servidor JavaScript y en el servidor .NET.

En la entrega final, el cliente React debe funcionar sobre el servidor .NET sin modificar su código, con la única excepción de la variable de entorno que indica la dirección del servidor. Este es el criterio central de la evaluación final y se verifica en clase.

La regla se anuncia desde ahora, y no al final del curso, porque su valor está en el momento del diseño: un contrato pensado con cuidado en la semana 8 hace viable la migración de la semana 14.

7. Repositorio único

El proyecto se mantiene en un único repositorio de Git durante todo el cuatrimestre. No se admite un repositorio distinto por avance: el objetivo es que el historial muestre la evolución del mismo sistema.

Cada entrega se marca con una etiqueta en el repositorio:

git tag entrega-1 && git push origin entrega-1

El repositorio debe incluir en todo momento un archivo .gitignore, un README.md con instrucciones de ejecución y un historial de commits que evidencie trabajo progresivo. Los archivos con secretos nunca se incorporan al repositorio.

8. Alcance excluido

Para mantener el proyecto dentro de un alcance académico razonable, Innovation Hub no requiere chat en tiempo real, videollamadas, pagos, facturación, aplicación móvil nativa, inteligencia artificial para formar equipos, firmas digitales, gestión legal de propiedad intelectual, integración con sistemas de matrícula, gestión de proyectos tipo Jira ni almacenamiento de documentos complejos.

Estas funcionalidades pueden proponerse como trabajo futuro en la presentación final, pero no forman parte del alcance obligatorio.

9. Resultado esperado

Al finalizar las tres etapas debe existir una aplicación web funcional donde un usuario pueda recorrer un flujo completo:

Registro → Perfil y competencias → Explorar iniciativas → Buscar y filtrar

  → Publicar iniciativa → Solicitar participación → Aceptar participantes

  → Formar equipo → Convertir iniciativa en proyecto → Gestionar proyecto

  → Consultar información del repositorio asociado

De esta forma, Innovation Hub evoluciona desde un prototipo de interfaz hasta una aplicación cliente-servidor completa, manteniendo el mismo problema de negocio durante todo el curso.

5. Evaluación del proyecto

Este documento no se evalúa por sí mismo. El proyecto se califica mediante las rúbricas de competencias de cada avance, según la siguiente distribución:

[Tabla]
Avance | Semanas | Fecha de entrega | Valor | Puntaje
Avance 1 — Prototipo funcional | 1 a 4 | Domingo 27 de setiembre de 2026 | 15 % | 56 puntos
Avance 2 — React, Express y MongoDB | 5 a 9 | Domingo 1 de noviembre de 2026 | 15 % | 64 puntos
Entrega final — ASP.NET Core y EF Core | 10 a 14 | Domingo 6 de diciembre de 2026 | 20 % | 64 puntos

Cada avance se evalúa con una rúbrica de cuatro niveles de desempeño: deficiente (2.00 puntos), regular (2.85), bueno (3.50) y excelente (4.00). La nota base cien de cada avance se obtiene mediante la fórmula:

Nota base 100 = (promedio de los criterios ÷ 4) × 100

Las consignas de cada avance, con sus requisitos detallados y su rúbrica completa, se publican en Moodle en la semana indicada en el apartado 5.

## word/footnotes.xml


## word/endnotes.xml

