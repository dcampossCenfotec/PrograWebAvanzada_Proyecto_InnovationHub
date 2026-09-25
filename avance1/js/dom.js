/** Construye nodos de texto sin interpretar los datos del usuario como HTML. */
export function elemento(etiqueta, texto, clases = '') {
  const nodo = document.createElement(etiqueta);
  nodo.textContent = texto;

  if (clases) {
    nodo.className = clases;
  }

  return nodo;
}

/** Sustituye el mensaje de estado anterior por el nuevo. */
export function estado(contenedor, mensaje, clase = 'text-body-secondary') {
  contenedor.replaceChildren(elemento('p', mensaje, clase));
}