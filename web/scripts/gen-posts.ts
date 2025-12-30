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
    () => `\n### ${faker.lorem.words(3)}\n${faker.lorem.paragraphs(1)}`,
    () => `\n**${faker.lorem.words(2)}** ${faker.lorem.sentence()} *${faker.lorem.words(3)}*.`,
    () => `\n> ${faker.lorem.sentence()}\n> — *${faker.person.fullName()}*`,
    () =>
      `\n\`\`\`javascript\nfunction ${faker.helpers.slugify(faker.lorem.words(1))}() {\n  console.log("${faker.lorem.words(3)}");\n}\n\`\`\``,
    () =>
      `\n| ${faker.lorem.word()} | ${faker.lorem.word()} |\n| --- | --- |\n| ${faker.number.int()} | ${faker.lorem.word()} |\n| ${faker.number.int()} | ${faker.lorem.word()} |`,
    () => `\n* ${faker.lorem.sentence()}\n* Including some \`inline_code\` here.\n* ${faker.lorem.sentence()}`,
    () => `\nCheck out [this link](${faker.internet.url()}) for more info.`,
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
    await fs.writeFile(path.resolve(__dirname, "..", "data", "dev", "posts", `${slug}-${id}.mdx`), contents);
  }
}

main();
