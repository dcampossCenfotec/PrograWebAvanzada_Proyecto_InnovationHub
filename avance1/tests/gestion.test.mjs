import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validarIniciativa } from '../js/validacion.js';

// Simula las funciones mínimas del navegador que utiliza iniciativas.js.
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

let cargas = 0;

globalThis.fetch = async (url) => {
  cargas += 1;

  return {
    ok: true,
    json: async () =>
      JSON.parse(await readFile(url, 'utf8'))
  };
};

const api = await import('../js/iniciativas.js');

test(
  'carga los datos iniciales y protege las iniciativas ajenas',
  async () => {
    const iniciales = await api.cargarIniciativas();

    assert.equal(iniciales.length, 8);

    assert.deepEqual(
      new Set(iniciales.map((iniciativa) => iniciativa.tipo)),
      new Set(['idea', 'necesidad', 'reto'])
    );

    assert.equal(cargas, 1);

    // Modificar una copia no cambia el dato original.
    iniciales[0].titulo = 'No debe cambiar el original';

    assert.equal(
      api.obtenerIniciativa('ini-001').titulo,
      'Huertos escolares'
    );

    assert.equal(
      api.actualizarIniciativa('ini-002', {
        titulo: 'Sin autorización'
      }),
      null
    );

    assert.equal(api.eliminarIniciativa('ini-002'), false);
  }
);

test(
  'crea, edita y elimina usando una fuente de datos compartida',
  () => {
    let avisos = 0;

    const dejarDeEscuchar = api.alCambiarIniciativas(() => {
      avisos += 1;
    });

    const nueva = api.crearIniciativa({
      titulo: 'Ensayo completo',
      tipo: 'idea',
      categoria: 'Ambiente',
      resumen: 'Un resumen de prueba',
      descripcion: 'Una descripción de prueba',
      problema: 'Un problema de prueba',
      beneficiarios: 'Público',
      competencias: ['Diseño'],
      participantesEstimados: 2,
      visibilidad: 'publica',
      etiquetas: ['prueba']
    });

    assert.equal(
      api.obtenerIniciativa(nueva.id).titulo,
      'Ensayo completo'
    );

    assert.equal(
      JSON.parse(
        almacenamiento.get('innovation-hub-iniciativas-v1')
      ).length,
      9
    );

    assert.equal(
      api.actualizarIniciativa(nueva.id, {
        titulo: 'Ensayo editado'
      }).titulo,
      'Ensayo editado'
    );

    assert.equal(api.eliminarIniciativa(nueva.id), true);
    assert.equal(api.obtenerIniciativa(nueva.id), null);
    assert.equal(avisos, 3);

    dejarDeEscuchar();
  }
);

test(
  'rechaza duplicados, rangos incorrectos y campos incompletos',
  () => {
    const campos = {
      titulo: 'Iniciativa válida',
      tipo: 'idea',
      categoria: 'Ambiente',
      resumen: 'Resumen suficiente para probar',
      descripcion: 'Descripción suficientemente amplia para probar',
      problema: 'Problema identificado',
      beneficiarios: 'Estudiantes',
      competencias: ['Diseño'],
      participantesEstimados: 3,
      visibilidad: 'publica',
      etiquetas: ['innovación']
    };

    assert.deepEqual(validarIniciativa(campos), {});

    const errores = validarIniciativa({
      ...campos,
      titulo: '',
      competencias: ['Diseño', 'diseño'],
      participantesEstimados: 0,
      etiquetas: ['a', 'a']
    });

    assert.ok(errores.titulo);
    assert.ok(errores.competencias);
    assert.ok(errores.participantesEstimados);
    assert.ok(errores.etiquetas);

    assert.ok(
      validarIniciativa({
        ...campos,
        etiquetas: ['']
      }).etiquetas
    );
  }
);