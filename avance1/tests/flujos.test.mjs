import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validarIniciativa } from '../js/validacion.js';

class Nodo {
  constructor() {
    this.textContent = '';
    this.value = '';
    this.children = [];
    this.hidden = true;
    this.escuchas = new Map();
    this.classList = { toggle() {} };
  }
  append(...nodos) { this.children.push(...nodos); }
  replaceChildren(...nodos) { this.children = nodos; }
  add(nodo) { this.children.push(nodo); }
  setAttribute() {}
  removeAttribute() {}
  focus() {}
  reset() {}
  addEventListener(tipo, escucha) { this.escuchas.set(tipo, escucha); }
}

function texto(nodo) {
  return [nodo.textContent, ...nodo.children.map(texto)].join(' ');
}

let nodos;
function preparar(id) {
  nodos = new Map([
    '#detalle', '#accionesDetalle', '#estadoDetalle', '#formularioSolicitud',
    '#estadoSolicitud', '#iniciativaDestino', '#error-mensaje', '#error-competencia',
    '#error-rol', '#error-disponibilidad'
  ].map((selector) => [selector, new Nodo()]));
  globalThis.location = { search: `?id=${encodeURIComponent(id)}` };
}

globalThis.document = {
  querySelector: (selector) => nodos.get(selector),
  getElementById: (id) => nodos.get(`#${id}`),
  createElement: () => new Nodo(),
  createTextNode: (valor) => Object.assign(new Nodo(), { textContent: valor })
};
globalThis.Option = class extends Nodo {
  constructor(etiqueta, valor) {
    super();
    this.textContent = etiqueta;
    this.value = valor;
  }
};
const almacenamiento = new Map();
globalThis.localStorage = {
  getItem: (clave) => almacenamiento.get(clave) ?? null,
  setItem: (clave, valor) => almacenamiento.set(clave, valor)
};
globalThis.window = new EventTarget();
globalThis.CustomEvent = class extends Event {
  constructor(tipo, opciones) {
    super(tipo);
    this.detail = opciones.detail;
  }
};
globalThis.fetch = async (url) => ({
  ok: true,
  json: async () => JSON.parse(await readFile(url, 'utf8'))
});
const api = await import('../js/iniciativas.js');
await api.cargarIniciativas();

test('una iniciativa creada y editada conserva sus datos y acceso de edición en detalle', async () => {
  const campos = { ...api.obtenerIniciativa('ini-001'), titulo: 'Huertos comunitarios nuevos' };
  assert.deepEqual(validarIniciativa(campos), {});
  const nueva = api.crearIniciativa(campos);
  api.actualizarIniciativa(nueva.id, { titulo: 'Huertos comunitarios editados' });
  preparar(nueva.id);
  await import('../js/detalle.js?flujo=propia');
  assert.match(texto(nodos.get('#detalle')), /Huertos comunitarios editados/);
  assert.equal(nodos.get('#accionesDetalle').children[0].href,
    `formulario.html?id=${encodeURIComponent(nueva.id)}`);
  const otraPagina = await import('../js/iniciativas.js?flujo=otra-pagina');
  await otraPagina.cargarIniciativas();
  assert.equal(otraPagina.obtenerIniciativa(nueva.id).titulo, 'Huertos comunitarios editados');
  assert.equal(api.eliminarIniciativa(nueva.id), true);
});

test('el detalle ajeno enlaza a solicitud y enviarla no incorpora al usuario al equipo', async () => {
  preparar('ini-002');
  await import('../js/detalle.js?flujo=ajena');
  assert.equal(nodos.get('#accionesDetalle').children[0].href, 'participar.html?id=ini-002');
  const antes = api.obtenerIniciativa('ini-002');
  const controles = new Map(['mensaje', 'competencia', 'rol', 'disponibilidad']
    .map((nombre) => [nombre, new Nodo()]));
  const formulario = nodos.get('#formularioSolicitud');
  formulario.elements = { namedItem: (nombre) => controles.get(nombre) };
  await import('../js/participar.js?flujo=ajena');
  assert.equal(formulario.hidden, false);
  assert.deepEqual(controles.get('competencia').children.map((opcion) => opcion.value), antes.competencias);
  controles.get('mensaje').value = 'Quiero aportar mis conocimientos a esta iniciativa.';
  controles.get('competencia').value = antes.competencias[0];
  controles.get('rol').value = 'colaborador';
  controles.get('disponibilidad').value = '2-4 horas';
  formulario.escuchas.get('submit')({ preventDefault() {} });
  assert.match(texto(nodos.get('#estadoSolicitud')), /Solicitud simulada y guardada/);
  const solicitudes = JSON.parse(almacenamiento.get('innovation-hub-solicitudes-v1'));
  assert.equal(solicitudes.length, 1);
  assert.equal(solicitudes[0].iniciativaId, 'ini-002');
  assert.deepEqual(api.obtenerIniciativa('ini-002').miembros, antes.miembros);
});

test('el detalle restringido no revela título ni ofrece participación y rechaza acceso directo', async () => {
  preparar('ini-003');
  await import('../js/detalle.js?flujo=restringida');
  assert.ok(!texto(nodos.get('#detalle')).includes(api.obtenerIniciativa('ini-003').titulo));
  assert.equal(nodos.get('#accionesDetalle').children.length, 0);
  await import('../js/participar.js?flujo=restringida');
  assert.equal(nodos.get('#formularioSolicitud').hidden, true);
  assert.match(texto(nodos.get('#estadoSolicitud')), /No se aceptan solicitudes/);
});
