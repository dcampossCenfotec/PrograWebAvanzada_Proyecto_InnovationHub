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
const limpiarFiltros = document.querySelector('#limpiarFiltros');
const contenedorModal = document.querySelector('#modalEliminar');
const modal = new bootstrap.Modal(contenedorModal);

let idPendiente = null;
let botonOrigen = null;
let recargaPendiente = false;
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

  const total = iniciativasCargadas.length;
  const contador = `Mostrando ${iniciativas.length} de ${total} ${
    total === 1 ? 'iniciativa' : 'iniciativas'
  }.`;
  const mensaje = total === 0
    ? 'No hay iniciativas disponibles. Puedes publicar una nueva iniciativa.'
    : iniciativas.length === 0
      ? 'No se encontraron iniciativas con estos criterios. Cambia los criterios o pulsa Limpiar filtros.'
      : '';

  estado(
    aviso,
    mensaje ? `${contador} ${mensaje}` : contador,
    iniciativas.length ? 'text-body-secondary mb-3' : 'alert alert-info'
  );
}

// Un único listener funciona incluso después de volver a dibujar las tarjetas.
lista.addEventListener('click', (evento) => {
  const boton = evento.target.closest('[data-eliminar-id]');

  if (!boton) return;

  idPendiente = boton.dataset.eliminarId;
  botonOrigen = boton;

  document.querySelector('#mensajeEliminar').textContent =
    '¿Deseas eliminar esta iniciativa?';

  modal.show();
});

// Bootstrap termina de cerrar el modal antes de devolver el foco.
contenedorModal.addEventListener('hidden.bs.modal', () => {
  idPendiente = null;

  if (botonOrigen?.isConnected) {
    botonOrigen.focus();
  } else if (botonOrigen) {
    const titulo = document.querySelector('#tituloIniciativas');
    titulo.setAttribute('tabindex', '-1');
    titulo.focus();
  }

  botonOrigen = null;
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
async function cargarCatalogo(recargar = false) {
  if (cargando) return;

  recargaPendiente = recargaPendiente || recargar;
  const devolverFoco = document.activeElement === reintentar;
  cargando = true;
  reintentar.disabled = true;
  busqueda.disabled = true;
  filtroTipo.disabled = true;
  filtroCategoria.disabled = true;
  filtroCompetencia.disabled = true;
  limpiarFiltros.disabled = true;
  lista.setAttribute('aria-busy', 'true');
  lista.replaceChildren();
  estado(avisoOperacion, '');
  estado(aviso, 'Cargando iniciativas…', 'text-body-secondary mb-3');

  try {
    actualizarCatalogo(await cargarIniciativas({ recargar: recargaPendiente }));
    recargaPendiente = false;
    busqueda.disabled = false;
    filtroTipo.disabled = false;
    filtroCategoria.disabled = false;
    filtroCompetencia.disabled = false;
    limpiarFiltros.disabled = false;
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
limpiarFiltros.addEventListener('click', () => {
  if (limpiarFiltros.disabled) return;

  busqueda.value = '';
  filtroTipo.value = '';
  filtroCategoria.value = '';
  filtroCompetencia.value = '';
  estado(avisoOperacion, '');
  // Regenera opciones para retirar criterios antiguos marcados sin disponibles.
  actualizarCatalogo(iniciativasCargadas);
  busqueda.focus();
});
reintentar.addEventListener('click', () => cargarCatalogo());
window.addEventListener('pageshow', (evento) => {
  // Atrás puede restaurar también la memoria antigua del módulo de datos.
  if (evento.persisted) return cargarCatalogo(true);
});

await cargarCatalogo();
