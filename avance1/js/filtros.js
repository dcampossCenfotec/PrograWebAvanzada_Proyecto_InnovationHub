/** Normaliza las consultas sin modificar el texto que se muestra al usuario. */
export function normalizarTexto(texto) {
  return texto
    .trim()
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** Devuelve un arreglo filtrado sin modificar la colección compartida. */
export function filtrarIniciativas(iniciativas, criterios = {}) {
  const consulta = normalizarTexto(criterios.texto || '');

  return iniciativas.filter((iniciativa) => {
    if (!consulta) return true;

    // La búsqueda tampoco debe revelar el título de una iniciativa restringida.
    const campos = iniciativa.visibilidad === 'restringida'
      ? [iniciativa.resumen]
      : [iniciativa.titulo, iniciativa.resumen];

    return campos.some((campo) => normalizarTexto(campo).includes(consulta));
  });
}
