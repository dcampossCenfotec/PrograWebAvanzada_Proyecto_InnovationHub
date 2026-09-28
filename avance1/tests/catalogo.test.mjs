import test from 'node:test';
import assert from 'node:assert/strict';
import { filtrarIniciativas, normalizarTexto, obtenerOpciones } from '../js/filtros.js';

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

const iniciativasCompletas = [
  {
    ...iniciativasPorTipo[0],
    categoria: 'Educación',
    competencias: ['Docencia', 'Agronomía']
  },
  {
    ...iniciativasPorTipo[1],
    categoria: 'Ambiente',
    competencias: [' agronomía ', 'Diseño']
  },
  {
    ...iniciativasPorTipo[2],
    categoria: 'educacion',
    competencias: ['DOCENCIA', 'Robótica']
  },
  {
    ...iniciativasPorTipo[3],
    categoria: 'Categoría privada',
    competencias: ['Competencia privada']
  }
];

test('genera opciones únicas ordenadas sin metadatos restringidos ni cambios en los datos', () => {
  const originales = structuredClone(iniciativasCompletas);
  const opciones = obtenerOpciones(iniciativasCompletas);
  assert.deepEqual(opciones.categorias, [
    { valor: 'ambiente', etiqueta: 'Ambiente' },
    { valor: 'educacion', etiqueta: 'Educación' }
  ]);
  assert.deepEqual(opciones.competencias, [
    { valor: 'agronomia', etiqueta: 'Agronomía' },
    { valor: 'diseno', etiqueta: 'Diseño' },
    { valor: 'docencia', etiqueta: 'Docencia' },
    { valor: 'robotica', etiqueta: 'Robótica' }
  ]);
  assert.deepEqual(iniciativasCompletas, originales);
  assert.deepEqual(obtenerOpciones([]), { categorias: [], competencias: [] });
});

test('filtra por categoría y por pertenencia a competencias, sin coincidencias parciales', () => {
  assert.deepEqual(
    filtrarIniciativas(iniciativasCompletas, { categoria: 'EDUCACIÓN' })
      .map((iniciativa) => iniciativa.id),
    ['idea', 'reto']
  );
  assert.deepEqual(
    filtrarIniciativas(iniciativasCompletas, { competencia: 'agronomia' })
      .map((iniciativa) => iniciativa.id),
    ['idea', 'necesidad']
  );
  assert.deepEqual(
    filtrarIniciativas(iniciativasCompletas, { competencia: 'agro' }), []
  );
});

test('exige simultáneamente texto, tipo, categoría y competencia', () => {
  const criterios = {
    texto: 'MENTORIAS', tipo: 'idea', categoria: 'educacion', competencia: 'docencia'
  };
  assert.deepEqual(
    filtrarIniciativas(iniciativasCompletas, criterios).map((iniciativa) => iniciativa.id),
    ['idea']
  );
  for (const [campo, valor] of [
    ['texto', 'inexistente'], ['tipo', 'necesidad'],
    ['categoria', 'ambiente'], ['competencia', 'robotica']
  ]) {
    assert.deepEqual(
      filtrarIniciativas(iniciativasCompletas, { ...criterios, [campo]: valor }), []
    );
  }
});

test('excluye restringidas cuando hay un filtro por categoría o competencia', () => {
  for (const criterios of [
    { categoria: 'Categoría privada' },
    { competencia: 'Competencia privada' }
  ]) {
    assert.deepEqual(filtrarIniciativas(iniciativasCompletas, criterios), []);
  }
  assert.deepEqual(
    filtrarIniciativas(iniciativasCompletas, {
      texto: 'ambientales', categoria: '', competencia: ''
    }).map((iniciativa) => iniciativa.id),
    ['restringida']
  );
});
