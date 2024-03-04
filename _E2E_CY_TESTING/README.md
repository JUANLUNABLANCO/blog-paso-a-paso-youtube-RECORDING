Este README proporciona instrucciones básicas para instalar dependencias, ejecutar pruebas y contribuir al proyecto. Puedes añadir más detalles o instrucciones específicas según las necesidades del proyecto.

# Pruebas End-to-End (E2E) con Cypress

Este directorio contiene las pruebas end-to-end (E2E) utilizando Cypress para garantizar la integridad y funcionalidad de la aplicación desde una perspectiva de usuario.

## Antes de comenzar

Asegúrate de tener instalado Node.js y npm en tu sistema. Puedes descargarlos e instalarlos desde [aquí](https://nodejs.org/).
Las versiones de nuestro proyecto son estas

Node: 16.17.0
npm: 9.7.2

## Instalación

Para instalar las dependencias necesarias, ejecuta el siguiente comando en la raíz del proyecto:

```bash
npm install
```

Esto instalará todas las dependencias necesarias, incluyendo Cypress.

si es un proyecto nuevo puedes instalarlas todas de la siguiente manera, para aprovechar la nueva versión en la que estés trabajando de Node ene ese momento.

Esto es sumamente importante, si tu proyecto tiene una versión mayor de NodeJs que la que aquí utilizamos, no funcionará a no ser que uses esta otra forma de instalación, en vez del `npm install`

```bash
npm i --save-dev mssql typescript @types/node mochawesome-report-generator mochawesome-merge mochawesome mocha fs-extra cypress @faker-js/faker cypress-localstorage-commands cypress-file-upload
```

## Ejecución de pruebas

Para ejecutar las pruebas E2E con Cypress en tu entorno local, debes primero lanzar todas las apps en modo test:

- 1. la base de datos dockerizada

```bash
  cd _backend
  docker compose -p agileninjatimertest up -d
```

- 2. arranca el proyecto backend api desde Visual Studio.

- 3. Arranca el frontend

```bash
cd _frontend
npm run ng:serve:test
```

Arranca cypress: Cypress se puede lanzar en dos formas, una `local` en tumáquina, yo me creo un entorno llamado `test` y otra para `CI/CD` en azure devops

```bash
# modo test
npm run cypress:open:local
```

```bash
# modo CI/CD
npm run cypress:run:cicd
```

vendrían a ser estos scripts

```json
"cypress:open:local": "npx cypress open",
"cypress:run:cicd": "npx cypress run",
```

Esto iniciará Cypress y ejecutará todas las pruebas definidas en el directorio `_e2e`.

## Reportes de pruebas

**¿Qué es el reporter Mocha para pruebas E2E con Cypress?**

El reporter Mocha para pruebas E2E con Cypress es una herramienta que se utiliza para generar informes detallados y legibles sobre los resultados de las pruebas realizadas con Cypress utilizando el framework de pruebas Mocha. Este reporter organiza y presenta los resultados de las pruebas de una manera estructurada y fácil de entender, lo que permite a los desarrolladores identificar rápidamente los problemas y errores en sus aplicaciones.

**¿Cómo se instala el reporter Mocha para pruebas E2E con Cypress?**

El reporter Mocha para pruebas E2E con Cypress no requiere una instalación separada, ya que está integrado en Cypress de forma predeterminada. Sin embargo, es posible que necesites instalar algunas dependencias adicionales para generar y visualizar los informes de manera adecuada. Estas dependencias pueden incluir:

1. **mochawesome-merge**: Para combinar múltiples archivos de informes JSON generados por Cypress.
2. **mochawesome-report-generator**: Para generar informes HTML a partir de los archivos JSON combinados.
3. **fs-extra**: para tratamiento de ficheros tratados en el reporte de una manera simple.

Puedes instalar estas dependencias utilizando npm:

```bash
npm install mocha mochawesome-merge mochawesome-report-generator fs-extra --save-dev
```

**¿Cómo se configura el reporter Mocha para pruebas E2E con Cypress?**

La configuración del reporter Mocha para pruebas E2E con Cypress se realiza generalmente a través de un script de Node.js que ejecuta Cypress y luego procesa los resultados de las pruebas. Aquí hay un ejemplo de cómo podrías configurar y ejecutar el reporter Mocha:

```javascript
// # run-reporter.js
const cypress = require('cypress')
const fse = require('fs-extra')
const { merge } = require('mochawesome-merge')
const generator = require('mochawesome-report-generator')

const options = {
  files: ['./mochawesome-report/*.json'], // donde guardará el reporte
  overwrite: false,
  html: false,
  json: true,
}

async function runTests() {
  await fse.emptyDir('mochawesome-report')
  const { totalFailed } = await cypress.run({ reporter: 'mochawesome' })
  const jsonReport = await merge(options)
  await generator.create(jsonReport, { inline: true })
  process.exit(totalFailed)
}

runTests()
```

En este script:

- Primero, se ejecutan las pruebas Cypress utilizando el reporter Mocha.
- Luego, se combinan los archivos JSON de informes generados por Cypress utilizando `mochawesome-merge`.
- Finalmente, se genera un informe HTML a partir del archivo JSON combinado utilizando `mochawesome-report-generator`.

Este script se puede ejecutar como un script de Node.js para ejecutar tus pruebas Cypress y generar informes detallados sobre los resultados de las pruebas.

**¿Cómo ejecutamos los reportes?**

```bash
npm run cypress:report # node run-reporter.js
```

**¿Dónde veo los resultados?**

en el directorio que has indicado en el `run-reporter.js`, en la parte de opciones, básicamente en `./mochawesome-report`, es una web o un json depende de la configuración que hayas seleccionado.
