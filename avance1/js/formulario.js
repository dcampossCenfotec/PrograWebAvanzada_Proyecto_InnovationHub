/** Registro y edición comparten el mismo formulario y sus reglas. */
import { cargarIniciativas, crearIniciativa } from './iniciativas.js';
import { validarIniciativa, mostrarErrores } from './validacion.js';
import { estado } from './dom.js';

const formulario = document.querySelector('#formularioIniciativa');
const competencias = formulario.querySelector('#competencias');
const aviso = document.querySelector('#estadoFormulario');

function agregarCompetencia(valor = '') {
  const fila = document.createElement('div');
  fila.className = 'input-group';

  const etiqueta = document.createElement('label');
  const indice = competencias.children.length + 1;
  etiqueta.className = 'input-group-text';
  etiqueta.textContent = `Competencia ${indice}`;

  const entrada = document.createElement('input');
  entrada.type = 'text';
  entrada.name = 'competencia';
  entrada.className = 'form-control';
  entrada.maxLength = 60;
  entrada.value = valor;
  entrada.id = `competencia-${crypto.randomUUID()}`;
  entrada.setAttribute('aria-describedby', 'error-competencias');
  etiqueta.htmlFor = entrada.id;

  const quitar = document.createElement('button');
  quitar.type = 'button';
  quitar.className = 'btn btn-outline-danger';
  quitar.dataset.accion = 'quitar-competencia';
  quitar.textContent = 'Quitar';

  fila.append(etiqueta, entrada, quitar);
  competencias.append(fila);
}

formulario
  .querySelector('#agregarCompetencia')
  .addEventListener('click', () => agregarCompetencia());

// Un listener sirve para las filas iniciales y las agregadas después.
competencias.addEventListener('click', (evento) => {
  if (!evento.target.closest('[data-accion="quitar-competencia"]')) {
    return;
  }

  evento.target.closest('.input-group').remove();
});

agregarCompetencia();

/** Convierte los controles del formulario en datos para validar y guardar. */
function leerFormulario() {
  const valor = (nombre) =>
    formulario.elements.namedItem(nombre).value.trim();

  return {
    titulo: valor('titulo'),
    tipo: valor('tipo'),
    categoria: valor('categoria'),
    resumen: valor('resumen'),
    descripcion: valor('descripcion'),
    problema: valor('problema'),
    beneficiarios: valor('beneficiarios'),
    competencias: [
      ...competencias.querySelectorAll('[name="competencia"]')
    ].map((entrada) => entrada.value.trim()),
    participantesEstimados: Number(valor('participantesEstimados')),
    visibilidad: valor('visibilidad'),
    etiquetas: valor('etiquetas')
      .split(',')
      .map((etiqueta) => etiqueta.trim())
  };
}

// Primero se cargan las iniciativas existentes para conservarlas.
formulario.querySelector('#guardar').disabled = true;
estado(aviso, 'Preparando datos…');

try {
  await cargarIniciativas();
  estado(aviso, '');
  formulario.querySelector('#guardar').disabled = false;
} catch (error) {
  estado(
    aviso,
    `No se pueden preparar los datos: ${error.message}`,
    'alert alert-danger'
  );
}

formulario.addEventListener('submit', (evento) => {
  // Evita que el navegador recargue la página al enviar.
  evento.preventDefault();

  const datos = leerFormulario();
  const errores = validarIniciativa(datos);
  mostrarErrores(formulario, errores);

  if (Object.keys(errores).length) {
    estado(
      aviso,
      `Revisa ${Object.keys(errores).length} campo(s) marcado(s).`,
      'alert alert-danger'
    );
    return;
  }

  // La función del commit 3 agrega la iniciativa al estado local.
  const creada = crearIniciativa(datos);

  const enlace = document.createElement('a');
  enlace.href = `detalle.html?id=${encodeURIComponent(creada.id)}`;
  enlace.textContent = 'Ver la iniciativa registrada';

  aviso.replaceChildren(
    document.createTextNode('Iniciativa guardada localmente. '),
    enlace
  );
  aviso.className = 'alert alert-success';

  formulario.reset();
  competencias.replaceChildren();
  agregarCompetencia();
});