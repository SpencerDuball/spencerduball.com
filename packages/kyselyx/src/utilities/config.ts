import { Kysely } from "kysely";
import fs from "fs-extra";
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
const ZConfigFile = z.object({
  db: z.instanceof(Kysely<any>),
  migrationFolder: z.string().optional(),
  seedFolder: z.string().optional(),
});

const ZConfig = z.object({
  db: z.instanceof(Kysely<any>),
  migrationFolder: z.string(),
  seedFolder: z.string(),
});
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

let _config: IConfig | null = null;

/**
 * Retrieves the ksyelyx configuration after it has been loaded.
 *
 * Note: The configuration needs to be loaded with `loadKyselyxConfig` before calling this function.
 */
export function getConfig(): IConfig {
  return ZConfig.parse(_config);
}

/**
 * Load the Kyselyx configuration from the specified config file.
 */
export async function loadKyselyxConfig(cli: ICliOptions) {
  // check if the config file exists
  let configFile: string | undefined = undefined;
  if (cli.configFile && fs.existsSync(cli.configFile)) configFile = cli.configFile;
  else if (fs.existsSync("kyselyx.config.ts")) configFile = "kyselyx.config.ts";
  else if (fs.existsSync("kyselyx.config.js")) configFile = "kyselyx.config.js";
  else if (fs.existsSync(".config/kyselyx.config.ts")) configFile = ".config/kyselyx.config.ts";
  else if (fs.existsSync(".config/kyselyx.config.js")) configFile = ".config/kyselyx.config.js";
  else {
    console.error("Could not find a `kyselyx.config.ts` or `kyselyx.config.js` file.");
    process.exit(1);
  }

  // load and validate the config file
  const { default: _cfg } = await import(configFile);
  const cfg = ZConfigFile.catch(({ error }) => {
    if (error instanceof z.ZodError) console.error(`There are errors in your kyselyx config file: ${error.message}`);
    process.exit(1);
  }).parse(_cfg);

  // set and validate the migrationFolder folder
  if (cli.migrationFolder && fs.existsSync(cli.migrationFolder)) cfg.migrationFolder = cli.migrationFolder;
  else if (cfg.migrationFolder && fs.existsSync(cfg.migrationFolder)) cfg.migrationFolder = cfg.migrationFolder;
  else cfg.migrationFolder = "migrations";

  // set and validate the seedFolder folder
  if (cli.seedFolder && fs.existsSync(cli.seedFolder)) cfg.seedFolder = cli.seedFolder;
  else if (cfg.seedFolder && fs.existsSync(cfg.seedFolder)) cfg.seedFolder = cfg.seedFolder;
  else cfg.seedFolder = "seeds";

  _config = ZConfig.parse(cfg);
}
