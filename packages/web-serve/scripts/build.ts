import fs from "fs-extra";
import path from "path";
import ts from "typescript";

/**
 * Compiles and writes the compiled TypeScript to destination.
 */
async function compile(cfg: ts.ParsedCommandLine) {
  // create the compiler host
  const host = ts.createCompilerHost(cfg.options);
  host.writeFile = (fileName, contents) => {
    fs.mkdir(path.dirname(fileName), { recursive: true }).finally(async () =>
      fs.writeFile(fileName, contents)
    );
  };

  // create the program
  const program = ts.createProgram(cfg.fileNames, cfg.options, host);

  // compile the files
  program.emit();
}

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

/**
 * Build the TypeScript project.
 */
async function main() {
  // get the tsconfig file path
  const tscFilePath = getTscFilePath();

  // read the tsconfig file
  const cfgFile = ts.readConfigFile(tscFilePath, ts.sys.readFile);
  const srcDir = cfgFile.config.baseUrl
    ? path.resolve(path.dirname(tscFilePath), cfgFile.config.baseUrl)
    : path.dirname(tscFilePath);
  const cfg = ts.parseJsonConfigFileContent(cfgFile.config, ts.sys, srcDir);

  // delete the output
  if (cfg.options.outDir) {
    fs.removeSync(cfg.options.outDir);
  } else if (cfg.options.outFile) {
    fs.removeSync(cfg.options.outFile);
  }

  // build the output
  await compile(cfg);
}

main();
