/**
 * Applies all migrations up to the latest migration.
 */
export declare function migrate(): Promise<void>;
/**
 * Retrieves the status of all migrations available and displays which migrations
 * have been applied, and which have not.
 */
export declare function status(): Promise<void>;
/**
 * Undoes the last migration or a specific migration if a name is provided.
 *
 * @param name The name of the migration to undo.
 */
export declare function undo(name?: string): Promise<void>;
export declare function undoAll(): Promise<void>;
/**
 * Creates a new migration file with the specified name.
 */
export declare function generate(name: string): Promise<void>;
