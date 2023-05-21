import path from "path";
import { writeFile } from "fs/promises";
import { faker } from "@faker-js/faker";
import prettier from "prettier";

/* ------------------------------------------------------------------------------------------------------------
 * Create General Utility Functions
 * ------------------------------------------------------------------------------------------------------------ */

/**
 * Gets a Date object a specified number of days from now, before or after.
 *
 * @param offset The offset (in days) from the initial date.
 * @param initialDate The initial date to base the offset from.
 */
function getDateFromOffset(offset: number, initialDate: Date = new Date()) {
  const offsetInMs = offset * 24 * 60 * 60 * 1000;
  return new Date(initialDate.getTime() + offsetInMs);
}

/**
 * Gets a random number from an exponential distribution.
 *
 * From `y = ab^x` where,
 * y is the random value
 * a is the initial value
 * b is the rate of change
 * x is the time interval
 *
 * @param initial The value that we will start from, in a growth function this is the min, in a decay function this is max.
 * @param rate The rate of decay; 1 = no change, <1 = decaying, >1 = growing.
 * @param time The time value.
 * @returns A random sample.
 */
function sampleFromExponential(initial: number, rate: number, time: number) {
  return initial * Math.pow(rate, time);
}

/**
 * Gets a sample from a normal distribution.
 *
 * @param mean The mean value
 * @param stdDev The standard deviation.
 * @param offset The offset.
 * @returns A sample.
 */
function sampleFromNormalDistribution(mean: number, stdDev: number, offset: number = 0): number {
  return mean + stdDev * (Math.random() * 2 - 1) + offset;
}

/** Random probability of success. */
function isSuccess(probability: number) {
  return Math.random() < probability;
}

/* ------------------------------------------------------------------------------------------------------------
 * Define Seed Generators
 * ------------------------------------------------------------------------------------------------------------ */

// define the 'Role' table seed data
interface IGenerateRolesDataParams {
  dbStartDate: Date;
}
async function generateRolesData({ dbStartDate }: IGenerateRolesDataParams) {
  return [{ id: "admin", description: "The administrator role.", created_at: dbStartDate, modified_at: dbStartDate }];
}

// define the 'User' table seed data
interface IGenerateUsersDataParams {
  dbStartDate: Date;
}
async function generateUsersData({ dbStartDate }: IGenerateUsersDataParams) {
  return [
    {
      id: 1,
      username: "AdminUser1",
      name: "First Admin",
      avatar_url: "",
      github_url: "https://www.github.com",
      created_at: dbStartDate,
      modified_at: dbStartDate,
    },
    {
      id: 2,
      username: "AdminUser2",
      name: "Second Admin",
      avatar_url: "",
      github_url: "https://www.github.com",
      created_at: dbStartDate,
      modified_at: dbStartDate,
    },
    {
      id: 3,
      username: "PublicUser1",
      name: "First User",
      avatar_url: "",
      github_url: "https://www.github.com",
      created_at: new Date("3/20/22"),
      modified_at: new Date("3/20/22"),
    },
    {
      id: 4,
      username: "PublicUser2",
      name: "Second User",
      avatar_url: "",
      github_url: "https://www.github.com",
      created_at: new Date("4/11/22"),
      modified_at: new Date("4/11/22"),
    },
  ];
}

// define 'UserRole' table seed data
interface IGenerateUserRoleDataParams {}
async function generateUserRolesData({}: IGenerateUserRoleDataParams) {
  return [
    { user_id: 1, role_id: "admin" },
    { user_id: 2, role_id: "admin" },
  ];
}

// define 'Tag' table seed data
interface IGenerateTagsDataParams {
  dbStartDate: Date;
}
async function generateTagData({ dbStartDate }: IGenerateTagsDataParams) {
  return [
    { id: "react", created_at: dbStartDate, modified_at: dbStartDate },
    { id: "remix", created_at: dbStartDate, modified_at: dbStartDate },
    { id: "typescript", created_at: dbStartDate, modified_at: dbStartDate },
    { id: "bjt", created_at: dbStartDate, modified_at: dbStartDate },
    { id: "mosfet", created_at: dbStartDate, modified_at: dbStartDate },
  ];
}

// define 'BlogpostTags' table seed data
interface IGenerateBlogpostTagsDataParams {}
async function generateBlogpostTagsData({}: IGenerateBlogpostTagsDataParams) {
  return [
    { blogpost_id: 1, tag_id: "react" },
    { blogpost_id: 2, tag_id: "react" },
    { blogpost_id: 3, tag_id: "react" },
    { blogpost_id: 4, tag_id: "react" },
    { blogpost_id: 5, tag_id: "react" },
    { blogpost_id: 6, tag_id: "react" },
    { blogpost_id: 7, tag_id: "react" },
    { blogpost_id: 8, tag_id: "react" },
    { blogpost_id: 9, tag_id: "react" },

    { blogpost_id: 10, tag_id: "remix" },
    { blogpost_id: 11, tag_id: "remix" },
    { blogpost_id: 12, tag_id: "remix" },
    { blogpost_id: 13, tag_id: "remix" },
    { blogpost_id: 14, tag_id: "remix" },
    { blogpost_id: 15, tag_id: "remix" },
    { blogpost_id: 16, tag_id: "remix" },
    { blogpost_id: 17, tag_id: "remix" },
    { blogpost_id: 18, tag_id: "remix" },

    { blogpost_id: 19, tag_id: "typescript" },
    { blogpost_id: 20, tag_id: "typescript" },
    { blogpost_id: 21, tag_id: "typescript" },
    { blogpost_id: 22, tag_id: "typescript" },
    { blogpost_id: 23, tag_id: "typescript" },
    { blogpost_id: 24, tag_id: "typescript" },
    { blogpost_id: 25, tag_id: "typescript" },
    { blogpost_id: 26, tag_id: "typescript" },
    { blogpost_id: 27, tag_id: "typescript" },

    { blogpost_id: 28, tag_id: "react" },
    { blogpost_id: 28, tag_id: "remix" },
    { blogpost_id: 29, tag_id: "react" },
    { blogpost_id: 29, tag_id: "remix" },
    { blogpost_id: 30, tag_id: "react" },
    { blogpost_id: 30, tag_id: "remix" },
    { blogpost_id: 31, tag_id: "react" },
    { blogpost_id: 31, tag_id: "remix" },
    { blogpost_id: 32, tag_id: "react" },
    { blogpost_id: 32, tag_id: "remix" },
    { blogpost_id: 33, tag_id: "react" },
    { blogpost_id: 33, tag_id: "remix" },
    { blogpost_id: 34, tag_id: "react" },
    { blogpost_id: 34, tag_id: "remix" },
    { blogpost_id: 35, tag_id: "react" },
    { blogpost_id: 35, tag_id: "remix" },
    { blogpost_id: 36, tag_id: "react" },
    { blogpost_id: 36, tag_id: "remix" },

    { blogpost_id: 37, tag_id: "react" },
    { blogpost_id: 37, tag_id: "typescript" },
    { blogpost_id: 38, tag_id: "react" },
    { blogpost_id: 38, tag_id: "typescript" },
    { blogpost_id: 39, tag_id: "react" },
    { blogpost_id: 39, tag_id: "typescript" },
    { blogpost_id: 40, tag_id: "react" },
    { blogpost_id: 40, tag_id: "typescript" },
    { blogpost_id: 41, tag_id: "react" },
    { blogpost_id: 41, tag_id: "typescript" },
    { blogpost_id: 42, tag_id: "react" },
    { blogpost_id: 42, tag_id: "typescript" },
    { blogpost_id: 43, tag_id: "react" },
    { blogpost_id: 43, tag_id: "typescript" },
    { blogpost_id: 44, tag_id: "react" },
    { blogpost_id: 44, tag_id: "typescript" },
    { blogpost_id: 45, tag_id: "react" },
    { blogpost_id: 45, tag_id: "typescript" },

    { blogpost_id: 46, tag_id: "remix" },
    { blogpost_id: 46, tag_id: "typescript" },
    { blogpost_id: 47, tag_id: "remix" },
    { blogpost_id: 47, tag_id: "typescript" },
    { blogpost_id: 48, tag_id: "remix" },
    { blogpost_id: 48, tag_id: "typescript" },
    { blogpost_id: 49, tag_id: "remix" },
    { blogpost_id: 49, tag_id: "typescript" },
    { blogpost_id: 50, tag_id: "remix" },
    { blogpost_id: 50, tag_id: "typescript" },
    { blogpost_id: 51, tag_id: "remix" },
    { blogpost_id: 51, tag_id: "typescript" },
    { blogpost_id: 52, tag_id: "remix" },
    { blogpost_id: 52, tag_id: "typescript" },
    { blogpost_id: 53, tag_id: "remix" },
    { blogpost_id: 53, tag_id: "typescript" },
    { blogpost_id: 54, tag_id: "remix" },
    { blogpost_id: 54, tag_id: "typescript" },

    { blogpost_id: 55, tag_id: "react" },
    { blogpost_id: 55, tag_id: "remix" },
    { blogpost_id: 55, tag_id: "typescript" },
    { blogpost_id: 56, tag_id: "react" },
    { blogpost_id: 56, tag_id: "remix" },
    { blogpost_id: 56, tag_id: "typescript" },
    { blogpost_id: 57, tag_id: "react" },
    { blogpost_id: 57, tag_id: "remix" },
    { blogpost_id: 57, tag_id: "typescript" },
    { blogpost_id: 58, tag_id: "react" },
    { blogpost_id: 58, tag_id: "remix" },
    { blogpost_id: 58, tag_id: "typescript" },
    { blogpost_id: 59, tag_id: "react" },
    { blogpost_id: 59, tag_id: "remix" },
    { blogpost_id: 59, tag_id: "typescript" },
    { blogpost_id: 60, tag_id: "react" },
    { blogpost_id: 60, tag_id: "remix" },
    { blogpost_id: 60, tag_id: "typescript" },
    { blogpost_id: 61, tag_id: "react" },
    { blogpost_id: 61, tag_id: "remix" },
    { blogpost_id: 61, tag_id: "typescript" },
    { blogpost_id: 62, tag_id: "react" },
    { blogpost_id: 62, tag_id: "remix" },
    { blogpost_id: 62, tag_id: "typescript" },
    { blogpost_id: 63, tag_id: "react" },
    { blogpost_id: 63, tag_id: "remix" },
    { blogpost_id: 63, tag_id: "typescript" },

    { blogpost_id: 64, tag_id: "bjt" },
    { blogpost_id: 65, tag_id: "bjt" },
    { blogpost_id: 66, tag_id: "bjt" },
    { blogpost_id: 67, tag_id: "bjt" },
    { blogpost_id: 68, tag_id: "bjt" },
    { blogpost_id: 69, tag_id: "bjt" },
    { blogpost_id: 70, tag_id: "bjt" },
    { blogpost_id: 71, tag_id: "bjt" },
    { blogpost_id: 72, tag_id: "bjt" },

    { blogpost_id: 73, tag_id: "mosfet" },
    { blogpost_id: 74, tag_id: "mosfet" },
    { blogpost_id: 75, tag_id: "mosfet" },
    { blogpost_id: 76, tag_id: "mosfet" },
    { blogpost_id: 77, tag_id: "mosfet" },
    { blogpost_id: 78, tag_id: "mosfet" },
    { blogpost_id: 79, tag_id: "mosfet" },
    { blogpost_id: 80, tag_id: "mosfet" },
    { blogpost_id: 81, tag_id: "mosfet" },

    { blogpost_id: 82, tag_id: "bjt" },
    { blogpost_id: 82, tag_id: "mosfet" },
    { blogpost_id: 83, tag_id: "bjt" },
    { blogpost_id: 83, tag_id: "mosfet" },
    { blogpost_id: 84, tag_id: "bjt" },
    { blogpost_id: 84, tag_id: "mosfet" },
    { blogpost_id: 85, tag_id: "bjt" },
    { blogpost_id: 85, tag_id: "mosfet" },
    { blogpost_id: 86, tag_id: "bjt" },
    { blogpost_id: 86, tag_id: "mosfet" },
    { blogpost_id: 87, tag_id: "bjt" },
    { blogpost_id: 87, tag_id: "mosfet" },
    { blogpost_id: 88, tag_id: "bjt" },
    { blogpost_id: 88, tag_id: "mosfet" },
    { blogpost_id: 89, tag_id: "bjt" },
    { blogpost_id: 89, tag_id: "mosfet" },
    { blogpost_id: 90, tag_id: "bjt" },
    { blogpost_id: 90, tag_id: "mosfet" },
  ];
}

// define 'Blogposts' table seed data
interface IGenerateBlogpostsDataParams {
  dbStartDate: Date;
  blogpostTags: Awaited<ReturnType<typeof generateBlogpostTagsData>>;
}
async function generateBlogpostsData({ dbStartDate, blogpostTags }: IGenerateBlogpostsDataParams) {
  let previousDate = dbStartDate;
  return [...Array(100).keys()].map((idx) => {
    // generate id
    const id = idx + 1;
    const created_at = getDateFromOffset(Math.round(Math.abs(sampleFromNormalDistribution(7, 3))), previousDate);
    previousDate = created_at;
    let modified_at = created_at;

    // generate title
    const title = faker.lorem.sentence(Math.round(Math.abs(sampleFromNormalDistribution(7, 1.5))));

    // assign image_url
    const image_url = "/images/default-splash-bg.png";

    // generate body
    const tags = blogpostTags.filter((tag) => tag.blogpost_id === id);
    let body = [
      `---`,
      `title: ${title}`,
      `image: ${image_url}`,
      `tags: [${tags.reduce((prev, next) => `${prev.length > 0 ? `${prev}, ` : ""}${next.tag_id}`, "")}]`,
      // ...(tags.length > 0 ? [`tags: [${tags}]`, ...tags.map((t) => `  - ${t.tag_id}`)] : [`tags: []`]),
      `---`,
      ``,
      faker.lorem.paragraphs(Math.round(Math.abs(sampleFromNormalDistribution(7, 1.5)))),
    ].join("\n");

    // assign to one of two admin authors
    let author_id = !!(idx % 2) ? 1 : 2;

    // generate views
    const views = Math.round(Math.abs(sampleFromNormalDistribution(1000, 250)));

    // assign published (assigning true ~50% of time)
    const published = isSuccess(0.5);

    // To set 'first_published_at':
    // - randomly ~50% of posts will have been published at some point and have a 'first_published_at' !== null
    // - for the posts that have been published at some point, their 'first_published_at' will be a poisson
    //   distribution with a maximum of 14 days after their creation
    // - don't forget to update the 'modified_at' attribute too
    let first_published_at = null;
    if (isSuccess(0.5)) {
      first_published_at = getDateFromOffset(Math.round(Math.abs(sampleFromNormalDistribution(7, 3))), created_at);
      modified_at = first_published_at;
    }

    // To set 'content_updated_at':
    // - randomly ~50% of posts will have been updated at some point
    // - for the posts that have been updated at some point, their 'content_updated_at' will be a poission
    //   distribution with a maximum of 90 days after their creation
    // - don't forget to update the 'modified_at' attribute too
    let content_modified_at = created_at;
    if (isSuccess(0.5)) {
      content_modified_at = getDateFromOffset(Math.round(Math.abs(sampleFromNormalDistribution(20, 8))), created_at);
      modified_at = content_modified_at;
    }

    return {
      id,
      title,
      image_url,
      body,
      author_id,
      views,
      published,
      first_published_at,
      content_modified_at,
      created_at,
      modified_at,
    };
  });
}

/* ------------------------------------------------------------------------------------------------------------
 * Execute All Generators
 * ------------------------------------------------------------------------------------------------------------ */

async function main() {
  // define constants
  const DbStartDate = new Date("2016-06-17T20:22:04.513Z");

  // generate data
  const roles = await generateRolesData({ dbStartDate: DbStartDate });
  const users = await generateUsersData({ dbStartDate: DbStartDate });
  const user_roles = await generateUserRolesData({});
  const tags = await generateTagData({ dbStartDate: DbStartDate });
  const blogpost_tags = await generateBlogpostTagsData({});
  const blogposts = await generateBlogpostsData({ dbStartDate: DbStartDate, blogpostTags: blogpost_tags });

  // write seed data to JSON
  await Promise.all([
    writeFile(path.resolve("seed", "roles.json"), prettier.format(JSON.stringify(roles), { parser: "json" })),
    writeFile(path.resolve("seed", "users.json"), prettier.format(JSON.stringify(users), { parser: "json" })),
    writeFile(path.resolve("seed", "user_roles.json"), prettier.format(JSON.stringify(user_roles), { parser: "json" })),
    writeFile(path.resolve("seed", "tags.json"), prettier.format(JSON.stringify(tags), { parser: "json" })),
    writeFile(
      path.resolve("seed", "blogpost_tags.json"),
      prettier.format(JSON.stringify(blogpost_tags), { parser: "json" })
    ),
    writeFile(path.resolve("seed", "blogposts.json"), prettier.format(JSON.stringify(blogposts), { parser: "json" })),
  ]);
}

main();
