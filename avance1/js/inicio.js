import {
  cargarIniciativas,
  alCambiarIniciativas,
  eliminarIniciativa
} from './iniciativas.js';
import { estado } from './dom.js';
import { crearTarjeta } from './tarjetas.js';

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
    lista.append(crearTarjeta(iniciativa));
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