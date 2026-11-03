# Fragmentos de colección para UI14

`iniciativas.postman_collection.json` es una colección Postman v2.1 importable, con IDs estables y 18 peticiones de API05–API06. Francisco la consolida con los fragmentos de los otros módulos en UI14; no reemplaza la colección final ni demuestra carreras intensivas.

Requisitos: MongoDB replica set activo, seed actual y API iniciada. Configurar `baseUrl` y el valor local de `demoPassword` en las variables de la colección. `demoPassword` se exporta vacío; `ownerToken`, `outsiderToken` e `initiativeId` se obtienen durante la ejecución. No exportar la colección con tokens vigentes o contraseñas locales guardadas.

Ejecutar en orden. Las aserciones comprueban estados HTTP, privacidad, propiedad, estados ocultos, filtros y escritura. Cada recorrido crea una iniciativa sintética y conserva su ID para lectura/edición; no incluye limpieza destructiva. Las pruebas específicas de concurrencia y rollback se ejecutan mediante `npm run test:integration`.

La sintaxis JSON y los scripts se validan localmente; la importación/ejecución en Postman se registra por separado al consolidar UI14. No contabilizar la revisión de sintaxis como una ejecución completa de Postman.
