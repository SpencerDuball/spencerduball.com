import { program } from "commander";
import axios from "axios";

async function envGet(stage: string) {
  console.log("Hello there!");
}

/**
 * The entry for all environment scripts.
 */
async function main() {
  // environment variables
  program
    .command("env:get")
    .requiredOption("-s, --stage <stage>")
    .description("The stage to get the environment variables from.")
    .action(async (name) => await envGet(name));

  // execute the program
  await program.parseAsync();
}

main();
