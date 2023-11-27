import arg from "arg";
import fs from "fs-extra";
import path from "path";
import ora from "ora";

const migrationTemplate = [
  `import { Kysely, sql } from "kysely";`,
  ``,
  `async function up(db: Kysely<any>): Promise<void> {}`,
  ``,
  `async function down(db: Kysely<any>): Promise<void> {}`,
  ``,
  `export { up, down };`,
].join("\n");

const runTemplate = [``].join("\n");

async function main() {
  const spinner = ora("Generating the migration ...");

  // collect the args
  const { _: argv } = arg({});
  const migrationName = argv[0];

  // ensure required args exist
  if (!migrationName) {
    spinner.fail("Must supply the migration name as the first positional argument.");
    process.exit();
  }

  // generate migration name
  const migrationId = `${Date.now()}_${migrationName}`;

  // write the migration file
  await fs.ensureDir("migrations");
  await fs.writeFile(path.resolve("migrations", `${migrationId}.ts`), migrationTemplate);

  // create the seed directory
  await fs.ensureDir(path.resolve("seed", migrationId));
  await fs.writeFile(path.resolve("seed", migrationId, "run.ts"), runTemplate);

  spinner.succeed(`Created migration ${migrationId}!`);
}

main();
