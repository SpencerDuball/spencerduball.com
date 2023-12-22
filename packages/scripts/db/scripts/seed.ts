import { ScriptInput } from "../lib";
import ora from "ora";
import { createClient, IDatabase } from "@spencerduballcom/db/sqldb";
import { Ddb } from "@spencerduballcom/db/ddb";
import { Config } from "sst/node/config";
import { Table } from "sst/node/table";
import { S3Client } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import path from "path";
import fs from "fs-extra";
import { FileMigrationProvider, Migrator } from "kysely";

type TxModule = {
  up: (params: ScriptInput<IDatabase>) => Promise<void>;
  down: (params: ScriptInput<IDatabase>) => Promise<void>;
};

/**
 * Runs all habitat and seed 'up' scripts for every migration that has been applied.
 */
export async function seed({ sqldb, s3Client, ddb }: ScriptInput<IDatabase>) {
  // create client connections
  let spinner = ora("Connecting to the database ...").start();
  const db = sqldb ?? createClient(Config.DATABASE_URL, Config.DATABASE_AUTH_TOKEN);
  const s3 = s3Client ?? new S3Client({});
  const dynamo =
    ddb ?? new Ddb({ tableName: Table.table.tableName, client: new DynamoDBClient({ region: Config.REGION }) });

  // retrieve all applied migrations
  spinner.text = "Getting all applied migrations ...";
  const migrationFolder = path.resolve("migrations");
  const migrator = new Migrator({ db, provider: new FileMigrationProvider({ fs, path, migrationFolder }) });
  const migrations = (await migrator.getMigrations())
    .filter((migration) => !!migration.executedAt)
    .sort((prev, next) => {
      const prevTimestamp = parseInt(prev.name.split("_")[0]);
      const nextTimestamp = parseInt(next.name.split("-")[0]);
      return prevTimestamp - nextTimestamp;
    });
  spinner.stop();

  // remove the seed and habitat data in reverse order of application
  await reset({ sqldb: db, s3Client: s3, ddb: dynamo });

  // apply the habitat and seed data in order
  for await (let { name } of migrations) {
    spinner = ora(`Applying seed + habitat transaction '${name}' ...`).start();

    // run the habitat "up" function
    const habitatFilePath = path.resolve("seed", name, "habitat", "run.ts");
    const habitat = (await import(habitatFilePath)) as TxModule;
    await habitat.up({ sqldb: db, s3Client: s3, ddb: dynamo }).catch((e: any) => {
      spinner.fail(`Error applying habitat transaction '${name}'.`);
      throw e;
    });

    // run the seed "up" function
    const seedFilePath = path.resolve("seed", name, "seed", "run.ts");
    const seed = (await import(seedFilePath)) as TxModule;
    await seed.up({ sqldb: db, s3Client: s3, ddb: dynamo }).catch((e: any) => {
      spinner.fail(`Error applying seed transaction '${name}'.`);
      throw e;
    });

    spinner.succeed(`Applied seed + habitat transaction '${name}'.`);
  }

  // close the connection
  if (!sqldb) await db.destroy();
}

/**
 * Runs all habitat and seed 'down' scripts for every migration that has been applied.
 */
export async function reset({ sqldb, s3Client, ddb }: ScriptInput) {
  // create client connections
  let spinner = ora("Connecting to the database ...").start();
  const db = sqldb ?? createClient(Config.DATABASE_URL, Config.DATABASE_AUTH_TOKEN);
  const s3 = s3Client ?? new S3Client({});
  const dynamo =
    ddb ?? new Ddb({ tableName: Table.table.tableName, client: new DynamoDBClient({ region: Config.REGION }) });

  // retrieve all applied migrations
  spinner.text = "Getting all applied migrations ...";
  const migrationFolder = path.resolve("migrations");
  const migrator = new Migrator({ db, provider: new FileMigrationProvider({ fs, path, migrationFolder }) });
  const migrations = (await migrator.getMigrations())
    .filter((migration) => !!migration.executedAt)
    .sort((prev, next) => {
      const prevTimestamp = parseInt(prev.name.split("_")[0]);
      const nextTimestamp = parseInt(next.name.split("-")[0]);
      return prevTimestamp - nextTimestamp;
    });
  if (migrations.length > 0) spinner.stop();
  else spinner.fail(`No migrations have been applied.`);

  // remove the seed and habitat data in reverse order of application
  for await (let { name } of [...migrations].reverse()) {
    spinner = ora(`Removing seed + habitat transaction '${name}' ...`).start();

    // run the seed "down" function
    const seedFilePath = path.resolve("seed", name, "seed", "run.ts");
    const seed = (await import(seedFilePath)) as TxModule;
    await seed.down({ sqldb: db, s3Client: s3, ddb: dynamo }).catch((e: any) => {
      spinner.fail(`Error removing seed transation '${name}'.`);
      throw e;
    });

    // run the habitat "down" function
    const habitatFilePath = path.resolve("seed", name, "habitat", "run.ts");
    const habitat = (await import(habitatFilePath)) as TxModule;
    await habitat.down({ sqldb: db, s3Client: s3, ddb: dynamo }).catch((e: any) => {
      spinner.fail(`Error removing habitat transaction '${name}'.`);
      throw e;
    });

    spinner.succeed(`Removed seed + habitat transaction '${name}'!`);
  }

  // close the connection
  if (!sqldb) await db.destroy();
}

/**
 * Runs all seed 'down' scripts and then applies all seed 'up' scripts, resetting the seed data. This will be run for
 * every migration applied.
 */
export async function replant({ sqldb, s3Client, ddb }: ScriptInput) {
  // create client connections
  let spinner = ora("Connecting to the database ...").start();
  const db = sqldb ?? createClient(Config.DATABASE_URL, Config.DATABASE_AUTH_TOKEN);
  const s3 = s3Client ?? new S3Client({});
  const dynamo =
    ddb ?? new Ddb({ tableName: Table.table.tableName, client: new DynamoDBClient({ region: Config.REGION }) });

  // retrieve all applied migrations
  spinner.text = "Getting all applied migrations ...";
  const migrationFolder = path.resolve("migrations");
  const migrator = new Migrator({ db, provider: new FileMigrationProvider({ fs, path, migrationFolder }) });
  const migrations = (await migrator.getMigrations())
    .filter((migration) => !!migration.executedAt)
    .sort((prev, next) => {
      const prevTimestamp = parseInt(prev.name.split("_")[0]);
      const nextTimestamp = parseInt(next.name.split("-")[0]);
      return prevTimestamp - nextTimestamp;
    });
  if (migrations.length > 0) spinner.stop();
  else spinner.fail(`No migrations have been applied.`);

  // remove the seed data in reverse order of application
  for await (let { name } of [...migrations].reverse()) {
    spinner = ora(`Removing seed transaction '${name}' ...`).start();

    // run the seed "down" function
    const seedFilePath = path.resolve("seed", name, "seed", "run.ts");
    const seed = (await import(seedFilePath)) as TxModule;
    await seed.down({ sqldb: db, s3Client: s3, ddb: dynamo }).catch((e: any) => {
      spinner.fail(`Error removing seed transation '${name}'.`);
      throw e;
    });

    spinner.succeed(`Removed seed transaction '${name}'!`);
  }

  // apply the seed data in order of application
  for await (let { name } of migrations) {
    spinner = ora(`Applying seed transaction '${name}' ...`).start();

    // run the seed "up" function
    const seedFilePath = path.resolve("seed", name, "seed", "run.ts");
    const seed = (await import(seedFilePath)) as TxModule;
    await seed.up({ sqldb: db, s3Client: s3, ddb: dynamo }).catch((e: any) => {
      spinner.fail(`Error applying seed transaction '${name}'.`);
      throw e;
    });

    spinner.succeed(`Applied seed transaction '${name}'.`);
  }

  // close the connection
  if (!sqldb) await db.destroy();
}
