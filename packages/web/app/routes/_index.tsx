import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import * as Avatar from "@radix-ui/react-avatar";
import { RiTwitterXFill, RiGithubFill, RiArrowRightLine } from "react-icons/ri/index.js";
import { PrintablesIcon } from "~/lib/ui/icon";
import { db, logger } from "~/lib/util/globals.server";
import { execute } from "~/lib/util/utils.server";
import { useLoaderData, Link } from "@remix-run/react";
import { parseBlog } from "~/model/blogs";
import { BlogLi } from "~/lib/app/blog-li";

export const meta: MetaFunction = () => {
  return [
    { title: "Home | Spencer Duball" },
    {
      name: "description",
      content:
        "The personal site for Spencer Duball. I write about web development, cloud computing, 3D printing, circuit design, and more!",
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const log = logger(request);

  // get the 5 latest blog posts
  let blogsReq = db
    .selectFrom("blogs")
    .leftJoin("blog_tags", "blogs.id", "blog_tags.blog_id")
    .select([
      "blogs.id",
      "blogs.title",
      "blogs.description",
      "blogs.cover_img",
      "blogs.views",
      "blogs.published",
      "blogs.published_at",
      "blogs.body_modified_at",
      "blogs.created_at",
      "blogs.modified_at",
      "blogs.author_id",
      db.fn.agg<string>("group_concat", ["blog_tags.name"]).as("tags"),
    ])
    .where("published", "=", true)
    .groupBy("blogs.id")
    .orderBy("published_at", "desc")
    .limit(3);
  const blogs = await execute(blogsReq);

  return { blogs };
}

export default function Index() {
  const { blogs } = useLoaderData<typeof loader>();
  const parsedBlogs = blogs.map((blog) => parseBlog(blog));

  return (
    <main className="grid w-full justify-items-center">
      <section className="grid w-full max-w-5xl gap-10 px-4 py-6">
        {/* Profile Card */}
        <div className="md:align-items-center grid w-full auto-rows-max gap-3 rounded-lg bg-gradient-to-r from-yellowA-6 to-crimsonA-6 p-8 md:auto-cols-max md:grid-flow-col md:justify-between">
          <Avatar.Root className="text-md relative flex h-24 w-24 shrink-0 justify-self-center overflow-hidden rounded-full md:col-start-2 md:h-32 md:w-32 md:justify-self-end">
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
                <RiTwitterXFill className="h-4 w-4" />
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
        <div className="grid gap-2">
          <h1 className="text-md px-3 font-bold uppercase text-slate-10">Latest Posts</h1>
          <div className="grid gap-2">
            {parsedBlogs.map((blog) => (
              <BlogLi key={blog.id} data={blog} />
            ))}
          </div>
          <Link
            className="focus-outline flex items-center justify-self-end text-xl font-extrabold leading-relaxed text-slate-9 hover:text-slate-11"
            to="/blog"
          >
            view all posts <RiArrowRightLine className="ml-2" />
          </Link>
        </div>
      </section>
    </main>
  );
}
