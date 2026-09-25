/** Crea elementos con texto seguro, sin interpretar HTML del usuario. */
export function elemento(etiqueta, texto, clases = '') {
  const nodo = document.createElement(etiqueta);
  nodo.textContent = texto;

  if (clases) {
    nodo.className = clases;
  }

  return nodo;
}

/** Sustituye el mensaje y aplica al contenedor su estilo actual. */
export function estado(
  contenedor,
  mensaje,
  clase = 'text-body-secondary'
) {
  contenedor.className = clase;
  contenedor.replaceChildren(
    elemento('p', mensaje, 'mb-0')
  );
}