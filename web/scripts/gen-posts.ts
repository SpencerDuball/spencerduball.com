import { faker } from "@faker-js/faker";
import yaml from "js-yaml";
import fs from "node:fs/promises";
import path from "path";
import { fileURLToPath } from "node:url";

/**
 * Generates a random number following a normal distribution.
 *
 * @param mean Average number of sections.
 * @param dev - Standard deviation.
 */
function normalRandom(mean: number, dev: number) {
  const u = 1 - Math.random();
  const v = 1 - Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return Math.max(1, Math.round(z * dev + mean));
}

/**
 * Generates a random markdown element.
 */
function generateMdElement() {
  const elements = [
    // H1 + p
    () => `\n# ${faker.lorem.words(3)}\n${faker.lorem.paragraphs({ min: 1, max: 3 })}`,
    // H2 + p
    () => `\n## ${faker.lorem.words(3)}\n${faker.lorem.paragraphs({ min: 1, max: 3 })}`,
    // H3 + p
    () => `\n### ${faker.lorem.words(3)}\n${faker.lorem.paragraphs({ min: 1, max: 3 })}`,
    // hr
    () => `\n---`,
    // image
    () =>
      `![${faker.lorem.words({ min: 1, max: 3 })}](${faker.image.url()} '${faker.lorem.words({ min: 1, max: 3 })}')`,
    // fence
    () =>
      faker.helpers.arrayElement([
        // long code (javascript)
        `\n\`\`\`javascript\nimport { createFileRoute, Link } from \"@tanstack/react-router\";\nimport { Button } from \"@/components/ui/button\";\nimport { HugeiconsIcon } from \"@hugeicons/react\";\nimport { ArrowRight02Icon, GithubIcon, NewTwitterIcon } from \"@hugeicons/core-free-icons\";\nimport { PrintablesIcon } from \"@/components/icons\";\nimport { PostLi } from \"@/components/post-li\";\nimport { getPostItems } from \"@/model/post\";\n\nexport const Route = createFileRoute(\"/\")({\n  loader: async () => {\n    const posts = await getPostItems({ data: { start: 0, end: 3 } });\n    return { posts };\n  },\n  component: Component,\n});\n\nexport function Component() {\n  const { posts } = Route.useLoaderData();\n\n  return (\n    <div className=\"grid justify-items-center\">\n      <div className=\"grid w-full max-w-4xl gap-10 px-4 py-12\">\n        {/* Welcome */}\n        <section className=\"grid gap-4 md:grid-flow-col md:grid-cols-[max-content_1fr]\">\n          <div className=\"bg-secondary h-32 w-32 border md:h-auto md:w-52\" />\n          <div className=\"grid auto-rows-max gap-4\">\n            <h1 className=\"text-5xl font-bold\">Welcome</h1>\n            <p>\n              Hello from my corner of the web! I write about web development, homelabs, networks, 3D printing, and more.\n              Check out some projects I have worked on, or a series of posts breaking down complex topics. I hope you\n              find something that sparks your curiosity.\n            </p>\n            <div className=\"inline-grid w-max grid-flow-col items-center gap-2\">\n              <Button\n                variant=\"outline\"\n                size=\"icon-lg\"\n                className=\"hover:text-primary dark:hover:text-primary active:text-primary dark:active:text-primary\"\n                render={<a href=\"https://x.com/SpencerDuball\" target=\"_blank\" rel=\"noopener noreferrer\" />}\n                nativeButton={false}\n              >\n                <HugeiconsIcon strokeWidth={2} icon={NewTwitterIcon} />\n              </Button>\n              <Button\n                variant=\"outline\"\n                size=\"icon-lg\"\n                className=\"hover:text-primary dark:hover:text-primary active:text-primary dark:active:text-primary\"\n                render={<a href=\"https://github.com/SpencerDuball\" target=\"_blank\" rel=\"noopener noreferrer\" />}\n                nativeButton={false}\n              >\n                <HugeiconsIcon strokeWidth={2} icon={GithubIcon} />\n              </Button>\n              <Button\n                variant=\"outline\"\n                size=\"icon-lg\"\n                className=\"hover:text-primary dark:hover:text-primary active:text-primary dark:active:text-primary text-stone-700 dark:text-stone-300\"\n                render={\n                  <a\n                    href=\"https://www.printables.com/social/212303-spencer_duball/about\"\n                    target=\"_blank\"\n                    rel=\"noopener noreferrer\"\n                  />\n                }\n                nativeButton={false}\n              >\n                <PrintablesIcon />\n              </Button>\n            </div>\n          </div>\n        </section>\n\n        {/* Divider */}\n        <div className=\"border-b\" />\n\n        {/* Posts */}\n        <section className=\"grid gap-6\">\n          <h1 className=\"text-2xl font-bold\">Posts</h1>\n          <div className=\"grid auto-rows-max gap-6\">\n            {posts.map((post) => (\n              <PostLi key={post.id} data={post} />\n            ))}\n          </div>\n          <Link\n            to=\"/posts/$page\"\n            params={{ page: 1 }}\n            className=\"hover:text-primary dark:hover:text-primary active:text-primary dark:active:text-primary group mt-6 inline-flex w-fit items-center gap-2 py-2 text-lg\"\n          >\n            All Posts\n            <HugeiconsIcon\n              strokeWidth={2}\n              className=\"transition-transform duration-200 ease-out group-hover:translate-x-1\"\n              icon={ArrowRight02Icon}\n            />\n          </Link>\n        </section>\n      </div>\n    </div>\n  );\n}\n\`\`\``,
        // small code (python)
        `\n\`\`\`python\nfrom typing import Union\n\nfrom fastapi import FastAPI\n\napp = FastAPI()\n\n\n@app.get(\"/\")\ndef read_root():\n    return {\"Hello\": \"World\"}\n\n\n@app.get(\"/items/{item_id}\")\ndef read_item(item_id: int, q: Union[str, None] = None):\n    return {\"item_id\": item_id, \"q\": q}\n\`\`\``,
        // small code (json)
        `\n\`\`\`json\n{\n  \"first_name\": \"George\",\n  \"last_name\": \"Washington\",\n  \"birthday\": \"1732-02-22\",\n  \"address\": {\n    \"street_address\": \"3200 Mount Vernon Memorial Highway\",\n    \"city\": \"Mount Vernon\",\n    \"state\": \"Virginia\",\n    \"country\": \"United States\"\n  }\n}\n\`\`\``,
      ]),
    // blockquote
    () => `\n> ${faker.lorem.sentence()}\n> — *${faker.person.fullName()}*`,
    // list
    () =>
      faker.helpers.arrayElement([
        // ordered
        `\n1.${faker.lorem.sentence()}\n2.${faker.lorem.sentence()}\n3.${faker.lorem.sentence()}`,
        // unordered
        `\n-${faker.lorem.sentence()}\n-${faker.lorem.sentence()}\n-${faker.lorem.sentence()}`,
        // ordered (nested - one level)
        `\n1.${faker.lorem.sentence()}\n  1.${faker.lorem.sentence()}\n  2.${faker.lorem.sentence()}\n  3.${faker.lorem.sentence()}\n2.${faker.lorem.sentence()}\n  1.${faker.lorem.sentence()}\n  2.${faker.lorem.sentence()}\n  3.${faker.lorem.sentence()}\n3.${faker.lorem.sentence()}\n  1.${faker.lorem.sentence()}\n  2.${faker.lorem.sentence()}\n  3.${faker.lorem.sentence()}`,
        // unordered (nested - one level)
        `\n-${faker.lorem.sentence()}\n  -${faker.lorem.sentence()}\n  -${faker.lorem.sentence()}\n  -${faker.lorem.sentence()}\n-${faker.lorem.sentence()}\n  1.${faker.lorem.sentence()}\n  2.${faker.lorem.sentence()}\n  3.${faker.lorem.sentence()}`,
        // mixed (nested - many levels)
        `\n1.${faker.lorem.sentence()}\n  1.${faker.lorem.sentence()}\n    1.${faker.lorem.sentence()}\n      -${faker.lorem.sentence()}\n      -${faker.lorem.sentence()}\n      -${faker.lorem.sentence()}\n    2.${faker.lorem.sentence()}\n      -${faker.lorem.sentence()}\n      -${faker.lorem.sentence()}\n      -${faker.lorem.sentence()}\n    3.${faker.lorem.sentence()}\n      -${faker.lorem.sentence()}\n      -${faker.lorem.sentence()}\n      -${faker.lorem.sentence()}\n  2.${faker.lorem.sentence()}\n    -${faker.lorem.sentence()}\n    -${faker.lorem.sentence()}\n    -${faker.lorem.sentence()}\n  3.${faker.lorem.sentence()}\n    1.${faker.lorem.sentence()}\n    2.${faker.lorem.sentence()}\n    3.${faker.lorem.sentence()}\n2.${faker.lorem.sentence()}\n  1.${faker.lorem.sentence()}\n  2.${faker.lorem.sentence()}\n  3.${faker.lorem.sentence()}\n3.${faker.lorem.sentence()}\n  1.${faker.lorem.sentence()}\n  2.${faker.lorem.sentence()}\n  3.${faker.lorem.sentence()}`,
      ]),
    // table
    () =>
      faker.helpers.arrayElement([
        // commonmark
        `\n| ${faker.lorem.word()} | ${faker.lorem.word()} |\n| --- | --- |\n| ${faker.number.int()} | ${faker.lorem.word()} |\n| ${faker.number.int()} | ${faker.lorem.word()} |`,
        // markdoc
        `\n{% table %}\n* ${faker.lorem.word()}\n* ${faker.lorem.word()}\n---\n* ${faker.number.int()}\n* ${faker.lorem.word()}\n---\n* ${faker.number.int()}\n* ${faker.lorem.word()}\n---\n* ${faker.number.int()}\n* ${faker.lorem.word()}\n{% table %}`,
      ]),
    // code (inline)
    () => `\n* ${faker.lorem.sentence()}\n* Including some \`const a = '42';\` here.\n* ${faker.lorem.sentence()}`,
    // bold & italics
    () =>
      `\n**${faker.lorem.words(2)}** ${faker.lorem.sentence()} *${faker.lorem.words(3)}* ${faker.lorem.sentence({ min: 1, max: 3 })}.`,
    // link
    () => `\nCheck out [this link](${faker.internet.url()} "${faker.lorem.words({ min: 1, max: 3 })}") for more info.`,
  ];
  return faker.helpers.arrayElement(elements)();
}

/**
 * Returns the full contents of the markdown file.
 */
function generatePost() {
  const title = faker.lorem.sentence({ min: 4, max: 8 }).replace(".", " ");
  const createdAt = faker.date.past().toISOString();

  const frontmatter = {
    id: faker.string.hexadecimal({ length: 8, casing: "lower", prefix: "" }),
    slug: faker.helpers.slugify(title.split(" ").slice(0, 4).join(" ")).toLowerCase(),
    title,
    summary: faker.lorem.paragraph({ min: 4, max: 8 }),
    createdAt,
    modifiedAt: faker.helpers.maybe(() =>
      faker.date.between({ from: createdAt, to: new Date(Date.now()) }).toISOString(),
    ),
  };

  // create the body
  const sectionCount = normalRandom(6, 2);
  let body = `# ${title}\n\n${faker.lorem.paragraphs(1)}\n`;
  for (let i = 0; i < sectionCount; i++) body += generateMdElement() + "\n";

  // create the full file string
  const contents = `---\n${yaml.dump(frontmatter, { lineWidth: 88 })}---\n${body}`;

  return { contents, frontmatter };
}

async function main() {
  faker.seed(10);
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  for (let i = 0; i < 72; i++) {
    const {
      contents,
      frontmatter: { id, slug },
    } = generatePost();
    await fs.writeFile(path.resolve(__dirname, "..", "data", "dev", "posts", `${slug}-${id}.mdoc`), contents);
  }
}

main();
