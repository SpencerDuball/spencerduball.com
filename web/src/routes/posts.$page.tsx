import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { PostLi } from "@/components/post-li";
import { getPostItems, getTotalPostItems } from "@/model/post";
import { Pagination } from "@/components/pagination";
import { z } from "zod/v4";

export const Route = createFileRoute("/posts/$page")({
  params: {
    parse: (params) => z.object({ page: z.coerce.number().int().positive() }).parse(params),
    stringify: (params) => ({ page: params.page.toString() }),
  },
  loader: async ({ params: { page } }) => {
    const [start, end] = [5 * (page - 1), 5 * page];
    const items = await getPostItems({ data: { start, end } });
    const total = await getTotalPostItems();
    return { posts: { items, total } };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { posts } = Route.useLoaderData();
  const { page } = Route.useParams();

  return (
    <div className="grid justify-items-center">
      <div className="grid w-full max-w-4xl gap-8 px-4 py-12">
        <div className="grid auto-cols-max gap-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link to="/" />}>Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Posts ({page})</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-4xl font-bold">Posts</h1>
          <p>Have a read of one of my posts.</p>
        </div>
        <div className="grid auto-rows-max gap-6">
          {posts.items.map((post) => (
            <PostLi key={post.id} data={post} />
          ))}
        </div>
        <Pagination
          to="/posts/$page"
          params={(idx) => ({ page: idx })}
          page={{ current: page, size: 5, total: posts.total }}
        />
      </div>
    </div>
  );
}
