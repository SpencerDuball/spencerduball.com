import React from "react";
import { getPost } from "@/model/post";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod/v4";
import Markdoc from "@markdoc/markdoc";
import { components } from "@/components/mdoc";

export const Route = createFileRoute("/posts/p/$slug")({
  params: {
    parse: (params) => z.object({ slug: z.string() }).parse(params),
    stringify: (params) => ({ slug: params.slug.toString() }),
  },
  loader: async ({ params: { slug } }) => {
    const { content, frontmatter } = await getPost({ data: { slug } });
    return { content, frontmatter };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { content, frontmatter } = Route.useLoaderData();
  const Content = React.useMemo(() => Markdoc.renderers.react(content, React, { components }), [content]);

  return (
    <div className="grid justify-items-center">
      <div className="grid w-full max-w-4xl gap-10 px-4 py-12">
        <div>Hello "/posts/p/$slug"! {frontmatter.id}</div>
        <div className="grid w-full max-w-none">{Content}</div>
      </div>
    </div>
  );
}
