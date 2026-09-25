/** Reglas y mensajes para el registro de iniciativas. */
export function validarIniciativa(datos) {
  const errores = {};

  const texto = (campo, etiqueta, minimo, maximo) => {
    const largo = datos[campo].length;

    if (largo === 0) {
      errores[campo] = `Escribe ${etiqueta}.`;
    } else if (largo < minimo || largo > maximo) {
      errores[campo] =
        `${etiqueta} debe tener entre ${minimo} y ${maximo} caracteres.`;
    }
  };

  texto('titulo', 'un título', 5, 100);
  texto('resumen', 'un resumen', 15, 240);
  texto('descripcion', 'una descripción', 20, 2000);
  texto('problema', 'el problema identificado', 10, 500);
  texto('beneficiarios', 'los beneficiarios', 3, 150);

  if (!['idea', 'necesidad', 'reto'].includes(datos.tipo)) {
    errores.tipo = 'Selecciona idea, necesidad o reto.';
  }

  if (![
    'Ambiente',
    'Comunidad',
    'Cultura',
    'Educación',
    'Tecnología'
  ].includes(datos.categoria)) {
    errores.categoria = 'Selecciona una categoría válida.';
  }

  if (![
    'publica',
    'comunidad',
    'equipo',
    'restringida'
  ].includes(datos.visibilidad)) {
    errores.visibilidad = 'Selecciona un nivel de visibilidad.';
  }

  if (
    !Number.isInteger(datos.participantesEstimados) ||
    datos.participantesEstimados < 1 ||
    datos.participantesEstimados > 100
  ) {
    errores.participantesEstimados =
      'Indica entre 1 y 100 participantes.';
  }

  if (
    datos.competencias.length === 0 ||
    datos.competencias.some((valor) => !valor || valor.length > 60)
  ) {
    errores.competencias =
      'Agrega al menos una competencia y completa todas las filas (máximo 60 caracteres).';
  } else if (
    new Set(
      datos.competencias.map((valor) => valor.toLocaleLowerCase('es'))
    ).size !== datos.competencias.length
  ) {
    errores.competencias = 'No repitas competencias.';
  }

  if (
    datos.etiquetas.length === 0 ||
    datos.etiquetas.some((valor) => !valor || valor.length > 40)
  ) {
    errores.etiquetas =
      'Escribe al menos una etiqueta de máximo 40 caracteres y evita comas vacías.';
  } else if (
    new Set(
      datos.etiquetas.map((valor) => valor.toLocaleLowerCase('es'))
    ).size !== datos.etiquetas.length
  ) {
    errores.etiquetas = 'No repitas etiquetas.';
  }

  return errores;
}

/** Muestra cada error junto a su campo y lleva el foco al primero. */
export function mostrarErrores(formulario, errores) {
  // Limpia los errores de un intento anterior.
  for (const salida of formulario.querySelectorAll('[id^="error-"]')) {
    salida.textContent = '';
  }

  for (const control of formulario.querySelectorAll('.is-invalid')) {
    control.classList.remove('is-invalid');
    control.removeAttribute('aria-invalid');
  }

  // Marca cada campo incorrecto y escribe su mensaje.
  for (const [campo, mensaje] of Object.entries(errores)) {
    formulario.querySelector(`#error-${campo}`).textContent = mensaje;

    const control = campo === 'competencias'
      ? formulario.querySelector('[name="competencia"]')
      : formulario.elements.namedItem(campo);

    if (control) {
      control.classList.add('is-invalid');
      control.setAttribute('aria-invalid', 'true');
    }
  }

  // Facilita la corrección llevando al usuario al primer error.
  const primero = Object.keys(errores)[0];

  const objetivo = primero === 'competencias'
    ? formulario.querySelector('[name="competencia"]') ||
      formulario.querySelector('#agregarCompetencia')
    : formulario.elements.namedItem(primero);

  objetivo?.focus();
}