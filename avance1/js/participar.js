import {
  cargarIniciativas,
  obtenerIniciativa,
  USUARIO_ACTUAL
} from './iniciativas.js';
import { estado } from './dom.js';

const CLAVE_SOLICITUDES = 'innovation-hub-solicitudes-v1';
const id = new URLSearchParams(location.search).get('id');

const formulario = document.querySelector('#formularioSolicitud');
const aviso = document.querySelector('#estadoSolicitud');

let iniciativa;

/** Valida los datos específicos de una solicitud. */
function validar(datos) {
  const errores = {};

  if (datos.mensaje.length < 15 || datos.mensaje.length > 500) {
    errores.mensaje =
      'Escribe un mensaje de 15 a 500 caracteres.';
  }

  if (!iniciativa.competencias.includes(datos.competencia)) {
    errores.competencia =
      'Selecciona una competencia requerida por esta iniciativa.';
  }

  if (!['colaborador', 'coordinador'].includes(datos.rol)) {
    errores.rol =
      'Selecciona el rol que deseas desempeñar.';
  }

  if (![
    '2-4 horas',
    '5-8 horas',
    '9+ horas'
  ].includes(datos.disponibilidad)) {
    errores.disponibilidad =
      'Indica tu disponibilidad semanal.';
  }

  return errores;
}

/** Muestra los errores junto a los campos correspondientes. */
function mostrarErrores(errores) {
  const nombres = [
    'mensaje',
    'competencia',
    'rol',
    'disponibilidad'
  ];

  for (const nombre of nombres) {
    const control = formulario.elements.namedItem(nombre);
    const mensaje = errores[nombre] || '';

    document.getElementById(
      `error-${nombre}`
    ).textContent = mensaje;

    control.classList.toggle(
      'is-invalid',
      Boolean(mensaje)
    );

    if (mensaje) {
      control.setAttribute('aria-invalid', 'true');
    } else {
      control.removeAttribute('aria-invalid');
    }
  }

  const primerError = Object.keys(errores)[0];

  if (primerError) {
    formulario.elements.namedItem(primerError).focus();
  }
}

// Comprueba que existe la iniciativa y que el usuario puede solicitar ingreso.
try {
  if (!id) {
    throw new Error('Falta el identificador de la iniciativa.');
  }

  await cargarIniciativas();
  iniciativa = obtenerIniciativa(id);

  if (!iniciativa) {
    throw new Error('No existe la iniciativa solicitada.');
  }

  if (iniciativa.visibilidad === 'restringida') {
    throw new Error(
      'No se aceptan solicitudes desde el detalle restringido.'
    );
  }

  if (iniciativa.propietario === USUARIO_ACTUAL) {
    throw new Error(
      'No necesitas solicitar participación en tu propia iniciativa.'
    );
  }

  document.querySelector('#iniciativaDestino').textContent =
    iniciativa.titulo;

  // Las opciones se obtienen de las competencias de esta iniciativa.
  const selector = formulario.elements.namedItem('competencia');

  for (const competencia of iniciativa.competencias) {
    selector.add(new Option(competencia, competencia));
  }

  formulario.hidden = false;
  estado(aviso, '');
} catch (error) {
  estado(aviso, error.message, 'alert alert-danger');
}

formulario.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const datos = {
    mensaje: formulario.elements.namedItem('mensaje').value.trim(),
    competencia: formulario.elements.namedItem('competencia').value,
    rol: formulario.elements.namedItem('rol').value,
    disponibilidad:
      formulario.elements.namedItem('disponibilidad').value
  };

  const errores = validar(datos);
  mostrarErrores(errores);

  if (Object.keys(errores).length) {
    estado(
      aviso,
      'Corrige los campos indicados antes de enviar.',
      'alert alert-danger'
    );
    return;
  }

  // Simula el envío: guarda la solicitud, pero no añade un miembro al equipo.
  try {
    const solicitudes = JSON.parse(
      localStorage.getItem(CLAVE_SOLICITUDES) || '[]'
    );

    if (!Array.isArray(solicitudes)) {
      throw new Error(
        'Las solicitudes guardadas no tienen un formato válido.'
      );
    }

    solicitudes.push({
      id: crypto.randomUUID(),
      iniciativaId: id,
      usuario: USUARIO_ACTUAL,
      ...datos,
      fecha: new Date().toISOString()
    });

    localStorage.setItem(
      CLAVE_SOLICITUDES,
      JSON.stringify(solicitudes)
    );

    formulario.reset();

    estado(
      aviso,
      'Solicitud simulada y guardada en este navegador. No se envió a un servidor.',
      'alert alert-success'
    );
  } catch (error) {
    estado(
      aviso,
      `No se pudo guardar la solicitud local: ${error.message}`,
      'alert alert-danger'
    );
  }
});