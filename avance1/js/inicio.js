import {
  cargarIniciativas,
  alCambiarIniciativas
} from './iniciativas.js';

import {
  elemento,
  estado
} from './dom.js';

const lista = document.querySelector('#listaIniciativas');
const aviso = document.querySelector('#estadoIniciativas');

function dibujar(iniciativas) {
  // Limpia las tarjetas anteriores antes de mostrar el estado actual.
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
    tarjeta.append(cuerpo);
    columna.append(tarjeta);
    lista.append(columna);
  }
}

estado(aviso, 'Cargando iniciativas…');

try {
  dibujar(await cargarIniciativas());

  // Permite redibujar la lista cuando otro módulo cambie las iniciativas.
  alCambiarIniciativas(dibujar);
} catch (error) {
  estado(
    aviso,
    `No se pudieron cargar las iniciativas: ${error.message}`,
    'alert alert-danger'
  );
}