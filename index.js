const fs = require("fs-extra");
const shelljs = require("shelljs");

function isSlitherInstalled() {
  return shelljs.which("slither");
}

function executeSlither(path) {
  shelljs.exec(`slither ${path}`);
}

function getHeader(path) {
  return `
JSON AST (compact format):
======= ${path} =======
`;
}

function run(compilationResult) {
  if (!isSlitherInstalled()) {
    console.log("Slither is not installed, visit: https://github.com/trailofbits/slither");
    return;
  }

  Object.keys(compilationResult.sources).forEach((path) => {
    const ast = compilationResult.sources[path].ast;
    const astPath = `${path}.ast.json`;
    fs.writeFileSync(astPath, getHeader(path) + JSON.stringify(ast, null, 2));
    executeSlither(astPath);
  });
}

function register(embark) {
  embark.events.on("contracts:compiled:solc", run);
}

module.exports = register;
