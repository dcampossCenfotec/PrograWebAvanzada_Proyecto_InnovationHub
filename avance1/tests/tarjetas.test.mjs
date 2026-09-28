import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { crearTarjeta } from '../js/tarjetas.js';
import { USUARIO_ACTUAL } from '../js/iniciativas.js';

const iniciativas = JSON.parse(
  await readFile(new URL('../datos/iniciativas.json', import.meta.url), 'utf8')
);

// Simula únicamente los nodos usados por el renderizado, sin dependencias nuevas.
class Nodo {
  constructor(etiqueta) {
    this.etiqueta = etiqueta;
    this.textContent = '';
    this.children = [];
    this.dataset = {};
  }

  append(...nodos) {
    this.children.push(...nodos);
  }

  set innerHTML(valor) {
    throw new Error('Las tarjetas deben insertar texto, no interpretar HTML.');
  }
}

globalThis.document = {
  createElement: (etiqueta) => new Nodo(etiqueta)
};

function descendientes(nodo) {
  return [nodo, ...nodo.children.flatMap(descendientes)];
}

test('muestra los datos del catálogo sin modificar las iniciativas', () => {
  const originales = structuredClone(iniciativas);

  for (const iniciativa of iniciativas.filter(
    (actual) => actual.visibilidad !== 'restringida'
  )) {
    const nodos = descendientes(crearTarjeta(iniciativa));
    const textos = nodos.map((nodo) => nodo.textContent);

    for (const valor of [
      iniciativa.titulo,
      iniciativa.resumen,
      iniciativa.categoria,
      iniciativa.propietario,
      iniciativa.estado,
      ...iniciativa.competencias
    ]) {
      assert.ok(textos.includes(valor), `Falta el dato: ${valor}`);
    }

    assert.ok(textos.includes({
      idea: 'Idea',
      necesidad: 'Necesidad',
      reto: 'Reto'
    }[iniciativa.tipo]));
    assert.equal(nodos.filter((nodo) => nodo.etiqueta === 'article').length, 1);
  }

  assert.deepEqual(iniciativas, originales);
});

test('no incorpora metadatos restringidos al contenido ni a los atributos', () => {
  const restringida = iniciativas.find(
    (iniciativa) => iniciativa.visibilidad === 'restringida'
  );
  const camposOcultos = [
    'titulo', 'tipo', 'categoria', 'propietario', 'estado',
    'descripcion', 'problema', 'beneficiarios'
  ];
  const iniciativa = {
    ...restringida,
    ...Object.fromEntries(camposOcultos.map(
      (campo) => [campo, `dato-privado-${campo}`]
    )),
    competencias: ['competencia-privada'],
    miembros: ['miembro-privado'],
    etiquetas: ['etiqueta-privada']
  };
  const tarjeta = crearTarjeta(iniciativa);
  const serializada = JSON.stringify(tarjeta);

  for (const valor of [
    ...camposOcultos.map((campo) => iniciativa[campo]),
    ...iniciativa.competencias,
    ...iniciativa.miembros,
    ...iniciativa.etiquetas
  ]) {
    assert.ok(!serializada.includes(valor), `Se expuso: ${valor}`);
  }

  const nodos = descendientes(tarjeta);
  assert.ok(nodos.some((nodo) => nodo.textContent === iniciativa.resumen));
  assert.ok(nodos.some((nodo) => nodo.textContent === 'Iniciativa restringida'));
  assert.equal(nodos.filter((nodo) => nodo.etiqueta === 'a').length, 1);
  assert.equal(nodos.filter((nodo) => nodo.etiqueta === 'button').length, 0);
});

test('conserva edición y borrado solo para el propietario y codifica los IDs', () => {
  for (const visibilidad of ['publica', 'comunidad', 'equipo', 'restringida']) {
    for (const propia of [true, false]) {
      const iniciativa = {
        ...iniciativas[0],
        id: 'id con espacios&otro=valor#final',
        visibilidad,
        propietario: propia ? USUARIO_ACTUAL : 'Otra persona'
      };
      const nodos = descendientes(crearTarjeta(iniciativa));
      const enlaces = nodos.filter((nodo) => nodo.etiqueta === 'a');
      const botones = nodos.filter((nodo) => nodo.etiqueta === 'button');
      const id = encodeURIComponent(iniciativa.id);

      assert.equal(enlaces[0].href, `paginas/detalle.html?id=${id}`);
      assert.equal(enlaces.length, propia ? 2 : 1);
      assert.equal(botones.length, propia ? 1 : 0);

      if (propia) {
        assert.equal(enlaces[1].href, `paginas/formulario.html?id=${id}`);
        assert.equal(botones[0].type, 'button');
        assert.equal(botones[0].dataset.eliminarId, iniciativa.id);
      }
    }
  }
});

test('conserva el contenido del usuario como texto literal', () => {
  const contenido = '<img src=x onerror=alert(1)>';
  const iniciativa = {
    ...iniciativas[0],
    titulo: contenido,
    resumen: contenido,
    competencias: [contenido]
  };
  const nodos = descendientes(crearTarjeta(iniciativa));

  assert.equal(nodos.filter((nodo) => nodo.textContent === contenido).length, 3);
  assert.ok(!nodos.some((nodo) => nodo.etiqueta === 'img'));
});
