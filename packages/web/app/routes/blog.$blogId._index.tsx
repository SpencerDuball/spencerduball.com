import type { LoaderArgs } from "@remix-run/node";
import { sql } from "kysely";
import { z } from "zod";
import { getLogger, getPgClient, logRequest } from "~/lib/util.server";

const ZParams = z.object({ blogId: z.coerce.number() });

export async function loader({ params, request }: LoaderArgs) {
  await logRequest(request);

  // get request info
  const { blogId } = ZParams.parse(params);

  // instantiate utilities
  const logger = getLogger();
  const db = await getPgClient();

  // get the blog
  logger.info("Retrieving the blog ...");
  const [blogpost, views] = await Promise.all([
    db
      .selectFrom("blogposts")
      .leftJoin("blogpost_tags", "blogpost_tags.blogpost_id", "blogposts.id")
      .where("blogposts.id", "=", blogId)
      .where("blogposts.published", "=", true)
      .groupBy("blogposts.id")
      .select([
        "blogposts.author_id",
        "blogposts.body",
        "blogposts.first_published_at",
        "blogposts.id",
        "blogposts.image_url",
        "blogposts.modified_at",
        "blogposts.published",
        "blogposts.title",
        "blogposts.description",
        sql<(string | null)[]>`array_agg(blogpost_tags.tag_id)`.as("tags"),
      ])
      .executeTakeFirstOrThrow()
      .then((values) => ({ ...values, tags: values.tags.filter((t) => t !== null) as string[] })),
    db
      .updateTable("blogposts")
      .where("blogposts.id", "=", blogId)
      .set({ views: ({ bxp }) => bxp("views", "+", 1) })
      .returning("views")
      .executeTakeFirstOrThrow()
      .then(({ views }) => views),
  ]).catch((e) => {
    logger.info(`Failure: Blogpost with id ${blogId} does not exist.`);
    logger.info(e);
    throw new Response(undefined, { status: 404, statusText: "Not Found" });
  });
  logger.info("Success: Retrieved the blog.");
}
