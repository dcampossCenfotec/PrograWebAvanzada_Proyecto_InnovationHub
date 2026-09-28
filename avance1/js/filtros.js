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
  const tipo = criterios.tipo || '';
  const categoria = normalizarTexto(criterios.categoria || '');
  const competencia = normalizarTexto(criterios.competencia || '');

  return iniciativas.filter((iniciativa) => {
    // Los filtros no deben revelar metadatos de iniciativas restringidas.
    if (iniciativa.visibilidad === 'restringida' && (
      tipo || categoria || competencia
    )) {
      return false;
    }

    if (tipo && iniciativa.tipo !== tipo) return false;
    if (categoria && normalizarTexto(iniciativa.categoria) !== categoria) {
      return false;
    }
    if (competencia && !iniciativa.competencias.some(
      (valor) => normalizarTexto(valor) === competencia
    )) {
      return false;
    }

    if (!consulta) return true;

    // La búsqueda tampoco debe revelar el título de una iniciativa restringida.
    const campos = iniciativa.visibilidad === 'restringida'
      ? [iniciativa.resumen]
      : [iniciativa.titulo, iniciativa.resumen];

    return campos.some((campo) => normalizarTexto(campo).includes(consulta));
  });
}

/** Obtiene opciones únicas de toda la colección, sin exponer datos restringidos. */
export function obtenerOpciones(iniciativas) {
  const categorias = new Map();
  const competencias = new Map();

  for (const iniciativa of iniciativas) {
    if (iniciativa.visibilidad === 'restringida') continue;

    agregar(categorias, iniciativa.categoria);
    iniciativa.competencias.forEach((valor) => agregar(competencias, valor));
  }

  return {
    categorias: ordenar(categorias),
    competencias: ordenar(competencias)
  };
}

function agregar(opciones, texto) {
  const valor = normalizarTexto(texto);

  if (valor && !opciones.has(valor)) {
    opciones.set(valor, texto.trim());
  }
}

function ordenar(opciones) {
  return [...opciones].map(([valor, etiqueta]) => ({ valor, etiqueta }))
    .sort((a, b) => a.etiqueta.localeCompare(b.etiqueta, 'es'));
}
