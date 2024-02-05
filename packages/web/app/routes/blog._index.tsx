import { LoaderFunctionArgs, MetaFunction, json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import React from "react";
import { z } from "zod";
import { logger, db } from "~/lib/util/globals.server";
import { execute, takeFirstOrThrow } from "~/lib/util/utils.server";
import * as Popover from "@radix-ui/react-popover";
import { InputGroup, Input, InputLeftElement, InputRightElement } from "~/lib/ui/input";
import { RiSearchLine } from "react-icons/ri";
import { Button, IconButton } from "~/lib/ui/button";
import { TimeDescIcon, TimeAscIcon, ViewsAscIcon, ViewsDescIcon } from "~/lib/ui/icon";
import { colorFromName, ColorList, Tag } from "~/lib/ui/tag";
import { BlogLi } from "~/lib/app/blog-li";
import { Pagination } from "~/lib/ui/pagination";
import { parseBlog } from "~/model/blogs";
import { Config } from "sst/node/config";

export const meta: MetaFunction = () => [
  { title: "Blog | Spencer Duball" },
  {
    name: "description",
    content:
      "Come checkout my thoughts on various topics such as web development, cloud computing, 3d printing, electronics, and more.",
  },
];

//---------------------------------------------------------------------------------------------------------------------
// Define Loader Function
//---------------------------------------------------------------------------------------------------------------------
// Define search paramters config
const SortOption = ["views-asc", "views-desc", "created-asc", "created-desc"] as const;
const ZLoaderSearch = z.object({
  page: z.coerce.number().positive().int().gte(1).nullable().catch(null),
  maxResults: z.coerce.number().positive().int().gte(10).lte(100).nullable().catch(null),
  sort: z.enum(SortOption).nullable().catch(null),
  tags: z.preprocess((tagsCsv) => {
    const tagCsv = z.string().nullable().catch(null).parse(tagsCsv);
    return tagCsv ? tagCsv.split(",") : [];
  }, z.string().array()),
  title: z.string().nullable().catch(null),
});
type LoaderSearchType = z.infer<typeof ZLoaderSearch>;
const DefaultParams = { page: 1, maxResults: 30, sort: "created-desc", tags: [], title: null } as const;

/**
 * The loader will run 3 database queries based upon the search parameter inputs:
 *
 * 1. It will get all blogs that match the search parameters for the specific page & maxResults.
 * 2. It will get total blogs that match the search parameters regardless of page/maxResults (for pagination info).
 * 3. It will get all the tags that the user has the ability to filter with.
 *
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const log = logger(request);

  //-------------------------------------------------------------------------------------------------------------------
  // Collect Search Parameters
  //--------------------------
  // Parse the searchParams from the request URL, then create new variables to hold the params with default values if
  // applicable. We need to hold onto the parsed inputs (without defaults) so that SSR can correctly determine if there
  // was a passed input, or if we have just used a default.
  //-------------------------------------------------------------------------------------------------------------------
  // collect the search parameters
  const search = new URL(request.url).searchParams;
  const params = ZLoaderSearch.parse(Object.fromEntries(search.entries()));

  // apply defaults to search parameters
  const page = params.page || DefaultParams.page;
  const maxResults = params.maxResults || DefaultParams.maxResults;
  const sort = params.sort || DefaultParams.sort;
  const tags = params.tags || DefaultParams.tags;
  const title = params.title || DefaultParams.title;

  //-------------------------------------------------------------------------------------------------------------------
  // Create Blog Query
  //------------------
  // This is the main query to retrieve all blogs that match the specified search options.
  //-------------------------------------------------------------------------------------------------------------------
  // create base query
  log.info("Creating blogs query ...");
  let blogsQuery = db
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
    ]);

  // apply the "published" filter
  blogsQuery = blogsQuery.where("published", "=", true);

  // apply the "tags" filter if exists
  if (tags.length > 0) {
    blogsQuery = blogsQuery.where("blogs.id", "in", (sub) =>
      sub
        .selectFrom("blog_tags")
        .select("blog_id")
        .where("name", "in", tags)
        .groupBy("blog_id")
        .having(db.fn.count("name"), "=", tags.length),
    );
  }
  blogsQuery = blogsQuery.groupBy("blogs.id");

  // apply the title filter if exists
  if (title) blogsQuery = blogsQuery.where("title", "like", `%${title}%`);

  // apply the sort filter
  blogsQuery = blogsQuery.orderBy(
    sort.startsWith("created") ? "blogs.created_at" : "blogs.views",
    sort.endsWith("asc") ? "asc" : "desc",
  );

  // apply the "maxResults" and page
  blogsQuery = blogsQuery.limit(maxResults).offset((page - 1) * maxResults);

  // apply data transforms
  const blogsReq = execute(blogsQuery);

  //-------------------------------------------------------------------------------------------------------------------
  // Create Supplemental Queries
  //----------------------------
  // There is other information we need to query the database for such as:
  //
  // 1. The count of all blogs that match the queries (regardless of page/maxResults) to be used for pagination info.
  // 2. Retrieve all tags available for a user to filter by.
  //-------------------------------------------------------------------------------------------------------------------
  // 1. Count matching blogs query
  log.info("Creating totalBlogs query ...");
  const totalBlogsReq = execute(
    db
      .with("matching_blogs", (sub) => {
        let query = sub.selectFrom("blogs").leftJoin("blog_tags", "blogs.id", "blog_tags.blog_id").select("id");

        // apply the "published" filter
        query = query.where("published", "=", true);

        // apply the "tags" filter
        if (tags.length > 0) {
          query = query
            .where("blog_tags.name", "in", tags)
            .groupBy("blogs.id")
            .having(db.fn.count("blog_tags.name"), "=", tags.length);
        } else query = query.groupBy("blogs.id");

        // apply the title filter if exists
        if (title) query = query.where("title", "like", `%${title}%`);

        return query;
      })
      .selectFrom("matching_blogs")
      .select(db.fn.countAll<number>().as("total_blogs")),
  ).then((res) => takeFirstOrThrow(res).total_blogs);

  // 2. Retrieve all tags
  log.info("Creating tags query ...");
  const tagsReq = execute(db.selectFrom("blog_tags").select("name").groupBy("name")).then((tags) =>
    tags.map(({ name }) => name).sort(),
  );
  //-------------------------------------------------------------------------------------------------------------------

  // run all requests in parallel & return
  log.info("Batching all sql requests ...");
  const [blogs, totalBlogs, allTags] = await Promise.all([blogsReq, totalBlogsReq, tagsReq]);

  return json({ blogs, totalBlogs, tags: allTags, params });
}
//---------------------------------------------------------------------------------------------------------------------

export default function Blog() {
  const { blogs, totalBlogs, tags, params } = useLoaderData<typeof loader>();

  // Form Reference for Portal Popover
  // ---------------------------------
  // The popover to select the sort order will by default be portaled to the root of the html page. Since we want this
  // to be included as an input as part of the Form (to filter posts), we need to manually supply the container that we
  // want this popover to be portaled to. This will make a popover a child of the Form, and all button clicks will
  // submit the Form.
  const formRef = React.useRef<HTMLFormElement>(null!);
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => setIsMounted(true));

  // capture initial search params
  const [search, setSearch] = React.useState<LoaderSearchType>({ ...params });

  // determine the sort icon
  let sortIcon = <TimeDescIcon className="h-5 w-5" />;
  if (search.sort === "created-asc") sortIcon = <TimeAscIcon className="h-5 w-5" />;
  else if (search.sort === "views-asc") sortIcon = <ViewsAscIcon className="h-5 w-5" />;
  else if (search.sort === "views-desc") sortIcon = <ViewsDescIcon className="h-5 w-5" />;

  // define function to toggle a tag
  function toggleTag(name: string) {
    let tags = [...search.tags];
    if (tags.includes(name)) tags = tags.filter((tag) => tag !== name);
    else tags = [...tags, name];
    setSearch({ ...search, tags });
  }

  // determine pagination message
  let paginationMsg = "No blogs found.";
  if (totalBlogs) {
    let startIdx = ((params.page || DefaultParams.page) - 1) * (params.maxResults || DefaultParams.maxResults);
    let endIdx = startIdx + blogs.length;
    paginationMsg = `Showing blogs ${startIdx} - ${endIdx} of ${totalBlogs}.`;
  }

  return (
    <main className="grid w-full justify-items-center">
      <section className="grid w-full max-w-5xl gap-10 px-4 py-6">
        {/* Blog Items */}
        <ul className="row-start-2 grid gap-3">
          {blogs.map((blog) => (
            <BlogLi key={blog.id} data={parseBlog(blog)} className="max-w-4xl" />
          ))}
        </ul>
        {/* Introduction */}
        <div className="row-start-1 grid gap-4">
          {/* Title & Summary */}
          <div className="grid max-w-3xl gap-2">
            <h1 className="text-5xl font-bold">Posts</h1>
            <p>
              I write mostly about web development and cloud computing, and sometimes about 3D printing and circuits. I
              hope you find something interesting!
            </p>
          </div>
          {/* Search Controls */}
          <Form ref={formRef} method="get" className="grid gap-3">
            <div className="grid max-w-3xl gap-2">
              <input type="hidden" name="maxResults" value={search.maxResults ?? 0} disabled={!search.maxResults} />
              <input type="hidden" name="sort" value={search.sort ?? ""} disabled={!search.sort} />
              <input
                type="hidden"
                name="tags"
                value={search.tags.length > 0 ? search.tags : ""}
                disabled={!(search.tags.length > 0)}
              />
              <input type="hidden" name="title" value={search.title ?? ""} disabled={!search.title} />

              <Popover.Root>
                <InputGroup variant="filled" size="lg">
                  <InputLeftElement>
                    <RiSearchLine className="h-5 w-5 text-slate-10" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search ..."
                    value={search.title ?? ""}
                    onChange={(e) => setSearch({ ...search, title: e.currentTarget.value })}
                  />
                  <InputRightElement>
                    <Popover.Trigger asChild>
                      <IconButton
                        size="sm"
                        aria-label="Open sort order menu."
                        variant="ghost"
                        className="hover:bg-slate-6 active:bg-slate-7"
                        icon={sortIcon}
                      />
                    </Popover.Trigger>
                  </InputRightElement>
                </InputGroup>
                {/* Add button after the Input, need a blank submit button so hitting Enter on the Input will submit the form. */}
                <button type="submit" className="invisible absolute" />
                <Popover.Portal container={isMounted ? formRef.current : undefined}>
                  <Popover.Content
                    align="end"
                    alignOffset={-16}
                    className="rounded-lg border border-slate-6 bg-slate-2 p-3 shadow"
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
                      <div className="relative h-3 w-3 origin-center -translate-y-[0.375rem] rotate-45 rounded-br-sm border-b border-r border-slate-6 bg-slate-2" />
                    </Popover.Arrow>
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((name) => (
                <button key={name} className="focus-outline rounded" onClick={() => toggleTag(name)}>
                  <Tag
                    className="border border-slate-4"
                    variant={search.tags.includes(name) ? "solid" : "subtle"}
                    colorScheme={colorFromName({ name, colors: ColorList })}
                  >
                    {name}
                  </Tag>
                </button>
              ))}
            </div>
          </Form>
        </div>
        {/* Pagination */}
        <div className="grid place-items-center gap-1">
          <Pagination total={totalBlogs} pageSize={search.maxResults || 30} />
          <p className="text-center text-xs text-slate-9">{paginationMsg}</p>
        </div>
      </section>
    </main>
  );
}
