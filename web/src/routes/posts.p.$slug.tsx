import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { z } from "zod/v4";

const getMdx = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data: { slug } }) => {
    // extract the ID
    const id = slug.match(/.*-(?<id>[0-9a-zA-Z]{8})$/)?.groups?.id;
    if (!id) throw notFound();

    return { id };
  });

export const Route = createFileRoute("/posts/p/$slug")({
  params: {
    parse: (params) => z.object({ slug: z.string() }).parse(params),
    stringify: (params) => ({ slug: params.slug.toString() }),
  },
  loader: async ({ params: { slug } }) => {
    const { id } = await getMdx({ data: { slug } });
    return { id };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useLoaderData();
  return <div>Hello "/posts/p/$slug"! {id}</div>;
}
