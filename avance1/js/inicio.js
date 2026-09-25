import {
  cargarIniciativas,
  alCambiarIniciativas,
  USUARIO_ACTUAL
} from './iniciativas.js';
import { elemento, estado } from './dom.js';

const lista = document.querySelector('#listaIniciativas');
const aviso = document.querySelector('#estadoIniciativas');

function dibujar(iniciativas) {
  // Limpia las tarjetas anteriores antes de mostrar la lista actualizada.
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
      elemento(
        'h3',
        iniciativa.titulo,
        'h5 card-title'
      ),
      elemento(
        'p',
        iniciativa.resumen,
        'card-text'
      )
    );

    const enlace = elemento(
      'a',
      'Ver detalle',
      'btn btn-outline-primary mt-auto'
    );

    enlace.href =
      `paginas/detalle.html?id=${encodeURIComponent(iniciativa.id)}`;

    cuerpo.append(enlace);

    // El usuario de prueba puede editar las iniciativas que publicó.
    if (iniciativa.propietario === USUARIO_ACTUAL) {
      const editar = elemento(
        'a',
        'Editar',
        'btn btn-outline-secondary mt-2'
      );

      editar.href =
        `paginas/formulario.html?id=${encodeURIComponent(iniciativa.id)}`;

      cuerpo.append(editar);
    }

    tarjeta.append(cuerpo);
    columna.append(tarjeta);
    lista.append(columna);
  }
}

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