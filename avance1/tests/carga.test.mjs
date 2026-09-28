import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// DOM mínimo para comprobar los estados de la vista sin dependencias nuevas.
class Nodo {
  constructor() {
    this.textContent = '';
    this.children = [];
    this.dataset = {};
    this.atributos = {};
    this.escuchas = new Map();
    this.hidden = false;
    this.disabled = false;
  }

  append(...nodos) {
    this.children.push(...nodos);
  }

  replaceChildren(...nodos) {
    this.children = nodos;
  }

  setAttribute(nombre, valor) {
    this.atributos[nombre] = valor;
  }

  addEventListener(tipo, escucha) {
    assert.ok(!this.escuchas.has(tipo), 'No debe duplicar listeners');
    this.escuchas.set(tipo, escucha);
  }

  focus() {
    document.activeElement = this;
  }
}

function texto(nodo) {
  return [nodo.textContent, ...nodo.children.map(texto)].join(' ');
}

const nodos = new Map([
  '#listaIniciativas', '#estadoIniciativas', '#estadoOperacion',
  '#reintentarCarga', '#modalEliminar', '#mensajeEliminar',
  '#confirmarEliminar', '#tituloIniciativas'
].map((selector) => [selector, new Nodo()]));

const lista = nodos.get('#listaIniciativas');
const aviso = nodos.get('#estadoIniciativas');
const reintentar = nodos.get('#reintentarCarga');
reintentar.hidden = true;

globalThis.document = {
  activeElement: null,
  querySelector: (selector) => nodos.get(selector),
  createElement: () => new Nodo()
};
globalThis.bootstrap = {
  Modal: class {
    show() {}
    hide() {}
  }
};
let suscripciones = 0;
globalThis.window = new class extends EventTarget {
  addEventListener(tipo, escucha) {
    if (tipo === 'iniciativas:actualizadas') suscripciones += 1;
    super.addEventListener(tipo, escucha);
  }
}();
globalThis.CustomEvent = class extends Event {
  constructor(tipo, opciones) {
    super(tipo);
    this.detail = opciones.detail;
  }
};

const clave = 'innovation-hub-iniciativas-v1';
const almacenamiento = new Map([[clave, '{']]);
globalThis.localStorage = {
  getItem: (nombre) => almacenamiento.get(nombre) ?? null,
  setItem: (nombre, valor) => almacenamiento.set(nombre, valor)
};

let cargas = 0;
let respuesta;
globalThis.fetch = async () => {
  cargas += 1;
  return respuesta();
};

async function reintentarCarga() {
  reintentar.focus();
  await reintentar.escuchas.get('click')();
}

function comprobarError() {
  assert.match(texto(aviso), /No se pudieron cargar las iniciativas/);
  assert.equal(aviso.className, 'alert alert-danger');
  assert.equal(reintentar.hidden, false);
  assert.equal(reintentar.disabled, false);
  assert.equal(lista.atributos['aria-busy'], 'false');
  assert.equal(lista.children.length, 0);
}

test('gestiona fallos, reintentos, carga, vacío y actualizaciones de la vista', async (t) => {
  await t.test('conserva los datos persistidos inválidos sin recurrir al JSON', async () => {
    await import('../js/inicio.js');
    comprobarError();
    assert.equal(almacenamiento.get(clave), '{');
    assert.equal(cargas, 0);

    almacenamiento.set(clave, '{}');
    await reintentarCarga();
    comprobarError();
    assert.equal(almacenamiento.get(clave), '{}');
    assert.equal(cargas, 0);
    almacenamiento.delete(clave);
  });

  await t.test('muestra carga y evita solicitudes simultáneas durante el reintento', async () => {
    let rechazar;
    respuesta = () => new Promise((resolver, fallo) => {
      rechazar = fallo;
    });
    const pendiente = reintentarCarga();
    assert.match(texto(aviso), /Cargando iniciativas/);
    assert.equal(lista.atributos['aria-busy'], 'true');
    assert.equal(reintentar.disabled, true);
    await reintentar.escuchas.get('click')();
    assert.equal(cargas, 1);
    rechazar(new Error('Sin conexión'));
    await pendiente;
    comprobarError();
    assert.equal(document.activeElement, reintentar);
  });

  await t.test('permite recuperarse de HTTP fallido, JSON inválido y datos no listados', async () => {
    for (const resultado of [
      { ok: false, status: 503 },
      { ok: true, json: async () => JSON.parse('{') },
      { ok: true, json: async () => ({}) }
    ]) {
      respuesta = async () => resultado;
      await reintentarCarga();
      comprobarError();
    }
  });

  await t.test('distingue una colección vacía de un error y devuelve el foco', async () => {
    respuesta = async () => ({ ok: true, json: async () => [] });
    await reintentarCarga();
    assert.match(texto(aviso), /No hay iniciativas disponibles/);
    assert.equal(aviso.className, 'alert alert-info');
    assert.equal(reintentar.hidden, true);
    assert.equal(lista.atributos['aria-busy'], 'false');
    assert.equal(document.activeElement, nodos.get('#tituloIniciativas'));
  });

  await t.test('mantiene una suscripción y conserva el aviso vacío al eliminar la última iniciativa', async () => {
    const api = await import('../js/iniciativas.js');
    const [campos] = JSON.parse(await readFile(
      new URL('../datos/iniciativas.json', import.meta.url), 'utf8'
    ));
    const nueva = api.crearIniciativa(campos);
    assert.equal(lista.children.length, 1);
    assert.match(texto(aviso), /Iniciativas disponibles: 1/);

    await lista.escuchas.get('click')({
      target: {
        closest: () => ({ dataset: { eliminarId: nueva.id } })
      }
    });
    await nodos.get('#confirmarEliminar').escuchas.get('click')();
    assert.equal(lista.children.length, 0);
    assert.match(texto(aviso), /No hay iniciativas disponibles/);
    assert.match(texto(nodos.get('#estadoOperacion')), /Iniciativa eliminada/);
    assert.equal(cargas, 5);
    assert.equal(suscripciones, 1);
  });
});
