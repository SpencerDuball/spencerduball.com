import { program } from "commander";
import * as migrate from "./scripts/migrate";

/**
 * The entry for all database scripts.
 */
async function main() {
  // migration scripts
  program
    .command("db:migrate:create <name>")
    .description("Creates the migration and associated seed files using the supplied name.")
    .action(async (name) => await migrate.create(name));
  program
    .command("db:migrate")
    .description("Migrates to the latest migration.")
    .action(async () => await migrate.migrate());
  program
    .command("db:migrate:status")
    .description("Returns status and information about the migrations applied.")
    .action(async () => await migrate.status());

  // execute the program
  await program.parseAsync();
}

main();
