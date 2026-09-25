/** Registro y edición comparten el mismo formulario y sus reglas. */
import {
  cargarIniciativas,
  crearIniciativa,
  obtenerIniciativa,
  actualizarIniciativa,
  USUARIO_ACTUAL
} from './iniciativas.js';
import { validarIniciativa, mostrarErrores } from './validacion.js';
import { estado } from './dom.js';

const formulario = document.querySelector('#formularioIniciativa');
const competencias = formulario.querySelector('#competencias');
const aviso = document.querySelector('#estadoFormulario');
const idEdicion = new URLSearchParams(location.search).get('id');

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

// Atiende también las filas de competencias agregadas posteriormente.
competencias.addEventListener('click', (evento) => {
  if (!evento.target.closest('[data-accion="quitar-competencia"]')) {
    return;
  }

  evento.target.closest('.input-group').remove();
});

agregarCompetencia();

/** Lee y prepara los valores para validarlos o guardarlos. */
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

/** Coloca en el formulario los datos existentes al entrar en modo edición. */
function llenarFormulario(iniciativa) {
  const campos = [
    'titulo',
    'tipo',
    'categoria',
    'resumen',
    'descripcion',
    'problema',
    'beneficiarios',
    'participantesEstimados',
    'visibilidad'
  ];

  for (const campo of campos) {
    formulario.elements.namedItem(campo).value = iniciativa[campo];
  }

  formulario.elements.namedItem('etiquetas').value =
    iniciativa.etiquetas.join(', ');

  competencias.replaceChildren();
  iniciativa.competencias.forEach((competencia) =>
    agregarCompetencia(competencia)
  );

  document.querySelector('#tituloPagina').textContent =
    'Editar iniciativa';
  document.title = 'Editar iniciativa | Innovation Hub';
  formulario.querySelector('#guardar').textContent = 'Guardar cambios';
}

// La carga inicial evita reemplazar las iniciativas ya existentes.
formulario.querySelector('#guardar').disabled = true;
estado(aviso, 'Preparando datos…');

try {
  await cargarIniciativas();

  if (idEdicion) {
    const original = obtenerIniciativa(idEdicion);

    if (!original) {
      throw new Error('La iniciativa que deseas editar no existe.');
    }

    if (original.propietario !== USUARIO_ACTUAL) {
      throw new Error(
        'Solo puedes editar tus propias iniciativas en esta demostración.'
      );
    }

    llenarFormulario(original);
  }

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

  // Con id actualiza el registro; sin id crea uno nuevo.
  const guardada = idEdicion
    ? actualizarIniciativa(idEdicion, datos)
    : crearIniciativa(datos);

  if (!guardada) {
    estado(
      aviso,
      'La iniciativa ya no está disponible para edición.',
      'alert alert-danger'
    );
    return;
  }

  const enlace = document.createElement('a');
  enlace.href = `detalle.html?id=${encodeURIComponent(guardada.id)}`;
  enlace.textContent = 'Ver la iniciativa';

  aviso.replaceChildren(
    document.createTextNode(
      idEdicion
        ? 'Cambios guardados localmente. '
        : 'Iniciativa guardada localmente. '
    ),
    enlace
  );
  aviso.className = 'alert alert-success';

  // Al editar conservamos los valores visibles; al crear limpiamos el formulario.
  if (!idEdicion) {
    formulario.reset();
    competencias.replaceChildren();
    agregarCompetencia();
  }
});