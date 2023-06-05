import React from "react";
import { json, Response } from "@remix-run/node";
import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { useLoaderData, useLocation, Form } from "@remix-run/react";
import { getLogger, getPgClient, logRequest } from "~/lib/util.server";
import { getSessionInfo } from "~/lib/session.server";
import { z } from "zod";
import { sql } from "kysely";
import * as Popover from "@radix-ui/react-popover";
import { RiSearchLine } from "react-icons/ri";
import { Input, InputGroup, InputLeftElement, InputRightElement } from "~/components/ui/input";
import { Button, IconButton } from "~/components/ui/button";
import { TimeAscIcon, TimeDescIcon, ViewsAscIcon, ViewsDescIcon } from "~/components/ui/icon";
import { Tag, colorFromName, ColorList } from "~/components/ui/tag";
import { Pagination } from "~/components/ui/pagination";
import { BlogPostLi } from "~/components/app/blog-post-li";
import { createBlog } from "~/model/blog.server";

export const meta: V2_MetaFunction = () => [{ title: "Blog | Spencer Duball" }];

// define the payload structure
const ZPostPayload = z.object({
  body: z.string(),
  author_id: z.coerce.number(),
});
type IPostPayload = z.infer<typeof ZPostPayload>;

export async function action({ request }: ActionArgs) {
  await logRequest(request);

  // ensure user is admin
  const session = await getSessionInfo(request);
  if (!session) return new Response(undefined, { status: 401 });
  else if (!session.roles.includes("admin")) return new Response(undefined, { status: 403 });

  // get utilities
  const logger = getLogger();

  switch (request.method) {
    case "POST": {
      // get request info
      logger.info("Validating the payload ...");
      let data: IPostPayload;
      try {
        const formData = await request.formData();
        data = ZPostPayload.parse(Object.fromEntries(formData.entries()));
      } catch (e) {
        const json = await request.json();
        data = await ZPostPayload.parseAsync(json).catch((e) => {
          logger.info("Failure: The payload is not valid.");
          throw new Response(undefined, { status: 400, statusText: "Bad Request" });
        });
      }
      logger.info("Success: The payload is valid.");

      // create the blog
      logger.info("Creating the blog ...");
      const blog = await createBlog(data);
      logger.info("Success: Created the blog.");

      return json(blog);
    }
  }

  return null;
}

// page search parameters config
const SortOption = ["views-asc", "views-desc", "created-asc", "created-desc"] as const;
const ZLoaderSearch = z.object({
  page: z.coerce.number().positive().int().gte(1).nullable().catch(null),
  maxResults: z.coerce.number().positive().int().gte(10).lte(100).nullable().catch(null),
  sort: z.enum(SortOption).nullable().catch(null),
  tags: z
    .preprocess((tagStr) => {
      let str = z.string().trim().min(1).nullable().catch(null).parse(tagStr);
      return str === null ? null : str.split(",");
    }, z.string().array().nullable())
    .catch(null),
  title: z.string().nullable().catch(null),
});
type LoaderSearchType = z.infer<typeof ZLoaderSearch>;

export async function loader({ request }: LoaderArgs) {
  await logRequest(request);

  // get utilities
  const db = await getPgClient();

  // collect the search parameters
  const search = new URL(request.url).searchParams;
  let params = ZLoaderSearch.parse(Object.fromEntries(search.entries()));

  // apply defaults to search parameters
  let page = params.page || 1;
  let maxResults = params.maxResults || 30;
  let sort = params.sort || "created-desc";
  let tags = params.tags || null;
  let title = params.title || null;

  // Create blogposts Query
  // --------------------------------------------------------------------------------------------
  // create base query
  let blogpostsQuery = db
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
    ]);

  // apply the "published" filter
  blogpostsQuery = blogpostsQuery.where("published", "=", true);

  // apply the "tags" filter if exists
  if (tags) {
    blogpostsQuery = blogpostsQuery
      .where("blogs.id", "in", (sub) =>
        sub
          .selectFrom("blog_tags")
          .select("blog_id")
          .where("tag_id", "in", tags)
          .groupBy("blog_id")
          .having(sub.fn.count("tag_id"), "=", tags!.length)
      )
      .groupBy("blogs.id");
  } else blogpostsQuery = blogpostsQuery.groupBy("blogs.id");

  // apply the title filter if exists
  if (title) blogpostsQuery = blogpostsQuery.where("title", "ilike", `%${title}%`);

  // apply the sort order
  blogpostsQuery = blogpostsQuery.orderBy(
    sort.startsWith("created") ? "blogs.created_at" : "blogs.views",
    sort.endsWith("asc") ? "asc" : "desc"
  );

  // apply the "maxResults" and page
  blogpostsQuery = blogpostsQuery.limit(maxResults).offset((page - 1) * maxResults);
  // --------------------------------------------------------------------------------------------

  // Count Matching Blogposts
  const countBlogPosts = db
    .with("matching_posts", (q) => {
      let query = q.selectFrom("blogs").leftJoin("blog_tags", "blogs.id", "blog_tags.blog_id").select("id");

      // apply the "published" filter
      query = query.where("published", "=", true);

      // apply the "tags" filter if exists
      if (tags) {
        query = query
          .where("blog_tags.tag_id", "in", tags)
          .groupBy("blogs.id")
          .having(db.fn.count("blog_tags.tag_id"), "=", tags.length);
      } else query = query.groupBy("blogs.id");

      // apply the title filter if exists
      if (title) query = query.where("title", "ilike", `%${title}%`);

      return query;
    })
    .selectFrom("matching_posts")
    .select(db.fn.countAll<number>().as("num_matching_posts"));

  // get all tags, these will be used by client to filter
  const allTagsQuery = db.selectFrom("tags").select("id");

  // run the queries in parallel
  const [blogposts, numMatchingPosts, allTags] = await Promise.all([
    blogpostsQuery
      .execute()
      .then((res) => res.map((item) => ({ ...item, tags: item.tags.filter((value) => value !== null) as string[] }))),
    countBlogPosts.executeTakeFirstOrThrow().then((res) => res.num_matching_posts),
    allTagsQuery.execute(),
  ]);

  return json({ allTags, blogposts, numMatchingPosts, params });
}

export default function Blog() {
  const { allTags, blogposts, numMatchingPosts, params } = useLoaderData<typeof loader>();

  // Collect Form Container for Popover Portal
  // -----------------------------------------
  // The popover to select the sort order will default be portaled to the root of the html page. Since we want this to
  // be included as an input as part of the Form (to filter posts), we need to manually supply the container that we want
  // this popover to be porataled to. This will make a popover a child of the Form, and all button clicks (to toggle the
  // sort) will submit the Form.
  const formRef = React.useRef<HTMLFormElement>(null!);
  const [container, setContainer] = React.useState<HTMLFormElement | null>(null!);
  React.useEffect(() => {
    if (!container) setContainer(formRef.current);
  }, []);

  // capture initial search params
  const [search, setSearch] = React.useState<LoaderSearchType>({ ...params });

  // onTagToggle
  function onTagToggle(id: string) {
    let tags = search.tags;
    if (tags?.includes(id)) tags = tags.length === 1 ? null : tags.filter((tag) => tag !== id);
    else tags = [...(tags || []), id];
    setSearch({ ...search, tags });
  }

  // define pagniation function
  const location = useLocation();
  const hrefFn = (page: number) => {
    if (location.search) {
      if (location.search.match(/page=\d+/))
        return location.pathname + location.search.replace(/page=\d+/, `page=${page}`);
      else return location.pathname + `?page=${page}` + location.search.replace(/^\?/, "&");
    } else return location.pathname + `?page=${page}`;
  };

  // determine information about paging
  let [page, maxResults] = [params.page || 1, params.maxResults || 30];
  let pagingMessage = "No blog posts found.";
  if (page === 1 && numMatchingPosts <= maxResults) pagingMessage = `Found ${numMatchingPosts} posts.`;
  else if (maxResults * page > numMatchingPosts) {
    let [startIdx, endIdx] = [maxResults * (page - 1), numMatchingPosts];
    pagingMessage = `Showing posts ${startIdx} - ${endIdx} of ${numMatchingPosts}.`;
  } else {
    let [startIdx, endIdx] = [maxResults * (page - 1), maxResults * (page - 1) + blogposts.length];
    pagingMessage = `Showing posts ${startIdx} - ${endIdx} of ${numMatchingPosts}.`;
  }

  return (
    <div className="grid w-full max-w-5xl py-6 px-4">
      <section className="grid content-center gap-10">
        {/* Blog Items */}
        <ul className="grid gap-3 row-start-2">
          {blogposts
            .map((post) => ({ ...post, published_at: (post.published_at && new Date(post.published_at)) || null }))
            .map((post) => (
              <BlogPostLi key={post.id} data={post} />
            ))}
        </ul>
        {/* Introduction */}
        <div className="grid gap-4 row-start-1">
          {/* Title & Summary */}
          <div className="grid gap-2 max-w-3xl">
            <h1 className="text-5xl font-bold">Posts</h1>
            <p>
              I write mostly about web development and cloud computing, and sometimes about 3D printing and circuits. I
              hope you find something interesting!
            </p>
          </div>
          {/* Search Controls */}
          <Form method="get" className="grid gap-3" ref={formRef}>
            <div className="grid gap-2 max-w-3xl">
              <input type="hidden" name="sort" value={search.sort || ""} disabled={!search.sort} />
              <input type="hidden" name="title" value={search.title || ""} disabled={!search.title} />
              <input type="hidden" name="tags" value={search.tags || []} disabled={!Boolean(search.tags)} />
              <input type="hidden" name="maxResults" value={search.maxResults || 0} disabled={!search.maxResults} />
              <Popover.Root>
                <InputGroup variant="filled" size="lg">
                  <InputLeftElement>
                    <RiSearchLine className="h-5 w-5 text-slate-10" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search ..."
                    value={search.title || ""}
                    onChange={(e) => setSearch({ ...search, title: e.currentTarget.value })}
                  />
                  <InputRightElement>
                    <Popover.Trigger asChild>
                      <IconButton
                        size="sm"
                        aria-label="sort order"
                        variant="ghost"
                        className="hover:bg-slate-6 active:bg-slate-7"
                        icon={
                          search.sort === "created-desc" || !search.sort ? (
                            <TimeDescIcon className="h-2/3 w-2/3" />
                          ) : search.sort === "created-asc" ? (
                            <TimeAscIcon className="h-2/3 w-2/3" />
                          ) : search.sort === "views-asc" ? (
                            <ViewsAscIcon className="h-2/3 w-2/3" />
                          ) : (
                            <ViewsDescIcon className="h-2/3 w-2/3" />
                          )
                        }
                      />
                    </Popover.Trigger>
                  </InputRightElement>
                </InputGroup>
                {/* Add button after the Input, need a blank submit button so hitting Enter on the Input will submit the form. */}
                <button type="submit" className="absolute invisible" />
                <Popover.Portal container={container}>
                  <Popover.Content
                    align="end"
                    alignOffset={-16}
                    className="rounded-lg p-3 bg-slate-2 border border-slate-6 shadow"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                  >
                    <div className="grid">
                      <Button
                        variant={search.sort === "created-asc" ? "subtle" : "ghost"}
                        onClick={() => setSearch({ ...search, sort: "created-asc" })}
                      >
                        Oldest-to-Newest
                      </Button>
                      <Button
                        variant={search.sort === "created-desc" || !search.sort ? "subtle" : "ghost"}
                        onClick={() => setSearch({ ...search, sort: "created-desc" })}
                      >
                        Newest-to-Oldest
                      </Button>
                      <Button
                        variant={search.sort === "views-desc" ? "subtle" : "ghost"}
                        onClick={() => setSearch({ ...search, sort: "views-desc" })}
                      >
                        Most-to-Least Views
                      </Button>
                      <Button
                        variant={search.sort === "views-asc" ? "subtle" : "ghost"}
                        onClick={() => setSearch({ ...search, sort: "views-asc" })}
                      >
                        Least-to-Most Views
                      </Button>
                    </div>
                    <Popover.Arrow asChild>
                      <div className="relative h-3 w-3 origin-center rounded-br-sm border-b border-r border-slate-6 bg-slate-2 rotate-45 -translate-y-[0.375rem]" />
                    </Popover.Arrow>
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            </div>
            {allTags ? (
              <div className="flex flex-wrap gap-2">
                {allTags
                  .map(({ id }) => id)
                  .sort()
                  .map((id) => (
                    <button key={id} className="focus-outline rounded" onClick={() => onTagToggle(id)}>
                      <Tag
                        className="border border-slate-4"
                        variant={search.tags?.includes(id) ? "solid" : "subtle"}
                        colorScheme={colorFromName({ name: id, colors: ColorList })}
                      >
                        {id}
                      </Tag>
                    </button>
                  ))}
              </div>
            ) : null}
          </Form>
        </div>

        {/* Pagination */}
        <div className="grid place-items-center gap-1">
          <p className="text-slate-9 text-sm text-center">{pagingMessage}</p>
          <Pagination
            totalItems={numMatchingPosts}
            itemsPerPage={params.maxResults || 30}
            currentPage={params.page || 1}
            hrefFn={hrefFn}
          />
        </div>
      </section>
    </div>
  );
}
