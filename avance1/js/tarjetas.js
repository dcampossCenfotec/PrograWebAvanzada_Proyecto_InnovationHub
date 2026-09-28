import { elemento } from './dom.js';
import { USUARIO_ACTUAL } from './iniciativas.js';

/** Agrega un dato con su etiqueta a la información de la tarjeta. */
function agregarDato(contenedor, nombre, valor) {
  contenedor.append(
    elemento('dt', nombre, 'fw-semibold'),
    elemento('dd', valor, 'mb-2')
  );
}

/** Construye una tarjeta sin modificar los datos ni registrar eventos. */
export function crearTarjeta(iniciativa) {
  const columna = elemento('div', '', 'col-12 col-md-6 col-xl-4');
  const tarjeta = elemento('article', '', 'card h-100 shadow-sm text-break');
  const cuerpo = elemento('div', '', 'card-body d-flex flex-column');
  const restringida = iniciativa.visibilidad === 'restringida';

  // RN-03: los datos restringidos no se incorporan al DOM, ni como atributos.
  if (restringida) {
    cuerpo.append(
      elemento('h3', 'Iniciativa restringida', 'h5 card-title'),
      elemento('p', iniciativa.resumen, 'card-text'),
      elemento(
        'p',
        'El contenido completo no está disponible.',
        'alert alert-warning'
      )
    );
  } else {
    const tipos = {
      idea: 'Idea',
      necesidad: 'Necesidad',
      reto: 'Reto'
    };

    cuerpo.append(
      elemento(
        'span',
        tipos[iniciativa.tipo] || iniciativa.tipo,
        'badge text-bg-secondary align-self-start mb-2'
      ),
      elemento('h3', iniciativa.titulo, 'h5 card-title'),
      elemento('p', iniciativa.resumen, 'card-text')
    );

    const informacion = elemento('dl', '', 'mb-3');
    agregarDato(informacion, 'Categoría', iniciativa.categoria);
    agregarDato(informacion, 'Propietario', iniciativa.propietario);
    agregarDato(informacion, 'Estado', iniciativa.estado);

    const competencias = elemento('ul', '', 'list-unstyled mb-0');

    for (const competencia of iniciativa.competencias) {
      competencias.append(elemento('li', competencia));
    }

    const contenidoCompetencias = elemento('dd', '', 'mb-0');
    contenidoCompetencias.append(competencias);
    informacion.append(
      elemento('dt', 'Competencias', 'fw-semibold'),
      contenidoCompetencias
    );
    cuerpo.append(informacion);
  }

  const acciones = elemento('div', '', 'mt-auto d-grid gap-2');
  const detalle = elemento('a', 'Ver detalle', 'btn btn-outline-primary');
  detalle.href =
    `paginas/detalle.html?id=${encodeURIComponent(iniciativa.id)}`;
  acciones.append(detalle);

  // Las acciones propias se conservan también para gestionar las restringidas.
  if (iniciativa.propietario === USUARIO_ACTUAL) {
    const editar = elemento('a', 'Editar', 'btn btn-outline-secondary');
    editar.href =
      `paginas/formulario.html?id=${encodeURIComponent(iniciativa.id)}`;

    const eliminar = elemento('button', 'Eliminar', 'btn btn-outline-danger');
    eliminar.type = 'button';
    eliminar.dataset.eliminarId = iniciativa.id;
    acciones.append(editar, eliminar);
  }

  cuerpo.append(acciones);
  tarjeta.append(cuerpo);
  columna.append(tarjeta);

  return columna;
}
