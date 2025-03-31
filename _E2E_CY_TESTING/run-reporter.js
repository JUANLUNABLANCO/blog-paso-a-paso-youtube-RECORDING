const cypress = require('cypress');
const fse = require('fs-extra');
const { merge } = require('mochawesome-merge');
const generator = require('mochawesome-report-generator');

const options = {
  files: ["./mochawesome-report/*.json"],
  overwrite: false,
  html: false,
  json: true
};

async function runTests() {
  await fse.emptyDir('mochawesome-report');
  const { totalFailed } = await cypress.run({reporter: "mochawesome"});
  const jsonReport = await merge(options);
  await generator.create(jsonReport, {inline: true});
  process.exit(totalFailed);
}

runTests();