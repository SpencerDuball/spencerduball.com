import { program } from "commander";
import * as migrate from "./scripts/migrate";

/**
 * The entry for all database scripts.
 */
async function main() {
  // migration scripts
  program
    .command("db:migrate")
    .description("Migrates to the latest migration.")
    .action(async () => await migrate.migrate());

  // execute the program
  await program.parseAsync();
}

main();
