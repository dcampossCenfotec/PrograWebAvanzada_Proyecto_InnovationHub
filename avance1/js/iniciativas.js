/**
 * Fuente de verdad del prototipo. El JSON inicial se carga con fetch una sola vez;
 * los cambios posteriores residen en memoria y se conservan en localStorage.
 * El catálogo de persona 1 puede importar esta API sin duplicar los datos.
 */
const CLAVE = 'innovation-hub-iniciativas-v1';
const EVENTO = 'iniciativas:actualizadas';
const URL_INICIAL = new URL('../datos/iniciativas.json', import.meta.url);

export const USUARIO_ACTUAL = 'Usuario de prueba';

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

/** Carga las iniciativas guardadas o, si aún no hay cambios, el JSON inicial. */
export async function cargarIniciativas() {
  if (iniciativas !== null) return copia(iniciativas);

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
      throw new Error(
        `No se pudieron cargar los datos (${respuesta.status}).`
      );
    }

    const datos = await respuesta.json();

    if (!Array.isArray(datos)) {
      throw new Error('El archivo inicial no contiene una lista.');
    }

    iniciativas = datos;
  }

  return copia(iniciativas);
}

/** Busca una iniciativa después de cargar los datos. */
export function obtenerIniciativa(id) {
  if (iniciativas === null) {
    throw new Error('Primero se deben cargar las iniciativas.');
  }

  const encontrada = iniciativas.find(
    (iniciativa) => iniciativa.id === id
  );

  return encontrada ? copia(encontrada) : null;
}

/** Agrega una iniciativa del usuario de prueba y guarda el cambio. */
export function crearIniciativa(campos) {
  if (iniciativas === null) {
    throw new Error('Primero se deben cargar las iniciativas.');
  }

  const nueva = {
    ...copia(campos),
    id: crypto.randomUUID(),
    propietario: USUARIO_ACTUAL,
    miembros: [USUARIO_ACTUAL],
    estado: 'Abierta'
  };

  iniciativas.push(nueva);
  notificar();

  return copia(nueva);
}

/** Actualiza solamente iniciativas que pertenecen al usuario de prueba. */
export function actualizarIniciativa(id, campos) {
  if (iniciativas === null) {
    throw new Error('Primero se deben cargar las iniciativas.');
  }

  const indice = iniciativas.findIndex(
    (iniciativa) => iniciativa.id === id
  );

  if (indice === -1) return null;
  if (iniciativas[indice].propietario !== USUARIO_ACTUAL) return null;

  // El identificador y el propietario pertenecen al registro original.
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

  const indice = iniciativas.findIndex(
    (iniciativa) => iniciativa.id === id
  );

  if (indice === -1) return false;

  iniciativas.splice(indice, 1);
  notificar();

  return true;
}

/** Permite actualizar una vista cuando cambian las iniciativas. */
export function alCambiarIniciativas(escucha) {
  const controlador = (evento) => escucha(evento.detail);

  window.addEventListener(EVENTO, controlador);

  return () => window.removeEventListener(EVENTO, controlador);
}