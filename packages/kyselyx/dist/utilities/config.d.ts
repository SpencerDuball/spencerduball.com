import { Kysely } from "kysely";
import { z } from "zod";
declare const ZConfigFile: z.ZodObject<{
    sources: z.ZodObject<{
        db: z.ZodType<Kysely<any>, z.ZodTypeDef, Kysely<any>>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        db: z.ZodType<Kysely<any>, z.ZodTypeDef, Kysely<any>>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        db: z.ZodType<Kysely<any>, z.ZodTypeDef, Kysely<any>>;
    }, z.ZodTypeAny, "passthrough">>;
    migrationFolder: z.ZodOptional<z.ZodString>;
    seedFolder: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    sources: {
        db: Kysely<any>;
    } & {
        [k: string]: unknown;
    };
    migrationFolder?: string | undefined;
    seedFolder?: string | undefined;
}, {
    sources: {
        db: Kysely<any>;
    } & {
        [k: string]: unknown;
    };
    migrationFolder?: string | undefined;
    seedFolder?: string | undefined;
}>;
type DefaultStores = {
    db: Kysely<any>;
};
export interface IConfigFile<T extends DefaultStores = DefaultStores> extends z.infer<typeof ZConfigFile> {
    sources: T;
}
declare const ZConfig: z.ZodObject<{
    configFile: z.ZodString;
    sources: z.ZodObject<{
        db: z.ZodType<Kysely<any>, z.ZodTypeDef, Kysely<any>>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        db: z.ZodType<Kysely<any>, z.ZodTypeDef, Kysely<any>>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        db: z.ZodType<Kysely<any>, z.ZodTypeDef, Kysely<any>>;
    }, z.ZodTypeAny, "passthrough">>;
    migrationFolder: z.ZodString;
    seedFolder: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sources: {
        db: Kysely<any>;
    } & {
        [k: string]: unknown;
    };
    migrationFolder: string;
    seedFolder: string;
    configFile: string;
}, {
    sources: {
        db: Kysely<any>;
    } & {
        [k: string]: unknown;
    };
    migrationFolder: string;
    seedFolder: string;
    configFile: string;
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
 */
export declare function getConfig(): IConfig;
/**
 * Load the Kyselyx configuration from the specified config file.
 */
export declare function loadKyselyxConfig(cli: ICliOptions): Promise<void>;
export {};
