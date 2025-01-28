/**
 * Supresses experimental warnings from printing to the console.
 *
 * This is necessary because in NodeJS 22.6.x, when running typescript files an experimental
 * warning is issued.
 */
function supressExperimentalWarnings() {
  process.removeAllListeners("warning");
  process.on("warning", (warning) => {
    if (warning.name === "ExperimentalWarning") return;
    else console.warn(warning);
  });
}

async function main() {
  supressExperimentalWarnings();
  const name: string = "spencer";
  console.log(`Hello there ${name}!`);
}

main();
