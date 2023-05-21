import arg from "arg";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const migrationTemplate = [
  'import { Kysely, sql } from "kysely";',
  '',
  'async function up(db: Kysely<any>): Promise<void> {}',
  '',
  'async function down(db: Kysely<any>): Promise<void> {}',
  '',
  'export { up, down };'
].join("\n");

async function generateMigration() {
  // collect the args
  const { _: argv } = arg({});
  const migrationName = argv[0];

  // ensure required args exist
  if (!migrationName) throw new Error("Must supply the migration name as the first positional argument.");

  // write the migration file
  const fileName = `${Date.now()}_${migrationName}.ts`;
  const fileToWrite = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "migrations", fileName);
  await fs.writeFile(fileToWrite, migrationTemplate).then(() => {
    console.log(`Success! New migration file "${fileName}" has been created.`)
  }).catch((e) => {
    console.error("Oops! Looks like there was an issue:");
    console.error(e);
  })
}

generateMigration();