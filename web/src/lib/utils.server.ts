import { z } from "zod/v4";

// -------------------------------------------------------------------------------------
// Globals
// -------------------------------------------------------------------------------------

/**
 * The runtime validated environment variables on the server.
 */
export const serverEnv = z.object({ NODE_ENV: z.enum(["development", "production", "test"]) }).parse(process.env);
