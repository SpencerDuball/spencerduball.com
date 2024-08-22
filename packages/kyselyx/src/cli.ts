import "tsx/esm";
import { Command } from "commander";
import * as migrate from "./commands/migrate.js";
import * as seed from "./commands/seed.js";
import { config } from "@dotenvx/dotenvx";
import { loadKyselyxConfig } from "./utilities/config.js";

async function main() {
  // read the .env file
  config();

  // define the program
  const program = new Command();
  program.name("kyselyx").description("A CLI for executing Kysely migrations and seeds.");
  program.option("-c, --config", "The config file.");
  program.option("-m, --migration-folder", "The folder where migrations are stored.");
  program.option("-s, --seed-folder", "The folder where seeds are stored.");

  // load the kyselyx config
  await loadKyselyxConfig(program.opts());

  // Database commands
  program.command("db:migrate").description("Run pending migrations.").action(migrate.migrate);
  program.command("db:migrate:status").description("List the status of all migrations.").action(migrate.status);
  program.command("db:migrate:undo [name]").description("Reverts a single migration.").action(migrate.undo);
  program.command("db:migrate:undo:all").description("Revert all migrations ran").action(migrate.undoAll);
  program.command("db:seed").description("Run specified seeder.").action(seed.seed);
  program.command("db:seed:undo [name]").description("Deletes data from the database.").action(seed.undo);
  program.command("db:seed:all").description("Run every seeder.").action(seed.seedAll);
  program.command("db:seed:undo:all").description("Deletes all data from the database.").action(seed.undoAll);
  program.command("db:migrate:generate <name>").description("Generate a new migration file.").action(migrate.generate);
  program.command("db:seed:generate <name>").description("Generate a new seed file.").action(seed.generate);

  program.parse();
}

main();
