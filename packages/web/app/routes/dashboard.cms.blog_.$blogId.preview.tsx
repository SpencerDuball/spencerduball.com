import * as React from "react";
import { json } from "@remix-run/node";
import { EditorCtx } from "~/lib/ui/editor";
import { ActionFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { logger } from "~/lib/util/globals.server";
import { z } from "zod";
import { compileMdx } from "~/model/blogs";
import { BlogView, BlogViewSkeleton } from "~/lib/app/blog-view";
import { ScrollArea, ScrollViewport } from "~/lib/ui/scroll-box";
import { getSessionInfo } from "~/lib/util/utils.server";
import { BlogEditorCtx } from "~/lib/context/blog-editor-ctx";

const ZPostPayload = z.object({
  /** The MDX string of the blog. */
  mdx: z.string(),
});
type IPostPayload = z.infer<typeof ZPostPayload>;

export async function action({ request }: ActionFunctionArgs) {
  const log = logger(request);

  // check if user is admin
  const session = await getSessionInfo(request);
  if (!session?.roles.includes("admin")) throw new Response(null, { status: 403 });

  switch (request.method) {
    case "POST": {
      // Validate FormData
      // -----------------
      // The information must be sent as FormData. We also need to validate that at least one updatable input was send
      // (body, views, published).
      log.info("Parsing the FormData from the request ...");
      let data: IPostPayload;
      try {
        data = ZPostPayload.parse(Object.fromEntries((await request.formData()).entries()));
      } catch (e) {
        log.info(e, "Invalid FormData was sent with the request.");
        throw json(
          { message: "Invalid FormData was sent with the request." },
          { status: 400, statusText: "Bad Request" },
        );
      }

      // 1. Parse the string into an AST
      log.info("Building the blog ...");
      const { content } = await compileMdx(data.mdx);

      return json({ content });
    }
    default: {
      log.info("This method is not allowed.");
      throw new Response(null, { status: 405, statusText: "Method Not Allowed" });
    }
  }
}

// TODO: Probably opt out of using `useFetcher` here. The reason is by using a Remix API, there will be a revalidation
// for EVERY layout in the app including the root. For this case, we should just use `axios` and a `useEffect` since
// this will bypass Remix APIs for revalidation logic.
export default function BlogIdPreview() {
  const [{ blog }] = React.useContext(BlogEditorCtx);
  const [editor] = React.useContext(EditorCtx);
  const fetcher = useFetcher<{ content: string }>();
  const ref = React.useRef<HTMLFormElement>(null!);

  React.useEffect(() => {
    if (ref.current && !fetcher.data && fetcher.state === "idle") fetcher.submit(ref.current);
  }, []);

  return (
    <ScrollArea className="w-full">
      <ScrollViewport className="w-full">
        <fetcher.Form hidden ref={ref} method="post">
          <input type="hidden" name="mdx" value={editor.data.value} />
        </fetcher.Form>
        {blog && fetcher.data?.content ? (
          <BlogView data={{ ...blog, content: fetcher.data?.content, url: "#" }} />
        ) : (
          <BlogViewSkeleton />
        )}
      </ScrollViewport>
    </ScrollArea>
  );
}
