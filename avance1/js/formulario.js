/** Registro y edición comparten el mismo formulario para mantener las reglas. */
const formulario = document.querySelector('#formularioIniciativa');
const competencias = formulario.querySelector('#competencias');

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

// Un solo listener atiende las filas actuales y las agregadas después.
competencias.addEventListener('click', (evento) => {
  if (!evento.target.closest('[data-accion="quitar-competencia"]')) {
    return;
  }

  evento.target.closest('.input-group').remove();
});

agregarCompetencia();