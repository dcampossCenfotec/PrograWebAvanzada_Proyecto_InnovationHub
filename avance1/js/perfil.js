import {
  cargarIniciativas,
  USUARIO_ACTUAL
} from './iniciativas.js';
import { elemento, estado } from './dom.js';

// Datos de demostración: este avance todavía no implementa inicio de sesión.
const usuario = {
  nombre: USUARIO_ACTUAL,
  correo: 'demo@innovationhub.example',
  descripcion:
    'Participante de demostración interesado en proyectos comunitarios.',
  competencias: [
    'Diseño',
    'Desarrollo web',
    'Comunicación'
  ],
  intereses: [
    'Educación',
    'Ambiente',
    'Tecnología'
  ]
};

const aviso = document.querySelector('#estadoPerfil');
const contenido = document.querySelector('#contenidoPerfil');

/** Crea una tarjeta con una lista de datos del perfil. */
function seccion(titulo, valores) {
  const columna = elemento(
    'section',
    '',
    'col-12 col-md-6'
  );

  const tarjeta = elemento(
    'div',
    '',
    'card h-100'
  );

  const cuerpo = elemento(
    'div',
    '',
    'card-body'
  );

  cuerpo.append(
    elemento('h2', titulo, 'h5 card-title')
  );

  const lista = elemento('ul', '', 'mb-0');

  for (const valor of valores) {
    lista.append(elemento('li', valor));
  }

  if (!valores.length) {
    cuerpo.append(
      elemento('p', 'Todavía no hay proyectos registrados.')
    );
  } else {
    cuerpo.append(lista);
  }

  tarjeta.append(cuerpo);
  columna.append(tarjeta);

  return columna;
}

try {
  const iniciativas = await cargarIniciativas();

  // Incluye los proyectos en los que figura el usuario como miembro.
  const proyectos = iniciativas.filter((iniciativa) =>
    iniciativa.miembros.includes(USUARIO_ACTUAL)
  );

  estado(aviso, '');

  const cabecera = elemento('section', '', 'col-12');

  cabecera.append(
    elemento('h2', usuario.nombre, 'h3'),
    elemento('p', usuario.correo),
    elemento('p', usuario.descripcion)
  );

  contenido.append(
    cabecera,
    seccion('Competencias', usuario.competencias),
    seccion('Intereses', usuario.intereses),
    seccion(
      'Proyectos en los que participa',
      proyectos.map((iniciativa) => iniciativa.titulo)
    )
  );
} catch (error) {
  estado(
    aviso,
    `No se pudo cargar el perfil: ${error.message}`,
    'alert alert-danger'
  );
}