import * as Avatar from "@radix-ui/react-avatar";
import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { RiTwitterFill, RiGithubFill } from "react-icons/ri";
import { PrintablesIcon } from "~/components/ui/icon";
import { getPgClient, logRequest, getLogger } from "~/lib/util.server";
import { sql } from "kysely";
import { useLoaderData } from "@remix-run/react";
import { BlogPostLi } from "~/components/app/blog-post-li";
import { Link } from "@remix-run/react";
import { RiArrowRightLine } from "react-icons/ri";

export const meta: V2_MetaFunction = () => {
  return [
    { title: `Home | Spencer Duball` },
    {
      name: "description",
      content:
        "The personal site for Spencer Duball. I write about web development, cloud computing, 3D printing, circuit design, and more!",
    },
  ];
};

export async function loader({ params, request }: LoaderArgs) {
  await logRequest(request);

  // instantiate utilities
  const logger = getLogger();
  const db = await getPgClient();

  // get 3 most recent blogs
  logger.info("Retrieving most recent blogs ...");
  const blogs = await db
    .selectFrom("blogs")
    .leftJoin("blog_tags", "blogs.id", "blog_tags.blog_id")
    .select([
      "id",
      "title",
      "image_url",
      "author_id",
      "views",
      "published_at",
      "published",
      sql<(string | null)[]>`array_agg(blog_tags.tag_id)`.as("tags"),
    ])
    .where("published", "=", true)
    .groupBy("blogs.id")
    .orderBy("blogs.published_at", "desc")
    .limit(3)
    .execute()
    .then((res) => res.map((item) => ({ ...item, tags: item.tags.filter((value) => value !== null) as string[] })));

  return { blogs };
}

export default function Index() {
  const { blogs } = useLoaderData<typeof loader>();

  return (
    <section className="grid gap-10 w-full max-w-5xl py-6 px-4">
      {/* Profile Card */}
      <div className="md:align-items-center grid w-full auto-rows-max gap-3 rounded-lg bg-gradient-to-r from-yellowA-6 to-crimsonA-6 p-8 md:auto-cols-max md:grid-flow-col md:justify-between">
        <Avatar.Root className="text-md relative flex h-24 w-24 md:h-32 md:w-32 shrink-0 overflow-hidden rounded-full justify-self-center md:col-start-2 md:justify-self-end">
          <Avatar.Image
            className="aspect-square h-full w-full"
            src="/images/profile.webp"
            alt="A profile photo of Spencer Duball"
          />
          <Avatar.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-slate-3">
            SD
          </Avatar.Fallback>
        </Avatar.Root>
        <div className="grid auto-rows-max justify-items-center gap-3 md:col-start-1 md:justify-items-start">
          <div className="grid justify-items-center gap-1 md:justify-items-start">
            <h1 className="text-center text-3xl font-bold sm:text-4xl">Spencer Duball</h1>
            <p className="text-md text-center text-slate-11">Software Engineer</p>
          </div>
          <p className="max-w-sm text-center md:text-start">
            Web development, cloud computing, 3D printing, designing circuits, and writing about all of these topics.
          </p>
          <div className="grid auto-cols-min grid-flow-col gap-2">
            <a
              className="focus-outline h-min w-min p-2"
              href="https://twitter.com/SpencerDuball"
              target="_blank"
              rel="noopener noreferrer"
            >
              <RiTwitterFill className="h-4 w-4" />
            </a>
            <a
              className="focus-outline h-min w-min p-2"
              href="https://github.com/SpencerDuball"
              target="_blank"
              rel="noopener noreferrer"
            >
              <RiGithubFill className="h-4 w-4" />
            </a>
            <a
              className="focus-outline h-min w-min p-2"
              href="https://www.printables.com/social/212303-spencer_duball/about"
              target="_blank"
              rel="noopener noreferrer"
            >
              <PrintablesIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
      {/* Recent Blogs */}
      <div className="grid gap-2 md:px-8">
        <h1 className="text-md font-bold px-3 text-slate-10 uppercase">Latest Posts</h1>
        <div className="grid gap-2">
          {blogs.map((post) => (
            <div className="grid gap-2 content-start bg-slate-2 border border-slate-4 rounded-lg p-3">
              <Link
                to={`/blog/${post.id}`}
                className="focus-outline leading-tight text-xl font-semibold line-clamp-3 md:leading-[1.15]"
              >
                {post.title}
              </Link>
              <div className="text-md text-slate-9 flex gap-2">
                <p>
                  {new Date(post.published_at || (null as any)).toLocaleDateString() || "Unpublished"} &#11825;{" "}
                  {post.views} Views
                </p>
              </div>
            </div>
          ))}
        </div>
        <Link
          className="focus-outline flex items-center text-xl font-extrabold leading-relaxed text-slate-9 hover:text-slate-11 justify-self-end"
          to="/blog"
        >
          view all posts <RiArrowRightLine className="ml-2" />
        </Link>
      </div>
    </section>
  );
}
