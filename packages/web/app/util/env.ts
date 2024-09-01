import { z } from "zod";

const ZEnv = z.object({
  SITE_URL: z.string(),
  LIBSQL_URL: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  GITHUB_CLIENT_ID: z.string(),
});

export { ZEnv };
