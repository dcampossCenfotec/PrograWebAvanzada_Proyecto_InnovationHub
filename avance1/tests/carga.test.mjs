import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// DOM mínimo para comprobar los estados de la vista sin dependencias nuevas.
class Nodo {
  constructor() {
    this.textContent = '';
    this.value = '';
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
  '#confirmarEliminar', '#tituloIniciativas', '#busquedaIniciativas', '#filtroTipo',
  '#filtroCategoria', '#filtroCompetencia', '#limpiarFiltros'
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
  assert.equal(nodos.get('#busquedaIniciativas').disabled, true);
  assert.equal(nodos.get('#filtroTipo').disabled, true);
  assert.equal(nodos.get('#filtroCategoria').disabled, true);
  assert.equal(nodos.get('#filtroCompetencia').disabled, true);
  assert.equal(nodos.get('#limpiarFiltros').disabled, true);
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
    assert.match(texto(aviso), /Mostrando 1 de 1 iniciativa\./);

    const busqueda = nodos.get('#busquedaIniciativas');
    assert.equal(busqueda.disabled, false);
    busqueda.focus();
    busqueda.value = 'sin coincidencias';
    busqueda.escuchas.get('input')();
    assert.equal(lista.children.length, 0);
    assert.match(texto(aviso), /No se encontraron iniciativas con estos criterios/);
    assert.equal(document.activeElement, busqueda);

    api.actualizarIniciativa(nueva.id, { titulo: 'Sin coincidencias anteriores' });
    assert.equal(lista.children.length, 1);
    assert.equal(busqueda.value, 'sin coincidencias');

    const filtroTipo = nodos.get('#filtroTipo');
    assert.equal(filtroTipo.disabled, false);
    filtroTipo.focus();
    filtroTipo.value = 'reto';
    filtroTipo.escuchas.get('change')();
    assert.equal(lista.children.length, 0);
    assert.match(texto(aviso), /No se encontraron iniciativas con estos criterios/);
    assert.equal(busqueda.value, 'sin coincidencias');
    assert.equal(document.activeElement, filtroTipo);

    api.actualizarIniciativa(nueva.id, { tipo: 'reto' });
    assert.equal(lista.children.length, 1);
    assert.equal(filtroTipo.value, 'reto');

    busqueda.value = 'texto que no existe';
    busqueda.escuchas.get('input')();
    assert.equal(lista.children.length, 0);
    assert.equal(filtroTipo.value, 'reto');

    filtroTipo.value = '';
    filtroTipo.escuchas.get('change')();
    assert.equal(lista.children.length, 0);
    assert.equal(busqueda.value, 'texto que no existe');

    busqueda.value = '';
    busqueda.escuchas.get('input')();
    assert.equal(lista.children.length, 1);

    const categoria = nodos.get('#filtroCategoria');
    const competencia = nodos.get('#filtroCompetencia');
    assert.equal(categoria.disabled, false);
    assert.equal(competencia.disabled, false);
    categoria.value = 'educacion';
    competencia.value = 'agronomia';
    categoria.escuchas.get('change')();
    competencia.escuchas.get('change')();
    assert.equal(lista.children.length, 1);

    const opcionesAntes = competencia.children.map((opcion) => opcion.value);
    busqueda.value = 'sin resultados';
    busqueda.escuchas.get('input')();
    assert.equal(lista.children.length, 0);
    assert.deepEqual(competencia.children.map((opcion) => opcion.value), opcionesAntes);
    busqueda.value = '';
    busqueda.escuchas.get('input')();

    api.actualizarIniciativa(nueva.id, { competencias: ['Robótica'] });
    assert.equal(lista.children.length, 0);
    assert.equal(competencia.value, 'agronomia');
    assert.ok(competencia.children.some((opcion) => opcion.value === 'robotica'));
    assert.ok(competencia.children.some(
      (opcion) => opcion.textContent === 'Agronomía (sin disponibles)'
    ));
    competencia.value = 'robotica';
    competencia.escuchas.get('change')();
    assert.equal(lista.children.length, 1);

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

  await t.test('limpia todos los criterios, retira opciones obsoletas y recupera los resultados', async () => {
    const api = await import('../js/iniciativas.js');
    const [campos] = JSON.parse(await readFile(
      new URL('../datos/iniciativas.json', import.meta.url), 'utf8'
    ));
    const primera = api.crearIniciativa(campos);
    const segunda = api.crearIniciativa({ ...campos, tipo: 'reto' });
    const busqueda = nodos.get('#busquedaIniciativas');
    const tipo = nodos.get('#filtroTipo');
    const categoria = nodos.get('#filtroCategoria');
    const competencia = nodos.get('#filtroCompetencia');
    const limpiar = nodos.get('#limpiarFiltros');

    limpiar.escuchas.get('click')();
    assert.match(texto(aviso), /Mostrando 2 de 2 iniciativas/);
    busqueda.value = 'huertos';
    tipo.value = 'idea';
    categoria.value = 'educacion';
    competencia.value = 'agronomia';
    competencia.focus();
    competencia.escuchas.get('change')();
    assert.equal(lista.children.length, 1);
    assert.match(texto(aviso), /Mostrando 1 de 2 iniciativas/);
    assert.equal(document.activeElement, competencia);

    api.actualizarIniciativa(primera.id, { competencias: ['Robótica'] });
    api.actualizarIniciativa(segunda.id, { competencias: ['Robótica'] });
    assert.match(texto(aviso), /Mostrando 0 de 2 iniciativas/);
    assert.match(texto(aviso), /pulsa Limpiar filtros/);
    assert.ok(competencia.children.some(
      (opcion) => opcion.textContent === 'Agronomía (sin disponibles)'
    ));

    const persistidas = almacenamiento.get(clave);
    limpiar.focus();
    limpiar.escuchas.get('click')();
    for (const control of [busqueda, tipo, categoria, competencia]) {
      assert.equal(control.value, '');
    }
    assert.equal(lista.children.length, 2);
    assert.match(texto(aviso), /Mostrando 2 de 2 iniciativas/);
    assert.equal(document.activeElement, busqueda);
    assert.ok(!competencia.children.some((opcion) => opcion.value === 'agronomia'));
    assert.equal(almacenamiento.get(clave), persistidas);
    assert.equal(cargas, 5);
    assert.equal(suscripciones, 1);

    api.eliminarIniciativa(primera.id);
    api.eliminarIniciativa(segunda.id);
    limpiar.escuchas.get('click')();
    assert.match(texto(aviso), /Mostrando 0 de 0 iniciativas/);
    assert.match(texto(aviso), /No hay iniciativas disponibles/);
    assert.doesNotMatch(texto(aviso), /No se encontraron/);
  });
});
