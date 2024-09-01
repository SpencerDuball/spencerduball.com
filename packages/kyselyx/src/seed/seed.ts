import { Kysely, KyselyPlugin, WithSchemaPlugin, CreateTableBuilder, CreateSchemaBuilder } from "kysely";
import { FileSeedProvider } from "./file-seed-provider.js";
import { NoopPlugin } from "./noop-plugin.js";
import { freeze, getLast } from "./utils.js";

export const DEFAULT_SEED_TABLE = "kyselyx_seed";
export const DEFAULT_ALLOW_UNORDERED_SEEDS = false;
export const NO_SEEDS: NoSeeds = freeze({ __noSeeds__: true });

export interface Seed {
  up(db: Kysely<any>): Promise<void>;
  down(db: Kysely<any>): Promise<void>;
}

/**
 * A class for running seeds.
 *
 * ### Example
 *
 * This example uses the {@link FileSeedProvider} that reads seeds
 * files from a single folder. You can easily implement your own
 * {@link SeedProvider} if you want to provide seeds some
 * other way.
 *
 * ```ts
 * import { promises as fs } from 'fs'
 * import path from 'path'
 *
 * const seeder = new Seeder({
 *   db,
 *   provider: new FileSeedProvider({
 *     fs,
 *     path,
 *     // Path to the folder that contains all your seeds.
 *     seedFolder: 'some/path/to/seeds'
 *   })
 * })
 * ```
 */
export class Seeder {
  readonly #props: SeederProps;

  constructor(props: SeederProps) {
    this.#props = freeze(props);
  }

  /**
   * Returns a {@link SeedInfo} object for each seed.
   *
   * The returned array is sorted by seed name.
   */
  async getSeeds(): Promise<ReadonlyArray<SeedInfo>> {
    const executedSeeds = (await this.#doesTableExists(this.#seedTable))
      ? await this.#props.db
          .withPlugin(this.#schemaPlugin)
          .selectFrom(this.#seedTable)
          .select(["name", "timestamp"])
          .execute()
      : [];

    const seeds = await this.#resolveSeeds();

    return seeds.map(({ name, ...seed }) => {
      const executed = executedSeeds.find((it) => it.name === name);

      return {
        name,
        seed,
        executedAt: executed ? new Date(executed.timestamp) : undefined,
      };
    });
  }

  /**
   * Runs all seeds that have not yet been run.
   *
   * This method returns a {@link SeedResultSet} instance and _never_ throws.
   * {@link SeedResultSet.error} holds the error if something went wrong.
   * {@link SeedResultSet.results} contains information about which seeds
   * were executed and which failed. See the examples below.
   *
   * This method goes through all possible seeds provided by the provider and runs the
   * ones whose names come alphabetically after the last seed that has been run. If the
   * list of executed seeds doesn't match the beginning of the list of possible seeds
   * an error is returned.
   *
   * ### Examples
   *
   * ```ts
   * const db = new Kysely<Database>({
   *   dialect: new PostgresDialect({
   *     host: 'localhost',
   *     database: 'kysely_test',
   *   }),
   * })
   *
   * const seeder = new Seeder({
   *   db,
   *   provider: new FileSeedProvider(
   *     // Path to the folder that contains all your seeds.
   *     'some/path/to/seeds'
   *   )
   * })
   *
   * const { error, results } = await seeder.seedToLatest()
   *
   * results?.forEach((it) => {
   *   if (it.status === 'Success') {
   *     console.log(`seed "${it.seedName}" was executed successfully`)
   *   } else if (it.status === 'Error') {
   *     console.error(`failed to execute seed "${it.seedName}"`)
   *   }
   * })
   *
   * if (error) {
   *   console.error('failed to run `seedToLatest`')
   *   console.error(error)
   * }
   * ```
   */
  async seedToLatest(): Promise<SeedResultSet> {
    return this.#seed(() => ({ direction: "Up", step: Infinity }));
  }

  /**
   * Seed up/down to a specific seed.
   *
   * This method returns a {@link SeedResultSet} instance and _never_ throws.
   * {@link SeedResultSet.error} holds the error if something went wrong.
   * {@link SeedResultSet.results} contains information about which seeds
   * were executed and which failed.
   *
   * ### Examples
   *
   * ```ts
   * await seeder.seedTo('some_seed')
   * ```
   *
   * If you specify the name of the first seed, this method seeds
   * down to the first seed, but doesn't run the `down` method of
   * the first seed. In case you want to seed all the way down,
   * you can use a special constant `NO_SEEDS`:
   *
   * ```ts
   * await seeder.seedTo(NO_SEEDS)
   * ```
   */
  async seedTo(targetSeedName: string | NoSeeds): Promise<SeedResultSet> {
    return this.#seed(({ seeds, executedSeeds, pendingSeeds }: SeedState) => {
      if (targetSeedName === NO_SEEDS) {
        return { direction: "Down", step: Infinity };
      }

      if (!seeds.find((m) => m.name === (targetSeedName as string))) {
        throw new Error(`seed "${targetSeedName}" doesn't exist`);
      }

      const executedIndex = executedSeeds.indexOf(targetSeedName as string);
      const pendingIndex = pendingSeeds.findIndex((m) => m.name === (targetSeedName as string));

      if (executedIndex !== -1) {
        return {
          direction: "Down",
          step: executedSeeds.length - executedIndex - 1,
        };
      } else if (pendingIndex !== -1) {
        return { direction: "Up", step: pendingIndex + 1 };
      } else {
        throw new Error(`seed "${targetSeedName}" isn't executed or pending`);
      }
    });
  }

  /**
   * Seed one step up.
   *
   * This method returns a {@link SeedResultSet} instance and _never_ throws.
   * {@link SeedResultSet.error} holds the error if something went wrong.
   * {@link SeedResultSet.results} contains information about which seeds
   * were executed and which failed.
   *
   * ### Examples
   *
   * ```ts
   * await seeder.seedUp()
   * ```
   */
  async seedUp(): Promise<SeedResultSet> {
    return this.#seed(() => ({ direction: "Up", step: 1 }));
  }

  /**
   * Seed one step down.
   *
   * This method returns a {@link SeedResultSet} instance and _never_ throws.
   * {@link SeedResultSet.error} holds the error if something went wrong.
   * {@link SeedResultSet.results} contains information about which seeds
   * were executed and which failed.
   *
   * ### Examples
   *
   * ```ts
   * await seeder.seedDown()
   * ```
   */
  async seedDown(): Promise<SeedResultSet> {
    return this.#seed(() => ({ direction: "Down", step: 1 }));
  }

  async #seed(
    getSeedDirectionAndStep: (state: SeedState) => {
      direction: SeedDirection;
      step: number;
    },
  ): Promise<SeedResultSet> {
    try {
      await this.#ensureSeedTablesExists();
      return await this.#runSeeds(getSeedDirectionAndStep);
    } catch (error) {
      if (error instanceof SeedResultSetError) {
        return error.resultSet;
      }

      return { error };
    }
  }

  get #seedTableSchema(): string | undefined {
    return this.#props.seedTableSchema;
  }

  get #seedTable(): string {
    return this.#props.seedTableName ?? DEFAULT_SEED_TABLE;
  }

  get #allowUnorderedSeeds(): boolean {
    return this.#props.allowUnorderedSeeds ?? DEFAULT_ALLOW_UNORDERED_SEEDS;
  }

  get #schemaPlugin(): KyselyPlugin {
    if (this.#seedTableSchema) {
      return new WithSchemaPlugin(this.#seedTableSchema);
    }

    return new NoopPlugin(); // TODO: Add PR for Kysely to export this!
  }

  async #ensureSeedTablesExists(): Promise<void> {
    await this.#ensureSeedTableSchemaExists();
    await this.#ensureSeedTableExists();
  }

  async #ensureSeedTableSchemaExists(): Promise<void> {
    if (!this.#seedTableSchema) {
      // Use default schema. Nothing to do.
      return;
    }

    if (!(await this.#doesSchemaExists())) {
      try {
        await this.#createIfNotExists(this.#props.db.schema.createSchema(this.#seedTableSchema));
      } catch (error) {
        // At least on PostgreSQL, `if not exists` doesn't guarantee the `create schema`
        // query doesn't throw if the schema already exits. That's why we check if
        // the schema exist here and ignore the error if it does.
        if (!(await this.#doesSchemaExists())) {
          throw error;
        }
      }
    }
  }

  async #ensureSeedTableExists(): Promise<void> {
    if (!(await this.#doesTableExists(this.#seedTable))) {
      try {
        if (this.#seedTableSchema) {
          await this.#createIfNotExists(this.#props.db.schema.createSchema(this.#seedTableSchema));
        }

        await this.#createIfNotExists(
          this.#props.db.schema
            .withPlugin(this.#schemaPlugin)
            .createTable(this.#seedTable)
            .addColumn("name", "varchar(255)", (col) => col.notNull().primaryKey())
            // The seed run time as ISO string. This is not a real date type as we
            // can't know which data type is supported by all future dialects.
            .addColumn("timestamp", "varchar(255)", (col) => col.notNull()),
        );
      } catch (error) {
        // At least on PostgreSQL, `if not exists` doesn't guarantee the `create table`
        // query doesn't throw if the table already exits. That's why we check if
        // the table exist here and ignore the error if it does.
        if (!(await this.#doesTableExists(this.#seedTable))) {
          throw error;
        }
      }
    }
  }

  async #doesSchemaExists(): Promise<boolean> {
    const schemas = await this.#props.db.introspection.getSchemas();

    return schemas.some((it) => it.name === this.#seedTableSchema);
  }

  async #doesTableExists(tableName: string): Promise<boolean> {
    const schema = this.#seedTableSchema;

    const tables = await this.#props.db.introspection.getTables({
      withInternalKyselyTables: true,
    });

    return tables.some((it) => it.name === tableName && (!schema || it.schema === schema));
  }

  async #runSeeds(
    getSeedDirectionAndStep: (state: SeedState) => {
      direction: SeedDirection;
      step: number;
    },
  ): Promise<SeedResultSet> {
    const adapter = this.#props.db.getExecutor().adapter;

    const run = async (db: Kysely<any>): Promise<SeedResultSet> => {
      const state = await this.#getState(db);

      if (state.seeds.length === 0) {
        return { results: [] };
      }

      const { direction, step } = getSeedDirectionAndStep(state);

      if (step <= 0) {
        return { results: [] };
      }

      if (direction === "Down") {
        return await this.#seedDown(db, state, step);
      } else if (direction === "Up") {
        return await this.#seedUp(db, state, step);
      }

      return { results: [] };
    };

    if (adapter.supportsTransactionalDdl) {
      return this.#props.db.transaction().execute(run);
    } else {
      return this.#props.db.connection().execute(run);
    }
  }

  async #getState(db: Kysely<any>): Promise<SeedState> {
    const seeds = await this.#resolveSeeds();
    const executedSeeds = await this.#getExecutedSeeds(db);

    this.#ensureNoMissingSeeds(seeds, executedSeeds);
    if (!this.#allowUnorderedSeeds) {
      this.#ensureSeedsInOrder(seeds, executedSeeds);
    }

    const pendingSeeds = this.#getPendingSeeds(seeds, executedSeeds);

    return freeze({
      seeds,
      executedSeeds,
      lastSeed: getLast(executedSeeds),
      pendingSeeds,
    });
  }

  #getPendingSeeds(seeds: ReadonlyArray<NamedSeed>, executedSeeds: ReadonlyArray<string>): ReadonlyArray<NamedSeed> {
    return seeds.filter((seed) => {
      return !executedSeeds.includes(seed.name);
    });
  }

  async #resolveSeeds(): Promise<ReadonlyArray<NamedSeed>> {
    const allSeeds = await this.#props.provider.getSeeds();

    return Object.keys(allSeeds)
      .sort()
      .map((name) => ({
        ...allSeeds[name],
        name,
      }));
  }

  async #getExecutedSeeds(db: Kysely<any>): Promise<ReadonlyArray<string>> {
    const executedSeeds = await db
      .withPlugin(this.#schemaPlugin)
      .selectFrom(this.#seedTable)
      .select("name")
      .orderBy(["timestamp", "name"])
      .execute();

    return executedSeeds.map((it) => it.name);
  }

  #ensureNoMissingSeeds(seeds: ReadonlyArray<NamedSeed>, executedSeeds: ReadonlyArray<string>) {
    // Ensure all executed seeds exist in the `seeds` list.
    for (const executed of executedSeeds) {
      if (!seeds.some((it) => it.name === executed)) {
        throw new Error(`corrupted seeds: previously executed seed ${executed} is missing`);
      }
    }
  }

  #ensureSeedsInOrder(seeds: ReadonlyArray<NamedSeed>, executedSeeds: ReadonlyArray<string>) {
    // Ensure the executed seeds are the first ones in the seed list.
    for (let i = 0; i < executedSeeds.length; ++i) {
      if (seeds[i].name !== executedSeeds[i]) {
        throw new Error(
          `corrupted seeds: expected previously executed seed ${executedSeeds[i]} to be at index ${i} but ${seeds[i].name} was found in its place. New seeds must always have a name that comes alphabetically after the last executed seed.`,
        );
      }
    }
  }

  async #seedDown(db: Kysely<any>, state: SeedState, step: number): Promise<SeedResultSet> {
    const seedsToRollback: ReadonlyArray<NamedSeed> = state.executedSeeds
      .slice()
      .reverse()
      .slice(0, step)
      .map((name) => {
        return state.seeds.find((it) => it.name === name)!;
      });

    const results: SeedResult[] = seedsToRollback.map((seed) => {
      return {
        seedName: seed.name,
        direction: "Down",
        status: "NotExecuted",
      };
    });

    for (let i = 0; i < results.length; ++i) {
      const seed = seedsToRollback[i];

      try {
        if (seed.down) {
          await seed.down(db);
          await db.withPlugin(this.#schemaPlugin).deleteFrom(this.#seedTable).where("name", "=", seed.name).execute();

          results[i] = {
            seedName: seed.name,
            direction: "Down",
            status: "Success",
          };
        }
      } catch (error) {
        results[i] = {
          seedName: seed.name,
          direction: "Down",
          status: "Error",
        };

        throw new SeedResultSetError({
          error,
          results,
        });
      }
    }

    return { results };
  }

  async #seedUp(db: Kysely<any>, state: SeedState, step: number): Promise<SeedResultSet> {
    const seedsToRun: ReadonlyArray<NamedSeed> = state.pendingSeeds.slice(0, step);

    const results: SeedResult[] = seedsToRun.map((seed) => {
      return {
        seedName: seed.name,
        direction: "Up",
        status: "NotExecuted",
      };
    });

    for (let i = 0; i < results.length; i++) {
      const seed = state.pendingSeeds[i];

      try {
        await seed.up(db);
        await db
          .withPlugin(this.#schemaPlugin)
          .insertInto(this.#seedTable)
          .values({
            name: seed.name,
            timestamp: new Date().toISOString(),
          })
          .execute();

        results[i] = {
          seedName: seed.name,
          direction: "Up",
          status: "Success",
        };
      } catch (error) {
        results[i] = {
          seedName: seed.name,
          direction: "Up",
          status: "Error",
        };

        throw new SeedResultSetError({
          error,
          results,
        });
      }
    }

    return { results };
  }

  async #createIfNotExists(qb: CreateTableBuilder<any, any> | CreateSchemaBuilder): Promise<void> {
    if (this.#props.db.getExecutor().adapter.supportsCreateIfNotExists) {
      qb = qb.ifNotExists();
    }

    await qb.execute();
  }
}

export interface SeederProps {
  readonly db: Kysely<any>;
  readonly provider: SeedProvider;

  /**
   * The name of the internal seed table. Defaults to `kysely_seed`.
   *
   * If you do specify this, you need to ALWAYS use the same value. Kysely doesn't
   * support changing the table on the fly. If you run the seeder even once with a
   * table name X and then change the table name to Y, kysely will create a new empty
   * seed table and attempt to run the seeds again, which will obviously
   * fail.
   *
   * If you do specify this, ALWAYS ALWAYS use the same value from the beginning of
   * the project, to the end of time or prepare to manually seed the seed
   * tables.
   */
  readonly seedTableName?: string;

  /**
   * The schema of the internal seed tables. Defaults to the default schema
   * on dialects that support schemas.
   *
   * If you do specify this, you need to ALWAYS use the same value. Kysely doesn't
   * support changing the schema on the fly. If you run the seeder even once with a
   * schema name X and then change the schema name to Y, kysely will create a new empty
   * seed tables in the new schema and attempt to run the seeds again, which
   * will obviously fail.
   *
   * If you do specify this, ALWAYS ALWAYS use the same value from the beginning of
   * the project, to the end of time or prepare to manually seed the seed
   * tables.
   *
   * This only works on postgres.
   */
  readonly seedTableSchema?: string;

  /**
   * Enforces whether or not seeds must be run in alpha-numeric order.
   *
   * When false, seeds must be run in their exact alpha-numeric order.
   * This is checked against the seeds already run in the database
   * (`seedTableName'). This ensures your seeds are always run in
   * the same order and is the safest option.
   *
   * When true, seeds are still run in alpha-numeric order, but
   * the order is not checked against already-run seeds in the database.
   * Kysely will simply run all seeds that haven't run yet, in alpha-numeric
   * order.
   */
  readonly allowUnorderedSeeds?: boolean;
}

/**
 * All seed methods ({@link Seeder.seedTo | seedTo},
 * {@link Seeder.seedToLatest | seedToLatest} etc.) never
 * throw but return this object instead.
 */
export interface SeedResultSet {
  /**
   * This is defined if something went wrong.
   *
   * An error may have occurred in one of the seeds in which case the
   * {@link results} list contains an item with `status === 'Error'` to
   * indicate which seed failed.
   *
   * An error may also have occurred before Kysely was able to figure out
   * which seeds should be executed, in which case the {@link results}
   * list is undefined.
   */
  readonly error?: unknown;

  /**
   * {@link SeedResult} for each individual seed that was supposed
   * to be executed by the operation.
   *
   * If all went well, each result's `status` is `Success`. If some seed
   * failed, the failed seed's result's `status` is `Error` and all
   * results after that one have `status` ´NotExecuted`.
   *
   * This property can be undefined if an error occurred before Kysely was
   * able to figure out which seeds should be executed.
   *
   * If this list is empty, there were no seeds to execute.
   */
  readonly results?: SeedResult[];
}

type SeedDirection = "Up" | "Down";

export interface SeedResult {
  readonly seedName: string;

  /**
   * The direction in which this seed was executed.
   */
  readonly direction: SeedDirection;

  /**
   * The execution status.
   *
   *  - `Success` means the seed was successfully executed. Note that
   *    if any of the later seeds in the {@link SeedResult.results}
   *    list failed (have status `Error`) AND the dialect supports transactional
   *    DDL, even the successfull seeds were rolled back.
   *
   *  - `Error` means the seed failed. In this case the
   *    {@link SeedResult.error} contains the error.
   *
   *  - `NotExecuted` means that the seed was supposed to be executed
   *    but wasn't because an earlier seed failed.
   */
  readonly status: "Success" | "Error" | "NotExecuted";
}

export interface SeedProvider {
  /**
   * Returns all seeds, old and new.
   *
   * For example if you have your seeds in a folder as separate files,
   * you can implement this method to return all seed in that folder
   * as {@link Seed} objects.
   *
   * Kysely already has a built-in {@link FileSeedProvider} for node.js
   * that does exactly that.
   *
   * The keys of the returned object are seed names and values are the
   * seeds. The order of the seeds is determined by the alphabetical
   * order of the seed names. The items in the object don't need to be
   * sorted, they are sorted by Kysely.
   */
  getSeeds(): Promise<Record<string, Seed>>;
}

/**
 * Type for the {@link NO_SEEDS} constant. Never create one of these.
 */
export interface NoSeeds {
  readonly __noSeeds__: true;
}

export interface SeedInfo {
  /**
   * Name of the seed.
   */
  name: string;

  /**
   * The actual seed.
   */
  seed: Seed;

  /**
   * When was the seed executed.
   *
   * If this is undefined, the seed hasn't been executed yet.
   */
  executedAt?: Date;
}

interface NamedSeed extends Seed {
  readonly name: string;
}

interface SeedState {
  // All seeds sorted by name.
  readonly seeds: ReadonlyArray<NamedSeed>;

  // Names of executed seeds sorted by execution timestamp
  readonly executedSeeds: ReadonlyArray<string>;

  // Name of the last executed seed.
  readonly lastSeed?: string;

  // Seeds that have not yet ran
  readonly pendingSeeds: ReadonlyArray<NamedSeed>;
}

class SeedResultSetError extends Error {
  readonly #resultSet: SeedResultSet;

  constructor(result: SeedResultSet) {
    super();
    this.#resultSet = result;
  }

  get resultSet(): SeedResultSet {
    return this.#resultSet;
  }
}
