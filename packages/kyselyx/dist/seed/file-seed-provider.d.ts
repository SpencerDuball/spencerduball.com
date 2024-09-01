import { Seed, SeedProvider } from "./seed";
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
export declare class FileSeedProvider implements SeedProvider {
    #private;
    constructor(props: FileSeedProviderProps);
    getSeeds(): Promise<Record<string, Seed>>;
}
export interface FileSeedProviderFS {
    readdir(path: string): Promise<string[]>;
}
export interface FileSeedProviderPath {
    join(...path: string[]): string;
}
export interface FileSeedProviderProps {
    fs: FileSeedProviderFS;
    path: FileSeedProviderPath;
    seedFolder: string;
}
