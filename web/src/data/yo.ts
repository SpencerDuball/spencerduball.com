import yaml from "js-yaml";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import crypto from "node:crypto";

async function main() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // read in the data
  const data = await fs.readFile(path.join(__dirname, "posts.yaml"), { encoding: "utf-8" });
  const items = yaml.load(data) as any[];

  for (const item of items) item.id = crypto.randomBytes(4).toString("hex");

  await fs.writeFile(path.join(__dirname, "posts.yaml"), yaml.dump(items, { lineWidth: 88 }));
}

main();
