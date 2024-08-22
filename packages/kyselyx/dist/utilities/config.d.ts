import { Kysely } from "kysely";
import { z } from "zod";
/**
 * The configuration interface for Kyselyx.
 */
export interface IConfigFile {
    /**
     * The Kysely instance.
     */
    db: Kysely<any>;
    /**
     * The path to the migrations folder.
     */
    migrationFolder?: string;
    /**
     * The path to the seeds folder.
     */
    seedFolder?: string;
}
declare const ZConfig: z.ZodObject<{
    db: z.ZodType<Kysely<any>, z.ZodTypeDef, Kysely<any>>;
    migrationFolder: z.ZodString;
    seedFolder: z.ZodString;
}, "strip", z.ZodTypeAny, {
    db: Kysely<any>;
    migrationFolder: string;
    seedFolder: string;
}, {
    db: Kysely<any>;
    migrationFolder: string;
    seedFolder: string;
}>;
type IConfig = z.infer<typeof ZConfig>;
export interface ICliOptions {
    /**
     * The path to the config file.
     */
    configFile?: string;
    /**
     * The folder where migrations are stored.
     */
    migrationFolder?: string;
    /**
     * The folder where seeds are stored.
     */
    seedFolder?: string;
}
/**
 * Retrieves the ksyelyx configuration after it has been loaded.
 *
 * Note: The configuration needs to be loaded with `loadKyselyxConfig` before calling this function.
 * @returns The Kyselyx configuration.
 */
export declare function getConfig(): IConfig;
/**
 * Load the Kyselyx configuration from the specified config file.
 *
 * @param cli The CLI options.
 */
export declare function loadKyselyxConfig(cli: ICliOptions): Promise<void>;
export {};
