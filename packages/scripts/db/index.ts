import { program } from "commander";
import * as migrate from "./scripts/migrate";
import * as seed from "./scripts/seed";
import * as misc from "./scripts/misc";

/**
 * The entry for all database scripts. Depending on the arguments the appropriate script is run.
 */
async function main() {
  // migration scripts
  program
    .command("db:migrate:create <name>")
    .description("Creates the migration and seed files from the supplied name.")
    .action(async (name) => await migrate.create({}, name));
  program
    .command("db:migrate:status")
    .description("Returns status and information about the migrations applied.")
    .action(async () => await migrate.status({}));
  program
    .command("db:migrate")
    .description("Migrates to the latest migration.")
    .action(async () => await migrate.migrate({}));

  // seed scripts
  program
    .command("db:seed")
    .description("Runs seed scripts up to the latest migration applied.")
    .action(async () => await seed.seed({}));
  program
    .command("db:seed:reset")
    .description("Removes all seed data.")
    .action(async () => await seed.reset({}));

  // misc scripts
  program
    .command("db:reset")
    .description("Removes all migrations and seed data.")
    .action(async () => await misc.reset({}));
  program
    .command("db:setup")
    .description("Applies all migrations and runs all seed scripts.")
    .action(async () => misc.setup({}));
  program
    .command("db:start")
    .description("Starts the localhost database at the given port.")
    .action(async () => misc.start());

  // execute the program
  await program.parseAsync();
}

main();
