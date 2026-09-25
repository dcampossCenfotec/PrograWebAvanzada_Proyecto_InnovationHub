import {
  cargarIniciativas,
  alCambiarIniciativas,
  eliminarIniciativa,
  USUARIO_ACTUAL
} from './iniciativas.js';
import { elemento, estado } from './dom.js';

const lista = document.querySelector('#listaIniciativas');
const aviso = document.querySelector('#estadoIniciativas');
const modal = new bootstrap.Modal(
  document.querySelector('#modalEliminar')
);

let idPendiente = null;

function dibujar(iniciativas) {
  // Borra las tarjetas anteriores para reflejar los cambios inmediatamente.
  lista.replaceChildren();

  estado(
    aviso,
    iniciativas.length ? '' : 'No hay iniciativas disponibles.'
  );

  for (const iniciativa of iniciativas) {
    const columna = elemento(
      'div',
      '',
      'col-12 col-md-6 col-xl-4'
    );

    const tarjeta = elemento(
      'article',
      '',
      'card h-100 shadow-sm'
    );

    const cuerpo = elemento(
      'div',
      '',
      'card-body d-flex flex-column'
    );

    cuerpo.append(
      elemento(
        'span',
        iniciativa.tipo,
        'badge text-bg-secondary align-self-start mb-2'
      ),
      elemento('h3', iniciativa.titulo, 'h5 card-title'),
      elemento('p', iniciativa.resumen, 'card-text')
    );

    const enlace = elemento(
      'a',
      'Ver detalle',
      'btn btn-outline-primary mt-auto'
    );

    enlace.href =
      `paginas/detalle.html?id=${encodeURIComponent(iniciativa.id)}`;

    cuerpo.append(enlace);

    // Solo las iniciativas propias muestran acciones de edición y borrado.
    if (iniciativa.propietario === USUARIO_ACTUAL) {
      const editar = elemento(
        'a',
        'Editar',
        'btn btn-outline-secondary mt-2'
      );

      editar.href =
        `paginas/formulario.html?id=${encodeURIComponent(iniciativa.id)}`;

      const eliminar = elemento(
        'button',
        'Eliminar',
        'btn btn-outline-danger mt-2'
      );

      eliminar.type = 'button';
      eliminar.dataset.eliminarId = iniciativa.id;

      cuerpo.append(editar, eliminar);
    }

    tarjeta.append(cuerpo);
    columna.append(tarjeta);
    lista.append(columna);
  }
}

// Un único listener funciona incluso después de volver a dibujar las tarjetas.
lista.addEventListener('click', (evento) => {
  const boton = evento.target.closest('[data-eliminar-id]');

  if (!boton) return;

  idPendiente = boton.dataset.eliminarId;

  document.querySelector('#mensajeEliminar').textContent =
    '¿Deseas eliminar esta iniciativa?';

  modal.show();
});

document
  .querySelector('#confirmarEliminar')
  .addEventListener('click', () => {
    if (!idPendiente) return;

    const eliminada = eliminarIniciativa(idPendiente);
    idPendiente = null;
    modal.hide();

    estado(
      aviso,
      eliminada
        ? 'Iniciativa eliminada. El listado ya está actualizado.'
        : 'No se pudo eliminar esta iniciativa.',
      eliminada ? 'alert alert-success' : 'alert alert-danger'
    );
  });

estado(aviso, 'Cargando iniciativas…');

try {
  dibujar(await cargarIniciativas());
  alCambiarIniciativas(dibujar);
} catch (error) {
  estado(
    aviso,
    `No se pudieron cargar las iniciativas: ${error.message}`,
    'alert alert-danger'
  );
}