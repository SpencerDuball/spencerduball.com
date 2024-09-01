import fs from "fs-extra";
import path from "path";
import ora from "ora";
import { getConfig } from "../utilities/config.js";
import { Seeder, FileSeedProvider } from "../seed/index.js";
const SEED_TABLE_NAME = "kyselyx_seed";
function template(configFile, seedFile) {
    // get the relative path of the config file from the seed file
    let relativePath = path.relative(path.dirname(seedFile), configFile);
    // remove the extension from the file path
    relativePath = relativePath.replace(/\.\w+$/, "");
    return [
        `import { type IKyselyxSources } from "${relativePath}";`,
        ``,
        `async function up({ db }: IKyselyxSources) {}`,
        ``,
        `async function down({ db }: IKyselyxSources) {}`,
        ``,
        `export { up, down };`,
    ].join("\n");
}
/**
 * Applies all seeds up to the latest seed.
 */
export async function seed() {
    const spinner = ora("Connecting to the database ...").start();
    const { sources: { db }, seedFolder: fld, } = getConfig();
    spinner.stopAndPersist({ text: "" });
    // apply the seeds
    const seedFolder = path.resolve(fld);
    if (!fs.existsSync(seedFolder)) {
        spinner.fail(`Seed folder not found: ${seedFolder}`);
        process.exit(1);
    }
    const provider = new FileSeedProvider({ fs, path, seedFolder });
    const seeder = new Seeder({ db, provider, seedTableName: SEED_TABLE_NAME });
    const { error, results } = await seeder.seedToLatest();
    // process the results
    results?.forEach((it) => {
        if (it.status === "Success")
            spinner.succeed(`Applied seed ${it.seedName} successfully!`);
        else if (it.status === "Error")
            spinner.fail(`Error applying ${it.seedName}.`);
        else if (it.status === "NotExecuted")
            spinner.fail(`Seeds not executed due to prior error ${it.seedName}.`);
    });
    // close the database connection
    await db.destroy();
    if (error) {
        spinner.fail(`Failed to seed.`);
        console.error(error);
        process.exit(1);
    }
    else {
        spinner.succeed("Seeded successfully.");
    }
}
/**
 * Retrieves the status of all seeds available and displays which seeds
 * have been applied, and which have not.
 */
export async function status() {
    const spinner = ora("Connecting to the database ...").start();
    const { sources: { db }, seedFolder: fld, } = getConfig();
    // get the seeds
    const seedFolder = path.resolve(fld);
    if (!fs.existsSync(seedFolder)) {
        spinner.fail(`Seed folder not found: ${seedFolder}`);
        process.exit(1);
    }
    const provider = new FileSeedProvider({ fs, path, seedFolder });
    const seeder = new Seeder({ db, provider, seedTableName: SEED_TABLE_NAME });
    const seeds = await seeder.getSeeds();
    spinner.stop();
    // collect a snapshot of the seed info
    let lastAppliedSeed = null;
    let totalAppliedSeeds = 0;
    for (let seed of seeds) {
        if (seed.executedAt !== undefined) {
            lastAppliedSeed = seed;
            totalAppliedSeeds++;
        }
    }
    // display the information
    let statusLine = [
        `Total Seeds: ${seeds.length}`,
        `Applied Seeds: ${totalAppliedSeeds}`,
        `Last Seed: ${lastAppliedSeed?.name || "NONE"}`,
    ].join("     ");
    console.log(statusLine);
    console.log(Array(statusLine.length).fill("-").join(""));
    for (let seed of seeds) {
        if (seed.executedAt)
            spinner.succeed(`Seed ${seed.name} applied.`);
        else
            spinner.fail(`Seed ${seed.name} not applied.`);
    }
    // cloase the database connection
    await db.destroy();
}
/**
 * Undos the last seed or a specific seed if a name is provided.
 *
 * @param name The name of the seed to undo.
 */
export async function undo(name) {
    const spinner = ora("Connecting to the database ...").start();
    const { sources: { db }, seedFolder: fld, } = getConfig();
    const seedFolder = path.resolve(fld);
    if (!fs.existsSync(seedFolder)) {
        spinner.fail(`Seed folder not found: ${seedFolder}`);
        process.exit(1);
    }
    const provider = new FileSeedProvider({ fs, path, seedFolder });
    const seeder = new Seeder({ db, provider, seedTableName: SEED_TABLE_NAME });
    const seeds = await seeder.getSeeds();
    spinner.stop();
    // Get the total applied seeds
    let totalAppliedSeeds = 0;
    for (let seed of seeds)
        seed.executedAt !== undefined && totalAppliedSeeds++;
    // If no name is provided, undo the last seed. If a name is provided,
    // undo all seeds including the specified seed.
    if (!name) {
        if (totalAppliedSeeds === 0) {
            spinner.fail(`Can't undo a seed because no seeds have been applied.`);
            process.exit(1);
        }
        // undo the last seed
        spinner.text = `Undoing last seed ...`;
        spinner.start();
        const { error, results } = await seeder.seedDown();
        if (error || results === undefined) {
            spinner.fail(`Failed to undo the last seed.`);
            if (error)
                console.error(error);
            process.exit(1);
        }
        for (let result of results) {
            if (result.status === "Success") {
                spinner.succeed(`Successful undo of seed ${result.seedName}.`);
            }
            else {
                spinner.fail(`Failed to undo seed ${result.seedName}.`);
            }
        }
    }
    else {
        // Find the seed to undo
        const seedToUndo = seeds.find((it) => it.name === name) ?? null;
        if (seedToUndo === null) {
            spinner.fail(`Seed ${name} not found.`);
            process.exit(1);
        }
        else if (seedToUndo.executedAt === undefined) {
            spinner.fail(`Seed ${name} has not been applied.`);
            process.exit(1);
        }
        // undo the seed
        spinner.text = `Undoing seed ${name} ...`;
        spinner.start();
        const { error, results } = await seeder.seedTo(name);
        if (error || results === undefined) {
            spinner.fail(`Failed to undo seed ${name}.`);
            if (error)
                console.error(error);
            process.exit(1);
        }
        for (let result of results) {
            if (result.status === "Success") {
                spinner.succeed(`Successful undo of seed ${result.seedName}.`);
            }
            else {
                spinner.fail(`Failed to undo seed ${result.seedName}.`);
            }
        }
    }
    // close the database connection
    await db.destroy();
}
/**
 * Undos all seeds that have been applied.
 */
export async function undoAll() {
    const spinner = ora("Connecting to the database ...").start();
    const { sources: { db }, seedFolder: fld, } = getConfig();
    const seedFolder = path.resolve(fld);
    if (!fs.existsSync(seedFolder)) {
        spinner.fail(`Seed folder not found: ${seedFolder}`);
        process.exit(1);
    }
    const provider = new FileSeedProvider({ fs, path, seedFolder });
    const seeder = new Seeder({ db, provider, seedTableName: SEED_TABLE_NAME });
    const seeds = await seeder.getSeeds();
    spinner.stop();
    // get the seed executed first
    let initialSeed = null;
    for (let seed of seeds) {
        if (seed.executedAt !== undefined) {
            if (!initialSeed)
                initialSeed = seed;
            else if (seed.executedAt < initialSeed.executedAt)
                initialSeed = seed;
        }
    }
    // if no seeds have been applied
    if (!initialSeed) {
        spinner.fail(`No seeds have been applied.`);
        process.exit(1);
    }
    // seed down to the initial seed
    spinner.text = `Undoing all seeds ...`;
    spinner.start();
    let { error, results } = await seeder.seedTo(initialSeed.name);
    if (error || results === undefined) {
        spinner.fail(`Failed to undo all seeds.`);
        if (error)
            console.error(error);
        process.exit(1);
    }
    // seed down to the inital seed
    ({ error, results } = await seeder.seedDown());
    if (error || results === undefined) {
        spinner.fail(`Failed to undo initial seed.`);
        if (error)
            console.error(error);
        process.exit(1);
    }
    for (let result of results) {
        if (result.status !== "Success") {
            spinner.succeed(`Failed to undo seed ${result.seedName}.`);
            process.exit(1);
        }
    }
    spinner.succeed(`All seeds undone successfully.`);
    // close the database connection
    await db.destroy();
}
/**
 * Generates a new seed file with the specified name.
 */
export async function generate(name) {
    const { configFile, seedFolder } = getConfig();
    // Generate the seed file
    const spinner = ora(`Generating seed file ...`).start();
    const seedId = `${Date.now()}_${name}`;
    await fs.ensureDir(path.resolve(seedFolder, seedId));
    const seedFile = path.resolve(seedFolder, seedId, "run.ts");
    await fs.writeFile(seedFile, template(configFile, seedFile));
    spinner.succeed(`Generated seed file: "${seedId}/run.ts"`);
}
