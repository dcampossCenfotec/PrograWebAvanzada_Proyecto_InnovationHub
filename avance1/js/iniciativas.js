/**
 * Fuente de verdad del prototipo. El JSON inicial se carga con fetch una sola vez;
 * los cambios posteriores residen en memoria y se conservan en localStorage.
 * El catálogo de persona 1 puede importar esta API sin duplicar los datos.
 */
const CLAVE = 'innovation-hub-iniciativas-v1';
const EVENTO = 'iniciativas:actualizadas';
const URL_INICIAL = new URL('../datos/iniciativas.json', import.meta.url);

let iniciativas = null;

function copia(valor) {
  return structuredClone(valor);
}

function notificar() {
  localStorage.setItem(CLAVE, JSON.stringify(iniciativas));
  window.dispatchEvent(
    new CustomEvent(EVENTO, { detail: copia(iniciativas) })
  );
}

/** Resuelve una lista editable. Los errores de red/JSON se propagan a la pantalla. */
export async function cargarIniciativas() {
  if (iniciativas !== null) {
    return copia(iniciativas);
  }

  const persistidas = localStorage.getItem(CLAVE);

  if (persistidas !== null) {
    const datos = JSON.parse(persistidas);

    if (!Array.isArray(datos)) {
      throw new Error('Los datos guardados no son una lista de iniciativas.');
    }

    iniciativas = datos;
  } else {
    const respuesta = await fetch(URL_INICIAL);

    if (!respuesta.ok) {
      throw new Error(`No se pudieron cargar los datos (${respuesta.status}).`);
    }

    const datos = await respuesta.json();

    if (!Array.isArray(datos)) {
      throw new Error('El archivo inicial no contiene una lista.');
    }

    iniciativas = datos;
  }

  return copia(iniciativas);
}

/** Funciona después de cargarIniciativas; nunca escribe el JSON original. */
export function obtenerIniciativa(id) {
  if (iniciativas === null) {
    throw new Error('Primero se deben cargar las iniciativas.');
  }

  const encontrada = iniciativas.find((iniciativa) => iniciativa.id === id);
  return encontrada ? copia(encontrada) : null;
}

export function crearIniciativa(campos) {
  if (iniciativas === null) {
    throw new Error('Primero se deben cargar las iniciativas.');
  }

  const nueva = {
    ...copia(campos),
    id: crypto.randomUUID(),
    propietario: 'Usuario de prueba',
    miembros: ['Usuario de prueba'],
    estado: 'Abierta'
  };

  iniciativas.push(nueva);
  notificar();
  return copia(nueva);
}

export function actualizarIniciativa(id, campos) {
  if (iniciativas === null) {
    throw new Error('Primero se deben cargar las iniciativas.');
  }

  const indice = iniciativas.findIndex((iniciativa) => iniciativa.id === id);

  if (indice === -1) {
    return null;
  }

  // El id y el propietario pertenecen al registro existente, no al formulario.
  iniciativas[indice] = {
    ...iniciativas[indice],
    ...copia(campos),
    id,
    propietario: iniciativas[indice].propietario
  };

  notificar();
  return copia(iniciativas[indice]);
}

export function eliminarIniciativa(id) {
  if (iniciativas === null) {
    throw new Error('Primero se deben cargar las iniciativas.');
  }

  const indice = iniciativas.findIndex((iniciativa) => iniciativa.id === id);

  if (indice === -1) {
    return false;
  }

  iniciativas.splice(indice, 1);
  notificar();
  return true;
}

/** Retorna una función para dejar de escuchar cambios cuando la vista ya no la use. */
export function alCambiarIniciativas(escucha) {
  const controlador = (evento) => escucha(evento.detail);

  window.addEventListener(EVENTO, controlador);

  return () => window.removeEventListener(EVENTO, controlador);
}