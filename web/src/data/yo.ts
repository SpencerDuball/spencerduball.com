import yaml from "js-yaml";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import crypto from "node:crypto";
import { IPostLi } from "../components/post-li";

type IPost = Omit<IPostLi, "createdAt" | "modifiedAt"> & { createdAt: string; modifiedAt?: string };

const templates: [IPost, IPost, IPost] = [
  {
    id: "52ad827d",
    slug: "aenean-luctus-a-dolor",
    title: "Aenean luctus a dolor ut ultrices.",
    summary:
      "Aenean luctus a dolor ut ultrices. Vivamus accumsan auctor odio, sed consequat erat lacinia ut. Nulla gravida dignissim cursus. Sed non dapibus enim. Mauris molestie, massa dapibus tincidunt semper, odio ex tincidunt arcu, ut dignissim lacus dui id sapien. Nulla quis ultrices erat. Fusce massa velit, vehicula id velit et, luctus facilisis diam.",
    createdAt: "",
  },
  {
    id: "52ad827d",
    slug: "duis-varius-ipsum-et-nisl",
    title: "Duis varius ipsum et nisl aliquet consectetur. Etiam ut nulla ligula.",
    summary:
      "Duis varius ipsum et nisl aliquet consectetur. Etiam ut nulla ligula. Fusce dignissim ligula vitae ligula placerat semper. In rhoncus placerat ex, et vestibulum tellus porta id.",
    createdAt: "",
  },
  {
    id: "52ad827d",
    slug: "vestibulum-ante-ipsum-primis",
    title: "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubili curae",
    summary:
      "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Quisque at dignissim odio, et volutpat massa. Nunc quis dolor ac ligula placerat imperdiet a ac quam. Nam ultricies massa vitae nulla iaculis maximus. Quisque sed dignissim lacus. Quisque pulvinar felis at est feugiat, quis dignissim diam ornare. Suspendisse potenti.",
    createdAt: "",
  },
];

async function main() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const items: IPost[] = [];
  const numItems = 80;
  for (let i = 0; i < numItems; i++) {
    let temp: IPost;
    if (i % 3) temp = { ...templates[0] };
    else if (i % 2) temp = { ...templates[1] };
    else temp = { ...templates[2] };
    temp.id = crypto.randomBytes(4).toString("hex");
    temp.createdAt = new Date(Date.now() - (numItems + 1 - i) * 1000 * 60 * 60 * 24).toISOString();
    temp.modifiedAt = i % 6 ? new Date(Date.now() - (numItems - i) * 1000 * 60 * 60 * 24).toISOString() : undefined;
    temp.summary = `Post ${i + 1}: ` + temp.summary;
    items.push(temp);
  }

  const content = "# yaml-language-server: $schema=./schemas/posts.schema.json\n" + yaml.dump(items, { lineWidth: 88 });
  await fs.writeFile(path.join(__dirname, "posts.yaml"), content);
}

main();
