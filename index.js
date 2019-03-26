const path = require("path");
const fs = require("fs-extra");
const shelljs = require("shelljs");

function isSlitherInstalled() {
  return shelljs.which("slither");
}

function executeSlither(astFile, flags = '', logger) {
  shelljs.exec(`slither ${astFile} ${Array.isArray(flags) ? flags.join(' ') : flags}`, {silent: true }, function (code, stdout, stderr) {
    if (stderr) {
      logger.info(stderr);
    }
  });
}

function buildAstData(sources) {
  const header = "JSON AST (compact format):\n";
  const data = Object.keys(sources).map((key) => {
    return `
======= ${key} =======

${JSON.stringify(sources[key].ast, null, 2)}
`;
  });
  return header + data.join("\n");
}

async function run(embark, compilationResult) {
  if (!isSlitherInstalled()) {
    embark.logger.warn("Slither is not installed, visit: https://github.com/trailofbits/slither");
    return;
  }
  const astFile = path.join(".embark", "slither", "ast.json");
  const astData = buildAstData(compilationResult.sources);
  await fs.ensureFile(astFile);
  await fs.writeFile(astFile, astData);
  executeSlither(astFile, embark.pluginConfig.flags, embark.logger);
}

function register(embark) {
  embark.events.on("contracts:compiled:solc", run.bind(null, embark));
}

module.exports = register;
