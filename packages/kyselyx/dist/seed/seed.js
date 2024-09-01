import { WithSchemaPlugin } from "kysely";
import { NoopPlugin } from "./noop-plugin.js";
import { freeze, getLast } from "./utils.js";
export const DEFAULT_SEED_TABLE = "kyselyx_seed";
export const DEFAULT_ALLOW_UNORDERED_SEEDS = false;
export const NO_SEEDS = freeze({ __noSeeds__: true });
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
    #props;
    constructor(props) {
        this.#props = freeze(props);
    }
    /**
     * Returns a {@link SeedInfo} object for each seed.
     *
     * The returned array is sorted by seed name.
     */
    async getSeeds() {
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
    async seedToLatest() {
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
    async seedTo(targetSeedName) {
        return this.#seed(({ seeds, executedSeeds, pendingSeeds }) => {
            if (targetSeedName === NO_SEEDS) {
                return { direction: "Down", step: Infinity };
            }
            if (!seeds.find((m) => m.name === targetSeedName)) {
                throw new Error(`seed "${targetSeedName}" doesn't exist`);
            }
            const executedIndex = executedSeeds.indexOf(targetSeedName);
            const pendingIndex = pendingSeeds.findIndex((m) => m.name === targetSeedName);
            if (executedIndex !== -1) {
                return {
                    direction: "Down",
                    step: executedSeeds.length - executedIndex - 1,
                };
            }
            else if (pendingIndex !== -1) {
                return { direction: "Up", step: pendingIndex + 1 };
            }
            else {
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
    async seedUp() {
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
    async seedDown() {
        return this.#seed(() => ({ direction: "Down", step: 1 }));
    }
    async #seed(getSeedDirectionAndStep) {
        try {
            await this.#ensureSeedTablesExists();
            return await this.#runSeeds(getSeedDirectionAndStep);
        }
        catch (error) {
            if (error instanceof SeedResultSetError) {
                return error.resultSet;
            }
            return { error };
        }
    }
    get #seedTableSchema() {
        return this.#props.seedTableSchema;
    }
    get #seedTable() {
        return this.#props.seedTableName ?? DEFAULT_SEED_TABLE;
    }
    get #allowUnorderedSeeds() {
        return this.#props.allowUnorderedSeeds ?? DEFAULT_ALLOW_UNORDERED_SEEDS;
    }
    get #schemaPlugin() {
        if (this.#seedTableSchema) {
            return new WithSchemaPlugin(this.#seedTableSchema);
        }
        return new NoopPlugin(); // TODO: Add PR for Kysely to export this!
    }
    async #ensureSeedTablesExists() {
        await this.#ensureSeedTableSchemaExists();
        await this.#ensureSeedTableExists();
    }
    async #ensureSeedTableSchemaExists() {
        if (!this.#seedTableSchema) {
            // Use default schema. Nothing to do.
            return;
        }
        if (!(await this.#doesSchemaExists())) {
            try {
                await this.#createIfNotExists(this.#props.db.schema.createSchema(this.#seedTableSchema));
            }
            catch (error) {
                // At least on PostgreSQL, `if not exists` doesn't guarantee the `create schema`
                // query doesn't throw if the schema already exits. That's why we check if
                // the schema exist here and ignore the error if it does.
                if (!(await this.#doesSchemaExists())) {
                    throw error;
                }
            }
        }
    }
    async #ensureSeedTableExists() {
        if (!(await this.#doesTableExists(this.#seedTable))) {
            try {
                if (this.#seedTableSchema) {
                    await this.#createIfNotExists(this.#props.db.schema.createSchema(this.#seedTableSchema));
                }
                await this.#createIfNotExists(this.#props.db.schema
                    .withPlugin(this.#schemaPlugin)
                    .createTable(this.#seedTable)
                    .addColumn("name", "varchar(255)", (col) => col.notNull().primaryKey())
                    // The seed run time as ISO string. This is not a real date type as we
                    // can't know which data type is supported by all future dialects.
                    .addColumn("timestamp", "varchar(255)", (col) => col.notNull()));
            }
            catch (error) {
                // At least on PostgreSQL, `if not exists` doesn't guarantee the `create table`
                // query doesn't throw if the table already exits. That's why we check if
                // the table exist here and ignore the error if it does.
                if (!(await this.#doesTableExists(this.#seedTable))) {
                    throw error;
                }
            }
        }
    }
    async #doesSchemaExists() {
        const schemas = await this.#props.db.introspection.getSchemas();
        return schemas.some((it) => it.name === this.#seedTableSchema);
    }
    async #doesTableExists(tableName) {
        const schema = this.#seedTableSchema;
        const tables = await this.#props.db.introspection.getTables({
            withInternalKyselyTables: true,
        });
        return tables.some((it) => it.name === tableName && (!schema || it.schema === schema));
    }
    async #runSeeds(getSeedDirectionAndStep) {
        const adapter = this.#props.db.getExecutor().adapter;
        const run = async (db) => {
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
            }
            else if (direction === "Up") {
                return await this.#seedUp(db, state, step);
            }
            return { results: [] };
        };
        if (adapter.supportsTransactionalDdl) {
            return this.#props.db.transaction().execute(run);
        }
        else {
            return this.#props.db.connection().execute(run);
        }
    }
    async #getState(db) {
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
    #getPendingSeeds(seeds, executedSeeds) {
        return seeds.filter((seed) => {
            return !executedSeeds.includes(seed.name);
        });
    }
    async #resolveSeeds() {
        const allSeeds = await this.#props.provider.getSeeds();
        return Object.keys(allSeeds)
            .sort()
            .map((name) => ({
            ...allSeeds[name],
            name,
        }));
    }
    async #getExecutedSeeds(db) {
        const executedSeeds = await db
            .withPlugin(this.#schemaPlugin)
            .selectFrom(this.#seedTable)
            .select("name")
            .orderBy(["timestamp", "name"])
            .execute();
        return executedSeeds.map((it) => it.name);
    }
    #ensureNoMissingSeeds(seeds, executedSeeds) {
        // Ensure all executed seeds exist in the `seeds` list.
        for (const executed of executedSeeds) {
            if (!seeds.some((it) => it.name === executed)) {
                throw new Error(`corrupted seeds: previously executed seed ${executed} is missing`);
            }
        }
    }
    #ensureSeedsInOrder(seeds, executedSeeds) {
        // Ensure the executed seeds are the first ones in the seed list.
        for (let i = 0; i < executedSeeds.length; ++i) {
            if (seeds[i].name !== executedSeeds[i]) {
                throw new Error(`corrupted seeds: expected previously executed seed ${executedSeeds[i]} to be at index ${i} but ${seeds[i].name} was found in its place. New seeds must always have a name that comes alphabetically after the last executed seed.`);
            }
        }
    }
    async #seedDown(db, state, step) {
        const seedsToRollback = state.executedSeeds
            .slice()
            .reverse()
            .slice(0, step)
            .map((name) => {
            return state.seeds.find((it) => it.name === name);
        });
        const results = seedsToRollback.map((seed) => {
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
            }
            catch (error) {
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
    async #seedUp(db, state, step) {
        const seedsToRun = state.pendingSeeds.slice(0, step);
        const results = seedsToRun.map((seed) => {
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
            }
            catch (error) {
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
    async #createIfNotExists(qb) {
        if (this.#props.db.getExecutor().adapter.supportsCreateIfNotExists) {
            qb = qb.ifNotExists();
        }
        await qb.execute();
    }
}
class SeedResultSetError extends Error {
    #resultSet;
    constructor(result) {
        super();
        this.#resultSet = result;
    }
    get resultSet() {
        return this.#resultSet;
    }
}
