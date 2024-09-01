import { z } from "zod";
import path from "path";
/**
 * Reads all seeds from a folder in node.js.
 *
 * ### Examples
 *
 * ```ts
 * import { promises as fs } from 'fs'
 * import path from 'path'
 *
 * new FileSeedProvider({
 *   fs,
 *   path,
 *   seedFolder: 'path/to/seeds/folder'
 * })
 * ```
 */
export class FileSeedProvider {
    #props;
    constructor(props) {
        this.#props = props;
    }
    async getSeeds() {
        const seeds = {};
        const folders = await this.#props.fs.readdir(this.#props.seedFolder);
        for await (const seedKey of folders) {
            const file = path.join(this.#props.seedFolder, seedKey, "run.ts");
            const seed = await import(file);
            if (isSeed(seed?.default)) {
                seeds[seedKey] = seed.default;
            }
            else if (isSeed(seed)) {
                seeds[seedKey] = seed;
            }
        }
        return seeds;
    }
}
function isSeed(obj) {
    return z.object({ up: z.function(), down: z.function() }).safeParse(obj).success;
}
