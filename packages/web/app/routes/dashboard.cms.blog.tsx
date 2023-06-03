import { json, redirect } from "@remix-run/node";
import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { useLoaderData, useLocation, useFetcher, Link, Form } from "@remix-run/react";
import * as Popover from "@radix-ui/react-popover";
import { BlogPostLi } from "~/components/app/blog-post-li";
import { IconButton, Button } from "~/components/ui/button";
import { Tag, colorFromName, ColorList } from "~/components/ui/tag";
import { Input, InputGroup, InputLeftElement } from "~/components/ui/input";
import {
  NumberInput,
  NumberInputScrubber,
  NumberInputField,
  NumberInputControl,
  NumberInputDecrementTrigger,
  NumberInputIncrementTrigger,
} from "~/components/ui/number-input";
import { Pagination } from "~/components/ui/pagination";
import { RiEqualizerFill, RiSearchLine, RiAddFill } from "react-icons/ri";
import { useRef, useState, useEffect } from "react";
import { getPgClient, logRequest } from "~/lib/util.server";
import { z } from "zod";
import { getSessionInfo } from "~/lib/session.server";
import { sql } from "kysely";
import { Select, SelectPositioner, SelectContent, SelectOption } from "~/components/ui/select";
import { defaultBlogTemplate } from "~/model/blogpost.server";

// page search parameters config
const SortOption = ["views-asc", "views-desc", "created-asc", "created-desc"] as const;
const PublishStatus = ["published", "unpublished", "both"] as const;
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
  status: z.enum(PublishStatus).nullable().catch(null),
});
type LoaderSearchType = z.infer<typeof ZLoaderSearch>;

export async function loader({ request }: LoaderArgs) {
  await logRequest(request);

  // check if user is admin
  const session = await getSessionInfo(request, "required");
  if (!session.roles.includes("admin")) return redirect("/");

  // get utilities
  const db = await getPgClient();

  // collect the search parameters
  const search = new URL(request.url).searchParams;
  let params = ZLoaderSearch.parse(Object.fromEntries(search.entries()));

  // apply defults to search parameters
  let page = params.page || 1;
  let maxResults = params.maxResults || 30;
  let sort = params.sort || "created-desc";
  let tags = params.tags || null;
  let title = params.title || null;
  let status = params.status || "both";

  // Create blogs Query
  /* ----------------------------------------------------------------------------------- */
  // create base query
  let blogsQuery = db
    .selectFrom("blogs")
    .leftJoin("blog_tags", "blogs.id", "blog_tags.blog_id")
    .select([
      "id",
      "title",
      "published",
      "image_url",
      "author_id",
      "views",
      "published_at",
      sql<(string | null)[]>`array_agg(blog_tags.tag_id)`.as("tags"),
    ]);

  // apply the "published" filter
  if (status === "published") blogsQuery = blogsQuery.where("published", "=", true);
  else if (status === "unpublished") blogsQuery = blogsQuery.where("published", "=", false);

  // apply the "tags" filter if exists
  if (tags) {
    blogsQuery = blogsQuery
      .where("blog_tags.tag_id", "in", tags)
      .groupBy("blogs.id")
      .having(db.fn.count("blog_tags.tag_id"), "=", tags.length);
  } else blogsQuery = blogsQuery.groupBy("blogs.id");

  // apply the title filter if exists
  if (title) blogsQuery = blogsQuery.where("title", "ilike", `%${title}%`);

  // apply the sort order
  blogsQuery = blogsQuery.orderBy(
    sort.startsWith("created") ? "blogs.created_at" : "blogs.views",
    sort.endsWith("asc") ? "asc" : "desc"
  );

  // apply the "maxResults" and page
  blogsQuery = blogsQuery.limit(maxResults).offset((page - 1) * maxResults);
  /* ----------------------------------------------------------------------------------- */

  // Count Matching Blogposts
  const countBlogs = db
    .with("matching_posts", (q) => {
      let query = q.selectFrom("blogs").leftJoin("blog_tags", "blogs.id", "blog_tags.blog_id").select("id");

      // apply the "published" filter
      if (status === "published") query = query.where("published", "=", true);
      else if (status === "unpublished") query = query.where("published", "=", false);

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
  const [blogs, allTags, numMatchingPosts] = await Promise.all([
    blogsQuery
      .execute()
      .then((res) => res.map((item) => ({ ...item, tags: item.tags.filter((value) => value !== null) as string[] }))),
    allTagsQuery.execute(),
    countBlogs.executeTakeFirstOrThrow().then((res) => res.num_matching_posts),
  ]);

  return json({ allTags, blogs, numMatchingPosts, params, userId: session.userId });
}

export const meta: V2_MetaFunction = () => [{ title: "Blog | Spencer Duball" }];

export default function Blog() {
  const { allTags, blogs, numMatchingPosts, params, userId } = useLoaderData<typeof loader>();

  // ---------------------------------------------------------------------------------
  // Settings & Filters
  // ---------------------------------------------------------------------------------
  // collect the form container for popover portal
  const formRef = useRef<HTMLFormElement>(null!);
  const [container, setContainer] = useState<HTMLFormElement | null>(null);
  useEffect(() => {
    if (!container) setContainer(formRef.current);
  }, []);

  // capture initial search params
  const [search, setSearch] = useState<LoaderSearchType>({ ...params });

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
    let [startIdx, endIdx] = [maxResults * (page - 1), maxResults * (page - 1) + blogs.length];
    pagingMessage = `Showing posts ${startIdx} - ${endIdx} of ${numMatchingPosts}.`;
  }

  // ---------------------------------------------------------------------------------
  // Fetchers
  // --------
  // We will handle all mutations that may modify the blogposts list here. This will
  // include:
  // (1) Tracking the CREATE button to add a skeleton blogpost when creating a post.
  // (2) Filtering out DELETEed blogposts when still processing.
  // ---------------------------------------------------------------------------------
  const create = useFetcher();

  return (
    <div className="w-full max-w-5xl py-6 px-4 grid gap-10">
      {/* Title Card */}
      <div className="grid gap-4 rounded-lg bg-brown-5 p-4 shadow-md md:grid-flow-col md:p-6">
        <div className="grid gap-2">
          <h1 className="text-5xl font-extrabold leading-relaxed text-brown-11">Blog</h1>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/dashboard/cms/blog" className="focus-outline font-bold leading-relaxed text-brown-12 ">
              Blog
            </Link>
            <Link to="/dashboard/cms/software" className="focus-outline font-bold leading-relaxed text-gray-10 ">
              Software
            </Link>
            <Link to="/dashboard/cms/3d-print" className="focus-outline font-bold leading-relaxed text-gray-10 ">
              3D Print
            </Link>
            <Link to="/dashboard/cms/electronics" className="focus-outline font-bold leading-relaxed text-gray-10 ">
              Electronics
            </Link>
          </div>
        </div>
        <div className="grid w-full gap-2 rounded-lg px-4 py-5 shadow-sm md:px-6 md:py-6 justify-self-end bg-brown-3 md:w-64">
          <p className="text-slate-11">Posts</p>
          <p className="text-4xl font-extrabold">{numMatchingPosts}</p>
        </div>
      </div>
      {/* Main Content */}
      <div className="grid gap-6">
        {/* NOTE: Place the blog items before the 'Search Controls' in order for the 'Search Controls' settings select
            popover to stack correctly. We are using the 'row-start-x' to organize the order after DOM stacking.
            Typically the modals are attached to the end of the DOM, but in the 'Search Controls' we want these items to be
            part of the submission form, so we specified the container as a child of the Form element.
          */}
        {/* Blog Items */}
        <ul className="grid gap-3 row-start-2">
          {blogs
            .map((blog) => ({ ...blog, published_at: blog.published_at ? new Date(blog.published_at) : null }))
            .map((post) => (
              <BlogPostLi key={post.id} data={post} hasControls={true} />
            ))}
        </ul>
        {/* Search Controls */}
        <div className="grid gap-2 row-start-1">
          <div className="grid grid-flow-col gap-2 grid-cols-[1fr_max-content]">
            <Form method="get" className="grid grid-flow-col gap-2 grid-cols-[max-content_1fr]" ref={formRef}>
              <input type="hidden" name="sort" value={search.sort || ""} disabled={!search.sort} />
              <input type="hidden" name="title" value={search.title || ""} disabled={!search.title} />
              <input type="hidden" name="tags" value={search.tags || []} disabled={!Boolean(search.tags)} />
              <input type="hidden" name="maxResults" value={search.maxResults || 0} disabled={!search.maxResults} />
              <input type="hidden" name="status" value={search.status || ""} disabled={!search.status} />
              <Popover.Root>
                <Popover.Trigger asChild>
                  <IconButton aria-label="search settings" variant="subtle" size="lg" icon={<RiEqualizerFill />} />
                </Popover.Trigger>
                <InputGroup variant="filled" size="lg">
                  <InputLeftElement>
                    <RiSearchLine className="h-5 w-5 text-slate-10" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search ..."
                    value={search.title || ""}
                    onChange={(e) => setSearch({ ...search, title: e.currentTarget.value })}
                  />
                </InputGroup>
                <Popover.Portal container={container}>
                  <Popover.Content
                    align="start"
                    className="rounded-lg p-3 bg-slate-2 border border-slate-6 border-radius-6 shadow"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                  >
                    <div className="grid gap-4">
                      <div className="grid gap-y-2 gap-x-4 grid-cols-[max-content_max-content] items-center">
                        <label className="col-start-1 row-start-1 text-sm">Sort</label>
                        <Select
                          placeholder="Newest-to-Oldest"
                          variant="subtle"
                          className="w-56 col-start-2 row-start-1"
                          defaultValue={
                            search.sort &&
                            {
                              "created-desc": { value: "created-desc", label: "Newest-to-Oldest" },
                              "created-asc": { value: "created-asc", label: "Oldest-to-Newest" },
                              "views-desc": { value: "views-desc", label: "Most-to-Least Views" },
                              "views-asc": { value: "views-asc", label: "Least-to-Most Views" },
                            }[search.sort]
                          }
                          onChange={(e) => {
                            if (!e) return;
                            const value = ZLoaderSearch.pick({ sort: true }).safeParse({ sort: e.value });
                            if (value.success) setSearch({ ...search, sort: value.data.sort });
                          }}
                        >
                          <SelectPositioner>
                            <SelectContent className="w-56">
                              <SelectOption value="created-desc" label="Newest-to-Oldest" />
                              <SelectOption value="created-asc" label="Oldest-to-Newest" />
                              <SelectOption value="views-desc" label="Most-to-Least Views" />
                              <SelectOption value="views-asc" label="Least-to-Most Views" />
                            </SelectContent>
                          </SelectPositioner>
                        </Select>
                        <label className="col-start-1 row-start-2 text-sm">Published</label>
                        <Select
                          placeholder="Both"
                          variant="subtle"
                          className="w-56 col-start-2 row-start-2"
                          defaultValue={
                            search.status &&
                            {
                              both: { value: "both", label: "Both" },
                              published: { value: "published", label: "Published" },
                              unpublished: { value: "unpublished", label: "Unpublished" },
                            }[search.status]
                          }
                          onChange={(e) => {
                            if (!e) return;
                            const value = ZLoaderSearch.pick({ status: true }).safeParse({ status: e.value });
                            if (value.success) setSearch({ ...search, status: value.data.status });
                          }}
                        >
                          <SelectPositioner>
                            <SelectContent className="w-56">
                              <SelectOption value="both" label="Both" />
                              <SelectOption value="published" label="Published" />
                              <SelectOption value="unpublished" label="Unpublished" />
                            </SelectContent>
                          </SelectPositioner>
                        </Select>
                        <label className="col-start-1 row-start-3 text-sm">Max Results</label>
                        <NumberInput
                          className="w-56 col-start-2 row-start-3"
                          variant="filled"
                          min={5}
                          max={100}
                          step={5}
                          defaultValue="30"
                          onChange={(e) => {
                            if (!e) return;
                            const value = ZLoaderSearch.pick({ maxResults: true }).safeParse({
                              maxResults: e.valueAsNumber,
                            });
                            if (value.success) setSearch({ ...search, maxResults: value.data.maxResults });
                          }}
                        >
                          <NumberInputScrubber />
                          <NumberInputField />
                          <NumberInputControl>
                            <NumberInputIncrementTrigger />
                            <NumberInputDecrementTrigger />
                          </NumberInputControl>
                        </NumberInput>
                      </div>
                      <Button type="submit" colorScheme="brown" className="w-full">
                        Apply
                      </Button>
                    </div>
                    <Popover.Arrow asChild>
                      <div className="relative h-3 w-3 origin-center rounded-br-sm border-b border-r border-slate-6 bg-slate-2 rotate-45 -translate-y-[0.375rem]" />
                    </Popover.Arrow>
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            </Form>
            <create.Form method="POST" action="/blog?index">
              <input type="hidden" name="mdx" value={defaultBlogTemplate} />
              <input type="hidden" name="author_id" value={userId} />
              <input type="hidden" name="published" value="false" />
              <IconButton
                type="submit"
                aria-label="new post"
                variant="subtle"
                size="lg"
                icon={<RiAddFill />}
                isLoading={create.state !== "idle"}
                disabled={create.state !== "idle"}
              />
            </create.Form>
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
        </div>
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
    </div>
  );
}
