
# Cierre y entrega — Innovation Hub Avance 2

## 1. Objetivo

Preparar un candidato de entrega verificable para SOFT-12, con contrato HTTP congelado, pruebas reproducibles y etiqueta Git `entrega-2`.

Este documento no certifica que el proyecto ya fue enviado a Moodle.

## 2. Condiciones de cierre

No crear la etiqueta hasta cumplir estas condiciones:

- El cliente React inicia correctamente.
- El servidor Express inicia correctamente.
- MongoDB está disponible en replica set.
- El seed puede reproducirse en un entorno de prueba.
- Las 27 operaciones HTTP están registradas.
- Los flujos funcionales principales operan.
- Las pruebas locales del servidor aprueban.
- Las pruebas integradas MongoDB aprueban.
- Vitest, ESLint y build aprueban.
- La colección Postman se ejecuta sin fallos bloqueantes.
- Los permisos se validan en el servidor.
- Las operaciones concurrentes no dejan datos inconsistentes.
- El README describe el entorno real.
- No se publican secretos ni dependencias instaladas.
- Ambos integrantes conocen el código para la defensa.
- No quedan diferencias pendientes entre React y el contrato HTTP.

Si una condición obligatoria falla, corregirla y volver a comprobarla antes de etiquetar.

## 3. Comprobaciones iniciales de Git

Desde la raíz:

```powershell
git status -sb
git branch --show-current
git log -1 --oneline
git rev-list --count HEAD
```

Comprobar fechas y autores:

```powershell
git log --reverse --format="%h | %as | %an | %s"
```

La consigna exige al menos treinta commits durante cinco semanas.

No modificar fechas ni autores para aparentar distribución temporal.

## 4. Comprobación de secretos

Revisar archivos versionados:

```powershell
git ls-files
```

Buscar entradas que no deban publicarse:

```powershell
git ls-files | Select-String '(^|/)node_modules/|(^|/)\.env$|(^|/)\.env\.local$|(^|/)coverage/'
```

El resultado esperado es ninguna coincidencia.

Los archivos `.env.example` y `.env.test.example` sí pueden versionarse, sin credenciales reales.

Revisar que la colección Postman no conserve contraseñas ni tokens obtenidos durante las pruebas.

## 5. Comprobación del backend

```powershell
cd servidor
npm ci
npm run fixtures:validate
npm run check
```

Configurar `.env.test` para una base desechable.

Ejecutar:

```powershell
npm run test:integration
```

Registrar resultados reales en la bitácora.

No ejecutar pruebas destructivas en una base con datos que deban conservarse.

## 6. Comprobación del cliente

Desde la raíz:

```powershell
cd cliente
npm ci
npm test
```

Para la demostración final utilizar:

```dotenv
VITE_API_MODE=real
VITE_API_BASE_URL=http://127.0.0.1:3000/api
```

Comprobar que el build de producción no está utilizando mocks.

## 7. Comprobación integral

Ejecutar el recorrido:

1. Registrar o iniciar sesión.
2. Consultar y editar perfil.
3. Buscar iniciativas.
4. Crear una iniciativa.
5. Editar una iniciativa propia.
6. Solicitar participación con otro usuario.
7. Consultar y editar una solicitud pendiente.
8. Aceptar una solicitud con el propietario.
9. Verificar membresía activa.
10. Convertir la iniciativa en proyecto.
11. Consultar proyectos.
12. Consultar GitHub cuando corresponda.
13. Retirar integrante y conservar historial.
14. Verificar restricciones para tercero ajeno.
15. Cerrar sesión y comprobar revocación.

Revisar las matrices `docs/verificacion-contrato.md` y `docs/qa-cliente.md`.

## 8. Revisión documental

Comprobar existencia y consistencia:

- `README.md`.
- `docs/api-contract.md`.
- `docs/modelo-datos.md`.
- `docs/matriz-reglas.md`.
- `docs/matriz-pruebas.md`.
- `docs/bitacora-avance2.md`.
- `docs/verificacion-contrato.md`.
- `docs/qa-cliente.md`.
- `docs/defensa.md`.
- `pruebas/innovation-hub.postman_collection.json`.

Ningún documento debe afirmar pruebas o revisiones no realizadas.

## 9. Crear último commit

Después de validar el contenido del Commit 12:

```powershell
git add -- docs/defensa.md docs/cierre-avance2.md
git diff --cached --check
git diff --cached --stat
```

Confirmar el mensaje:

```powershell
git commit -m "docs: preparar defensa y cierre de entrega 2"
```

Comprobar que el directorio esté limpio:

```powershell
git status --porcelain
```

El resultado debe ser vacío.

## 10. Verificar candidato

Obtener hash real:

```powershell
git rev-parse HEAD
```

Verificar que la etiqueta no exista previamente:

```powershell
git tag -l entrega-2
```

Si existe, detenerse y revisar su origen.

No sobrescribir ni mover una etiqueta publicada sin acuerdo explícito del equipo.

## 11. Crear etiqueta anotada

Solo si la versión está aprobada:

```powershell
git tag -a entrega-2 -m "Innovation Hub - Avance 2"
```

Comprobar que apunta al mismo commit:

```powershell
git rev-parse HEAD
git rev-parse "entrega-2^{commit}"
```

Ambos resultados deben coincidir.

El contrato `docs/api-contract.md` queda congelado en esa versión.

## 12. Publicación de rama y etiqueta

Comprobar rama y remoto:

```powershell
git branch --show-current
git remote -v
```

Publicar la rama de entrega acordada con el equipo.

Después publicar la etiqueta:

```powershell
git push origin entrega-2
```

Comprobar la referencia remota:

```powershell
git ls-remote origin 'refs/tags/entrega-2*'
```

Una etiqueta anotada tiene una referencia de etiqueta y una referencia al commit al desreferenciarla.

Confirmar que ambas correspondan a la versión correcta.

## 13. Comprobar versión etiquetada

Probar recuperación del código en otra carpeta o clon limpio.

Ejemplo:

```powershell
git clone <URL_REAL_DEL_REPOSITORIO> innovation-hub-verificacion
cd innovation-hub-verificacion
git checkout entrega-2
```

Configurar de nuevo las variables de entorno.

Instalar dependencias con `npm ci`.

Arrancar MongoDB, servidor y cliente.

Verificar login, catálogo y una consulta de proyectos.

No copiar archivos `.env` con contraseñas al repositorio.

## 14. Preparar el TXT para Moodle

La consigna solicita un archivo de texto que contenga el enlace al repositorio de GitHub.

Debe identificar la versión específica entregada.

Contenido esperado, sustituyendo las direcciones con los valores reales:

```text
Universidad CENFOTEC
SOFT-12 - Programación Web Avanzada
Proyecto: Innovation Hub
Entrega: Avance 2

Repositorio:
URL_REAL_DEL_REPOSITORIO

Versión entregada:
URL_REAL_DEL_REPOSITORIO/tree/entrega-2
```

No generar un enlace inventado.

Antes de subir el TXT, verificar que la URL existe y es accesible para el docente.

El TXT de entrega no necesita agregarse al repositorio Git.

## 15. Verificación de Moodle

El responsable de la entrega debe confirmar:

- Archivo TXT correcto.
- Enlace accesible.
- Etiqueta `entrega-2` publicada.
- Commit correspondiente al candidato aprobado.
- Entrega registrada dentro del plazo confirmado.
- Comprobante de envío conservado.

La fecha impresa en la consigna y la fecha corregida comunicada por el equipo deben contrastarse con Moodle o con el profesor.

No afirmar que Moodle recibió la entrega sin confirmación.

## 16. Estado de cierre

Completar solamente después de revisar:

- Hash del Commit 12:
- Hash asociado a entrega-2:
- Rama entregada:
- Repositorio remoto:
- Pruebas backend:
- Integraciones MongoDB:
- Pruebas frontend:
- Resultado Postman:
- Resultado QA manual:
- Revisión de Daniel:
- Revisión de Francisco:
- Fecha de creación de etiqueta:
- Confirmación de Moodle:
- Incidencias abiertas:

**Estado inicial: candidato pendiente de verificación y publicación.**

Este documento prepara las acciones; no las ejecuta automáticamente.
