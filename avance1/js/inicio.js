import {
  cargarIniciativas,
  alCambiarIniciativas,
  eliminarIniciativa
} from './iniciativas.js';
import { elemento, estado } from './dom.js';
import { crearTarjeta } from './tarjetas.js';
import { filtrarIniciativas, obtenerOpciones } from './filtros.js';

const lista = document.querySelector('#listaIniciativas');
const aviso = document.querySelector('#estadoIniciativas');
const avisoOperacion = document.querySelector('#estadoOperacion');
const reintentar = document.querySelector('#reintentarCarga');
const busqueda = document.querySelector('#busquedaIniciativas');
const filtroTipo = document.querySelector('#filtroTipo');
const filtroCategoria = document.querySelector('#filtroCategoria');
const filtroCompetencia = document.querySelector('#filtroCompetencia');
const modal = new bootstrap.Modal(
  document.querySelector('#modalEliminar')
);

let idPendiente = null;
let cargando = false;
let iniciativasCargadas = [];

function actualizarCatalogo(iniciativas) {
  iniciativasCargadas = iniciativas;
  const opciones = obtenerOpciones(iniciativasCargadas);
  llenarSelector(filtroCategoria, opciones.categorias);
  llenarSelector(filtroCompetencia, opciones.competencias);
  dibujar();
}

/** Conserva el criterio seleccionado aunque ya no existan coincidencias. */
function llenarSelector(selector, opciones) {
  const seleccion = selector.value;
  const anterior = [...selector.children].find(
    (opcion) => opcion.value === seleccion
  );
  const todas = elemento('option', 'Todas');
  todas.value = '';
  const nodos = opciones.map(({ valor, etiqueta }) => {
    const opcion = elemento('option', etiqueta);
    opcion.value = valor;
    return opcion;
  });

  if (seleccion && !opciones.some((opcion) => opcion.valor === seleccion)) {
    const etiqueta = anterior?.textContent || seleccion;
    const pendiente = elemento(
      'option',
      `${etiqueta.replace(/ \(sin disponibles\)$/, '')} (sin disponibles)`
    );
    pendiente.value = seleccion;
    nodos.push(pendiente);
  }

  selector.replaceChildren(todas, ...nodos);
  selector.value = seleccion;
}

function dibujar() {
  const iniciativas = filtrarIniciativas(iniciativasCargadas, {
    texto: busqueda.value,
    tipo: filtroTipo.value,
    categoria: filtroCategoria.value,
    competencia: filtroCompetencia.value
  });
  // Borra las tarjetas anteriores para reflejar los cambios inmediatamente.
  const tarjetas = iniciativas.map(crearTarjeta);
  lista.replaceChildren(...tarjetas);

  estado(
    aviso,
    iniciativas.length
      ? `Iniciativas disponibles: ${iniciativas.length}.`
      : iniciativasCargadas.length
        ? 'No se encontraron iniciativas con estos criterios.'
        : 'No hay iniciativas disponibles.',
    iniciativas.length ? 'text-body-secondary mb-3' : 'alert alert-info'
  );
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
      avisoOperacion,
      eliminada
        ? 'Iniciativa eliminada. El listado ya está actualizado.'
        : 'No se pudo eliminar esta iniciativa.',
      eliminada ? 'alert alert-success' : 'alert alert-danger'
    );
  });

/** Reutiliza la API compartida y evita cargas simultáneas desde esta vista. */
async function cargarCatalogo() {
  if (cargando) return;

  const devolverFoco = document.activeElement === reintentar;
  cargando = true;
  reintentar.disabled = true;
  busqueda.disabled = true;
  filtroTipo.disabled = true;
  filtroCategoria.disabled = true;
  filtroCompetencia.disabled = true;
  lista.setAttribute('aria-busy', 'true');
  lista.replaceChildren();
  estado(avisoOperacion, '');
  estado(aviso, 'Cargando iniciativas…', 'text-body-secondary mb-3');

  try {
    actualizarCatalogo(await cargarIniciativas());
    busqueda.disabled = false;
    filtroTipo.disabled = false;
    filtroCategoria.disabled = false;
    filtroCompetencia.disabled = false;
    reintentar.hidden = true;

    if (devolverFoco) {
      const titulo = document.querySelector('#tituloIniciativas');
      titulo.setAttribute('tabindex', '-1');
      titulo.focus();
    }
  } catch (error) {
    lista.replaceChildren();
    estado(
      aviso,
      `No se pudieron cargar las iniciativas: ${error.message} Puedes reintentar la carga.`,
      'alert alert-danger'
    );
    reintentar.hidden = false;

    if (devolverFoco) {
      reintentar.disabled = false;
      reintentar.focus();
    }
  } finally {
    cargando = false;
    reintentar.disabled = false;
    lista.setAttribute('aria-busy', 'false');
  }
}

// Se registran una sola vez, independientemente del número de reintentos.
alCambiarIniciativas(actualizarCatalogo);
busqueda.addEventListener('input', () => {
  if (busqueda.disabled) return;

  estado(avisoOperacion, '');
  dibujar();
});
for (const selector of [filtroTipo, filtroCategoria, filtroCompetencia]) {
  selector.addEventListener('change', () => {
    if (selector.disabled) return;

    estado(avisoOperacion, '');
    dibujar();
  });
}
reintentar.addEventListener('click', cargarCatalogo);

await cargarCatalogo();
