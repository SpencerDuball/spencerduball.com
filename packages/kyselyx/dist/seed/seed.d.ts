import { DefaultStores } from "../utilities/config.js";
export declare const DEFAULT_SEED_TABLE = "kyselyx_seed";
export declare const DEFAULT_ALLOW_UNORDERED_SEEDS = false;
export declare const NO_SEEDS: NoSeeds;
export interface Seed<T extends DefaultStores = DefaultStores> {
    up(sources: T): Promise<void>;
    down(sources: T): Promise<void>;
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
export declare class Seeder {
    #private;
    constructor(props: SeederProps);
    /**
     * Returns a {@link SeedInfo} object for each seed.
     *
     * The returned array is sorted by seed name.
     */
    getSeeds(): Promise<ReadonlyArray<SeedInfo>>;
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
    seedToLatest(): Promise<SeedResultSet>;
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
    seedTo(targetSeedName: string | NoSeeds): Promise<SeedResultSet>;
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
    seedUp(): Promise<SeedResultSet>;
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
    seedDown(): Promise<SeedResultSet>;
}
export interface SeederProps<T extends DefaultStores = DefaultStores> {
    readonly sources: T;
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
export {};
