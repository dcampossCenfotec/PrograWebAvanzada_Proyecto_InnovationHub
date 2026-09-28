import test from 'node:test';
import assert from 'node:assert/strict';
import { filtrarIniciativas, normalizarTexto } from '../js/filtros.js';

const iniciativas = [
  {
    id: 'publica',
    titulo: 'Educación comunitaria',
    resumen: 'Organizar mentorías para estudiantes.',
    visibilidad: 'publica'
  },
  {
    id: 'restringida',
    titulo: 'Título confidencial',
    resumen: 'Proponer soluciones ambientales.',
    visibilidad: 'restringida'
  }
];

function buscar(texto) {
  return filtrarIniciativas(iniciativas, { texto }).map(
    (iniciativa) => iniciativa.id
  );
}

test('busca coincidencias parciales en título y resumen ignorando tildes y mayúsculas', () => {
  assert.deepEqual(buscar('  EDUCACION  '), ['publica']);
  assert.deepEqual(buscar('mentorias'), ['publica']);
  assert.deepEqual(buscar('comunit'), ['publica']);
  assert.equal(normalizarTexto(' EDUCACIO\u0301N '), 'educacion');
});

test('busca las iniciativas restringidas únicamente por el resumen', () => {
  assert.deepEqual(buscar('confidencial'), []);
  assert.deepEqual(buscar('ambientales'), ['restringida']);
});

test('devuelve todas las iniciativas con consulta vacía y ninguna si no hay coincidencias', () => {
  assert.deepEqual(buscar('   '), ['publica', 'restringida']);
  assert.deepEqual(buscar('inexistente'), []);
  assert.deepEqual(filtrarIniciativas([], { texto: 'algo' }), []);
  assert.deepEqual(filtrarIniciativas(iniciativas), iniciativas);
});

test('no modifica los datos originales al buscar ni al cambiar el arreglo resultante', () => {
  const originales = structuredClone(iniciativas);
  const resultado = filtrarIniciativas(iniciativas, { texto: '' });
  assert.notEqual(resultado, iniciativas);
  resultado.pop();
  filtrarIniciativas(iniciativas, { texto: 'EDUCACION' });
  assert.deepEqual(iniciativas, originales);
});

const iniciativasPorTipo = [
  { ...iniciativas[0], id: 'idea', tipo: 'idea' },
  { ...iniciativas[0], id: 'necesidad', tipo: 'necesidad', visibilidad: 'comunidad' },
  { ...iniciativas[0], id: 'reto', tipo: 'reto', visibilidad: 'equipo' },
  { ...iniciativas[1], tipo: 'reto' }
];

test('filtra los tres tipos y recupera la colección completa al seleccionar Todos', () => {
  for (const tipo of ['idea', 'necesidad', 'reto']) {
    assert.deepEqual(
      filtrarIniciativas(iniciativasPorTipo, { tipo }).map((iniciativa) => iniciativa.id),
      [tipo]
    );
  }

  assert.deepEqual(filtrarIniciativas(iniciativasPorTipo, { tipo: '' }), iniciativasPorTipo);
  assert.deepEqual(filtrarIniciativas(iniciativasPorTipo, { tipo: 'desconocido' }), []);
});

test('combina búsqueda y tipo exigiendo ambos criterios sin modificar los datos', () => {
  const originales = structuredClone(iniciativasPorTipo);
  assert.deepEqual(
    filtrarIniciativas(iniciativasPorTipo, { texto: 'MENTORIAS', tipo: 'necesidad' })
      .map((iniciativa) => iniciativa.id),
    ['necesidad']
  );
  assert.deepEqual(
    filtrarIniciativas(iniciativasPorTipo, { texto: 'inexistente', tipo: 'idea' }),
    []
  );
  assert.deepEqual(iniciativasPorTipo, originales);
});

test('no revela el tipo de restringidas aunque coincidan texto y tipo', () => {
  assert.deepEqual(
    filtrarIniciativas(iniciativasPorTipo, { texto: 'ambientales', tipo: 'reto' }),
    []
  );
  assert.deepEqual(
    filtrarIniciativas(iniciativasPorTipo, { texto: 'ambientales', tipo: '' })
      .map((iniciativa) => iniciativa.id),
    ['restringida']
  );
});
