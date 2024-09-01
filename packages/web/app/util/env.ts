import { z } from "zod";

const ZEnv = z.object({
  NODE_ENV: z.string(),
  SITE_URL: z.string(),
  LIBSQL_URL: z.string(),
  MINIO_ROOT_USER: z.string(),
  MINIO_ROOT_PASSWORD: z.string(),
  MINIO_URL: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  GITHUB_CLIENT_ID: z.string(),
  CRON_CLIENT_SECRET: z.string(),
});

export { ZEnv };
