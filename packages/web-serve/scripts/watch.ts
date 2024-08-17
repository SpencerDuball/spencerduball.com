import path from "path";
import ts from "typescript";

/**
 * Get the tsconfig file path.
 */
function getTscFilePath() {
  const tscFilePath = process.argv[2];

  if (!tscFilePath) {
    console.log(
      "Usage: build.ts <tsc-file-path> - e.g. tsx ./build.ts ../src/tsconfig.json"
    );
    process.exit(1);
  }

  return path.resolve(tscFilePath);
}

async function main() {
  // get the tsconfig file path
  const tscFilePath = getTscFilePath();

  // read the tsconfig file
  const cfgFile = ts.readConfigFile(tscFilePath, ts.sys.readFile);
  const srcDir = cfgFile.config.baseUrl
    ? path.resolve(path.dirname(tscFilePath), cfgFile.config.baseUrl)
    : path.dirname(tscFilePath);
  const cfg = ts.parseJsonConfigFileContent(cfgFile.config, ts.sys, srcDir);

  // create the program
  const host = ts.createWatchCompilerHost(tscFilePath, cfg.options, ts.sys);
  ts.createWatchProgram(host);
}

main();
