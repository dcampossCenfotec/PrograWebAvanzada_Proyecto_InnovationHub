import {
  cargarIniciativas,
  obtenerIniciativa,
  USUARIO_ACTUAL
} from './iniciativas.js';
import { elemento, estado } from './dom.js';

const identificador = new URLSearchParams(location.search).get('id');
const articulo = document.querySelector('#detalle');
const acciones = document.querySelector('#accionesDetalle');
const aviso = document.querySelector('#estadoDetalle');

function linea(nombre, valor) {
  const parrafo = elemento('p', '');

  parrafo.append(
    elemento('strong', `${nombre}: `),
    document.createTextNode(String(valor))
  );

  return parrafo;
}

function dibujar(iniciativa) {
  articulo.replaceChildren();
  acciones.replaceChildren();
  estado(aviso, '');

  // RN-03: una iniciativa restringida no muestra su contenido completo.
  if (iniciativa.visibilidad === 'restringida') {
    articulo.append(
      elemento('h1', 'Iniciativa restringida'),
      elemento('p', iniciativa.resumen, 'lead'),
      elemento(
        'p',
        'El contenido completo no está disponible.',
        'alert alert-warning'
      )
    );

    return;
  }

  articulo.append(
    elemento('h1', iniciativa.titulo),
    elemento('p', iniciativa.resumen, 'lead'),
    linea('Tipo', iniciativa.tipo),
    linea('Descripción', iniciativa.descripcion),
    linea('Autor', iniciativa.propietario),
    linea('Categoría', iniciativa.categoria),
    linea('Competencias', iniciativa.competencias.join(', ')),
    linea('Miembros', iniciativa.miembros.join(', ')),
    linea('Estado', iniciativa.estado),
    linea('Visibilidad', iniciativa.visibilidad)
  );

  const participar = elemento(
    'a',
    'Solicitar participación',
    'btn btn-primary'
  );

  participar.href =
    `participar.html?id=${encodeURIComponent(iniciativa.id)}`;

  acciones.append(participar);

  // La opción de edición aparece únicamente para iniciativas propias.
  if (iniciativa.propietario === USUARIO_ACTUAL) {
    const editar = elemento(
      'a',
      'Editar iniciativa',
      'btn btn-outline-primary'
    );

    editar.href =
      `formulario.html?id=${encodeURIComponent(iniciativa.id)}`;

    acciones.append(editar);
  }
}

try {
  if (!identificador) {
    throw new Error('Falta el identificador de la iniciativa.');
  }

  await cargarIniciativas();

  const iniciativa = obtenerIniciativa(identificador);

  if (!iniciativa) {
    throw new Error('No se encontró la iniciativa solicitada.');
  }

  dibujar(iniciativa);
} catch (error) {
  estado(aviso, error.message, 'alert alert-danger');
}