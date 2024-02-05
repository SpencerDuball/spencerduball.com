import * as React from "react";
import { json } from "@remix-run/node";
import { EditorCtx } from "~/lib/ui/editor";
import { ActionFunctionArgs } from "@remix-run/node";
import axios from "axios";
import { logger } from "~/lib/util/globals.server";
import { z } from "zod";
import { compileMdx } from "~/model/blogs";
import { useHref } from "@remix-run/react";

const ZPostPayload = z.object({
  /** The MDX string of the blog. */
  mdx: z.string(),
});
type IPostPayload = z.infer<typeof ZPostPayload>;

export async function action({ request }: ActionFunctionArgs) {
  const log = logger(request);

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

export default function BlogIdPreview() {
  const [ctx] = React.useContext(EditorCtx);
  const href = useHref("");

  // retrieve the compiled MDX string from the server
  const [content, setContent] = React.useState<string | null>(null);
  React.useEffect(() => {
    const data = new FormData();
    data.set("mdx", ctx.data.value);
    axios.post(href, data).then(({ data }) => console.log(data));
  }, []);

  return <></>;
}
