# Cliente React de Innovation Hub

Base navegable del Avance 2 construida con React, Vite y React Router. Las pantallas de UI01 son marcadores explícitos: validan la estructura de rutas, pero todavía no consultan la API ni implementan operaciones de negocio.

## Requisitos

- Node.js `22.12.0` o posterior compatible. `.nvmrc` fija la versión compartida recomendada.
- npm compatible con la versión de Node instalada.

## Ejecución

```bash
npm ci
npm run dev
```

Abrir `http://localhost:5173`. La URL puede cambiar si ese puerto está ocupado; Vite lo indica en la terminal.

## Comandos

| Comando | Función |
| --- | --- |
| `npm run dev` | Servidor local con recarga durante desarrollo. |
| `npm run build` | Genera el paquete de producción en `dist/`. |
| `npm run preview` | Sirve localmente el build generado. |
| `npm run lint` | Ejecuta ESLint sobre JavaScript y JSX. |
| `npm test` | Puerta estructural actual: lint y build. Las pruebas de comportamiento se agregan con las funciones reales. |

## Alcance actual

- Todas las rutas acordadas se resuelven mediante React Router.
- Las rutas de detalle leen `:id` desde la URL.
- La ruta comodín presenta un error 404 con regreso al inicio.
- La navegación interna utiliza `Link`/`NavLink` y no recarga todo el documento.
- No hay autenticación, llamadas HTTP, estado de dominio ni formularios funcionales todavía.

El contrato HTTP común está en [`../docs/api-contract.md`](../docs/api-contract.md). La guía general de ejecución se mantiene en el [`README.md` raíz](../README.md).
