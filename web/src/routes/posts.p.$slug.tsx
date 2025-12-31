import React from "react";
import { getPost } from "@/model/post";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod/v4";
import { runSync } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";

export const Route = createFileRoute("/posts/p/$slug")({
  params: {
    parse: (params) => z.object({ slug: z.string() }).parse(params),
    stringify: (params) => ({ slug: params.slug.toString() }),
  },
  loader: async ({ params: { slug } }) => {
    const { compiled, frontmatter } = await getPost({ data: { slug } });
    return { compiled, frontmatter };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { compiled, frontmatter } = Route.useLoaderData();

  const Content = React.useMemo(() => runSync(compiled, runtime).default, [compiled]);

  return (
    <div>
      <div>Hello "/posts/p/$slug"! {frontmatter.id}</div>
      <article>
        <Content />
      </article>
    </div>
  );
}
