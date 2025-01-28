import cron from "node-cron";
import { z } from "zod";

const Env = z.object({
  SITE_URL: z.string(),
  CRON_CLIENT_SECRET: z.string(),
});

/**
 * This function will ping the `/cron/daily` endpoint on the site.
 */
async function pingDailyCronHook() {
  const env = await Env.parseAsync(process.env).catch((e) => {
    console.error("Invalid environment variables:", e);
    process.exit(1);
  });

  // build the URL to ping
  const url = new URL(env.SITE_URL);
  if (url.hostname === "localhost") {
    // docker containers can't access localhost, so we need to use host.docker.internal
    url.hostname = "host.docker.internal";
  }

  // ping the endpoint
  await fetch(new URL("/cron/daily", url.toString()), {
    headers: { Authorization: `Bearer ${env.CRON_CLIENT_SECRET}` },
  })
    .then((res) => {
      console.log(res);
    })
    .catch((e) => {
      console.log(e);
    });
}

async function main() {
  cron.schedule("0 0 * * *", pingDailyCronHook);
}

main();
