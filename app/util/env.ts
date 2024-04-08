import { z } from "zod";

const ZEnv = z.object({
  SITE_URL: z.string(),
});

const ENV = ZEnv.parse(process.env);

export { ZEnv, ENV };
