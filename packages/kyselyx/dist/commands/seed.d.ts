/**
 * Applies all seeds up to the latest seed.
 */
export declare function seed(): Promise<void>;
/**
 * Retrieves the status of all seeds available and displays which seeds
 * have been applied, and which have not.
 */
export declare function status(): Promise<void>;
/**
 * Undos the last seed or a specific seed if a name is provided.
 *
 * @param name The name of the seed to undo.
 */
export declare function undo(name?: string): Promise<void>;
/**
 * Undos all seeds that have been applied.
 */
export declare function undoAll(): Promise<void>;
/**
 * Generates a new seed file with the specified name.
 */
export declare function generate(name: string): Promise<void>;
